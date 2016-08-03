# muter

A node package to mute and/or capture console or other loggers' logs.

## Usage

Muter is a factory taking two arguments, the logger and the spied on method name.

```js
import Muter from 'muter';

const muter = Muter(console, 'error');
```
###The returned object has 5 main methods:

* mute(): To silence the logger and capture the logs.
* unmute(): To restore the logger to its normal use.
* capture(): To capture the logs without silencing the logger.
* uncapture(): Same as unmute().
* getLogs(color): Returns a colored string concatenation of all the logs. color is an optional argument. If not provided, text will be printed in default stdout/stderr color (most likely white on black or black on white). Colors are as defined by the [chalk](https://github.com/chalk/chalk) module.

```js
muter.mute();
// console.error outputs nothing anymore

console.error('Test message');
// This message is not printed

console.log(muter.getLogs('red'));
// Prints on stdout 'Test message' in red

muter.unmute();
// Restores console.error to default behavior

console.log(muter.getLogs('red'));
// Prints on stdout 'undefined'

muter.capture();
// stderr will still output logs

console.error('Another test message');
// Prints on stderr 'Another test message' in default color

console.log(muter.getLogs('red'));
// Prints on stdout 'Another test message' in red

muter.uncapture();
// Restores console.error to default behavior

console.log(muter.getLogs('red'));
// Prints on stdout 'undefined'
```
### Format strings

Muter supports the same format strings as console in [Node.js](https://nodejs.org) as it utilizes util.format from [util module](https://nodejs.org/api/util.html#util_util_format_format) under the hood.

```js
muter.mute();

for (let i = 1; i < 4; i++) {
  console.error('%d) %s %d', i, 'Cute test message', i);
  // Prints nothing
}

console.log(muter.getLogs());
// Prints:
// 1) Cute test message 1
// 2) Cute test message 2
// 3) Cute test message 3

muter.unmute();
```

## License

Muter is [MIT licensed](./LICENSE).
