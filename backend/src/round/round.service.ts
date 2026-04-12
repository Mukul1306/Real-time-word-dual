import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoundService {
  constructor(private prisma: PrismaService) {}

  create(matchId: string, word: string) {
    return this.prisma.round.create({
      data: {
        matchId,
        word,
        revealedTiles: Array(word.length).fill(false)
      },
    });
  }

  setWinner(roundId: string, playerId: string) {
    return this.prisma.round.update({
      where: { id: roundId },
      data: { winnerId: playerId }
    });
  }
}