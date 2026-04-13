import { Controller, Post, Body } from '@nestjs/common';
import { RoundService } from './round.service';

@Controller('round')
export class RoundController {
  constructor(private readonly roundService: RoundService) {}

  @Post()
  create(@Body() body: { matchId: string; word: string }) {
    return this.roundService.create(body.matchId, body.word);
  }
}