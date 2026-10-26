import { aboutDefaults } from '../dist/assets/about-content.js';

const labels = {
  personal_open_label: 'Nebenquests: Karte öffnen', twitch_channel: 'Twitch: Kanalname', twitch_link_label: 'Twitch: Linktext', twitch_load_label: 'Twitch: Player laden', twitch_notice: 'Twitch: Hinweis vor dem Laden', twitch_player_title: 'Twitch: Barrierefreier Player-Titel',
  roll_result_label: 'Würfel: Ergebnis-Beschriftung', roll_pending_label: 'Würfel: Text während des Wurfs', roll_bonus_label: 'Würfel: Bonus-Überschrift', roll_outcomes: 'Würfelergebnisse (1–20)',
  eyebrow: 'Kleine Überschrift', title: 'Hauptüberschrift', intro: 'Einleitung', portrait: 'Profilbild', portrait_alt: 'Bildbeschreibung (Barrierefreiheit)', portrait_placeholder: 'Text ohne Profilbild', portrait_caption: 'Bildunterschrift', identity_label: 'Charakter: Überschrift', identity: 'Charakter: Einträge', roll_label: 'Würfel: Button', dice_label: 'Würfel: Barrierefreie Beschreibung', dice_hint: 'Würfel: Hinweis', discovery_label: 'Einblick: Kleine Überschrift', discovery_link: 'Einblick: Linktext', discoveries: 'Einblicke für den Entdeckungswurf', skills_title: 'Fähigkeiten: Überschrift', skills_hint: 'Fähigkeiten: Hinweis', skills: 'Fähigkeiten & Arbeitsproben', inventory_title: 'Inventar: Überschrift', inventory: 'Inventar: Einträge', approach_title: 'Arbeitsweise: Überschrift', approach: 'Arbeitsweise: Einträge', quests_title: 'Questlog: Überschrift', projects_tab: 'Questlog: Projekte-Tab', process_tab: 'Questlog: Prozess-Tab', project_link: 'Projekt: Linktext', project_empty: 'Projekt: Leerzustand', next_title: 'Projektanfrage: Titel', next_text: 'Projektanfrage: Text', next_link: 'Projektanfrage: Linktext', personal_title: 'Nebenquests: Überschrift', personal_intro: 'Nebenquests: Einleitung', personal: 'Nebenquests: Karten & Geschichten', personal_empty: 'Nebenquests: Leerzustand', cta_eyebrow: 'Kontakt: Kleine Überschrift', cta_title: 'Kontakt: Überschrift', cta_text: 'Kontakt: Text', cta_label: 'Kontakt: Button', cta_url: 'Kontakt: Linkziel', brand_label: 'Markenname im Header', menu_label: 'Menü: Barrierefreier Text', navigation_label: 'Navigation: Barrierefreier Text', theme_label: 'Farbschema: Barrierefreier Text', light_label: 'Farbschema: Hell-Button', dark_label: 'Farbschema: Dunkel-Button', legal_label: 'Footer: Impressum-Link', privacy_label: 'Footer: Datenschutz-Link'
};
const groups = [
  ['sheet_hero_group', 'About me · Kopfbereich & Profilbild', ['eyebrow', 'title', 'intro', 'portrait', 'portrait_alt', 'portrait_placeholder', 'portrait_caption', 'identity_label', 'identity']],
  ['sheet_dice_group', 'About me · Würfel & Einblicke', ['roll_label', 'dice_label', 'dice_hint', 'roll_result_label', 'roll_pending_label', 'roll_bonus_label', 'roll_outcomes', 'discovery_label', 'discovery_link', 'discoveries']],
  ['sheet_skills_group', 'About me · Fähigkeiten, Inventar & Arbeitsweise', ['skills_title', 'skills_hint', 'skills', 'inventory_title', 'inventory', 'approach_title', 'approach']],
  ['sheet_quest_group', 'About me · Nebenquests', ['quests_title', 'projects_tab', 'process_tab', 'project_link', 'project_empty', 'next_title', 'next_text', 'next_link', 'personal_title', 'personal_intro', 'personal_open_label', 'personal', 'personal_empty', 'twitch_channel', 'twitch_link_label', 'twitch_load_label', 'twitch_notice', 'twitch_player_title']],
  ['sheet_cta_group', 'About me · Kontakt', ['cta_eyebrow', 'cta_title', 'cta_text', 'cta_label', 'cta_url']],
  ['sheet_ui_group', 'About me · Navigation & Bedienelemente', ['brand_label', 'menu_label', 'navigation_label', 'theme_label', 'light_label', 'dark_label', 'legal_label', 'privacy_label']]
];
const translations = label => [{ language: 'de-DE', translation: label }];
const listFields = key => {
  const fields = [
    { field: 'title', name: 'Titel', type: 'string', meta: { interface: 'input', width: 'full' } },
    { field: 'text', name: 'Text', type: 'text', meta: { interface: 'input-multiline', width: 'full' } }
  ];
  if (['skills', 'personal'].includes(key)) fields.push(
    { field: 'link_label', name: 'Linktext', type: 'string', meta: { interface: 'input', width: 'half' } },
    { field: 'url', name: 'Linkziel', type: 'string', meta: { interface: 'input', width: 'half', note: 'Interner Pfad oder https://-Adresse' } }
  );
  if (key === 'personal') fields.push(
    { field: 'teaser', name: 'Kurzbeschreibung auf der Karte', type: 'string', meta: { interface: 'input', width: 'full' } },
    { field: 'twitch', name: 'Twitch-Kanal in dieser Karte anzeigen', type: 'boolean', meta: { interface: 'boolean', width: 'full' } }
  );
  if (['discoveries', 'roll_outcomes'].includes(key)) fields.push({ field: 'target', name: 'Zielbereich', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Fähigkeiten', value: 'skills' }, { text: 'Inventar', value: 'inventory' }, { text: 'Nebenquests', value: 'personal' }] } } });
  if (key === 'roll_outcomes') {
    fields.unshift(
      { field: 'min', name: 'Wurf von (1–20)', type: 'integer', meta: { interface: 'input', width: 'half', required: true, options: { min: 1, max: 20 } } },
      { field: 'max', name: 'Wurf bis (1–20)', type: 'integer', meta: { interface: 'input', width: 'half', required: true, options: { min: 1, max: 20 } } }
    );
    fields.push({ field: 'bonus_text', name: 'Bonus-Inhalt bei einer natürlichen 20', type: 'text', meta: { interface: 'input-multiline', width: 'full', note: 'Wird nur bei einer 20 freigeschaltet. Zeilenumbrüche bleiben erhalten.' } });
  }
  if (['skills', 'inventory', 'approach', 'personal'].includes(key)) fields.push({ field: 'icon', name: 'Symbol', type: 'string', meta: { interface: 'select-dropdown', options: { choices: ['layout', 'code', 'chart', 'mail', 'layers', 'cube', 'listen', 'compass', 'spark', 'dice', 'bike', 'mountain', 'gamepad'].map(value => ({ text: value, value })) } } });
  return fields;
};

export const aboutFields = groups.flatMap(([group, label, keys], index) => [
  { field: group, type: 'alias', meta: { interface: 'group-detail', special: ['alias', 'no-data', 'group'], options: { start: 'closed' }, translations: translations(label), sort: 100 + index * 20 } },
  ...keys.map((key, sort) => {
    const isList = Array.isArray(aboutDefaults[key]);
    const meta = { group, sort: sort + 1, width: 'full', translations: translations(labels[key]), ...(['quests_title', 'projects_tab', 'process_tab', 'project_link', 'project_empty', 'next_title', 'next_text', 'next_link'].includes(key) ? { hidden: true } : {}) };
    if (key === 'portrait') return { field: 'sheet_portrait', type: 'uuid', schema: { is_nullable: true }, meta: { ...meta, interface: 'file-image', special: ['file'], note: 'JPEG, PNG, WebP oder AVIF. Am besten hochkant. Zuschneiden erfolgt im Layout.', options: { crop: false } } };
    if (isList) return { field: `sheet_${key}`, type: 'json', schema: { is_nullable: true }, meta: { ...meta, interface: 'list', special: ['cast-json'], options: { template: '{{title}}', addLabel: 'Eintrag hinzufügen', fields: listFields(key) } } };
    return { field: `sheet_${key}`, type: 'text', schema: { is_nullable: true }, meta: { ...meta, interface: 'input-multiline', note: key === 'title' ? 'Zeilenumbrüche werden in der Überschrift übernommen.' : undefined } };
  })
]);

export const aboutSeed = Object.fromEntries(Object.entries(aboutDefaults).map(([key, value]) => [key.startsWith('meta_') ? key : `sheet_${key}`, value]));
