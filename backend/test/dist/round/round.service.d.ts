import { PrismaService } from '../prisma/prisma.service';
export declare class RoundService {
    private prisma;
    constructor(prisma: PrismaService);
    create(matchId: string, word: string): import(".prisma/client").Prisma.Prisma__RoundClient<{
        id: string;
        createdAt: Date;
        matchId: string;
        word: string;
        revealedTiles: boolean[];
        winnerId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    setWinner(roundId: string, playerId: string): import(".prisma/client").Prisma.Prisma__RoundClient<{
        id: string;
        createdAt: Date;
        matchId: string;
        word: string;
        revealedTiles: boolean[];
        winnerId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
