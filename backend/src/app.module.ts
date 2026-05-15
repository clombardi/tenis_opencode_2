import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { PlayersModule } from './players/players.module';
import { CategoriesModule } from './categories/categories.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { RegistrationsModule } from './registrations/registrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    PlayersModule,
    CategoriesModule,
    TournamentsModule,
    RegistrationsModule,
  ],
})
export class AppModule {}
