import { Controller, Post, Body } from '@nestjs/common';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
  constructor(private matchService: MatchService) {}

  @Post()
  create(@Body() body: any) {
    return this.matchService.create(body.player1Id, body.player2Id);
  }
}