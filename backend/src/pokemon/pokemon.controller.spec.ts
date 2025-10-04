import { Test, TestingModule } from '@nestjs/testing';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service'; 


const detailResponse = (name: string, id: number) => ({
    data: { 
        id, 
        name, 
        sprites: { 
            // Mock que o Service espera:
            front_default: `https://pokeapi.co/sprites/${name}.png` 
        } 
    },
    status: 200, statusText: 'OK', headers: {}, config: {}
});


const mockPokemonService = {
  importAllPokemons: jest.fn(),
  findAll: jest.fn(),
  levelUp: jest.fn(),
  toggleFavorite: jest.fn(),
  updateImage: jest.fn(),
};



describe('PokemonController', () => {
  let controller: PokemonController;
  let service: PokemonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonController],
      providers: [
        {
          provide: PokemonService,
          useValue: mockPokemonService,
        },
      ],
    }).compile();

    controller = module.get<PokemonController>(PokemonController);
    service = module.get<PokemonService>(PokemonService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('o método import deve chamar o service.importAllPokemons', async () => {
    const importResult = { count: 10 };
    jest.spyOn(service, 'importAllPokemons').mockResolvedValue(importResult);
    const result = await controller.import();  
    expect(service.importAllPokemons).toHaveBeenCalled(); 
    expect(result).toEqual(importResult);
  });
});