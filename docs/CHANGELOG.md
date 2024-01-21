# Changelog

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
