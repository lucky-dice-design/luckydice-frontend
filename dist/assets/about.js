import { aboutDefaults, mergeAbout, portraitUrl } from './about-content.js';
import { escapeHtml as e } from './projects.js';
import { rollD20, outcomeForRoll } from './about-roll.js';

const paths = {
  layout: 'M3 4h18v16H3z M3 9h18 M9 9v11',
  code: 'm8 6-6 6 6 6 m8-12 6 6-6 6 M14 3l-4 18',
  chart: 'M3 14h4v7H3z M10 9h4v12h-4z M17 3h4v18h-4z',
  mail: 'M2 5h20v14H2z m0 0 10 8L22 5',
  layers: 'm12 2 10 5-10 5L2 7z M2 12l10 5 10-5 M2 17l10 5 10-5',
  cube: 'm12 2 10 6v9l-10 5-10-5V8z M2 8l10 5 10-5 M12 13v9 M12 2v4',
  listen: 'M7 9a5 5 0 0 1 10 0c0 5-5 5-5 9a3 3 0 0 1-6 0 M10 10a2 2 0 0 1 4 0c0 2-3 3-3 5',
  compass: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M16 8l-2 6-6 2 2-6z',
  spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z',
  dice: 'm12 2 10 6v9l-10 5-10-5V8z M2 8l10 5 10-5 M12 13v9 M12 2 6 10l6 3 6-3z',
  bike: 'M10 17a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M22 17a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M6 17l4-9 8 9-4-12h3 M8 8h5',
  mountain: 'M2 21 10 4l4 8 3-6 5 15z M7 11l3 2 3-3 M13 21l4-8',
  gamepad: 'M7 7h10c3 0 5 4 5 9 0 4-3 4-6 0H8c-3 4-6 4-6 0 0-5 2-9 5-9z M6 10v6 M3 13h6 M16 11h.01 M19 14h.01'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.spark}"/></svg>`;
