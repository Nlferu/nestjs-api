import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

/** @dev @Global decorator makes Prisma module available for all other modules */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
