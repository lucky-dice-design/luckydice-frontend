// Additive migration: no existing field, page value or grant is removed.
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { aboutFields, aboutSeed } from './about-schema.mjs';

export async function installAbout(api) {
  const fields = await api('/fields/pages');
  const policies = await api('/policies?filter[name][_eq]=Lucky%20Website&limit=-1');
  const policy = policies.find(item => item.name === 'Lucky Website');
  if (!policy || policy.admin_access || policy.app_access) throw new Error('Expected restricted Lucky Website policy missing. No changes made.');
  const grants = await api(`/permissions?filter[policy][_eq]=${encodeURIComponent(policy.id)}&limit=-1`);
  const pageGrant = grants.find(item => item.collection === 'pages' && item.action === 'read');
  const fileGrant = grants.find(item => item.collection === 'directus_files' && item.action === 'read');
  if (!pageGrant || !fileGrant) throw new Error('Required existing pages/files read permissions missing. No changes made.');
  const existingPages = await api('/items/pages?filter[slug][_eq]=about&limit=1');
  if (!existingPages[0]) throw new Error('About page missing. No changes made.');
  const known = new Map(fields.map(item => [item.field, item]));
  for (const field of aboutFields) {
    const existing = known.get(field.field);
    if (existing?.type && existing.type !== field.type) throw new Error(`Unexpected type for ${field.field}. Review before installing.`);
  }
  for (const field of aboutFields) {
    const existing = known.get(field.field);
    if (!existing) await api('/fields/pages', 'POST', field);
    else {
      // Also completes installs made with the generic schema blueprint, which
      // creates columns but cannot configure image and repeater interfaces.
      const meta = Object.fromEntries(Object.entries(field.meta).filter(([key, value]) => value !== undefined && JSON.stringify(existing.meta?.[key]) !== JSON.stringify(value)));
      if (Object.keys(meta).length) await api(`/fields/pages/${field.field}`, 'PATCH', { meta });
    }
  }
  const fileFields = await api('/fields/directus_files');
  if (!fileFields.some(item => item.field === 'lucky_about_portraits')) await api('/fields/directus_files', 'POST', {
    field: 'lucky_about_portraits', type: 'alias', meta: { special: ['o2m'], interface: 'list-o2m', hidden: true }
  });
  const relations = await api('/relations');
  const existingRelation = relations.find(item => item.collection === 'pages' && item.field === 'sheet_portrait');
  if (existingRelation && (existingRelation.related_collection !== 'directus_files' || existingRelation.meta?.one_field !== 'lucky_about_portraits')) throw new Error('sheet_portrait has an unexpected relation; review it manually.');
  if (!existingRelation) await api('/relations', 'POST', {
    collection: 'pages', field: 'sheet_portrait', related_collection: 'directus_files',
    meta: { one_field: 'lucky_about_portraits', one_deselect_action: 'nullify' }, schema: { on_delete: 'SET NULL' }
  });
  if (!(pageGrant.fields || []).includes('*')) {
    const nextFields = [...new Set([...(pageGrant.fields || []), ...aboutFields.filter(field => field.type !== 'alias').map(field => field.field)])];
    if (nextFields.length !== (pageGrant.fields || []).length) await api(`/permissions/${pageGrant.id}`, 'PATCH', { fields: nextFields });
  }
  const portraitRule = { _and: [
    { type: { _in: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'] } },
    { lucky_about_portraits: { _some: { slug: { _eq: 'about' }, status: { _eq: 'published' } } } }
  ] };
  const existingRule = fileGrant.permissions;
  // An unrestricted existing grant is preserved, never replaced by a stricter one.
  if (existingRule && Object.keys(existingRule).length && !JSON.stringify(existingRule).includes('lucky_about_portraits')) {
    await api(`/permissions/${fileGrant.id}`, 'PATCH', { permissions: { _or: [existingRule, portraitRule] } });
  }
  const page = (await api('/items/pages?filter[slug][_eq]=about&limit=1'))[0];
  const seed = Object.fromEntries(Object.entries(aboutSeed).filter(([key, value]) => value !== null && (page[key] === null || page[key] === undefined)));
  if (Object.keys(seed).length) await api(`/items/pages/${encodeURIComponent(page.id)}`, 'PATCH', seed);
  return { fields: aboutFields.length, preserved: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (!process.argv.includes('--apply')) {
    console.log(JSON.stringify({ mode: 'plan-only', collection: 'pages', slug: 'about', fields: aboutFields.map(item => item.field), portraitRelation: 'directus_files.lucky_about_portraits', note: 'Use --apply with DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN to install. Existing content is preserved.' }, null, 2));
  } else {
    const base = process.env.DIRECTUS_URL?.replace(/\/$/, '');
    const token = process.env.DIRECTUS_ADMIN_TOKEN;
    if (!base || !token || !/^https?:\/\//.test(base)) throw new Error('Set DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN in the environment.');
    const api = async (path, method = 'GET', body) => {
      const response = await fetch(base + path, { method, signal: AbortSignal.timeout(20000), headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      if (!response.ok) throw new Error(`Directus ${method} ${path.split('?')[0]} failed (${response.status}). Rerun after fixing the cause; completed additions are retained.`);
      if (response.status === 204) return null;
      return (await response.json()).data;
    };
    console.log(await installAbout(api));
  }
}
