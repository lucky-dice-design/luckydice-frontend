import test from 'node:test';
import assert from 'node:assert/strict';
import { aboutDefaults, mergeAbout, portraitUrl, profileFromPage } from '../dist/assets/about-content.js';
import { renderAbout, safeLink, twitchChannel } from '../dist/assets/about.js';
import { aboutFields } from '../directus/about-schema.mjs';
import { installAbout } from '../directus/setup-about.mjs';
import { rollD20, outcomeForRoll } from '../dist/assets/about-roll.js';

const fileId = '11111111-1111-4111-8111-111111111111';
test('CMS copy, deliberately empty lists and a related portrait replace defaults safely', () => {
  const profile = profileFromPage({ sheet_title: 'Mein <Charakter>', sheet_intro: '', sheet_skills: [], sheet_portrait: { id: fileId }, sheet_portrait_alt: 'Mein "Bild"', meta_title: 'Über mich' });
  const merged = mergeAbout(profile);
  assert.equal(merged.title, 'Mein <Charakter>');
  assert.equal(merged.intro, '');
  assert.deepEqual(merged.skills, []);
  const html = renderAbout(profile);
  assert.ok(html.includes('Mein &lt;Charakter&gt;'));
  assert.ok(html.includes(`src="/cms/assets/${fileId}?width=1000&amp;height=1200&amp;fit=cover"`));
  assert.ok(html.includes('alt="Mein &quot;Bild&quot;"'));
  assert.ok(!html.includes('class="sheet-skill"'));
});

test('malformed CMS lists, image IDs and unsafe links cannot inject markup or executable URLs', () => {
  const html = renderAbout({ skills: [{ title: '<script>alert(1)</script>', text: '<img src=x>', url: 'javascript:alert(1)', link_label: 'Unsafe' }], personal: [null], discoveries: [], roll_outcomes: [], inventory: 'broken' });
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x>'));
  assert.ok(!html.includes('javascript:'));
  assert.ok(html.includes('data-roll disabled'));
  assert.equal(portraitUrl('x" onerror="alert(1)'), '');
  assert.equal(safeLink('//evil.example'), '');
  assert.equal(safeLink('/\\evil.example'), '');
  assert.equal(safeLink('/work/'), '/work/');
  assert.equal(portraitUrl(fileId, 'https://cms.example/'), `https://cms.example/assets/${fileId}?width=1000&height=1200&fit=cover`);
});

test('every page-specific copy field has an editor field and defaults survive legacy page exports', () => {
  const names = new Set(aboutFields.map(item => item.field));
  for (const key of Object.keys(aboutDefaults).filter(key => !key.startsWith('meta_'))) assert.ok(names.has(`sheet_${key}`), key);
  assert.equal(mergeAbout(profileFromPage({ title: 'Legacy title' })).title, aboutDefaults.title);
  const html = renderAbout({ personal: [{ title: 'Neugier', text: 'Meine Geschichte' }] }, { projects: [{ slug: 'real-project', title: 'Echt', text: 'Aus dem CMS' }], process: [{ title: 'Zuhören', text: 'Prozess aus Directus' }] });
  assert.ok(!html.includes('/work/real-project/'));
  assert.ok(html.includes('Meine Geschichte'));
  assert.ok(!html.includes('Prozess aus Directus'));
  assert.ok(!html.includes('aria-controls="sheet-process"'));
  assert.ok(html.includes('id="sidequests-title"'));
});

function fixture() {
  const fields = [{ field: 'id' }, { field: 'slug' }], fileFields = [], relations = [];
  const page = { id: 3, slug: 'about', sheet_title: 'Mein eigener Text', sheet_personal: [] };
  const grants = [
    { id: 1, collection: 'pages', action: 'read', fields: ['id', 'slug'], permissions: { status: { _eq: 'published' } } },
    { id: 2, collection: 'directus_files', action: 'read', fields: ['*'], permissions: { lucky_project_screenshots: { _some: { status: { _eq: 'published' } } } } }
  ];
  const writes = [];
  const api = async (path, method = 'GET', body) => {
    if (method !== 'GET') writes.push({ path, method, body });
    if (path === '/fields/pages' && method === 'POST') { fields.push(body); return body; }
    if (path.startsWith('/fields/pages/') && method === 'PATCH') { const field = fields.find(item => item.field === path.split('/').at(-1)); field.meta = { ...field.meta, ...body.meta }; return field; }
    if (path === '/fields/directus_files' && method === 'POST') { fileFields.push(body); return body; }
    if (path === '/relations' && method === 'POST') { relations.push(body); return body; }
    if (path.startsWith('/permissions/') && method === 'PATCH') { Object.assign(grants.find(item => item.id === Number(path.split('/').at(-1))), body); return null; }
    if (path === '/items/pages/3' && method === 'PATCH') { Object.assign(page, body); return page; }
    if (path === '/fields/pages') return fields;
    if (path === '/fields/directus_files') return fileFields;
    if (path === '/relations') return relations;
    if (path.startsWith('/policies?')) return [{ id: 'website-policy', name: 'Lucky Website', admin_access: false, app_access: false }];
    if (path.startsWith('/permissions?')) return grants;
    if (path.startsWith('/items/pages?')) return [page];
    throw new Error(`Unexpected request ${method} ${path}`);
  };
  return { api, page, fields, grants, writes };
}

