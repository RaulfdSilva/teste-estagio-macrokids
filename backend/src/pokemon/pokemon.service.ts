import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Pokemon } from '@prisma/client';
import { PokemonListResponse } from './dto/pokemon.dto';


interface PokeApiListResponse {
  count: number;
  next: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

interface PokemonDetailsResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string; 
  };
}

export interface ImportResult {
  count: number;
}



@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);
  private readonly POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

 async importAllPokemons(): Promise<ImportResult> {
    const existingCount = await this.prisma.pokemon.count();
    
    if (existingCount > 0) {
        this.logger.warn('O banco de dados de Pokémons não está vazio. Abortando importação.');
        return { count: existingCount }; 
    }

    let nextUrl: string | null = this.POKEAPI_BASE_URL;
    let importedCount = 0;

    this.logger.log('Iniciando importação de Pokémons...');

    while (nextUrl) {

      const response: AxiosResponse<PokeApiListResponse> = await firstValueFrom(
        this.httpService.get<PokeApiListResponse>(nextUrl),
      );
      const data = response.data;

      for (const item of data.results) {
        try {
          const details = await this.fetchPokemonDetails(item.url);

          await this.prisma.pokemon.create({
            data: {
              name: item.name,           
              pokedexId: details.id,     
              imageUrl: details.sprites.front_default, 
              level: 0,                  
              isFavorite: false,
            },
          });
          importedCount++;
        } catch (error) {
          this.logger.error(`Erro ao importar ${item.name}: ${error.message}`);
        }
      }

     
      nextUrl = data.next;
      this.logger.log(`Página importada. Próxima URL: ${nextUrl || 'Nenhuma (Fim da lista)'}`);
    }

    this.logger.log(`Importação concluída. Total de novos Pokémons: ${importedCount}`);
    return { count:importedCount};
  }

  
  private async fetchPokemonDetails(url: string): Promise<PokemonDetailsResponse> {
    
    const response: AxiosResponse<PokemonDetailsResponse> = await firstValueFrom(
      this.httpService.get<PokemonDetailsResponse>(url),
    );
    return response.data;
  }

 async findAll(skip: number, take: number, onlyFavorites: boolean = false): Promise<PokemonListResponse> {
    
 
    const whereClause: any = {};
    if (onlyFavorites) {
      whereClause.isFavorite = true;
    }

    const pokemons: Pokemon[] = await this.prisma.pokemon.findMany({
      skip: skip,
      take: take,
      where: whereClause,
      orderBy: {
        pokedexId: 'asc',
      },
    });

    const totalCount: number = await this.prisma.pokemon.count({
      where: whereClause,
    });

    return {
      data: pokemons,
      totalCount: totalCount,
    };
  }

  async findOne(id: number): Promise<Pokemon> {
    const pokemon = await this.prisma.pokemon.findUnique({
      where: { id },
    });

    if (!pokemon) {
      throw new NotFoundException(`Pokémon com ID ${id} não encontrado.`);
    }
    return pokemon;
  }
 
  async levelUp(id: number): Promise<Pokemon> {
    const pokemon = await this.findOne(id);

    return this.prisma.pokemon.update({
      where: { id },
      data: {
        level: pokemon.level + 1,
      },
    });
  }

  async toggleFavorite(id: number): Promise<Pokemon> {
    const pokemon = await this.findOne(id);

    return this.prisma.pokemon.update({
      where: { id },
      data: {
        isFavorite: !pokemon.isFavorite,
      },
    });
  }

  async updateImage(id: number, imageUrl: string): Promise<Pokemon> {
    await this.findOne(id);

    return this.prisma.pokemon.update({
      where: { id },
      data: {
        imageUrl: imageUrl,
      },
    });
  }

  
}