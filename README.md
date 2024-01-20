# cache-changed

A simple library to monitor changes in a directory and cache the results. It allows you to compare the current state of a directory with its previous state, and return a list of added, updated, and deleted files. The library also provides a method to create a cache of the current state of the directory.

[![Npm package license](https://badgen.net/npm/license/cache-changed)](https://npmjs.com/package/cache-changed)
[![Npm package dependents](https://badgen.net/npm/dependents/cache-changed)](https://npmjs.com/package/cache-changed)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/kolserdav/cache-changed/pulls)

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

Result of compare:

```json
{
  "added": [],
  "updated": [
    {
      "file": "/nome/user/projects/cache-changed/.gitignore",
      "mtimeMs": 1705743775005.3252
    }
  ],
  "deleted": [],
  "isChanged": true
}
```
