import path from 'path';
import pkg from './package.json' with { type: 'json' };
import { readFile, readdir, stat, writeFile } from 'fs';

process.removeAllListeners('warning');

const EXCLUDE_DEFAULT = ['.git'];

const cwd = process.cwd();
const { name } = pkg;

/**
 * @typedef {{
 *  file: string;
 *  mtimeMs: number;
 * }} CacheItem
 */

export default class CacheChanged {
  cacheFilePath = path.resolve(cwd, `${name}.json`);
  targetDirPath = cwd;
  /**
   * @type {string[]}
   */
  exclude = [];

  /**
   * @param {{
   *  cacheFilePath: string;
   *  targetDirPath: string;
   *  exclude?: string[];
   * }} param0
   */
  constructor({ cacheFilePath, targetDirPath, exclude }) {
    this.cacheFilePath = cacheFilePath;
    this.targetDirPath = targetDirPath;
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
            const cachedItem = cached.find((_item) => item.file === _item.file);
            if (!cachedItem) {
              res.added.push(item);
              return;
            }
            if (cachedItem.mtimeMs !== item.mtimeMs) {
              res.updated.push(item);
            }
          });
          cached.forEach((item) => {
            const currentItem = current.find((_item) => item.file === _item.file);
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
        let res = [];
        try {
          res = JSON.parse(data.toString());
        } catch (err) {
          reject(err);
        }
        this.getCreated()
          .then((data) => {
            resolve({
              cached: res,
              current: data,
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
                      resolve(data.flat());
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
                file,
                mtimeMs: stats.mtimeMs,
              },
            ]);
          });
        })
      );
    });

    return Promise.all(await Promise.all(proms));
  }
}
