# Client

Creates a `boardgame.io` client for local, client-side game execution.

<!-- tabs:start -->

### **Plain JS**

#### Import

```js
import { Client } from 'boardgame.io/client';
```

### Creating a client

```js
const client = Client({
  game,
  numPlayers: 2,
  playerID: '0',
  enhancer,
});
```

#### Options

1. `game` (_object_, required): Game definition.
2. `numPlayers` (_number_, optional): Number of players.
3. `playerID` (_string_, optional): Current player id.
4. `enhancer` (_StoreEnhancer_, optional): Redux enhancer.

### Client API

- `moves`: Dispatch move functions.
- `events`: Dispatch game events (`endTurn`, `endPhase`, etc.).
- `plugins`: Dispatch plugin actions.
- `log`: Deltalog/history entries.

### Methods

- `start()`: Starts the client.
- `stop()`: Stops the client.
- `getState()`: Returns current state (`G`, `ctx`, `plugins`, `log`, `isActive`, `isConnected`) or `null`.
- `subscribe(cb)`: Subscribes to state updates; returns unsubscribe.
- `reset()`: Resets game state.
- `undo()`: Undo previous action.
- `redo()`: Redo undone action.
- `updatePlayerID(id)`: Updates active player id.

### **React**

#### Import

```js
import { Client } from 'boardgame.io/react';
```

#### Usage

```js
const App = Client({
  game,
  board: Board,
  numPlayers: 2,
  debug: false,
});
```

The returned React component accepts these props:

1. `matchID` (_string_)
2. `playerID` (_string_)
3. `credentials` (_string_)
4. `debug` (_boolean_)

#### Board Props

Your board component receives:

- `G`
- `ctx`
- `plugins`
- `moves`
- `events`
- `reset`
- `undo`
- `redo`
- `log`
- `isActive`
- `isConnected`
- `playerID`

<!-- tabs:end -->
