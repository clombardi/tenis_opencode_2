import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/registration.dto';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  create(@Body() dto: CreateRegistrationDto) {
    return this.registrationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.registrationsService.findAll();
  }

  @Get('tournament/:tournamentId')
  findByTournament(@Param('tournamentId') tournamentId: string) {
    return this.registrationsService.findByTournament(tournamentId);
  }
}