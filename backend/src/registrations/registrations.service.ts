import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/registration.dto';
import { TournamentStatus } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRegistrationDto) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: dto.tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.status !== TournamentStatus.REGISTRATION) {
      throw new ForbiddenException('Can only register players when tournament status is REGISTRATION');
    }

    const playersToRegister = dto.players.map((p) => p.playerId);
    const uniquePlayers = [...new Set(playersToRegister)];

    if (uniquePlayers.length !== dto.players.length) {
      throw new BadRequestException('Duplicate player IDs in request');
    }

    const existingPlayers = await this.prisma.player.findMany({
      where: { id: { in: uniquePlayers } },
    });

    if (existingPlayers.length !== uniquePlayers.length) {
      throw new NotFoundException('One or more players not found');
    }

    const existingRegistration = await this.prisma.registration.findUnique({
      where: { tournamentId: dto.tournamentId },
      include: { participants: true },
    });

    if (existingRegistration) {
      const existingPlayerIds = existingRegistration.participants.map((p) => p.playerId);
      const newPlayerIds = dto.players.map((p) => p.playerId);
      const alreadyRegistered = newPlayerIds.filter((id) => existingPlayerIds.includes(id));

      if (alreadyRegistered.length > 0) {
        throw new BadRequestException(`Players already registered: ${alreadyRegistered.join(', ')}`);
      }

      await this.prisma.playerInRegistration.createMany({
        data: dto.players.map((p) => ({
          registrationId: existingRegistration.id,
          playerId: p.playerId,
          role: p.role,
        })),
      });

      return this.prisma.registration.findUnique({
        where: { id: existingRegistration.id },
        include: { participants: { include: { player: true } }, tournament: true },
      });
    }

    const registration = await this.prisma.registration.create({
      data: {
        tournamentId: dto.tournamentId,
        participants: {
          create: dto.players.map((p) => ({
            playerId: p.playerId,
            role: p.role,
          })),
        },
      },
      include: { participants: { include: { player: true } }, tournament: true },
    });

    return registration;
  }

  async findByTournament(tournamentId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { tournamentId },
      include: { participants: { include: { player: true } } },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found for this tournament');
    }

    return registration;
  }

  async findAll() {
    return this.prisma.registration.findMany({
      include: { tournament: true, participants: { include: { player: true } } },
      orderBy: { registeredAt: 'desc' },
    });
  }
}