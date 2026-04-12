import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  // 🔥 CREATE MATCH (FIXED)
  create(player1Id: string, player2Id: string) {
    return this.prisma.match.create({
      data: {
        player1Id,
        player2Id,
        status: "ONGOING",
        score1: 0,
        score2: 0,
        currentTurnId: player1Id // 🔥 REQUIRED FIX
      },
    });
  }

  // 🔥 UPDATE SCORE (SAFE)
  updateScore(matchId: string, player: number) {
    return this.prisma.match.update({
      where: { id: matchId },
      data:
        player === 1
          ? { score1: { increment: 1 } }
          : { score2: { increment: 1 } },
    });
  }

  // 🔥 OPTIONAL: SWITCH TURN (GOOD PRACTICE)
  switchTurn(matchId: string, nextTurnId: string) {
    return this.prisma.match.update({
      where: { id: matchId },
      data: {
        currentTurnId: nextTurnId
      }
    });
  }
}