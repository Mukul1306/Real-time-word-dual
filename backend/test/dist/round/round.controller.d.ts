import { RoundService } from './round.service';
export declare class RoundController {
    private roundService;
    constructor(roundService: RoundService);
    create(body: any): import(".prisma/client").Prisma.Prisma__RoundClient<{
        id: string;
        createdAt: Date;
        matchId: string;
        word: string;
        revealedTiles: boolean[];
        winnerId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
