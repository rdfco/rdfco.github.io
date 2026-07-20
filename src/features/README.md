# Features

User-facing or domain capabilities with explicit ownership. A feature may contain its UI, hooks, local state, animation, tests, and adapters. Cross-feature consumers import only from that feature's `index.ts`.

Do not create broad feature barrels or import another feature's internal files. Feature extraction begins in M7.
