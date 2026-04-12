import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],  // IMPORTANT
  controllers: [PlayerController],
  providers: [PlayerService],
})
export class PlayerModule {}