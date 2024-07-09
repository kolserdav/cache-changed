import path from 'path';
import { readFile, readdir, stat, writeFile } from 'fs';
import { tmpdir } from 'os';

/**
 * @borrows package.json[name]
 */
const PACKAGE_NAME = 'cache-changed';
const EXCLUDE_DEFAULT = ['.git'];
const TARGET_DIR_PATH_DEFAULT = './';

const cwd = process.cwd();

/**
 * @typedef {{
 *  pathAbs: string;
 *  mtimeMs: number;
 *  isDir: boolean;
 *  size: number;
 * }} CacheItem
 * @typedef {{
 *  cacheFilePath?: string;
 *  targetDirPath?: string;
 *  exclude?: string[];
 * }} CacheChangedOptions
 */

export default class CacheChanged {
  /**
   * @private
   * @type {string}
   */
  cacheFilePath = path.resolve(cwd, `${PACKAGE_NAME}.json`);
  /**
   * @private
   * @type {string}
   */
  targetDirPath = cwd;
  /**
   * @private
   * @type {string[]}
   */
  exclude = [];

  /**
   * @param {CacheChangedOptions | undefined} [options={}]
   */
  constructor({ cacheFilePath, targetDirPath, exclude } = {}) {
    const cacheFileName = `${PACKAGE_NAME}_${PACKAGE_NAME}.json`;
    let _cacheFilePath = cacheFilePath;
    if (!cacheFilePath) {
      _cacheFilePath = path.resolve(tmpdir(), cacheFileName);
    }

    let _targetDirPath = targetDirPath;
    if (!targetDirPath) {
      _targetDirPath = TARGET_DIR_PATH_DEFAULT;
    }

    this.cacheFilePath = _cacheFilePath || cacheFileName;
    this.targetDirPath = _targetDirPath || TARGET_DIR_PATH_DEFAULT;
    this.exclude = exclude ? exclude.concat(EXCLUDE_DEFAULT) : EXCLUDE_DEFAULT;
  }

  /**
   * @private
   * @param {string} dirPath
   * @returns {Promise<string[]>}
   */
  async readDir(dirPath) {
    return new Promise((resolve, reject) => {
      readdir(dirPath, (err, _dir) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(_dir);
      });
    });
  }

  /**
   * @public
   * @param {{
   *  noWrite?: boolean;
   * }} [options={}]
   * @returns {Promise<CacheItem[]>}
   */
  async create({ noWrite } = {}) {
    return new Promise((resolve, reject) => {
      this.getCreated()
        .then((data) => {
          if (noWrite) {
            resolve(data);
          } else {
            writeFile(this.cacheFilePath, JSON.stringify(data), (err) => {
              if (err) {
                reject(err);
              }
              resolve(data);
            });
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * @typedef {{
   *  isChanged: boolean;
   *  added: CacheItem[];
   *  updated: CacheItem[];
   *  deleted: CacheItem[];
   * }} CompareResult
   */

  /**
   * @public
   * @param {CacheItem[] | undefined} cached
   * @returns {Promise<CompareResult>}
   */
  async compare(cached = undefined) {
    return new Promise((resolve, reject) => {
      this.getCompared(cached)
        .then(({ cached: _cached, current }) => {
          /**
           * @type {CompareResult}
           */
          const res = {
            added: [],
            updated: [],
            deleted: [],
            isChanged: false,
          };
          current.forEach((item) => {
            const cachedItem = _cached.find((_item) => item.pathAbs === _item.pathAbs);
            if (!cachedItem) {
              res.added.push(item);
              return;
            }
            if (cachedItem.mtimeMs !== item.mtimeMs) {
              res.updated.push(item);
            }
          });
          _cached.forEach((item) => {
            const currentItem = current.find((_item) => item.pathAbs === _item.pathAbs);
            if (!currentItem) {
              res.deleted.push(item);
            }
          });

          if (res.added.length || res.deleted.length || res.updated.length) {
            res.isChanged = true;
          }

          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * @private
   * @param {CacheItem[] | undefined} cached
   * @returns {Promise<{current: CacheItem[], cached: CacheItem[]}>}
   */
  async getCompared(cached = undefined) {
    /**
     * @type {Error | undefined}
     */
    let error;
    /**
     * @type {CacheItem[]}
     */
    let cache = [];
    if (!cached) {
      cache = await new Promise((resolve, reject) => {
        readFile(this.cacheFilePath, (err, data) => {
          if (err) {
            reject(err);
          }
          /**
           * @type {CacheItem[]}
           */
          let _cached = [];
          try {
            _cached = JSON.parse(data.toString());
          } catch (err) {
            reject(err);
          }
          resolve(_cached);
        });
      }).catch((e) => {
        error = e;
      });
    }
    return new Promise((resolve, reject) => {
      if (!cached && error) {
        reject(error);
      }
      this.getCreated()
        .then((current) => {
          resolve({
            cached: cached || cache,
            current,
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * @private
   * @returns {Promise<CacheItem[]>}
   */
  async getCreated() {
    return new Promise((resolve, reject) => {
      this.readDir(this.targetDirPath)
        .then((dir) => {
          this.getStats(this.targetDirPath, dir)
            .then((stats) => {
              resolve(stats.flat());
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * @private
   * @param {string} currentDirPath
   * @param {string[]} dir
   */
  async getStats(currentDirPath, dir) {
    /**
     * @type {Promise<CacheItem[]>[]}
     */
    const proms = [];
    dir.forEach((item) => {
      const file = path.resolve(currentDirPath, item);
      if (
        this.exclude.find((ex) => {
          const exclude = path.resolve(this.targetDirPath, ex);
          return exclude === file;
        })
      ) {
        return;
      }

      proms.push(
        new Promise((resolve, reject) => {
          stat(file, (err, stats) => {
            if (err) {
              reject(err);
            }

            let isDir = false;
            try {
              isDir = stats.isDirectory();
            } catch (err) {
              reject(err);
            }

            if (isDir) {
              this.readDir(file)
                .then((_newDir) => {
                  // Recursion
                  this.getStats(file, _newDir)
                    .then((data) => {
                      resolve(
                        data.flat().concat([
                          {
                            pathAbs: file,
                            mtimeMs: stats.mtimeMs,
                            isDir,
                            size: stats.size,
                          },
                        ])
                      );
                    })
                    .catch((err) => {
                      reject(err);
                    });
                })
                .catch((err) => {
                  reject(err);
                });
              return;
            }

            resolve([
              {
                pathAbs: file,
                mtimeMs: stats.mtimeMs,
                isDir,
                size: stats.size,
              },
            ]);
          });
        })
      );
    });

    return Promise.all(await Promise.all(proms));
  }
}
