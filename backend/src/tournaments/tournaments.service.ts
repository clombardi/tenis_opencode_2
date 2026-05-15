import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentDto, UpdateTournamentDto, TournamentQueryDto, UpdateStatusDto } from './dto/tournament.dto';
import { TournamentStatus } from '@prisma/client';
import { parseAndNormalizeDate } from '../common/date.utils';

const VALID_DRAW_SIZES = [4, 8, 16, 32, 64, 128];

const STATE_TRANSITIONS: Record<TournamentStatus, TournamentStatus[]> = {
  [TournamentStatus.DRAFT]: [TournamentStatus.REGISTRATION, TournamentStatus.CANCELLED],
  [TournamentStatus.REGISTRATION]: [TournamentStatus.ORGANIZING, TournamentStatus.CANCELLED],
  [TournamentStatus.ORGANIZING]: [TournamentStatus.IN_PROGRESS, TournamentStatus.CANCELLED],
  [TournamentStatus.IN_PROGRESS]: [TournamentStatus.COMPLETED],
  [TournamentStatus.COMPLETED]: [],
  [TournamentStatus.CANCELLED]: [],
};

@Injectable()
export class TournamentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTournamentDto) {
    const startDate = parseAndNormalizeDate(dto.startDate);
    const endDate = parseAndNormalizeDate(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('startDate must be before endDate');
    }

    if (!VALID_DRAW_SIZES.includes(dto.drawSize)) {
      throw new BadRequestException(`drawSize must be one of: ${VALID_DRAW_SIZES.join(', ')}`);
    }

    const category = await this.prisma.tournamentCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return this.prisma.tournament.create({
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
        genderCategory: dto.genderCategory,
        mode: dto.mode,
        drawSize: dto.drawSize,
        startDate,
        endDate,
        status: TournamentStatus.DRAFT,
      },
    });
  }

  async findAll(query: TournamentQueryDto) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.genderCategory) where.genderCategory = query.genderCategory;
    if (query.mode) where.mode = query.mode;
    if (query.categoryId) where.categoryId = query.categoryId;

    return this.prisma.tournament.findMany({
      relationLoadStrategy: 'join',
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const registration = await this.prisma.registration.findUnique({
      where: { tournamentId: id },
      include: { participants: { include: { player: true } } },
    });

    return {
      ...tournament,
      participants: registration?.participants || [],
    };
  }

  async update(id: string, dto: UpdateTournamentDto) {
    const tournament = await this.findOne(id);

    if (tournament.status !== TournamentStatus.DRAFT) {
      throw new ForbiddenException('Can only update tournament in DRAFT status');
    }

    const startDate = parseAndNormalizeDate(dto.startDate);
    const endDate = parseAndNormalizeDate(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('startDate must be before endDate');
    }

    if (!VALID_DRAW_SIZES.includes(dto.drawSize)) {
      throw new BadRequestException(`drawSize must be one of: ${VALID_DRAW_SIZES.join(', ')}`);
    }

    const category = await this.prisma.tournamentCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return this.prisma.tournament.update({
      where: { id },
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
        genderCategory: dto.genderCategory,
        mode: dto.mode,
        drawSize: dto.drawSize,
        startDate,
        endDate,
      },
    });
  }

  async remove(id: string) {
    const tournament = await this.findOne(id);

    if (tournament.status !== TournamentStatus.DRAFT) {
      throw new ForbiddenException('Can only delete tournament in DRAFT status');
    }

    await this.prisma.tournament.delete({ where: { id } });
  }

  async closeRegistration(id: string) {
    const tournament = await this.findOne(id);

    if (tournament.status !== TournamentStatus.REGISTRATION) {
      throw new ForbiddenException('Can only close registration when status is REGISTRATION');
    }

    return this.prisma.tournament.update({
      where: { id },
      data: { status: TournamentStatus.ORGANIZING },
    });
  }

  async openRegistration(id: string) {
    const tournament = await this.findOne(id);

    if (tournament.status !== TournamentStatus.DRAFT) {
      throw new ForbiddenException('Can only open registration when status is DRAFT');
    }

    return this.prisma.tournament.update({
      where: { id },
      data: { status: TournamentStatus.REGISTRATION },
    });
  }

  async start(id: string) {
    const tournament = await this.findOne(id);

    if (tournament.status !== TournamentStatus.ORGANIZING) {
      throw new ForbiddenException('Can only start tournament when status is ORGANIZING');
    }

    return this.prisma.tournament.update({
      where: { id },
      data: { status: TournamentStatus.IN_PROGRESS },
    });
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const tournament = await this.findOne(id);

    const allowedTransitions = STATE_TRANSITIONS[tournament.status];
    if (!allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${tournament.status} to ${dto.status}. Allowed transitions: ${allowedTransitions.join(', ')}`
      );
    }

    return this.prisma.tournament.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}