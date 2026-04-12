import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  create(username: string) {
    return this.prisma.player.create({
      data: { username },
    });
  }

  findAll() {
    return this.prisma.player.findMany();
  }
}