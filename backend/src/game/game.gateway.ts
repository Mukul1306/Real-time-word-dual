import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  private waitingClient: Socket | null = null;
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(private gameService: GameService) {}

  // 🔥 JOIN GAME
  @SubscribeMessage('joinGame')
  async handleJoin(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket
  ) {
    const result = await this.gameService.joinGame(data.username);

    // 🔹 First player waits
    if (!result.match) {
      this.waitingClient = client;

      client.emit('gameUpdate', result);
      return;
    }

    // 🔥 Match created
    const roomId = result.match.id;

    // Player 2 joins
    client.join(roomId);

    // Player 1 joins
    if (this.waitingClient) {
      this.waitingClient.join(roomId);
    }

    this.waitingClient = null;

    // 🔥 Send match to both
    this.server.to(roomId).emit('gameUpdate', result);

    // 🔥 Start timer for first turn
    this.startTimer(roomId);
  }

  // 🔥 GUESS (TURN BASED)
  @SubscribeMessage('guess')
  async handleGuess(@MessageBody() data: any) {
    const result = await this.gameService.submitGuess(
      data.roundId,
      data.guess,
      data.playerId
    );

    if (!result.matchId) return;

    // 🔥 Send update to room
    this.server.to(result.matchId).emit('gameUpdate', result);

    // 🔥 Restart timer for next player turn
    this.startTimer(result.matchId);
  }

  // 🔥 TIMER (5 sec PER TURN)
  startTimer(roomId: string) {
    // 🔥 Clear old timer
    if (this.activeTimers.has(roomId)) {
      clearInterval(this.activeTimers.get(roomId)!);
    }

    let time = 5;

    const interval = setInterval(() => {
      this.server.to(roomId).emit('timer', { time });

      time--;

      if (time < 0) {
        clearInterval(interval);
        this.activeTimers.delete(roomId);

        this.server.to(roomId).emit('timerEnd', {
          message: "⏰ Time Up!",
        });

        // 🔥 OPTIONAL: auto switch turn on timeout
        this.handleTimeout(roomId);
      }
    }, 1000);

    this.activeTimers.set(roomId, interval);
  }

  // 🔥 OPTIONAL: AUTO TURN SWITCH ON TIMEOUT
  async handleTimeout(roomId: string) {
    try {
      const match = await this.gameService.getMatchById(roomId);

      if (!match) return;

      const nextTurn =
        match.player1Id === match.currentTurnId
          ? match.player2Id
          : match.player1Id;

      const updatedMatch = await this.gameService.updateTurn(
        roomId,
        nextTurn
      );

      this.server.to(roomId).emit('gameUpdate', {
        message: "⏰ Turn skipped!",
        match: updatedMatch,
      });

    } catch (err) {
      console.log("Timeout error", err);
    }
  }
}