export function safeLink(value) {
  if (typeof value !== 'string') return '';
  if (/^\/(?!\/)[^\\\s]*$/.test(value)) return value;
  try { const url = new URL(value); return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
const link = (url, label, css = '') => safeLink(url) ? `<a class="${css}" href="${e(safeLink(url))}">${e(label)} <span aria-hidden="true">↗</span></a>` : '';

export function twitchChannel(value) { return typeof value === 'string' && /^[a-zA-Z0-9_]{3,25}$/.test(value) ? value.toLowerCase() : ''; }

function twitchCard(p) {
  const channel = twitchChannel(p.twitch_channel);
  if (!channel) return '';
  return `<div class="sidequest-twitch"><span class="twitch-handle">@${e(channel)}</span>${link(`https://www.twitch.tv/${channel}`, p.twitch_link_label, 'sheet-text-link')}<button class="sheet-button" type="button" data-twitch-load>${e(p.twitch_load_label)}</button><p class="twitch-notice">${e(p.twitch_notice)}</p></div>`;
}

export function renderAbout(raw, content = {}, base = '') {
  const p = mergeAbout(raw);
  const photo = portraitUrl(p.portrait, base);
  const discovery = p.discoveries[0];
  return `<section class="sheet-hero sheet-panel" aria-labelledby="sheet-title">
    <div class="sheet-intro"><p class="sheet-kicker">${e(p.eyebrow)}</p><h1 id="sheet-title">${e(p.title)}</h1><p class="sheet-lead">${e(p.intro)}</p><a class="sheet-text-link" href="#skills">${e(p.skills_title)} <span aria-hidden="true">↓</span></a></div>
    <figure class="sheet-portrait"><div class="portrait-frame">${photo ? `<img src="${e(photo)}" alt="${e(p.portrait_alt)}" width="1000" height="1200" fetchpriority="high" decoding="async">` : ''}<div class="portrait-placeholder"${photo ? ' hidden' : ''}>${icon('spark')}<span>${e(p.portrait_placeholder)}</span><i aria-hidden="true"></i></div></div><figcaption>${e(p.portrait_caption)}</figcaption></figure>
    <aside class="sheet-identity"><p class="sheet-kicker">${e(p.identity_label)}</p><dl>${p.identity.map(item => `<div><dt>${e(item.title)}</dt><dd>${e(item.text)}</dd></div>`).join('')}</dl><span class="identity-seal" aria-hidden="true">✧</span></aside>
  </section>
  <section class="sheet-discovery sheet-panel" aria-label="${e(p.roll_label)}">
    <div class="sheet-roll"><div class="sheet-dice"><img src="/assets/luckydice-logo.svg" alt="" class="dice-fallback"><canvas id="d20-canvas" role="img" aria-label="${e(p.dice_label)}"></canvas><span class="sheet-roll-score" data-roll-score aria-hidden="true" hidden></span></div><div><button class="sheet-button" type="button" data-roll${p.roll_outcomes.length ? '' : ' disabled'}><span data-roll-button-label>${e(p.roll_label)}</span> <span aria-hidden="true">↗</span></button></div></div>
    <div class="sheet-discovery-copy" aria-live="polite" aria-atomic="true"><p class="sheet-kicker"><span data-discovery-label>${e(p.discovery_label)}</span><strong class="sheet-result-number" data-result-number hidden></strong></p><h2 data-discovery-title>${e(discovery?.title || '')}</h2><p data-discovery-text>${e(discovery?.text || '')}</p><a class="sheet-text-link" data-discovery-link href="#${target(discovery?.target)}">${e(p.discovery_link)} <span aria-hidden="true">→</span></a></div>
    <details class="sheet-roll-bonus" data-roll-bonus hidden><summary>${icon('spark')}<span>${e(p.roll_bonus_label)}</span><span class="sheet-expand" aria-hidden="true"></span></summary><p data-bonus-text></p></details>
  </section>
  <div class="sheet-columns">
    <section class="sheet-panel sheet-skills" id="skills"><header class="sheet-section-heading"><h2>${e(p.skills_title)}</h2></header><div>${p.skills.map((item, index) => `<details class="sheet-skill"${index === 0 ? ' open' : ''}><summary><span class="sheet-skill-icon">${icon(item.icon)}</span><h3>${e(item.title)}</h3><span class="sheet-expand" aria-hidden="true"></span></summary><div class="sheet-skill-body"><p>${e(item.text)}</p>${link(item.url, item.link_label, 'sheet-text-link')}</div></details>`).join('')}</div></section>
    <div class="sheet-right"><section class="sheet-panel" id="inventory"><header class="sheet-section-heading"><h2>${e(p.inventory_title)}</h2><span aria-hidden="true">◇</span></header><div class="sheet-inventory">${p.inventory.map(item => `<article>${icon(item.icon)}<div><h3>${e(item.title)}</h3><p>${e(item.text)}</p></div></article>`).join('')}</div></section>
    <section class="sheet-panel"><header class="sheet-section-heading"><h2>${e(p.approach_title)}</h2></header><div class="sheet-approach">${p.approach.map(item => `<article>${icon(item.icon)}<h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('')}</div></section></div>
  </div>
  <section class="sheet-panel sheet-personal sheet-sidequests" id="personal" aria-labelledby="sidequests-title"><header class="sheet-section-heading"><h2 id="sidequests-title">${e(p.personal_title)}</h2><span aria-hidden="true">✧</span></header><p class="sheet-personal-intro">${e(p.personal_intro)}</p><div class="sheet-personal-grid">${p.personal.map((item, index) => `<details class="sheet-sidequest"><summary><span class="sidequest-topline"><span class="sidequest-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>${icon(item.icon)}</span><span class="sidequest-title">${e(item.title)}</span>${item.teaser ? `<span class="sidequest-teaser">${e(item.teaser)}</span>` : ''}<span class="sidequest-action"><span>${e(p.personal_open_label)}</span><span class="sheet-expand" aria-hidden="true"></span></span></summary><div class="sidequest-story"><p>${e(item.text)}</p>${link(item.url, item.link_label, 'sheet-text-link')}${item.twitch ? twitchCard(p) : ''}</div></details>`).join('') || `<p class="sheet-personal-empty">${e(p.personal_empty)}</p>`}</div><div class="sidequest-twitch-player" data-twitch-player hidden></div></section>
  <section class="sheet-cta"><div><p class="sheet-kicker">${e(p.cta_eyebrow)}</p><h2>${e(p.cta_title)}</h2><p>${e(p.cta_text)}</p></div>${link(p.cta_url, p.cta_label, 'sheet-button')}</section>`;
}

function target(value) { if (value === 'quests') return 'personal'; return ['skills', 'inventory', 'personal'].includes(value) ? value : 'skills'; }

export function mountAbout(raw = aboutDefaults, content = {}, base = '') {
  const root = document.querySelector('[data-about-sheet]');
  if (!root) return;
  const p = mergeAbout(raw);
  root.innerHTML = renderAbout(p, content, base);
  document.title = p.meta_title;
  document.querySelector('meta[name="description"]').content = p.meta_description;
  const photo = root.querySelector('.sheet-portrait img');
  if (photo) photo.addEventListener('error', () => { photo.hidden = true; root.querySelector('.portrait-placeholder').hidden = false; }, { once: true });
  const channel = twitchChannel(p.twitch_channel);
  root.querySelectorAll('[data-twitch-load]').forEach(loadButton => {
    const host = root.querySelector('[data-twitch-player]');
    // HTTPS and the player minimum size are required by Twitch. Small screens
    // and the HTTP local preview retain the ordinary channel link.
    const supported = () => window.location.protocol === 'https:' && host.parentElement.clientWidth - 52 >= 400;
    const update = () => {
      const available = supported();
      loadButton.hidden = !available;
      loadButton.parentElement.querySelector('.twitch-notice').hidden = !available;
      if (!available && host.querySelector('iframe')) { host.replaceChildren(); host.hidden = true; }
    };
    const observer = new ResizeObserver(update);
    observer.observe(host.parentElement);
    update();
    loadButton.addEventListener('click', () => {
      if (!channel || !supported()) return;
      if (!host.querySelector('iframe')) {
        const iframe = document.createElement('iframe');
        const url = new URL('https://player.twitch.tv/');
        url.search = new URLSearchParams({ channel, parent: window.location.hostname, autoplay: 'false' }).toString();
        iframe.src = url.href;
        iframe.title = p.twitch_player_title;
        iframe.allowFullscreen = true;
        host.appendChild(iframe);
      }
      host.hidden = false;
      host.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    });
  });
  const button = root.querySelector('[data-roll]');
  const discoveryPanel = root.querySelector('.sheet-discovery');
  const canvas = root.querySelector('#d20-canvas');
  button.addEventListener('click', () => {
    if (button.disabled || !p.roll_outcomes.length) return;
    const value = rollD20();
    const item = outcomeForRoll(value, p.roll_outcomes);
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 950;
    button.disabled = true;
    root.querySelector('[data-roll-button-label]').textContent = p.roll_pending_label;
    discoveryPanel.classList.add('is-rolling');
    discoveryPanel.dataset.rollState = 'rolling';
    root.querySelector('[data-roll-score]').hidden = true;
    canvas.dataset.rollValue = String(value);
    canvas.dispatchEvent(new CustomEvent('dice-roll', { detail: { value, duration } }));
    const reveal = () => {
      if (!root.contains(button)) return;
      discoveryPanel.classList.remove('is-rolling');
      discoveryPanel.dataset.rollState = value === 1 ? 'fumble' : value === 20 ? 'critical' : 'success';
      root.querySelector('[data-discovery-label]').textContent = p.roll_result_label;
      const number = root.querySelector('[data-result-number]');
      number.textContent = `${value} / 20`;
      number.hidden = false;
      const score = root.querySelector('[data-roll-score]');
      score.textContent = String(value);
      score.hidden = false;
      canvas.setAttribute('aria-label', `${p.dice_label}: ${value}`);
      root.querySelector('[data-discovery-title]').textContent = item.title || '';
      root.querySelector('[data-discovery-text]').textContent = item.text || '';
      root.querySelector('[data-discovery-link]').href = `#${target(item.target)}`;
      if (value === 20 && item.bonus_text) {
        const bonus = root.querySelector('[data-roll-bonus]');
        root.querySelector('[data-bonus-text]').textContent = item.bonus_text;
        bonus.hidden = false;
        bonus.open = true;
      }
      root.querySelector('[data-roll-button-label]').textContent = p.roll_label;
      button.disabled = false;
    };
    if (duration) window.setTimeout(reveal, duration);
    else reveal();
  });
}
