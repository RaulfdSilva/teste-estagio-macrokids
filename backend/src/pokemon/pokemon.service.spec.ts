import { Test, TestingModule } from '@nestjs/testing';
import { PokemonService } from './pokemon.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs'; 


// --- MOCKS ---
const mockPrismaService = {
  pokemon: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn()
  },
};

const mockHttpService = {
  get: jest.fn(),
};


describe('PokemonService', () => {
  let service: PokemonService;
  let prisma: PrismaService;
  let http: HttpService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: HttpService, useValue: mockHttpService }, 
      ],
    }).compile();

    service = module.get<PokemonService>(PokemonService);
    prisma = module.get<PrismaService>(PrismaService);
    http = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve aumentar o nível do Pokémon em 1 (TDD)', async () => {
   
    const mockPokemon = { id: 1, level: 5, name: 'Pikachu' } as any;
    jest.spyOn(prisma.pokemon, 'findUnique').mockResolvedValue(mockPokemon);
    jest.spyOn(prisma.pokemon, 'update').mockResolvedValue({ 
        ...mockPokemon, 
        level: 6
    } as any);
    const updatedPokemon = await service.levelUp(1);
    expect(prisma.pokemon.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
            level: 6, 
        },
    });
    expect(updatedPokemon.level).toBe(6);
  });
})