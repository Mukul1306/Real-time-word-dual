import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoundService {
  constructor(private prisma: PrismaService) {}

  // 🔥 CREATE ROUND
  async create(matchId: string, word: string) {
    return this.prisma.round.create({
      data: {
        matchId,
        word,
        revealedTiles: Array(word.length).fill(false),
      },
    });
  }
}