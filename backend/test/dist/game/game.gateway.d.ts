import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
export declare class GameGateway {
    private gameService;
    server: Server;
    private waitingClient;
    private activeTimers;
    constructor(gameService: GameService);
    handleJoin(data: any, client: Socket): Promise<void>;
    handleGuess(data: any): Promise<void>;
    startTimer(roomId: string): void;
    handleTimeout(roomId: string): Promise<void>;
}
