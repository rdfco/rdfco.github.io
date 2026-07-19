# Legacy FARA navigation adapter

This folder owns navigation and route-page rendering inside the production legacy iframe.

- `navigation.js` defines the current legacy navbar/menu items.
- `navigation-events.js` synchronizes iframe navigation with React Router.
- `pages/<route>/` owns legacy-adapter content and imperative rendering for that route.

This is a transitional boundary, not the target native routing architecture. Native modules must not import it. New native routes belong to the target `src/routes`, `src/pages`, `src/features`, and `src/content` boundaries after their milestones establish those folders.
