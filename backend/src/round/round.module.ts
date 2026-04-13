import { Module } from '@nestjs/common';
import { RoundService } from './round.service';
import { RoundController } from './round.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RoundController],
  providers: [RoundService, PrismaService],
  exports: [RoundService],
})
export class RoundModule {}