<p align="center">
  <a href="https://boardgame.io/">
    <img src="https://raw.githubusercontent.com/boardgameio/boardgame.io/main/docs/logo-optimized.svg?sanitize=true" alt="boardgame.io" />
  </a>
</p>

<p align="center">
<a href="https://www.npmjs.com/package/boardgame.io"><img src="https://badge.fury.io/js/boardgame.io.svg" alt="npm version" /></a>
<a href="https://github.com/Drasky-Vanderhoff/boardgame.io/actions?query=workflow%3ATests"> <img src="https://github.com/Drasky-Vanderhoff/boardgame.io/workflows/Tests/badge.svg" alt='Build Status'></a>
<a href='https://coveralls.io/github/Drasky-Vanderhoff/boardgame.io?branch=main'><img src='https://coveralls.io/repos/github/Drasky-Vanderhoff/boardgame.io/badge.svg?branch=main' alt='Coverage Status' /></a>
<a href="https://gitter.im/boardgame-io"><img src="https://badges.gitter.im/boardgame-io.svg" alt="Gitter" /></a>
</p>

<p align="center">
  <strong><a href="https://boardgame.io/documentation/#/">Read the Documentation</a></strong>
</p>

<p align="center">
  <strong>boardgame.io</strong> is a React-first engine for creating turn-based games with JavaScript.
</p>

Write simple functions that describe how the game state changes when a move is made.
Use the client and React bindings to render boards, apply moves, run events, and integrate AI bots.

### Features

- **Game Engine Core**: Deterministic move/event processing with phase and turn-order support.
- **React Client**: Compose your game with `Client({ game, board })` from `boardgame.io/react`.
- **AI**: Built-in bot utilities including random and MCTS bots.
- **Plugins**: Extend behavior via plugin hooks and APIs.
- **Testing Helpers**: Utilities for deterministic randomness in tests.

## Usage

### Installation

```sh
bun add boardgame.io
```

### Documentation

Read our [Full Documentation](https://boardgame.io/documentation/) to learn how to
use boardgame.io, and join the [community on gitter](https://gitter.im/boardgame-io/General)
to ask your questions.

### Running checks in this repository

```sh
bun install
bun run ts
bun run test
bun run build
```

### Integration sample in this repository

```sh
bun run test:integration
```

This validates a React tic-tac-toe app in `/integration` against the current package.

#### Using VS Code?

This repository is ready to run in a dev container in VS Code. See [the contributing guidelines for details](CONTRIBUTING.md).

## Changelog

See [changelog](docs/documentation/CHANGELOG.md).

## Get involved

We welcome contributions of all kinds.
Please take a moment to review our [Code of Conduct](CODE_OF_CONDUCT.md).

🐛 **Found a bug?**
Let us know by [creating an issue][new-issue].

❓ **Have a question?**
Our [Gitter channel][gitter] and [GitHub Discussions][discussions]
are good places to start.

⚙️ **Interested in fixing a [bug][bugs] or adding a [feature][features]?**
Check out the [contributing guidelines](CONTRIBUTING.md)
and the [project roadmap](roadmap.md).

📖 **Can we improve [our documentation][docs]?**
Pull requests even for small changes can be helpful.

[new-issue]: https://github.com/boardgameio/boardgame.io/issues/new/choose
[gitter]: https://gitter.im/boardgame-io/General
[discussions]: https://github.com/boardgameio/boardgame.io/discussions
[bugs]: https://github.com/boardgameio/boardgame.io/issues?q=is%3Aissue+is%3Aopen+label%3Abug
[features]: https://github.com/boardgameio/boardgame.io/issues?q=is%3Aissue+is%3Aopen+label%3Afeature
[docs]: https://boardgame.io/documentation/
[sponsors]: https://github.com/sponsors/boardgameio
[collective]: https://opencollective.com/boardgameio#support

## License

[MIT](LICENSE)
