import { Pokemon } from '@prisma/client';

export interface PokemonListResponse {
  data: Pokemon[];
  totalCount: number;
}

export class UpdateImageDto {
  imageUrl: string;
}