/*
 * Copyright 2026 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Client as PlainJSClient } from 'boardgame.io/client';

const sessionsByGame = new WeakMap();

function getSessionKey(matchID, numPlayers) {
  return `${matchID || 'default'}::${numPlayers || 2}`;
}

function getActiveBotPlayer(state, bots) {
  if (!state || state.ctx.gameover !== undefined || !bots) {
    return null;
  }

  if (state.ctx.activePlayers) {
    for (const playerID of Object.keys(bots)) {
      if (playerID in state.ctx.activePlayers) {
        return playerID;
      }
    }
    return null;
  }

  if (state.ctx.currentPlayer in bots) {
    return state.ctx.currentPlayer;
  }

  return null;
}

function clone(entry) {
  if (entry === undefined || entry === null) return entry;
  try {
    return JSON.parse(JSON.stringify(entry));
  } catch {
    const seen = new WeakSet();
    return JSON.parse(
      JSON.stringify(entry, (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        if (typeof value === 'function') {
          return '[Function]';
        }
        return value;
      })
    );
  }
}

function redactLogEntryForPlayer(logEntry, playerID) {
  if (!logEntry || !logEntry.redact) {
    return logEntry;
  }

  const actingPlayer = logEntry.action?.payload?.playerID;
  if (actingPlayer === playerID) {
    return logEntry;
  }

  const redacted = clone(logEntry);
  if (redacted.action?.payload) {
    redacted.action.payload.args = ['<redacted>'];
  }
  return redacted;
}

function filterStateForPlayer(masterClient, playerID) {
  const rawState = masterClient.store.getState();
  return {
    ...rawState,
    G: masterClient.game.playerView({
      G: rawState.G,
      ctx: rawState.ctx,
      playerID,
    }),
  };
}

function ensureSession(opts, localOpts) {
  let sessionsForGame = sessionsByGame.get(opts.gameKey);
  if (!sessionsForGame) {
    sessionsForGame = new Map();
    sessionsByGame.set(opts.gameKey, sessionsForGame);
  }

  const sessionKey = getSessionKey(opts.matchID, opts.numPlayers);
  if (sessionsForGame.has(sessionKey)) {
    return sessionsForGame.get(sessionKey);
  }

  const masterClient = PlainJSClient({
    game: opts.gameKey,
    numPlayers: opts.numPlayers,
    matchID: opts.matchID,
    debug: false,
  });
  masterClient.start();

  const initializedBots = {};
  if (localOpts.bots && opts.game?.ai) {
    for (const playerID of Object.keys(localOpts.bots)) {
      const Bot = localOpts.bots[playerID];
      initializedBots[playerID] = new Bot({
        game: opts.gameKey,
        enumerate: opts.game.ai.enumerate,
        seed: opts.game.seed,
      });
    }
  }

  const session = {
    matchID: opts.matchID || 'default',
    masterClient,
    initialState: masterClient.getInitialState(),
    transports: new Set(),
    bots: localOpts.bots || null,
    initializedBots,
    botIsRunning: false,
  };

  sessionsForGame.set(sessionKey, session);
  return session;
}

function broadcastSync(session) {
  for (const transport of session.transports) {
    transport.pushSync();
  }
}

function maybeRunBotTurn(session) {
  if (!session.bots || session.botIsRunning) return;

  const state = session.masterClient.store.getState();
  const playerID = getActiveBotPlayer(state, session.initializedBots);
  if (playerID === null) return;

  session.botIsRunning = true;
  setTimeout(async () => {
    try {
      const bot = session.initializedBots[playerID];
      if (!bot || typeof bot.play !== 'function') return;
      const botAction = await bot.play(state, playerID);
      if (!botAction?.action) return;
      session.masterClient.store.dispatch(botAction.action);
      console.debug(
        `[examples][transport] bot-action match=${session.matchID} player=${playerID} type=${botAction.action.type}`
      );
    } catch (error) {
      console.debug('[examples][transport] bot-error', error);
    } finally {
      session.botIsRunning = false;
      broadcastSync(session);
      maybeRunBotTurn(session);
    }
  }, 0);
}

class LocalTransport {
  constructor(opts, localOpts) {
    this.transportDataCallback = opts.transportDataCallback;
    this.gameKey = opts.gameKey;
    this.game = opts.game;
    this.matchID = opts.matchID || 'default';
    this.playerID = opts.playerID || null;
    this.credentials = opts.credentials;
    this.numPlayers = opts.numPlayers || 2;
    this.localOpts = localOpts;
    this.session = null;
    this.connectionStatusCallback = () => {};
    this.isConnected = false;
  }

  subscribeToConnectionStatus(fn) {
    this.connectionStatusCallback = fn;
  }

  setConnectionStatus(isConnected) {
    this.isConnected = isConnected;
    this.connectionStatusCallback();
  }

  notifyClient(data) {
    this.transportDataCallback(data);
  }

  ensureSession() {
    if (!this.session) {
      this.session = ensureSession(
        {
          gameKey: this.gameKey,
          game: this.game,
          matchID: this.matchID,
          numPlayers: this.numPlayers,
        },
        this.localOpts
      );
    }
    return this.session;
  }

  connect() {
    const session = this.ensureSession();
    session.transports.add(this);
    this.setConnectionStatus(true);
    this.pushSync();
    maybeRunBotTurn(session);
  }

  disconnect() {
    if (this.session) {
      this.session.transports.delete(this);
    }
    this.setConnectionStatus(false);
  }

  sendAction(_state, action) {
    const session = this.ensureSession();
    session.masterClient.store.dispatch(action);

    const actionType = action?.payload?.type || action?.type;
    console.debug(
      `[examples][transport] action match=${this.matchID} player=${this.playerID ?? 'spectator'} type=${actionType}`
    );

    broadcastSync(session);
    maybeRunBotTurn(session);
  }

  sendChatMessage(matchID, chatMessage) {
    const session = this.ensureSession();
    for (const transport of session.transports) {
      transport.notifyClient({
        type: 'chat',
        args: [matchID, chatMessage],
      });
    }
  }

  requestSync() {
    this.pushSync();
  }

  pushSync() {
    const session = this.ensureSession();
    const state = filterStateForPlayer(session.masterClient, this.playerID);
    const log = (session.masterClient.log || []).map((entry) =>
      redactLogEntryForPlayer(clone(entry), this.playerID)
    );

    this.notifyClient({
      type: 'sync',
      args: [
        this.matchID,
        {
          state,
          log,
          initialState: session.initialState,
          filteredMetadata: undefined,
        },
      ],
    });

    console.debug(
      `[examples][transport] sync match=${this.matchID} player=${this.playerID ?? 'spectator'} stateID=${state._stateID}`
    );
  }

  updateMatchID(matchID) {
    if (this.matchID === matchID) return;
    if (this.session) {
      this.session.transports.delete(this);
    }
    this.matchID = matchID || 'default';
    this.session = null;
    if (this.isConnected) {
      this.connect();
    }
  }

  updatePlayerID(playerID) {
    this.playerID = playerID || null;
    if (this.isConnected) {
      this.requestSync();
    }
  }

  updateCredentials(credentials) {
    this.credentials = credentials;
  }
}

export function Local(localOpts = {}) {
  return (opts) => new LocalTransport(opts, localOpts);
}

export function SocketIO() {
  console.debug(
    '[examples][transport] SocketIO is unavailable in this branch; falling back to Local transport.'
  );
  return Local();
}
