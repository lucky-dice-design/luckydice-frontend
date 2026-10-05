export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function projectPath(item) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug || '') ? `/work/${item.slug}/` : '';
}

export function websiteUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

export function projectCard(item) {
  const internal = projectPath(item);
  const website = websiteUrl(item.website_url);
  return `<article class="project-card">
    <div class="project-topline"><span>${escapeHtml(item.type)}</span><span>${escapeHtml(item.year)}</span></div>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.text)}</p>
    <div class="project-actions">
      ${internal ? `<a class="project-more" href="${internal}">Mehr erfahren <span aria-hidden="true">&#8594;</span></a>` : ''}
      ${website ? `<a class="project-website" href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer">Direkt zur Website <span aria-hidden="true">&#8599;</span></a>` : ''}
    </div>
  </article>`;
}

export function renderProjectDetail(item) {
  const website = websiteUrl(item.website_url);
  return `<a class="project-back" href="/work/">&#8592; My Work</a>
    <header class="project-detail-heading">
      <h1>${escapeHtml(item.title)}</h1>
      <p class="project-detail-meta">${escapeHtml([item.type, item.year].filter(Boolean).join(' · '))}</p>
      <p class="project-summary">${escapeHtml(item.text)}</p>
    </header>
    <div class="project-detail-body">${escapeHtml(item.detail_body || item.text)}</div>
    ${website ? `<a class="button primary" href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer">Zur Projektwebsite <span aria-hidden="true">&#8599;</span></a>` : ''}`;
}
