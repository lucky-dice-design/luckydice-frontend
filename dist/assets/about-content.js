// Kept separate from content.js: the deployment's CMS export replaces that file.
export const aboutDefaults = {
  meta_title: 'About me | Lucky Dice Design',
  meta_description: 'Lerne die Person, die Haltung und die Arbeitsweise hinter Lucky Dice Design kennen.',
  eyebrow: 'Charakterbogen / Lucky Dice Design',
  title: 'Kreativer Kopf.\nKlarer Kompass.',
  intro: 'Lerne die Person hinter den Interfaces kennen. Ich verbinde durchdachte Gestaltung mit sauberer Umsetzung – und einer guten Portion Neugier.',
  portrait: null,
  portrait_alt: 'Die Person hinter Lucky Dice Design',
  portrait_placeholder: 'Hier ist Platz für mein Bild.',
  portrait_caption: 'Die Person hinter den Pixeln',
  identity_label: 'Mein Charakter',
  identity: [
    { title: 'Klasse', text: 'Designer / Frontend' },
    { title: 'Spielstil', text: 'Neugierig. Klar. Systematisch.' },
    { title: 'Mission', text: 'Digitale Auftritte, die sich richtig anfühlen.' }
  ],
  roll_label: 'Entdeckungswurf',
  dice_label: 'Interaktiver zwanzigseitiger Würfel',
  roll_result_label: 'Dein Wurf',
  roll_pending_label: 'Der Würfel rollt …',
  roll_bonus_label: 'Bonus-Quest: Der 60-Sekunden-Designcheck',
  roll_outcomes: [
    { min: 1, max: 1, title: 'Kritischer Patzer!', text: 'Du wolltest das Layout retten und hast die ganze Ebene verschoben. Zum Glück ist Strg + Z Teil meines Inventars. Noch mal würfeln?', target: 'inventory' },
    { min: 2, max: 5, title: 'Knapp am Chaos vorbei.', text: 'Dein Button hat sich um einen Pixel verschoben. Du siehst es. Ich sehe es. Wir wissen beide, dass wir das noch korrigieren.', target: 'skills' },
    { min: 6, max: 10, title: 'Wahrnehmungsprobe bestanden.', text: 'Du hast einen versteckten Pfad entdeckt. Die Nebenquests führen dich zu der persönlichen Seite hinter den Interfaces.', target: 'personal' },
    { min: 11, max: 15, title: 'Gelungener Designwurf.', text: 'Struktur gefunden, Chaos gebändigt. Du erhältst einen Einblick in die Fähigkeiten hinter den Interfaces.', target: 'skills' },
    { min: 16, max: 19, title: 'Fast schon legendär.', text: 'Dein Blick fürs Detail hat angeschlagen. Du entdeckst das Inventar, mit dem aus guten Ideen durchdachte Interfaces werden.', target: 'inventory' },
    { min: 20, max: 20, title: 'Natürliche 20. Kritischer Erfolg!', text: 'Du hast eine geheime Bonus-Quest freigeschaltet: einen kleinen Designcheck für deine eigene Website. Dein Loot wartet direkt hier.', target: 'quests', bonus_text: 'Nimm dir eine Minute und öffne deine Startseite.\n\n01 · Ist in fünf Sekunden klar, was du anbietest und für wen?\n02 · Gibt es einen eindeutigen nächsten Schritt?\n03 · Kannst du diesen Schritt auf dem Handy bequem mit dem Daumen erreichen?\n\nDreimal ja? Quest bestanden. Wenn nicht: Du hast gerade den ersten Ansatz für dein nächstes Upgrade gefunden.' }
  ],
  discovery_label: 'Einblick freigeschaltet',
  discovery_link: 'Mehr entdecken',
  discoveries: [
    { title: 'Meine Haltung', text: 'Gute Gestaltung macht Komplexes verständlich.', target: 'skills' },
    { title: 'Meine Arbeitsweise', text: 'Erst zuhören. Dann die richtigen Dinge gestalten.', target: 'inventory' },
    { title: 'Meine Werkzeuge', text: 'Die beste Methode ist die, die dein Projekt weiterbringt.', target: 'inventory' },
    { title: 'Abseits des Bildschirms', text: 'Hinter jedem Interface steht ein Mensch. Hier gibt es Raum für die persönliche Seite.', target: 'personal' }
  ],
  skills_title: 'Fähigkeiten',
  skills: [
    { title: 'UI/UX Design', text: 'Ich bringe Inhalte, Struktur und Gestaltung zusammen. Damit Menschen sich zurechtfinden und Marken ihren eigenen Ausdruck bekommen.', link_label: 'Arbeitsproben ansehen', url: '/work/', icon: 'layout' },
    { title: 'Frontend', text: 'Aus einem Entwurf wird ein Interface, das auf kleinen wie großen Bildschirmen funktioniert. Mit Sorgfalt für Details, Zugänglichkeit und Performance.', link_label: 'Projekte entdecken', url: '/work/', icon: 'code' },
    { title: 'SEO & KI Analyse', text: 'Ich schaue auf Inhalte, Suchintention und technische Grundlagen. Daraus entstehen klare nächste Schritte für bessere Auffindbarkeit.', link_label: 'Darüber sprechen', url: '/contact/', icon: 'chart' },
    { title: 'E-Mail Design', text: 'Newsletter und Kampagnen, die zur Marke passen – mit klarer Hierarchie und einer Umsetzung für unterschiedliche E-Mail-Clients.', link_label: 'Projekt besprechen', url: '/contact/', icon: 'mail' }
  ],
  inventory_title: 'Inventar',
  inventory: [
    { title: 'Designsystem', text: 'Konsistent. Flexibel. Weitergedacht.', icon: 'layers' },
    { title: 'Code', text: 'Sauber. Zugänglich. Durchdacht.', icon: 'code' },
    { title: 'Analyse', text: 'Verstehen, bevor wir verändern.', icon: 'chart' },
    { title: 'Prototyp', text: 'Ideen erlebbar machen.', icon: 'cube' }
  ],
  approach_title: 'So arbeite ich',
  approach: [
    { title: 'Zuhören', text: 'Verstehen, was wirklich gebraucht wird.', icon: 'listen' },
    { title: 'Struktur schaffen', text: 'Komplexes ordnen. Klarheit herstellen.', icon: 'compass' },
    { title: 'Details verfeinern', text: 'Das Ganze sehen. Im Kleinen sorgfältig sein.', icon: 'spark' }
  ],
  personal_title: 'Nebenquests',
  personal_intro: 'Am Spieltisch, auf dem Rennrad, im Schnee oder im nächsten Game – hier geht die Geschichte weiter.',
  personal_open_label: 'Geschichte entdecken',
  personal: [
    { title: 'Pen & Paper', teaser: 'Neue Welten. Gemeinsame Geschichten.', text: 'Pen & Paper gehört zu meinen Nebenquests. Gemeinsam Geschichten entwickeln, Entscheidungen treffen und schauen, wohin der nächste Würfelwurf führt.', icon: 'dice' },
    { title: 'Rennrad', teaser: 'Rad am Ring · Cyclassics Hamburg', text: 'Auf dem Rennrad gehören Rad am Ring und die Cyclassics in Hamburg zu meinen Nebenquests. Bei Rad am Ring gehören für mich die Ammersee Wadler dazu.', icon: 'bike', link_label: 'Ammersee Wadler', url: '' },
    { title: 'Snowboardlehrer', teaser: 'Perspektivwechsel auf Schnee.', text: 'Neben Design und Code bin ich auch als Snowboardlehrer unterwegs. Ein anderer Ort, um Wissen weiterzugeben und Menschen beim nächsten Schritt zu begleiten.', icon: 'mountain' },
    { title: 'Gaming', teaser: 'Die nächste Runde wartet.', text: 'Gaming gehört für mich dazu. Auf Twitch geht die Nebenquest weiter – schau gern vorbei.', icon: 'gamepad', twitch: true }
  ],
  twitch_channel: 'mrjokytv',
  twitch_link_label: 'Auf Twitch vorbeischauen',
  twitch_load_label: 'Twitch-Player laden',
  twitch_notice: 'Erst beim Laden des Players wird eine Verbindung zu Twitch hergestellt.',
  twitch_player_title: 'Twitch-Stream',
  personal_empty: 'Hier teile ich bald mehr über mich und das, was mich inspiriert.',
  cta_eyebrow: 'Bereit für ein gemeinsames Projekt?',
  cta_title: 'Auf zur nächsten Quest.',
  cta_text: 'Eine Idee reicht für den Anfang.',
  cta_label: 'Projekt besprechen',
  cta_url: '/contact/',
  brand_label: 'Lucky Dice Design',
  menu_label: 'Menü öffnen oder schließen',
  navigation_label: 'Hauptnavigation',
  theme_label: 'Farbschema wechseln',
  light_label: 'Light',
  dark_label: 'Dark',
  legal_label: 'Impressum',
  privacy_label: 'Datenschutz'
};

export function mergeAbout(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const result = { ...aboutDefaults };
  for (const key of Object.keys(result)) {
    if (source[key] !== undefined && source[key] !== null) result[key] = source[key];
  }
  for (const key of ['identity', 'skills', 'inventory', 'approach', 'discoveries', 'personal', 'roll_outcomes']) {
    if (!Array.isArray(result[key])) result[key] = aboutDefaults[key];
    result[key] = result[key].filter(item => item && typeof item === 'object');
  }
  return result;
}

export function profileFromPage(page = {}) {
  return Object.fromEntries(Object.keys(aboutDefaults).map(key => [key, page[key.startsWith('meta_') ? key : `sheet_${key}`]]));
}

export function portraitUrl(value, base = '') {
  const id = typeof value === 'object' ? value?.id : value;
  if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id || '')) return '';
  return `${base.replace(/\/$/, '') || '/cms'}/assets/${id}?width=1000&height=1200&fit=cover`;
}
