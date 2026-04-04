import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto, UpdatePlayerDto, PlayerQueryDto } from './dto/player.dto';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  create(@Body() dto: CreatePlayerDto) {
    return this.playersService.create(dto);
  }

  @Get()
  findAll(@Query() query: PlayerQueryDto) {
    return this.playersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.playersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlayerDto,
  ) {
    return this.playersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.playersService.remove(id);
  }
}

@Controller('seed')
export class SeedController {
  constructor(private readonly playersService: PlayersService) {}

  @Post('players')
  seedPlayers(
    @Query('count') count?: string,
    @Query('category') category?: string,
  ) {
    const parsedCount = count ? parseInt(count, 10) : 32;
    return this.playersService.seed(parsedCount, category as any);
  }
}