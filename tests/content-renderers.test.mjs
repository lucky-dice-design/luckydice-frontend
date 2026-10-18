import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contentUrl, renderNavigation, renderContentRepeats, renderFooter } from '../dist/assets/content-renderers.js';
import { fallbackContent } from '../dist/assets/content.js';

// Minimal DOM double: fail if CMS rendering ever invokes an HTML parser again.
class Element {
  constructor(tagName) { this.tagName = tagName; this.children = []; this.attributes = {}; this.text = ''; }
  set innerHTML(_) { throw new Error('CMS content must not be assigned to innerHTML'); }
  set textContent(value) { this.text = String(value); this.children = []; }
  get textContent() { return this.text + this.children.map(child => child.textContent).join(''); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.text = ''; this.children = children; }
}

function documentWith(...selectors) {
  const nodes = new Map(selectors.map(selector => [selector, new Element('container')]));
  return { querySelector: selector => nodes.get(selector) ?? null, createElement: tag => new Element(tag) };
}

const payload = '<img src=x onerror="alert(1)"><svg onload=alert(2)> & "quoted"';

test('content links allow intended protocols and relative paths', () => {
  for (const url of ['/', '/work/', './about/', '../contact/', '#details', '?page=2', 'https://example.com/',
    'http://example.com/', 'mailto:info@example.com', 'tel:+491234567']) assert.equal(contentUrl(url), url);
  assert.equal(contentUrl('  /work/  '), '/work/');
});

test('content links reject executable schemes, control characters and backslashes', () => {
  for (const url of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'java\tscript:alert(1)',
    'java\nscript:alert(1)', '\u0000javascript:alert(1)', 'data:text/html,<svg onload=alert(1)>',
    'vbscript:msgbox(1)', 'file:///etc/passwd', 'blob:https://example.com/id', '//example.com/',
    '/\\example.com/', 'https://example.com/\u007f', '', null, 42]) assert.equal(contentUrl(url), '', String(url));
});

test('navigation keeps CMS HTML literal and dangerous links inert', () => {
  const document = documentWith('.site-nav');
  renderNavigation([{ label: payload, url: 'javascript:alert(1)' }, { label: 'Work', url: '/work/' }], document);
  const nav = document.querySelector('.site-nav');
  assert.equal(nav.children[0].textContent, payload);
  assert.deepEqual(nav.children[0].children, []);
  assert.equal(nav.children[0].getAttribute('href'), null);
  assert.equal(nav.children[1].getAttribute('href'), '/work/');
  renderNavigation([{ label: 'New', url: '/' }], document);
  assert.equal(nav.children.length, 1);
});

test('all repeated CMS text stays literal while existing structure and numbering survive', () => {
  const document = documentWith('[data-repeat="services"]', '[data-repeat="facts"]',
    '[data-repeat="process"]', '[data-repeat="contact-lines"]');
  renderContentRepeats({
    services: [{ number: payload, title: payload, text: payload }],
    facts: [{ label: payload, value: payload }],
    process: [{ title: payload, text: payload }],
    contactLines: [{ label: payload, value: payload, url: 'data:text/html,test' }]
  }, document);
  const service = document.querySelector('[data-repeat="services"]').children[0];
  assert.equal(service.className, 'service-card');
  assert.deepEqual(service.children.map(node => node.tagName), ['span', 'h3', 'p']);
  for (const child of service.children) assert.equal(child.textContent, payload);
  const fact = document.querySelector('[data-repeat="facts"]').children[0];
  assert.deepEqual(fact.children.map(node => node.tagName), ['dt', 'dd']);
  for (const child of fact.children) assert.equal(child.textContent, payload);
  const process = document.querySelector('[data-repeat="process"]').children[0];
  assert.equal(process.children[0].textContent, '01');
  assert.equal(process.children[1].textContent, payload);
  assert.equal(process.children[2].textContent, payload);
  const contact = document.querySelector('[data-repeat="contact-lines"]').children[0];
  assert.equal(contact.getAttribute('href'), null);
  for (const child of contact.children) assert.equal(child.textContent, payload);
});

test('footer escapes no data into HTML and rejects email URL/header injection', () => {
  const document = documentWith('.site-footer');
  for (const email of [payload, 'victim@example.com?bcc=other@example.com', 'victim@example.com\r\nBcc:other@example.com']) {
    renderFooter({ footer_note: payload, email, instagram: payload }, document);
    const footer = document.querySelector('.site-footer');
    assert.equal(footer.children[0].textContent, payload);
    const links = footer.children[1].children;
    assert.equal(links[0].textContent, email);
    assert.equal(links[0].getAttribute('href'), null);
    assert.equal(links[1].textContent, payload);
    assert.equal(links[2].getAttribute('href'), '/impressum/');
    assert.equal(links[3].getAttribute('href'), '/datenschutz/');
  }
  renderFooter({ email: 'info@example.com' }, document);
  assert.equal(document.querySelector('.site-footer').children[1].children[0].getAttribute('href'), 'mailto:info@example.com');
});

test('renderers tolerate page sections that are not present', () => {
  const document = documentWith();
  renderNavigation([], document);
  renderContentRepeats({}, document);
  renderFooter({}, document);
});

test('existing fallback navigation, services and contact links remain usable', () => {
  const document = documentWith('.site-nav', '.site-footer', '[data-repeat="services"]',
    '[data-repeat="facts"]', '[data-repeat="process"]', '[data-repeat="contact-lines"]');
  renderNavigation(fallbackContent.navigation, document);
  renderContentRepeats(fallbackContent, document);
  renderFooter(fallbackContent.settings, document);
  assert.deepEqual(document.querySelector('.site-nav').children.map(node => node.getAttribute('href')),
    fallbackContent.navigation.map(item => item.url));
  assert.equal(document.querySelector('[data-repeat="services"]').children.length, fallbackContent.services.length);
  assert.deepEqual(document.querySelector('[data-repeat="contact-lines"]').children.map(node => node.getAttribute('href')),
    fallbackContent.contactLines.map(item => item.url));
  assert.equal(document.querySelector('.site-footer').children[1].children[0].getAttribute('href'),
    `mailto:${fallbackContent.settings.email}`);
});
