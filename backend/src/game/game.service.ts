import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameService {
  private static playersQueue: any[] = [];

  // 🔥 WORD LIST
  private words = ["GAME", "CODE", "PLAY", "WORD", "NODE"];

  constructor(private prisma: PrismaService) {}

  // 🔥 GET RANDOM WORD
  private getRandomWord() {
    return this.words[Math.floor(Math.random() * this.words.length)];
  }

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

    const exists = GameService.playersQueue.find(p => p.id === player.id);
    if (exists) {
      return { message: "Already waiting...", player };
    }

    GameService.playersQueue.push(player);

    console.log("Queue:", GameService.playersQueue.map(p => p.username));

    // 🔥 CREATE MATCH
    if (GameService.playersQueue.length === 2) {
      try {
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

        // 🔥 FIRST RANDOM WORD
        const word = this.getRandomWord();

        const round = await this.prisma.round.create({
          data: {
            matchId: match.id,
            word,
            revealedTiles: Array(word.length).fill(false)
          }
        });

        GameService.playersQueue = [];

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

      } catch (error) {
        console.log("❌ Match error:", error);
        GameService.playersQueue = [];

        return {
          message: "Server error, try again",
          player
        };
      }
    }

    return {
      message: "Waiting for another player...",
      player
    };
  }

  // 🔥 SUBMIT GUESS
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

    const player1 = await this.prisma.player.findUnique({
      where: { id: match.player1Id }
    });

    const player2 = await this.prisma.player.findUnique({
      where: { id: match.player2Id }
    });

    const resultArray = this.checkGuess(round.word, guess);
    const isCorrect = resultArray.every(v => v === true);

    const nextTurn =
      match.player1Id === playerId
        ? match.player2Id
        : match.player1Id;

    // 🎉 CORRECT GUESS
    if (isCorrect) {

      let updatedMatch;

      if (match.player1Id === playerId) {
        updatedMatch = await this.prisma.match.update({
          where: { id: match.id },
          data: {
            score1: { increment: 1 },
            currentTurnId: nextTurn
          }
        });
      } else {
        updatedMatch = await this.prisma.match.update({
          where: { id: match.id },
          data: {
            score2: { increment: 1 },
            currentTurnId: nextTurn
          }
        });
      }

      // 🔥 COUNT ROUNDS
      const rounds = await this.prisma.round.findMany({
        where: { matchId: match.id }
      });

      // 🔥 GAME OVER AFTER 3 ROUNDS
      if (rounds.length >= 3) {
        let winner = "Draw";

        if (updatedMatch.score1 > updatedMatch.score2) {
          winner = player1?.username || "Player 1";
        } else if (updatedMatch.score2 > updatedMatch.score1) {
          winner = player2?.username || "Player 2";
        }

        return {
          message: `🏆 Winner: ${winner}`,
          matchId: match.id,
          match: {
            ...updatedMatch,
            player1Name: player1?.username,
            player2Name: player2?.username
          },
          gameOver: true
        };
      }

      // 🔥 NEW RANDOM WORD
      const newWord = this.getRandomWord();

      const newRound = await this.prisma.round.create({
        data: {
          matchId: match.id,
          word: newWord,
          revealedTiles: Array(newWord.length).fill(false)
        }
      });

      return {
        message: "🎉 Correct! Next Round",
        matchId: match.id,
        match: {
          ...updatedMatch,
          player1Name: player1?.username,
          player2Name: player2?.username
        },
        round: newRound,
        result: resultArray
      };
    }

    // ❌ WRONG GUESS
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

  // 🔥 TIMER SUPPORT
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