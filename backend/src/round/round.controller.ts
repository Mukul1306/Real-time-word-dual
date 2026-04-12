import { Controller, Post, Body } from '@nestjs/common';
import { RoundService } from './round.service';

@Controller('round')
export class RoundController {
  constructor(private roundService: RoundService) {}

  @Post()
  create(@Body() body: any) {
    return this.roundService.create(body.matchId, body.word);
  }
}