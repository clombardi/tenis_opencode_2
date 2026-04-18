import { IsString, IsNotEmpty, IsEnum, IsInt, IsDateString, IsOptional } from 'class-validator';
import { GenderCategory, TournamentMode, TournamentStatus } from '@prisma/client';

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsEnum(GenderCategory)
  genderCategory!: GenderCategory;

  @IsEnum(TournamentMode)
  mode!: TournamentMode;

  @IsInt()
  drawSize!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}

export class UpdateTournamentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsEnum(GenderCategory)
  genderCategory!: GenderCategory;

  @IsEnum(TournamentMode)
  mode!: TournamentMode;

  @IsInt()
  drawSize!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}

export class TournamentQueryDto {
  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;

  @IsOptional()
  @IsEnum(GenderCategory)
  genderCategory?: GenderCategory;

  @IsOptional()
  @IsEnum(TournamentMode)
  mode?: TournamentMode;

  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class UpdateStatusDto {
  @IsEnum(TournamentStatus)
  status!: TournamentStatus;
}