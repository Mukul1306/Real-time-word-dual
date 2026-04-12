import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameService {
private static playersQueue: any[] = [];

  constructor(private prisma: PrismaService) {}

  // 🔥 JOIN GAME
  async joinGame(username: string) {
    let player = await this.prisma.player.findUnique({
      where: { username }
    });

    if (!player) {
      player = await this.prisma.player.create({
        data: { username }
      });
    }
const alreadyInQueue = GameService.playersQueue.find(
  (p) => p.id === player.id
);

if (alreadyInQueue) {
  return { message: "Player already in queue", player };
}

GameService.playersQueue.push(player);

// 🔥 MATCH CREATE
if (GameService.playersQueue.length === 2) {
  const [player1, player2] = GameService.playersQueue;

  const match = await this.prisma.match.create({
    data: {
      player1Id: player1.id,
      player2Id: player2.id,
      status: "ONGOING",
      score1: 0,
      score2: 0,
      currentTurnId: player1.id
    }
  });

  const round = await this.prisma.round.create({
    data: {
      matchId: match.id,
      word: "GAME",
      revealedTiles: [false, false, false, false]
    }
  });

  GameService.playersQueue = []; // 🔥 FIXED

  return {
    message: "Match started",
    match: {
      ...match,
      player1Name: player1.username,
      player2Name: player2.username
    },
    round,
    player
  };
}

    return {
      message: "Waiting for another player...",
      player
    };
  }

  // 🔥 SUBMIT GUESS (TURN BASED)
  async submitGuess(roundId: string, guess: string, playerId: string) {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId }
    });

    if (!round) return { message: "Round not found" };

    const match = await this.prisma.match.findUnique({
      where: { id: round.matchId }
    });

    if (!match) return { message: "Match not found" };

    // 🔥 TURN CHECK
    if (match.currentTurnId !== playerId) {
      return {
        message: "⛔ Not your turn",
        matchId: match.id,
        match,
        round
      };
    }

    // 🔥 FETCH PLAYERS
    const player1 = await this.prisma.player.findUnique({
      where: { id: match.player1Id }
    });

    const player2 = await this.prisma.player.findUnique({
      where: { id: match.player2Id }
    });

    // 🔥 GUESS LOGIC
    const resultArray = this.checkGuess(round.word, guess);
    const isCorrect = resultArray.every(v => v === true);

    // 🔥 NEXT TURN
    const nextTurn =
      match.player1Id === playerId
        ? match.player2Id
        : match.player1Id;

    // 🎉 CORRECT
    if (isCorrect) {
      await this.prisma.round.update({
        where: { id: roundId },
        data: { winnerId: playerId }
      });

      let updatedMatch;

      // 🔥 FIXED WINNER BUG (NO ELSE SHORTCUT)
      if (match.player1Id === playerId) {
        updatedMatch = await this.prisma.match.update({
          where: { id: match.id },
          data: {
            score1: { increment: 1 },
            currentTurnId: nextTurn
          }
        });
      } else if (match.player2Id === playerId) {
        updatedMatch = await this.prisma.match.update({
          where: { id: match.id },
          data: {
            score2: { increment: 1 },
            currentTurnId: nextTurn
          }
        });
      }

      return {
        message: "🎉 Correct Guess!",
        matchId: match.id,
        match: {
          ...updatedMatch,
          player1Name: player1?.username,
          player2Name: player2?.username
        },
        round: { ...round, winnerId: playerId },
        result: resultArray
      };
    }

    // ❌ WRONG → SWITCH TURN
    const updatedMatch = await this.prisma.match.update({
      where: { id: match.id },
      data: { currentTurnId: nextTurn }
    });

    return {
      message: "❌ Try Again",
      matchId: match.id,
      match: {
        ...updatedMatch,
        player1Name: player1?.username,
        player2Name: player2?.username
      },
      round,
      result: resultArray
    };
  }

  // 🔥 TIMER SUPPORT (for gateway)
  async getMatchById(matchId: string) {
    return this.prisma.match.findUnique({
      where: { id: matchId }
    });
  }

  async updateTurn(matchId: string, nextTurnId: string) {
    return this.prisma.match.update({
      where: { id: matchId },
      data: { currentTurnId: nextTurnId }
    });
  }

  // 🔥 CHECK LOGIC
  private checkGuess(word: string, guess: string) {
    const result: boolean[] = [];

    for (let i = 0; i < word.length; i++) {
      result.push(word[i] === guess[i]);
    }

    return result;
  }
}