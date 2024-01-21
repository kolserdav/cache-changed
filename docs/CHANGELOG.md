# Changelog

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
      "path": "/nome/user/projects/cache-changed/.gitignore",
      "mtimeMs": 1705743775005.3252,
      "isDir": false
    }
  ],
  "deleted": [],
  "isChanged": true
}
```

---
