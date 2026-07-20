# Content

This folder owns validated shared FARA copy, UI labels, navigation labels, footer
content, content schemas, and the content-source ownership registry.

`site-data.js` is the canonical shared source consumed by both the preserved Legacy
runtime and Native Preview. TypeScript consumers use the validated `content` export
from this folder's public `index.ts`. Files under `src/data` are compatibility adapters
only and must not receive new content.

Route-specific content under `src/navbar/pages` remains `legacy-protected`. It is
registered in `content-sources.json` and migrates with its owning route, not globally.
Content modules must not import React UI, routes, scenes, or browser APIs.
