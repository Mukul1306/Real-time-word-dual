import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PlayerModule } from './player/player.module';
import { MatchModule } from './match/match.module';
import { RoundModule } from './round/round.module';
import { GameModule } from './game/game.module';


@Module({
  imports: [
    PrismaModule,
    PlayerModule,
    MatchModule,
    RoundModule,
    GameModule
  ],
})
export class AppModule {}