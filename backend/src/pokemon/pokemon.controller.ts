import { Controller, Post, Get, HttpStatus, HttpCode, Query, ParseIntPipe, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'
import { PokemonService } from './pokemon.service';
import { PokemonListResponse } from './dto/pokemon.dto';

@UseGuards(AuthGuard('jwt')) 
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post('importar')
  @HttpCode(HttpStatus.OK)
  async import() {
    return this.pokemonService.importAllPokemons();
  }

  @Get()
 async findAll(
    @Query('skip', new ParseIntPipe({ optional: true })) skip: number = 0,
    @Query('take', new ParseIntPipe({ optional: true })) take: number = 20, 
  ): Promise<PokemonListResponse> {
    return this.pokemonService.findAll(skip, take, false); 
  }

  @Get('favoritos')
  async findFavorites(
    @Query('skip', new ParseIntPipe({ optional: true })) skip: number = 0,
    @Query('take', new ParseIntPipe({ optional: true })) take: number = 20, 
  ): Promise<PokemonListResponse> {
    return this.pokemonService.findAll(skip, take, true); 
  }
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pokemonService.findOne(id);
  }
}