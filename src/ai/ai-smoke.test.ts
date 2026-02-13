import { RandomBot } from './random-bot';
import { InitializeGame } from '../core/initialize';
import { ProcessGameConfig } from '../core/game';

describe('ai smoke', () => {
  test('RandomBot returns a legal move action', async () => {
    const game = ProcessGameConfig({
      setup: () => ({ cells: [null] }),
      moves: {
        clickCell: ({ G }) => ({ cells: ['0'] }),
      },
      ai: {
        enumerate: (G) =>
          G.cells[0] === null ? [{ move: 'clickCell', args: [0] }] : [],
      },
    });

    const state = InitializeGame({ game });

    const bot = new RandomBot({
      game,
      enumerate: game.ai.enumerate,
      seed: 'seed',
    });

    const { action } = await bot.play(state, '0');

    expect(action.type).toBe('MAKE_MOVE');
    expect(action.payload.type).toBe('clickCell');
    expect(action.payload.playerID).toBe('0');
  });
});