test('migration preserves edited content, keeps published filters and adds only referenced portrait access', async () => {
  const state = fixture();
  await installAbout(state.api);
  assert.equal(state.page.sheet_title, 'Mein eigener Text');
  assert.deepEqual(state.page.sheet_personal, []);
  assert.ok(state.fields.some(item => item.field === 'sheet_portrait' && item.meta.interface === 'file-image'));
  assert.ok(state.grants[0].fields.includes('sheet_title'));
  assert.deepEqual(state.grants[0].permissions, { status: { _eq: 'published' } });
  const rule = state.grants[1].permissions;
  assert.ok(rule._or[0].lucky_project_screenshots);
  assert.equal(rule._or[1]._and[1].lucky_about_portraits._some.slug._eq, 'about');
  assert.equal(rule._or[1]._and[1].lucky_about_portraits._some.status._eq, 'published');
  state.writes.length = 0;
  await installAbout(state.api);
  assert.deepEqual(state.writes, [], 'running the migration twice must not duplicate or overwrite anything');
});

test('migration refuses a missing website policy before writing', async () => {
  const state = fixture();
  await assert.rejects(() => installAbout((path, method, body) => path.startsWith('/policies?') ? [] : state.api(path, method, body)), /policy missing/);
  assert.deepEqual(state.writes, []);
});

test('migration completes image/repeater editors after a generic blueprint install', async () => {
  const state = fixture();
  state.fields.push({ field: 'sheet_portrait', type: 'uuid', meta: { interface: 'input' } });
  state.fields.push({ field: 'sheet_skills', type: 'json', meta: { interface: 'input' } });
  await installAbout(state.api);
  assert.equal(state.fields.find(item => item.field === 'sheet_portrait').meta.interface, 'file-image');
  assert.equal(state.fields.find(item => item.field === 'sheet_skills').meta.interface, 'list');
  assert.equal(state.page.sheet_title, 'Mein eigener Text');
});

test('D20 covers all twenty equal intervals, including 1 and 20, and allows repeats', () => {
  for (let value = 1; value <= 20; value++) {
    assert.equal(rollD20(() => (value - 1 + .5) / 20), value);
  }
  assert.equal(rollD20(() => 0), 1);
  assert.equal(rollD20(() => .999999999), 20);
  assert.equal(rollD20(() => .5), rollD20(() => .5));
  for (const invalid of [-.1, 1, NaN, Infinity]) assert.throws(() => rollD20(() => invalid), RangeError);
});

test('natural 1 is a fumble, natural 20 unlocks a useful bonus, every middle number has a result', () => {
  assert.match(outcomeForRoll(1, aboutDefaults.roll_outcomes).title, /Patzer/);
  assert.ok(!outcomeForRoll(1, aboutDefaults.roll_outcomes).bonus_text);
  const critical = outcomeForRoll(20, aboutDefaults.roll_outcomes);
  assert.match(critical.title, /Kritischer Erfolg/);
  assert.match(critical.bonus_text, /Startseite/);
  for (let value = 2; value < 20; value++) {
    const outcome = outcomeForRoll(value, aboutDefaults.roll_outcomes);
    assert.ok(outcome.text);
    assert.ok(!outcome.bonus_text);
  }
});

test('CMS ranges and specific overrides work; gaps and malformed ranges retain valid defaults', () => {
  const custom = [{ min: 1, max: 20, title: 'Allgemein' }, { min: '20', max: '20', title: 'Mein Bonus', bonus_text: 'CMS-Bonus' }];
  assert.equal(outcomeForRoll(20, custom).title, 'Mein Bonus');
  assert.equal(outcomeForRoll(12, custom).title, 'Allgemein');
  assert.equal(outcomeForRoll(20, []).title, aboutDefaults.roll_outcomes.at(-1).title);
  assert.equal(outcomeForRoll(1, [{ min: 0, max: 20 }, { min: 5, max: 2 }, null]).title, aboutDefaults.roll_outcomes[0].title);
  for (const value of [0, 21, 1.5, NaN]) assert.throws(() => outcomeForRoll(value, []), RangeError);
});

test('sidequests replace Questlog and old dice links still point to a visible section', () => {
  const html = renderAbout({ discoveries: [{ title: 'Test', text: 'Test', target: 'quests' }] });
  assert.ok(!html.includes('Questlog'));
  assert.equal((html.match(/id="personal"/g) || []).length, 1);
  assert.ok(html.includes('href="#personal"'));
  for (const title of ['Pen &amp; Paper', 'Rennrad', 'Snowboardlehrer', 'Gaming']) assert.ok(html.includes(title));
  assert.ok(html.includes('Ammersee Wadler'));
  assert.ok(!html.includes('href=""'));
});

test('Twitch has a safe channel link and makes no player request before an explicit click', () => {
  const html = renderAbout();
  assert.ok(html.includes('https://www.twitch.tv/mrjokytv'));
  assert.ok(!html.includes('<iframe'));
  assert.ok(!html.includes('src="https://player.twitch.tv'));
  assert.ok(html.includes('data-twitch-load'));
  assert.equal(twitchChannel('MrJokyTV'), 'mrjokytv');
  assert.equal(twitchChannel('https://evil.example/'), '');
  assert.ok(!renderAbout({ twitch_channel: 'bad" onclick="alert(1)' }).includes('data-twitch-load'));
  const external = renderAbout({ personal: [{ title: 'Rad', text: 'Story', url: 'https://example.com/team', link_label: 'Team' }] });
  assert.ok(external.includes('href="https://example.com/team"'));
});
