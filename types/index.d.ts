/**
 * @typedef {{
 *  file: string;
 *  mtimeMs: number;
 * }} CacheItem
 */
export default class CacheChanged {
    /**
     * @param {{
     *  cacheFilePath: string;
     *  targetDirPath: string;
     *  exclude?: string[];
     * }} param0
     */
    constructor({ cacheFilePath, targetDirPath, exclude }: {
        cacheFilePath: string;
        targetDirPath: string;
        exclude?: string[];
    });
    cacheFilePath: string;
    targetDirPath: string;
    /**
     * @type {string[]}
     */
    exclude: string[];
    /**
     * @private
     * @param {string} dirPath
     * @returns {Promise<string[]>}
     */
    private readDir;
    /**
     * @public
     */
    public create(): Promise<any>;
    /**
     * @typedef {{
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
    file: string;
    mtimeMs: number;
};
