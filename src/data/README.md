# Transitional data

M4 converted the content files in this folder into compatibility adapters for existing
import paths. Canonical shared content and schemas live in `src/content`; canonical
asset metadata lives in `src/assets`.

Do not add new content, configuration, schemas, or assets here. New consumers must use
the public APIs from `src/content`, `src/config`, and `src/assets`.
