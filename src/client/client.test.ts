import { createStore } from 'redux';
import { CreateGameReducer } from '../core/reducer';
import { InitializeGame } from '../core/initialize';
import { Client, createMoveDispatchers } from './client';
import { ProcessGameConfig } from '../core/game';
import { Transport } from './transport/transport';
import { makeMove, sync } from '../core/action-creators';
import type { Game, SyncInfo } from '../types';

describe('Client', () => {
  test('creates initial state and applies moves', () => {
    const client = Client({
      game: {
        setup: () => ({ value: 0 }),
        moves: {
          inc: ({ G }) => ({ value: G.value + 1 }),
        },
      },
    });

    expect(client.getState()?.G).toEqual({ value: 0 });
    client.moves.inc();
    expect(client.getState()?.G).toEqual({ value: 1 });
  });

  test('supports event dispatchers', () => {
    const client = Client({ game: {} });
    expect(client.getState()?.ctx.turn).toBe(1);
    client.events.endTurn();
    expect(client.getState()?.ctx.turn).toBe(2);
  });

  test('applies playerView in local mode', () => {
    const client = Client({
      game: {
        setup: () => ({ secret: true }),
        playerView: ({ playerID }) => ({ strippedFor: playerID }),
      },
      playerID: '1',
    });

    expect(client.getState()?.G).toEqual({ strippedFor: '1' });
  });

  test('updates local log from moves', () => {
    const client = Client({
      game: {
        moves: {
          A: () => ({}),
        },
      },
    });

    client.moves.A();
    client.moves.A();

    expect(client.log).toEqual([
      {
        action: makeMove('A', [], '0'),
        _stateID: 0,
        phase: null,
        turn: 1,
      },
      {
        action: makeMove('A', [], '0'),
        _stateID: 1,
        phase: null,
        turn: 1,
      },
    ]);
  });

  test('accepts a custom store enhancer', () => {
    let calls = 0;
    const spyEnhancer = (vanillaCreateStore) => (...args) => {
      const store = vanillaCreateStore(...args);
      return {
        ...store,
        dispatch: (action) => {
          calls++;
          return store.dispatch(action);
        },
      };
    };

    const client = Client({
      game: {
        moves: {
          A: () => ({}),
        },
      },
      enhancer: spyEnhancer,
    });

    client.moves.A();
    expect(calls).toBe(1);
  });

  test('can consume transport sync/update data from a custom transport', () => {
    let emitToClient;

    const client = Client({
      game: {},
      matchID: 'A',
      multiplayer: ({ transportDataCallback }) => {
        emitToClient = transportDataCallback;
        return {
          connect() {},
          disconnect() {},
          sendAction() {},
          sendChatMessage() {},
          requestSync() {},
          updateMatchID() {},
          updatePlayerID() {},
          updateCredentials() {},
          subscribeToConnectionStatus() {},
          isConnected: true,
        } as unknown as Transport;
      },
    });

    client.start();

    emitToClient({
      type: 'sync',
      args: ['A', { state: { G: 'G1', ctx: {}, _stateID: 1 } } as SyncInfo],
    });
    expect(client.getState()?.G).toEqual('G1');

    emitToClient({
      type: 'update',
      args: ['A', { G: 'G2', ctx: {}, _stateID: 2 }, []],
    });
    expect(client.getState()?.G).toEqual('G2');

    client.stop();
  });
});

describe('createMoveDispatchers', () => {
  test('defaults undefined playerID to current player in single-player mode', () => {
    const game = ProcessGameConfig({
      moves: {
        moveBy: ({ playerID }) => ({ playerID }),
      },
    });
    const reducer = CreateGameReducer({ game });
    const initialState = InitializeGame({ game });
    const store = createStore(reducer, initialState);

    const api = createMoveDispatchers(game.moveNames, store);
    api.moveBy();

    expect(store.getState().G).toEqual({ playerID: '0' });
  });

  test('keeps undefined playerID when multiplayer mode is enabled', () => {
    const game = ProcessGameConfig({
      moves: {
        moveBy: ({ playerID }) => ({ playerID }),
      },
    });
    const reducer = CreateGameReducer({ game });
    const initialState = InitializeGame({ game });
    const store = createStore(reducer, initialState);

    const api = createMoveDispatchers(
      game.moveNames,
      store,
      undefined,
      undefined,
      true
    );
    api.moveBy();

    expect(store.getState().G).toEqual({ playerID: undefined });
  });

  test('sync action seeds initial state in multiplayer mode', () => {
    const client = Client({
      game: {
        moves: {
          A: () => ({}),
        },
      },
      multiplayer: () => ({
        connect() {},
        disconnect() {},
        sendAction() {},
        sendChatMessage() {},
        requestSync() {},
        updateMatchID() {},
        updatePlayerID() {},
        updateCredentials() {},
        subscribeToConnectionStatus() {},
        isConnected: true,
      } as unknown as Transport),
    });

    expect(client.getState()).toBeNull();
    client.store.dispatch(sync({ state: { G: {}, ctx: {}, _stateID: 0 } } as SyncInfo));
    expect(client.getState()).not.toBeNull();
  });
});
