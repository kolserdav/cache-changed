import CacheChanged from '../index.js';

const cacheChanged = new CacheChanged({
  cacheFilePath: './tmp/cache.json',
  targetDirPath: './',
  exclude: ['node_modules', 'tmp'],
});

cacheChanged
  .compare()
  .catch((err) => {
    console.error('Failed to compare cache', err, new Error().stack);
  })
  .then((res) => {
    console.log('Compared cache result', res);
  });
