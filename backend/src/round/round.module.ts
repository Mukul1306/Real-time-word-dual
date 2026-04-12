import { Module } from '@nestjs/common';
import { RoundService } from './round.service';
import { RoundController } from './round.controller';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [PrismaModule],  // IMPORTANT
  providers: [RoundService],
  controllers: [RoundController]
})
export class RoundModule {}
