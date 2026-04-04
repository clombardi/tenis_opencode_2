import { Module } from '@nestjs/common';
import { PlayersController, SeedController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
  controllers: [PlayersController, SeedController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}