# Navbar And Menu

This folder owns route labels, routed page lookup, and the iframe-side menu/navbar interaction lifecycle.

## Responsibilities

- `navigation.js` defines primary navigation items.
- `navigation-events.js` owns menu, navbar, scroll-header, and route-click state transitions.
- `pages/` owns non-home page data and rendering.

## State Machine

`navigation-events.js` uses explicit states to keep menu close, navbar reveal, and route navigation synchronized. Invalid transitions such as opening while closing or sending the same route twice are ignored.

## How To Modify

Add navigation items in `navigation.js`; `src/js/navigation.js` applies labels and animation order variables to the legacy DOM. Keep animation timing in CSS and lifecycle coordination in `navigation-events.js`.
