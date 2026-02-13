const shell = require('shelljs');

shell.set('-e');

shell.rm('-rf', 'dist');
shell.exec('bun pm pack');
const packed = shell.ls('./boardgame.io-*.tgz').stdout.trim();

shell.mv(packed, 'integration');
shell.cd('integration');
shell.rm('-rf', 'node_modules', 'package-lock.json', 'bun.lock');
shell.mkdir('-p', 'node_modules');
shell.exec(`tar -xzf ${packed} -C node_modules`);
if (shell.test('-d', 'node_modules/package')) {
  shell.mv('node_modules/package', 'node_modules/boardgame.io');
}
shell.rm(packed);

// Test
shell.exec('bun run test');
shell.exec('bun run build');
