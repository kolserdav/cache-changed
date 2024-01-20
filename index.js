import path from "path";
import pkg from "./package.json" with { type: "json" };
import { readdir, readdirSync, stat, writeFileSync } from "fs";

process.removeAllListeners("warning");

const cwd = process.cwd();
const { name } = pkg;

/**
 * @typedef {{file: string, time: number}} CacheItem
 */

export default class CacheChanged {
  cacheFilePath = path.resolve(cwd, `${name}.json`);
  targetDirPath = cwd;
  /**
   * @type {string[] | undefined}
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
    this.exclude = exclude || [];
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
          console.error("Failed to read dir", err);
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
    const data = await this._create();
    writeFileSync(this.cacheFilePath, JSON.stringify(data));
  }

  async _create() {
    const dir = await this.readDir(this.targetDirPath);
    const stats = await this.getStats(this.targetDirPath, dir);
    return stats.flat();
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
    for (let i = 0; dir[i]; i++) {
      const file = path.resolve(currentDirPath, dir[i]);
      proms.push(
        new Promise((resolve, reject) => {
          stat(file, (err, stats) => {
            if (err) {
              console.error("Failed to get stats", err);
              reject(err);
            }
            if (stats.isDirectory()) {
              this.readDir(file).then((_newDir) => {
                this.getStats(file, _newDir).then((d) => {
                  resolve(d.flat());
                });
              });

              return;
            }
            resolve([
              {
                file,
                time: stats.atimeMs,
              },
            ]);
          });
        }),
      );
    }
    return Promise.all(await Promise.all(proms));
  }
}

const i = new CacheChanged({
  cacheFilePath: path.resolve(cwd, "./tmp/cache.json"),
  targetDirPath: path.resolve(cwd, "./"),
});

i.create();
