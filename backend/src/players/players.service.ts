import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto, UpdatePlayerDto, PlayerQueryDto } from './dto/player.dto';
import { PlayerGender, Hand } from '@prisma/client';
import { normalizeToMidnightGMT, parseAndNormalizeDate } from '../common/date.utils';

type SeedCategory = 'senior' | 'normal' | 'infantiles';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePlayerDto) {
    const existing = await this.prisma.player.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    return this.prisma.player.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        gender: dto.gender,
        documento: dto.documento,
        mano: dto.mano,
        country: dto.country,
        birthDate: dto.birthDate ? parseAndNormalizeDate(dto.birthDate) : null,
      },
    });
  }

  async findAll(query: PlayerQueryDto) {
    const where: any = {};
    if (query.gender) where.gender = query.gender;
    if (query.country) where.country = query.country;

    return this.prisma.player.findMany({
      where,
      orderBy: { lastName: 'asc' },
    });
  }

  async findOne(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return player;
  }

  async update(id: string, dto: UpdatePlayerDto) {
    await this.findOne(id);

    return this.prisma.player.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        documento: dto.documento,
        mano: dto.mano,
        country: dto.country,
        birthDate: dto.birthDate ? parseAndNormalizeDate(dto.birthDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const hasRegistrations = await this.prisma.playerInRegistration.findFirst({
      where: { playerId: id },
    });

    if (hasRegistrations) {
      throw new ConflictException('Cannot delete player with registrations');
    }

    await this.prisma.player.delete({ where: { id } });
  }

  async seed(count: number = 32, category: SeedCategory = 'normal') {
    const normalizedCategory = category.toLowerCase() as SeedCategory;
    if (!['senior', 'normal', 'infantiles'].includes(normalizedCategory)) {
      throw new BadRequestException('Category must be: senior, normal, or infantiles');
    }

    const players = [];
    const firstNames = {
      MALE: [
        'Juan', 'Pedro', 'Carlos', 'Diego', 'Luis', 'Miguel', 'Javier', 'Andres',
        'Guillermo', 'David', 
      ],
      FEMALE: [
        'Maria', 'Ana', 'Laura', 'Sofia', 'Carmen', 'Isabel', 'Elena', 'Rosa',
        'Martina', 'Gabriela' 
      ],
    };
    const lastNames = [
      'Garcia', 'Martinez', 'Rodriguez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Torres',
      'Vilas', 'Nastase', 'Navratilova', 'Nalbandian', 'Sabatini'
    ];
    const countries = ['Argentina', 'Spain', 'USA', 'France', 'Brazil', 'Italy'];
    const handValues = [Hand.DIESTRO, Hand.ZURDO];

    function randomDocumento(): string {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const letter = letters.charAt(Math.floor(Math.random() * letters.length));
      const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      return `${letter}${letter}-${number}`;
    }

    const ageRanges: Record<SeedCategory, { min: number; max: number }> = {
      infantiles: { min: 8, max: 14 },
      normal: { min: 15, max: 36 },
      senior: { min: 37, max: 60 },
    };

    const { min: minAge, max: maxAge } = ageRanges[normalizedCategory];

    function randomBirthDate(minYears: number, maxYears: number): Date {
      const now = new Date();
      const year = now.getUTCFullYear() - Math.floor(Math.random() * (maxYears - minYears + 1)) - minYears;
      const month = Math.floor(Math.random() * 12);
      const day = Math.floor(Math.random() * 28) + 1;
      return normalizeToMidnightGMT(new Date(Date.UTC(year, month, day)));
    }

    for (let i = 0; i < count; i++) {
      const gender = i < count / 2 ? PlayerGender.MALE : PlayerGender.FEMALE;
      const firstName = firstNames[gender][i % firstNames[gender].length];
      const lastName = lastNames[i % lastNames.length];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;

      const player = await this.prisma.player.create({
        data: {
          firstName,
          lastName,
          email,
          gender,
          documento: randomDocumento(),
          mano: handValues[i % 2],
          country: countries[i % countries.length],
          birthDate: randomBirthDate(minAge, maxAge),
        },
      });
      players.push(player);
    }

    return players;
  }
}