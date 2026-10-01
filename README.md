# Lucky Dice Design

Minimalistische Multipage-Website mit Directus-fähiger Content-Struktur.

## Seiten

- Landingpage mit halbinteraktivem Three.js-D20
- My Work
- About me
- Kontakt mit Directus-Submission

## Directus verbinden

1. Collections aus `directus/schema.json` in Directus anlegen.
2. Beispielinhalte aus `directus/seed.json` einpflegen.
3. Public Role Berechtigungen setzen:
   - Read: `site_settings`, `navigation_items`, `pages`, `services`, `projects`, `about_facts`, `process_steps`, `contact_channels`
   - Create: `contact_submissions`
4. In `dist/assets/config.js` die Directus URL setzen:

```js
window.LDD_CONFIG = {
  directusUrl: "https://dein-directus.example.com",
  directusToken: ""
};
```

Ein Token ist nur nötig, wenn du die Inhalte nicht über die Public Role ausspielst.

## Lokal ansehen

Die Website ist statisch. Ein einfacher Webserver reicht:

```bash
npx serve dist
```

Ohne Directus nutzt die Website Fallback-Inhalte aus `dist/assets/content.js`.
