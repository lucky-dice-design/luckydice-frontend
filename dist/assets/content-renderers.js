// CMS fields are text, never HTML. Keep link validation separate from text output.
export function contentUrl(value) {
  if (typeof value !== 'string') return '';
  const candidate = value.trim();
  if (!candidate || /[\u0000-\u0020\u007f\\]/.test(candidate) || candidate.startsWith('//')) return '';
  try {
    const url = new URL(candidate, 'https://relative-link.invalid/');
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? candidate : '';
  } catch { return ''; }
}

function element(document, tag, text) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = String(text ?? '');
  return node;
}

function link(document, url, text) {
  const anchor = element(document, 'a', text);
  const href = contentUrl(url);
  if (href) anchor.setAttribute('href', href);
  return anchor;
}

export function renderNavigation(items, document = globalThis.document) {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  nav.replaceChildren(...items.map(item => link(document, item.url, item.label)));
}

export function renderContentRepeats(content, document = globalThis.document) {
  const services = document.querySelector('[data-repeat="services"]');
  if (services) services.replaceChildren(...content.services.map(item => {
    const article = element(document, 'article');
    article.className = 'service-card';
    article.append(element(document, 'span', item.number || '00'),
      element(document, 'h3', item.title), element(document, 'p', item.text));
    return article;
  }));

  const facts = document.querySelector('[data-repeat="facts"]');
  if (facts) facts.replaceChildren(...content.facts.map(item => {
    const row = element(document, 'div');
    row.append(element(document, 'dt', item.label), element(document, 'dd', item.value));
    return row;
  }));

  const process = document.querySelector('[data-repeat="process"]');
  if (process) process.replaceChildren(...content.process.map((item, index) => {
    const article = element(document, 'article');
    article.append(element(document, 'span', String(index + 1).padStart(2, '0')),
      element(document, 'h2', item.title), element(document, 'p', item.text));
    return article;
  }));

  const contacts = document.querySelector('[data-repeat="contact-lines"]');
  if (contacts) contacts.replaceChildren(...content.contactLines.map(item => {
    const anchor = link(document, item.url);
    anchor.append(element(document, 'span', item.label), element(document, 'strong', item.value));
    return anchor;
  }));
}

export function renderFooter(settings, document = globalThis.document) {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;
  const email = String(settings.email ?? '').trim();
  // Encode the recipient so CMS values cannot introduce mail headers or URL syntax.
  const recipient = /^[^\s@<>"'\\?#&]+@[^\s@<>"'\\?#&]+$/.test(email)
    ? `mailto:${encodeURIComponent(email).replace(/%40/g, '@')}` : '';
  const links = element(document, 'div');
  links.append(link(document, recipient, settings.email), element(document, 'span', settings.instagram),
    link(document, '/impressum/', 'Impressum'), link(document, '/datenschutz/', 'Datenschutz'));
  footer.replaceChildren(element(document, 'p', settings.footer_note), links);
}
