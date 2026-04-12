import { PrismaService } from '../prisma/prisma.service';
export declare class MatchService {
    private prisma;
    constructor(prisma: PrismaService);
    create(player1Id: string, player2Id: string): import(".prisma/client").Prisma.Prisma__MatchClient<{
        id: string;
        createdAt: Date;
        player1Id: string;
        player2Id: string;
        score1: number;
        score2: number;
        status: string;
        currentTurnId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateScore(matchId: string, player: number): import(".prisma/client").Prisma.Prisma__MatchClient<{
        id: string;
        createdAt: Date;
        player1Id: string;
        player2Id: string;
        score1: number;
        score2: number;
        status: string;
        currentTurnId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    switchTurn(matchId: string, nextTurnId: string): import(".prisma/client").Prisma.Prisma__MatchClient<{
        id: string;
        createdAt: Date;
        player1Id: string;
        player2Id: string;
        score1: number;
        score2: number;
        status: string;
        currentTurnId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
