import { Controller, Post, Body } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  // 🔹 Join Game
  @Post('join')
  join(@Body('username') username: string) {
    return this.gameService.joinGame(username);
  }

  // 🔥 ADD THIS (VERY IMPORTANT)
  @Post('guess')
  submitGuess(@Body() body: any) {
    return this.gameService.submitGuess(
      body.roundId,
      body.guess,
      body.playerId
    );
  }
}