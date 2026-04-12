import { MatchService } from './match.service';
export declare class MatchController {
    private matchService;
    constructor(matchService: MatchService);
    create(body: any): import(".prisma/client").Prisma.Prisma__MatchClient<{
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
