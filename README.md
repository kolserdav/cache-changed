# cache-changed

A simple library to monitor changes in a directory and cache the results. It allows you to compare the current state of a directory with its previous state, and return a list of added, updated, and deleted files. The library also provides a method to create a cache of the current state of the directory.

> The library uses only asynchronous operations where possible. Due to this, better performance is expected, but no error stack.

## Installation

```sh
npm i cache-changed
```

## Usage

Import `CacheChanged` class and get an instance of it:

```javascript
import path from 'path';
import CacheChanged from '../index.js';

const cwd = process.cwd();

const cacheChanged = new CacheChanged({
  cacheFilePath: path.resolve(cwd, './tmp/cache.json'),
  targetDirPath: path.resolve(cwd, './'),
  exclude: ['node_modules'],
});
```

Creating a cache from the `targetDirPath` directory to the `cacheFilePath` file:

```javascript
cacheChanged
  .create()
  .catch((err) => {
    console.error('Failed to create cache', err, new Error().stack);
  })
  .then((code) => {
    console.log('Created cache files count', code);
  });
```

Comparison of cache from file `cacheFilePath` and directory `targetDirPath`:

```javascript
cacheChanged
  .compare()
  .catch((err) => {
    console.error('Failed to compare cache', err, new Error().stack);
  })
  .then((res) => {
    console.log('Compared cache result', res);
  });
```