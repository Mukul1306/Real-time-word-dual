import { GameService } from './game.service';
export declare class GameController {
    private gameService;
    constructor(gameService: GameService);
    join(username: string): Promise<{
        message: string;
        player: {
            id: string;
            username: string;
            totalWins: number;
            createdAt: Date;
        };
        match?: undefined;
        round?: undefined;
    } | {
        message: string;
        match: {
            player1Name: any;
            player2Name: any;
            id: string;
            createdAt: Date;
            player1Id: string;
            player2Id: string;
            score1: number;
            score2: number;
            status: string;
            currentTurnId: string;
        };
        round: {
            id: string;
            createdAt: Date;
            matchId: string;
            word: string;
            revealedTiles: boolean[];
            winnerId: string | null;
        };
        player: {
            id: string;
            username: string;
            totalWins: number;
            createdAt: Date;
        };
    }>;
    submitGuess(body: any): Promise<{
        message: string;
        matchId?: undefined;
        match?: undefined;
        round?: undefined;
        result?: undefined;
    } | {
        message: string;
        matchId: string;
        match: {
            id: string;
            createdAt: Date;
            player1Id: string;
            player2Id: string;
            score1: number;
            score2: number;
            status: string;
            currentTurnId: string;
        };
        round: {
            id: string;
            createdAt: Date;
            matchId: string;
            word: string;
            revealedTiles: boolean[];
            winnerId: string | null;
        };
        result?: undefined;
    } | {
        message: string;
        matchId: string;
        match: any;
        round: {
            winnerId: string;
            id: string;
            createdAt: Date;
            matchId: string;
            word: string;
            revealedTiles: boolean[];
        };
        result: boolean[];
    } | {
        message: string;
        matchId: string;
        match: {
            player1Name: string | undefined;
            player2Name: string | undefined;
            id: string;
            createdAt: Date;
            player1Id: string;
            player2Id: string;
            score1: number;
            score2: number;
            status: string;
            currentTurnId: string;
        };
        round: {
            id: string;
            createdAt: Date;
            matchId: string;
            word: string;
            revealedTiles: boolean[];
            winnerId: string | null;
        };
        result: boolean[];
    }>;
}
