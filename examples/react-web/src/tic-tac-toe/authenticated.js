/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from '../local-multiplayer';
import TicTacToe from './game';
import Board from './board';
import PropTypes from 'prop-types';

const App = Client({
  game: TicTacToe,
  board: Board,
  debug: false,
  multiplayer: SocketIO(),
});

class AuthenticatedClient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      matchID: 'authenticated-local',
      players: {
        0: {
          credentials: 'player-0',
        },
        1: {
          credentials: 'player-1',
        },
      },
    };
  }

  componentDidMount() {
    console.debug(
      '[examples] Authenticated example uses local transport in this client-only branch.'
    );
  }

  onPlayerCredentialsChange(playerID, credentials) {
    this.setState({
      matchID: this.state.matchID,
      players: {
        ...this.state.players,
        [playerID]: {
          credentials,
        },
      },
    });
  }

  render() {
    return (
      <AuthenticatedExample
        matchID={this.state.matchID}
        players={this.state.players}
        onPlayerCredentialsChange={this.onPlayerCredentialsChange.bind(this)}
      />
    );
  }
}

class AuthenticatedExample extends React.Component {
  static propTypes = {
    matchID: PropTypes.string,
    players: PropTypes.any,
    onPlayerCredentialsChange: PropTypes.func,
  };

  render() {
    return (
      <div>
        <h1>Authenticated</h1>

        <p>
          Change the credentials to simulate identity changes while using the
          local transport.
        </p>

        <div className="runner">
          <div className="run">
            <App
              matchID={this.props.matchID}
              playerID="0"
              credentials={this.props.players['0'].credentials}
            />
            <input
              type="text"
              value={this.props.players['0'].credentials}
              onChange={(event) =>
                this.props.onPlayerCredentialsChange('0', event.target.value)
              }
            />
          </div>
          <div className="run">
            <App
              matchID={this.props.matchID}
              playerID="1"
              credentials={this.props.players['1'].credentials}
            />
            <input
              type="text"
              value={this.props.players['1'].credentials}
              onChange={(event) =>
                this.props.onPlayerCredentialsChange('1', event.target.value)
              }
            />
          </div>
        </div>
      </div>
    );
  }
}

export default AuthenticatedClient;
