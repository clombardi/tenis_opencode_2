import { IsString, IsNotEmpty, IsArray, ValidateNested, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { RegistrationRole } from '@prisma/client';

export class PlayerRegistrationDto {
  @IsUUID()
  @IsNotEmpty()
  playerId!: string;

  @IsEnum(RegistrationRole)
  role!: RegistrationRole;
}

export class CreateRegistrationDto {
  @IsUUID()
  @IsNotEmpty()
  tournamentId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlayerRegistrationDto)
  players!: PlayerRegistrationDto[];
}