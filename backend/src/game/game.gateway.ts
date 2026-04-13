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

    // 🔥 store player in socket
    client.data.player = result.player;

    // 🔹 First player waits
    if (!result.match) {
      this.waitingClient = client;

      client.emit('gameUpdate', {
        message: result.message,
        player: result.player,
      });

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

    // 🔥 SEND SEPARATE DATA TO EACH PLAYER

    // 👉 Player 2 (current client)
    client.emit('gameUpdate', {
      message: result.message,
      match: result.match,
      round: result.round,
      player: client.data.player, // ✅ correct player
    });

    // 👉 Player 1 (waiting client)
    if (this.waitingClient) {
      this.waitingClient.emit('gameUpdate', {
        message: result.message,
        match: result.match,
        round: result.round,
        player: this.waitingClient.data.player, // ✅ correct player
      });
    }

    // 🔥 reset waiting
    this.waitingClient = null;

    // 🔥 Start timer
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

    // 🔥 Send update to BOTH (this is fine)
    this.server.to(result.matchId).emit('gameUpdate', result);

    // 🔥 Restart timer
    this.startTimer(result.matchId);
  }

  // 🔥 TIMER (5 sec PER TURN)
  startTimer(roomId: string) {
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

        this.handleTimeout(roomId);
      }
    }, 1000);

    this.activeTimers.set(roomId, interval);
  }

  // 🔥 AUTO TURN SWITCH
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