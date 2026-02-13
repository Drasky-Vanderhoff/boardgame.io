import { createStore, applyMiddleware } from 'redux';
import { ProcessGameConfig } from './game';
import { CreateGameReducer, TransientHandlingMiddleware } from './reducer';
import { InitializeGame } from './initialize';
import { makeMove, gameEvent } from './action-creators';

describe('core smoke', () => {
  test('processes moves and turn events', () => {
    const game = ProcessGameConfig({
      moves: {
        add: ({ G }, value: number) => ({ total: G.total + value }),
      },
      setup: () => ({ total: 0 }),
    });

    const reducer = CreateGameReducer({ game });
    const store = createStore(
      reducer,
      InitializeGame({ game }),
      applyMiddleware(TransientHandlingMiddleware)
    );

    store.dispatch(makeMove('add', [3], '0'));
    expect(store.getState().G).toEqual({ total: 3 });
    expect(store.getState().ctx.turn).toBe(1);

    store.dispatch(gameEvent('endTurn', undefined, '0'));
    expect(store.getState().ctx.turn).toBe(2);
  });
});
