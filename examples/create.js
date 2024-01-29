// @ts-check
import CacheChanged from '../cache-changed.js';

const cacheChanged = new CacheChanged({
  cacheFilePath: './tmp/cache.json',
  targetDirPath: './',
  exclude: ['node_modules', 'examples/create.js', 'tmp'],
});

cacheChanged
  .create()
  .catch((err) => {
    console.error('Failed to create cache', err, new Error().stack);
  })
  .then((code) => {
    console.log('Created cache count files', code);
  });
