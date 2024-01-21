import path from 'path';
import pkg from './package.json' with { type: 'json' };
import { readFile, readdir, stat, writeFile } from 'fs';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.removeAllListeners('warning');

const EXCLUDE_DEFAULT = ['.git'];
const TARGET_DIR_PATH_DEFAULT = './';

const cwd = process.cwd();
const { name } = pkg;

/**
 * @typedef {{
 *  pathAbs: string;
 *  mtimeMs: number;
 *  isDir: boolean;
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
  cacheFilePath = path.resolve(cwd, `${name}.json`);
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
    const cacheFileName = `${name}_${path.basename(__dirname)}.json`;
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
   * @returns {Promise<number>}
   */
  async create() {
    return new Promise((resolve, reject) => {
      this.getCreated()
        .then((data) => {
          writeFile(this.cacheFilePath, JSON.stringify(data), (err) => {
            if (err) {
              reject(err);
            }
            resolve(data.length);
          });
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
   * @returns {Promise<CompareResult>}
   */
  async compare() {
    return new Promise((resolve, reject) => {
      this.getCompared()
        .then(({ cached, current }) => {
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
            const cachedItem = cached.find((_item) => item.pathAbs === _item.pathAbs);
            if (!cachedItem) {
              res.added.push(item);
              return;
            }
            if (cachedItem.mtimeMs !== item.mtimeMs) {
              res.updated.push(item);
            }
          });
          cached.forEach((item) => {
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
   * @returns {Promise<{current: CacheItem[], cached: CacheItem[]}>}
   */
  async getCompared() {
    return new Promise((resolve, reject) => {
      readFile(this.cacheFilePath, (err, data) => {
        if (err) {
          reject(err);
        }
        /**
         * @type {CacheItem[]}
         */
        let cached = [];
        try {
          cached = JSON.parse(data.toString());
        } catch (err) {
          reject(err);
        }
        this.getCreated()
          .then((current) => {
            resolve({
              cached,
              current,
            });
          })
          .catch((err) => {
            reject(err);
          });
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
      if (this.exclude.indexOf(item) !== -1) {
        return;
      }

      const file = path.resolve(currentDirPath, item);
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
              },
            ]);
          });
        })
      );
    });

    return Promise.all(await Promise.all(proms));
  }
}
