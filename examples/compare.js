import path from 'path';
import CacheChanged from 'cache-changed';

const cwd = process.cwd();

const cacheChanged = new CacheChanged({
  cacheFilePath: path.resolve(cwd, './tmp/cache.json'),
  targetDirPath: path.resolve(cwd, './'),
  exclude: ['node_modules'],
});

cacheChanged
  .compare()
  .catch((err) => {
    console.error('Failed to compare cache', err, new Error().stack);
  })
  .then((res) => {
    console.log('Compared cache result', res);
  });
