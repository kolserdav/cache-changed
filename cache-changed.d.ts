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
   * @param {CacheChangedOptions | undefined} [options={}]
   */
  constructor({ cacheFilePath, targetDirPath, exclude }?: CacheChangedOptions | undefined);
  /**
   * @private
   * @type {string}
   */
  private cacheFilePath;
  /**
   * @private
   * @type {string}
   */
  private targetDirPath;
  /**
   * @private
   * @type {string[]}
   */
  private exclude;
  /**
   * @private
   * @param {string} dirPath
   * @returns {Promise<string[]>}
   */
  private readDir;
  /**
   * @public
   * @param {{
   *  noWrite?: boolean;
   * }} [options={}]
   * @returns {Promise<CacheItem[]>}
   */
  public create({
    noWrite,
  }?:
    | {
        noWrite?: boolean | undefined;
      }
    | undefined): Promise<CacheItem[]>;
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
  public compare(): Promise<{
    isChanged: boolean;
    added: CacheItem[];
    updated: CacheItem[];
    deleted: CacheItem[];
  }>;
  /**
   * @private
   * @returns {Promise<{current: CacheItem[], cached: CacheItem[]}>}
   */
  private getCompared;
  /**
   * @private
   * @returns {Promise<CacheItem[]>}
   */
  private getCreated;
  /**
   * @private
   * @param {string} currentDirPath
   * @param {string[]} dir
   */
  private getStats;
}
export type CacheItem = {
  pathAbs: string;
  mtimeMs: number;
  isDir: boolean;
};
export type CacheChangedOptions = {
  cacheFilePath?: string;
  targetDirPath?: string;
  exclude?: string[];
};
