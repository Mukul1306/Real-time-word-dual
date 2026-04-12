import { PlayerService } from './player.service';
export declare class PlayerController {
    private playerService;
    constructor(playerService: PlayerService);
    create(username: string): import(".prisma/client").Prisma.Prisma__PlayerClient<{
        id: string;
        username: string;
        totalWins: number;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        username: string;
        totalWins: number;
        createdAt: Date;
    }[]>;
}
