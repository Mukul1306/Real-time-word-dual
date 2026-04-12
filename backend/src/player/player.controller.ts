import { Controller, Get, Post, Body } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  @Post()
  create(@Body('username') username: string) {
    return this.playerService.create(username);
  }

  @Get()
  findAll() {
    return this.playerService.findAll();
  }
}