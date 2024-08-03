# Changelog

### 1.3.1

- Added `pathRel` to result

### 1.3.0

- Added file sizes to result

### 1.2.0

- Provide argument to `compare` for custom cache

### 1.1.2

- Remove usage of `import.meta.url`

### 1.1.1

- Provided `noWrite` param to method `create`

### 1.1.0

- Method create returns the list of create items instead of its count
- Exclude now works in a different way: instead of just comparing a file or directory name, the relative path of the excludes is taken into account.

### 1.0.2

---

- Fix node warning. Instead of use `import with {type: 'json'}` the package name set expliciltly

```sh
(node:92439) ExperimentalWarning: Importing JSON modules is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
```

---

### 1.0.0

- Added checking for empty directories

---

- The return type of `compare` method has been changed

old:

```json
{
  "added": [],
  "updated": [
    {
      "file": "/nome/user/projects/cache-changed/.gitignore",
      "mtimeMs": 1705743775005.3252
    }
  ],
  "deleted": [],
  "isChanged": true
}
```

new:

```json
{
  "added": [],
  "updated": [
    // CacheItem changed
    {
      "pathAbs": "/nome/user/projects/cache-changed/.gitignore",
      "mtimeMs": 1705743775005.3252,
      "isDir": false
    }
  ],
  "deleted": [],
  "isChanged": true
}
```

---
