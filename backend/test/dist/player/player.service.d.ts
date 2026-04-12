import { PrismaService } from '../prisma/prisma.service';
export declare class PlayerService {
    private prisma;
    constructor(prisma: PrismaService);
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
