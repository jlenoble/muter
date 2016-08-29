# muter

A node package to mute and/or capture console or other loggers' logs.

## Content

* [Basic usage](#basic-usage)
  * [Basic muting](#basic-muting)
  * [Basic capturing](#basic-capturing)
  * [Using options](#using-options)
    * [Available options](#available-options)
    * [Overriding options](#overriding-options)
  * [Clearing](#clearing)
* [Using several Muters in parallel](#using-several-muters-in-parallel)
  * [Distinct Muters](#distinct-muters)
  * [Related Muters](#related-muters)
  * [Overlapping Muters](#overlapping-muters)
* [Advanced usage](#advanced-usage)
  * [Coordinated muting/capturing](#coordinated-mutingcapturing)
  * [Printing](#printing)
  * [Flushing](#flushing)
  * [Forgetting](#forgetting)
* [Miscellaneous](#miscellaneous)
  * [Format strings](#format-strings)
  * [Handling hidden logging methods](#handling-hidden-logging-methods)
    * [gulp-util logger](#gulp-util-logger)
  * [Special arguments](#special-arguments)
* [Full API](#full-api)
* [License](#license)

## Basic usage

Muter is a factory generally taking two main arguments, the logger and the spied-on method name, plus an optional one used to help reformat the captured messages if desired.

### Basic muting

Using Muter can be as simple as writing the few lines:

```js
import Muter from 'muter';

const muter = Muter(console, 'log'); // Sets a Muter on console.log
muter.mute(); // The Muter starts muting console.log

console.log('Lorem ipsum'); // console.log prints nothing

const logs = muter.getLogs(); // Returns 'Lorem ipsum\n'

muter.unmute(); // The Muter stops muting console.log
```

Therefore a Muter does not only mute a specific logging method but **it also always captures what the muted method is expected to print.**

### Basic capturing

Muter can be used to capture seamlessly what a specific method of a logger is expected to print, that is to say without muting it. To do that, just call 'capture' instead of 'mute':

```js
import Muter from 'muter';

const muter = Muter(console, 'log'); // Sets a Muter on console.log
muter.capture(); // The Muter starts capturing console.log

console.log('Lorem ipsum'); // console.log prints as usual

const logs = muter.getLogs(); // Returns 'Lorem ipsum\n'

muter.uncapture(); // The Muter stops capturing console.log
```

### Using options

The messages captured by a Muter can be altered:

```js
import Muter from 'muter';

const muter = Muter(console, 'log', {
  color: 'magenta',
  format: (...args) => {
    return args.join(' • ');
  },
  endString: ' ▪▪▪'
}); // Sets a Muter on console.log with special formatting options
muter.mute(); // The Muter starts muting console.log

console.log('Lorem', 'ipsum'); // console.log prints nothing

const logs = muter.getLogs(); // Returns 'Lorem • ipsum ▪▪▪' in magenta

muter.unmute(); // The Muter stops muting console.log
```

But a Muter won't usually interfere with what is printed by the logging method if it is just captured and not muted altogether:

```js
import Muter from 'muter';

const muter = Muter(console, 'log', {
  color: 'magenta',
  format: (...args) => {
    return args.join(' • ');
  },
  endString: ' ▪▪▪'
}); // Sets a Muter on console.log with special formatting options
muter.capture(); // The Muter starts capturing console.log

console.log('Lorem', 'ipsum'); // console.log prints as usual with no special formatting

const logs = muter.getLogs(); // Returns 'Lorem • ipsum ▪▪▪' in magenta

muter.uncapture(); // The Muter stops capturing console.log
```

Unless of course you stipulate it explicitly by setting the option 'alter' to true:

```js
import Muter from 'muter';

const muter = Muter(console, 'log', {
  color: 'magenta',
  format: (...args) => {
    return args.join(' • ');
  },
  endString: ' ▪▪▪',
  alter: true
}); // Sets a Muter on console.log with special formatting options
muter.capture(); // The Muter starts capturing console.log

console.log('Lorem', 'ipsum'); // console.log is altered to print 'Lorem • ipsum ▪▪▪' in magenta

const logs = muter.getLogs(); // Returns 'Lorem • ipsum ▪▪▪' in magenta

muter.uncapture(); // The Muter stops capturing console.log
```

Note that the 'alter' option has no effect when the logging method is fully muted.

#### Available options

* color: Allows to change the output color. If not provided, text will be printed in default stdout/stderr color (most likely white on black or black on white). Colors are as defined by the [chalk](https://github.com/chalk/chalk) module.
* format: Allows to reformat the arguments with which logger[methodName] is called.
* endString: Helps change how the output string resulting from the call to logger[methodName] is terminated. It is simply '' or '\n' by default, but could be more sophisticated.
* alter: Boolean. If true, then not only are strings returned by the Muter methods reformatted according to options, but when the Muter is capturing without muting, the output on screen is also reformatted on the fly.
* logger: Not used when calling factory, but by methods 'getLogs' and 'flush'. When the Muter references several pairs (logger, methodName), this option in conjunction with the following one allows to precise which logging channel to access. See [Coordinated muting/capturing](#coordinated-mutingcapturing) for an example.
* method: Not used when calling factory, but by methods 'getLogs' and 'flush'. When the Muter references several pairs (logger, methodName), this option in conjunction with the previous one allows to precise which logging channel to access. See [Coordinated muting/capturing](#coordinated-mutingcapturing) for an example.

#### Overriding options

The options that a Muter was set with can be overridden when recovering the logged messages:

```js
import Muter from 'muter';

const muter = Muter(console, 'log', {
  color: 'magenta',
  format: (...args) => {
    return args.join(' • ');
  },
  endString: ' ▪▪▪'
}); // Sets a Muter on console.log with special formatting options
muter.mute(); // The Muter starts muting console.log

console.log('Lorem', 'ipsum'); // console.log prints nothing

var logs = muter.getLogs(); // Returns 'Lorem • ipsum ▪▪▪' in magenta

logs = muter.getLogs({
  color: 'cyan',
  endString: ' ▪'
}); // Returns 'Lorem • ipsum ▪' in cyan

logs = muter.getLogs({
  format: (...args) => {
   return args.join(' ••• ');
  }
}); // Returns 'Lorem ••• ipsum ▪▪▪' in magenta

muter.unmute(); // The Muter stops muting console.log
```

### Clearing

To clear a Muter, that is to say to both forget the captured logs and stop muting/capturing, you just call 'unmute' or 'uncapture'.

```js
import Muter from 'muter';

const muter = Muter(console, 'log'); // Sets a Muter on console.log
muter.mute(); // The Muter starts muting console.log

console.log('Lorem ipsum'); // console.log prints nothing

var logs = muter.getLogs(); // Returns 'Lorem ipsum\n'

muter.unmute(); // The Muter stops muting console.log

logs = muter.getLogs(); // Returns nothing

console.log('dolor sit amet'); // console.log prints as expected

logs = muter.getLogs(); // Returns nothing
```

## Using several Muters in parallel

### Distinct Muters

Muters can be used in parallel. They can't interfere with one another as long as they were not set with the same pair (logger, methodName).

In other words, two pairs can share the same logger, as in the following example:

```js
import Muter from 'muter';

const logMuter = Muter(console, 'log'); // Sets a Muter on console.log
const errorMuter = Muter(console, 'error'); // Sets a Muter on console.error

logMuter.mute(); // logMuter starts muting console.log
errorMuter.mute(); // errorMuter starts muting console.error

console.log('Lorem'); // console.log prints nothing
console.error('ipsum'); // console.error prints nothing
console.error('dolor'); // console.error prints nothing
console.log('sit'); // console.log prints nothing

const logMessage = logMuter.getLogs(); // Returns 'Lorem\nsit\n'
const errorMessage = errorMuter.getLogs(); // Returns 'ipsum\ndolor\n'

logMuter.unmute(); // logMuter stops muting console.log
errorMuter.unmute(); // errorMuter stops muting console.error
```

Or they can share the same logging method, as in:

```js
import Muter from 'muter';

const stdoutWrite = Muter(process.stdout, 'write'); // Sets a Muter on process.stdout.write
const stderrWrite = Muter(process.stderr, 'write'); // Sets a Muter on process.stderr.write

process.stdout.write === process.stderr.write; // true

stdoutWrite.mute(); // stdoutWrite starts muting process.stdout.write
stderrWrite.mute(); // stderrWrite starts muting process.stderr.write

process.stdout.write === process.stderr.write; // false

process.stdout.write('Lorem'); // process.stdout.write prints nothing
process.stderr.write('ipsum'); // process.stderr.write prints nothing
process.stderr.write('dolor'); // process.stderr.write prints nothing
process.stdout.write('sit'); // process.stdout.write prints nothing

const outMessage = stdoutWrite.getLogs(); // Returns 'Loremsit'
const errMessage = stderrWrite.getLogs(); // Returns 'ipsumdolor'

stdoutWrite.unmute(); // stdoutWrite stops muting process.stdout.write
stderrWrite.unmute(); // stderrWrite stops muting process.stderr.write
```

Of course, if two Muters share neither logger nor method, they'll a fortiori work alongside seamlessly.

### Related Muters

Internally, Muters are singletons. They have a one-to-one correspondence to pairs (logger, methodName), as those are generally global anyway.

So you can't a priori set several Muters with the same (logger, methodName) pair in a consistent manner. This is due to the third argument of the Muter factory. The first time you set a Muter, it will cache the options. Any other time, it will return the Muter singleton unless you specify new different options, upon which it will throw an error.

But you can use a slightly different construct (see [Advanced usage](#advanced-usage) for a general exposition) to have the same Muter formatting the same output differently. Take the arguments and put them in an array, pass the latter to the factory, and you get a sub-Muter that can be customized individually, as in the following example:

```js
import Muter from 'muter';

const log1 = Muter(console, 'log', {
  color: 'blue'
}); // Sets a Muter on console.log
const log2 = Muter([console, 'log', {
  color: 'red'
}]); // Associates different options to the same Muter

log1.mute(); // log1 starts muting console.log
// log2 is automatically muted, log2.mute() throws an error

console.log('Lorem'); // console.log prints nothing
console.log('ipsum'); // console.log prints nothing

const logMessage1 = log1.getLogs(); // Returns 'Lorem\nipsum\n' in blue
const logMessage2 = log2.getLogs(); // Returns 'Lorem\nipsum\n' in red

log1.unmute(); // log1 stops muting console.log
// Calling log2.unmute() is safe but unnecessary, as unmuting already occurred for console.log
```

### Overlapping Muters

Overlapping Muters are coordinated Muters (see [Advanced usage](#advanced-usage)) that share one or more (logger, methodName) pairs.

Changing the state of one Muter does affect the state of the other, making it potentially inconsistent, as the shared sub-Muter may now be muting whereas the other sub-Muters are still not. To prevent unexpected behaviors, the second Muter will throw errors on each method call until all its sub-Muters are once again in a consistent state.

```js
import Muter from 'muter';

const muter1 = Muter(
  [console, 'log'],
  [console, 'warn']
); // Sets a Muter on console.log and console.warn

const muter2 = Muter(
  [console, 'warn'],
  [console, 'error']
); // Shares the Muter on console.warn and sets a Muter on console.error

muter1.mute(); // muter1 mutes console.log and console.warn

console.log('Lorem ipsum'); // console.log prints nothing
console.warn('dolor'); // console.warn prints nothing
console.error('sit amet'); // console.error prints as expected

var logs1 = muter1.getLogs(); // Returns 'Lorem ipsum\ndolor\n'
var logs2 =  muter2.getLogs(); // Throws an error because console.warn and console.error are in inconsistent states

muter2.mute(); // Throws an error because console.warn cannot be muted twice

Muter(console, 'error').mute(); // Retrieves Muter singleton and mutes console.error, putting muter2 in a consistent state

logs2 = muter2.getLogs(); // Returns 'dolor\n'

muter1.unmute(); // Unmutes console.log and console.warn, leaving muter2 in an inconsistent state
muter2.unmute(); // Fine, re-unmutes console.warn and unmutes console.error, putting back muter2 in a consistent state
```

Needless to say that overlapping Muters should be avoided whenever possible.

## Advanced usage

Muters can be used in parallel as in [Using several Muters in parallel](#using-several-muters-in-parallel), but they actually can be coordinated, that is to say that their states can be changed simultaneously without having to micromanage them.

A special construct is provided to achieve this, using the same factory interface, but instead of calling it with a triplet (logger, methodName, options), you call it with a series of array arguments in a row, each containing a logger reference, a method name and optionally the options object.

### Coordinated muting/capturing

Using the Muter factory with a series of array arguments, we can set up basic coordination between Muters. For example we can mute and unmute several logging methods simultaneously:

```js
import Muter from 'muter';

const muter = Muter(
  [console, 'log'],
  [console, 'warn'],
  [console, 'error']
); // Sets a Muter on console.log, console.warn and console.error

muter.mute(); // The Muter mutes simultaneously console.log, console.warn and console.error

console.log('Lorem'); // console.log prints nothing
console.warn('ipsum'); // console.warn prints nothing
console.log('dolor'); // console.log prints nothing
console.error('sit'); // console.error prints nothing
console.log('amet'); // console.log prints nothing

const logMessage = muter.getLogs({
  logger: console,
  method: 'log'
}); // Returns 'Lorem\ndolor\namet\n'
const warnMessage = muter.getLogs({
  logger: console,
  method: 'warn'
}); // Returns 'ipsum\n'
const errorMessage = muter.getLogs({
  logger: console,
  method: 'error'
}); // Returns 'sit\n'
const message = muter.getLogs(); // Returns 'Lorem\nipsum\ndolor\nsit\namet\n'

muter.unmute(); // The Muter unmutes simultaneously console.log, console.warn and console.error
```

Coordinated capturing is pretty much the same, by calling 'capture' instead of 'mute' and 'uncapture' instead of 'unmute'.

### Printing

With 'getLogs', you can return whatever was logged from muting to unmuting. But you can also print it on screen with method 'print'.

```js
import Muter from 'muter';

const muter = Muter(console, 'log'); // Sets a Muter on console.log
muter.mute(); // The Muter starts muting console.log

console.log('Lorem ipsum'); // console.log prints nothing

muter.print(); // Prints 'Lorem ipsum\n'

console.log('dolor sit amet'); // console.log prints nothing

muter.print(); // Prints 'Lorem ipsum\ndolor sit amet\n'
muter.print(0); // Prints 'Lorem ipsum\n'
muter.print(1); // Prints 'dolor sit amet\n'

muter.unmute(); // The Muter stops muting console.log
```

### Flushing

First you 'mute'/'capture', last you 'unmute'/'uncapture'. Inbetween, you log stuff and if you want, you access the log history with 'getLogs'. But the log history is whatever was logged from muting to unmuting. You may want to get it by chunks, especially if you access it several times before unmuting. But you can also 'flush' the logs. Calling that method doesn't affect the state of the Muter, but it prints the current history before clearing it.

```js
import Muter from 'muter';

const muter = Muter(console, 'log'); // Sets a Muter on console.log
muter.mute(); // The Muter starts muting console.log

console.log('Lorem ipsum'); // console.log prints nothing

muter.flush(); // Prints 'Lorem ipsum\n'
muter.flush(); // Prints nothing

console.log('dolor sit amet'); // console.log prints nothing

muter.flush(); // Prints 'dolor sit amet\n'
muter.flush(); // Prints nothing

muter.unmute(); // The Muter stops muting console.log
```

### Forgetting

Method 'forget' flushes without printing on screen.

```js
import Muter from 'muter';

const muter = Muter(console, 'log'); // Sets a Muter on console.log
muter.mute(); // The Muter starts muting console.log

console.log('Lorem ipsum'); // console.log prints nothing

var logs = muter.getLogs(); // Returns 'Lorem ipsum\n'
muter.forget(); // Forgets history
logs = muter.getLogs(); // Returns ''

console.log('dolor sit amet'); // console.log prints nothing

logs = muter.getLogs(); // Returns 'dolor sit amet\n'
muter.forget(); // Forgets history
logs = muter.getLogs(); // Returns ''

muter.unmute(); // The Muter stops muting console.log
```

## Miscellaneous

### Format strings

Muter supports the same format strings as console in [Node.js](https://nodejs.org) as it utilizes util.format from [util module](https://nodejs.org/api/util.html#util_util_format_format) under the hood.

```js
import Muter from 'muter';

const muter = Muter(console, 'log'); // Sets a Muter on console.log

muter.mute(); // Mutes console.log

for (let i = 1; i < 4; i++) {
  console.log('%d) %s%d', i, 'message', i); // console.log prints nothing
}

const logs = muter.getLogs(); // Returns '1) message1\n2) message2\n3) message3\n'

muter.unmute(); // Unmutes console.log
```

But if you specify a custom formatter as an option, it's your responsability to handle the special formatting strings.

### Handling hidden logging methods

Some fancy loggers print on interleaved channels. To mute such loggers, you need first to identify all those channels and then set a coordinating Muter on them (see [Advanced usage](#advanced-usage)), as in the following example:

```js
import Muter from 'muter';

function log() {
  console.info('>>>>');
  console.log(...arguments);
  console.info('<<<<');
} // A custom logging function printing on interleaved console.info and console.log

const muter = Muter(
  [console, 'info'],
  [console, 'log']
); // Sets a Muter on consoleL.info and console.log

muter.mute(); // Mutes console.info and console.log, therefore muting the custom logging function 'log'

log('Lorem', 'ipsum'); // Prints nothing
log('dolor', 'sit', 'amet'); // Prints nothing

const logs = muter.getLogs(); // Returns '>>>>\nLorem ipsum\n<<<<\n>>>>\ndolor sit amet\n<<<<\n'

muter.unmute(); // Unmutes console.info and console.log, therefore unmuting  the custom logging function 'log'
```

#### gulp-util logger

gulp-util 'log' method is such a fancy logger. The two interleaved channels are process.stdout.write and console.log. But you may use a special construct directly, see [Special arguments](#special-arguments).

### Special arguments

As a convenience, you may call the Muter factory with special arguments to have common Muters be set.

```js
import Muter from 'muter';
import gulp from 'gulp';
import gutil from 'gulp-util';

const muter1 = Muter(process); // Sets Muters on process.stdout.write and process.stderr.write, therefore allowing to silence the whole process
const muter2 = Muter(console); // Sets Muters on all four logging methods of console
const muter3 = Muter(gutil); // Sets a Muter on gulp-util logger
const muter4 = Muter(gulp); // Same as Muter(gutil)
```

## Full API

* ```Muter(logger, methodName [, options])```: Muter is the default import of the 'muter' module. This construct returns a singleton associated with the pair (logger, methodName), able to mute/unmute it at will (see [Basic muting](#basic-muting)). Options are explained in [Using options](#using-options).
They are set once and for all, but can be overridden by methods such as 'getLogs' or 'flush'.
* ```Muter(Array(logger1, methodName1 [, options1]), Array(logger2, methodName2 [, options2])[, ...])```: This construct improves on the previous one, allowing to set coordinated Muters on several pairs (logger, methodName) (see [Coordinated muting/capturing](#coordinated-mutingcapturing)). Though options are set once and for all when a Muter singleton is created, calling this construct encapsulates and therefore allows to override these options (see [Related Muters](#related-muters)).
* ```mute()```: Mutes (and captures) all pairs (logger, methodName) referenced by the Muter. See [Basic muting](#basic-muting) and  [Coordinated muting/capturing](#coordinated-mutingcapturing).
* ```unmute()```: Unmutes all pairs (logger, methodName) referenced by the Muter and resets logging history.
* ```capture()```: Captures all pairs (logger, methodName) referenced by the Muter. See [Basic capturing](#basic-capturing) and  [Coordinated muting/capturing](#coordinated-mutingcapturing).
* ```uncapture()```: Uncaptures all pairs (logger, methodName) referenced by the Muter and resets logging history.
* ```print([nth])```: Prints the whole logging history (no argument) or the nth logged message by one of the muted/captured pair (logger, methodName), see [Printing](#printing).
* ```getLogs([options])```: Returns the whole logging history since last muting/capturing/flushing. options override those set on the pair (logger, methodName) on creation (see [Overriding options](#overriding-options)).
* ```flush([options])```: Like 'getLogs([options])', returns the whole logging history, but also both prints it and resets it, see [Flushing](#flushing).
* ```forget()```: Returns and resets the logging history, but don't print it, see [Forgetting](#forgetting).

## License

Muter is [MIT licensed](./LICENSE).

© [Jason Lenoble](mailto:jason.lenoble@gmail.com)
