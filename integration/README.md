# Integration Example

This folder is a minimal React integration app used to validate the published
`boardgame.io` package.

## Run with Bun

```sh
bun install
bun run test
bun run build
```

The root repository script `bun run test:integration` will:
1. Pack the current workspace package.
2. Install it into this app.
3. Run this app's test and build to verify compatibility.
