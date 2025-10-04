import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PokemonModule } from './pokemon/pokemon.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PokemonModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}