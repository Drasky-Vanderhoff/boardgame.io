import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { Client } from './react';

let latestProps: any;

const RecorderBoard = (props: any) => {
  latestProps = props;
  return <div data-testid="board-state">{JSON.stringify(props.G)}</div>;
};

describe('React Client', () => {
  test('renders board and wires move API', () => {
    const App = Client({
      game: {
        setup: () => ({ count: 0 }),
        moves: {
          inc: ({ G }) => ({ count: G.count + 1 }),
        },
      },
      board: RecorderBoard,
      debug: false,
    });

    render(<App />);

    expect(latestProps.G).toEqual({ count: 0 });
    expect(latestProps.isMultiplayer).toBe(false);

    act(() => {
      latestProps.moves.inc();
    });

    expect(latestProps.G).toEqual({ count: 1 });
    expect(screen.getByTestId('board-state').textContent).toContain('"count":1');
  });

  test('passes additional wrapper props to board', () => {
    const App = Client({
      game: {},
      board: RecorderBoard,
      debug: false,
    });

    render(<App extraValue={55} />);

    expect(latestProps.extraValue).toBe(55);
  });

  test('uses custom loading component while waiting for multiplayer sync', () => {
    const App = Client({
      game: {},
      board: RecorderBoard,
      debug: false,
      loading: () => <div>loading-custom</div>,
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
        isConnected: false,
      } as any),
    });

    render(<App />);
    expect(screen.getByText('loading-custom')).toBeInTheDocument();
  });
});
