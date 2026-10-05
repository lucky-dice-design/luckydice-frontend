import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projectCard, projectPath, renderProjectDetail, websiteUrl } from '../dist/assets/projects.js';

test('project links distinguish internal details and optional external websites', () => {
  const project = { slug: 'test-project', title: 'Test <project>', type: 'UI/UX', year: '2026', text: 'Summary', detail_body: 'First paragraph\n\nSecond paragraph' };
  assert.equal(projectPath(project), '/work/test-project/');
  const html = projectCard(project);
  assert.ok(html.includes('Mehr erfahren'));
  assert.ok(html.includes('Test &lt;project&gt;'));
  assert.ok(!html.includes('Direkt zur Website'));
  assert.ok(projectCard({ ...project, website_url: 'https://example.com/' }).includes('Direkt zur Website'));
  assert.equal(websiteUrl('javascript:alert(1)'), '');
  assert.equal(projectPath({ slug: '../escape' }), '');
  const detail = renderProjectDetail(project);
  assert.ok(detail.includes('First paragraph\n\nSecond paragraph'));
  assert.ok(!detail.includes('Zur Projektwebsite'));
});

test('project screenshot is optional and uses a safe same-origin asset URL', () => {
  const project = { title: 'Website', text: 'Summary' };
  assert.ok(!renderProjectDetail(project).includes('<img'));
  const html = renderProjectDetail({ ...project, screenshot: '11111111-1111-4111-8111-111111111111', screenshot_alt: 'Website <overview>' });
  assert.ok(html.includes('src="/cms/assets/11111111-1111-4111-8111-111111111111"'));
  assert.ok(html.includes('alt="Website &lt;overview&gt;"'));
  assert.ok(!renderProjectDetail({ ...project, screenshot: 'javascript:alert(1)' }).includes('<img'));
});
