import path from 'path';
import CacheChanged from '../index.js';

const cwd = process.cwd();

const cacheChanged = new CacheChanged({
  cacheFilePath: path.resolve(cwd, './tmp/cache.json'),
  targetDirPath: path.resolve(cwd, './'),
  exclude: ['node_modules'],
});

cacheChanged
  .create()
  .catch((err) => {
    console.error('Failed to create cache', err, new Error().stack);
  })
  .then((code) => {
    console.log('Created cache count files', code);
  });
