import * as THREE from "https://esm.sh/three@0.180.0";
import { fallbackContent } from "./content.js";

const config = window.LDD_CONFIG || {};
const pageKey = document.body.dataset.page || "home";
const themeStorageKey = "ldd-theme";

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem(themeStorageKey, nextTheme);
  document.querySelectorAll(".theme-toggle").forEach((button) => {
    button.setAttribute("aria-checked", String(nextTheme === "dark"));
    button.querySelector(".theme-toggle__text").textContent = nextTheme === "dark" ? "Light" : "Dark";
  });
}

function setupThemeToggle() {
  const header = document.querySelector(".site-header");
  if (!header || header.querySelector(".theme-toggle")) return;

  const savedTheme = localStorage.getItem(themeStorageKey);
  const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(savedTheme || preferredTheme);

  const button = document.createElement("button");
  button.className = "theme-toggle";
  button.type = "button";
  button.setAttribute("role", "switch");
  button.setAttribute("aria-label", "Darkmode umschalten");
  button.innerHTML = '<span class="theme-toggle__track" aria-hidden="true"><span></span></span><span class="theme-toggle__text"></span>';
  button.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    applyTheme(current === "dark" ? "light" : "dark");
  });

  header.appendChild(button);
  applyTheme(document.documentElement.dataset.theme);
}

async function directusFetch(path, params = "") {
  if (!config.directusUrl) return null;
  const base = config.directusUrl.replace(/\/$/, "");
  const headers = config.directusToken ? { Authorization: `Bearer ${config.directusToken}` } : {};
  const response = await fetch(`${base}${path}${params}`, { headers });
  if (!response.ok) throw new Error(`Directus request failed: ${response.status}`);
  const json = await response.json();
  return json.data;
}

async function loadContent() {
  try {
    const [settings, navigation, page, services, projects, facts, process, contactLines] = await Promise.all([
      directusFetch("/items/site_settings"),
      directusFetch("/items/navigation_items", "?sort=sort"),
      directusFetch("/items/pages", `?filter[slug][_eq]=${pageKey}&limit=1`),
      directusFetch("/items/services", "?filter[status][_eq]=published&sort=sort"),
      directusFetch("/items/projects", "?filter[status][_eq]=published&sort=sort"),
      directusFetch("/items/about_facts", "?sort=sort"),
      directusFetch("/items/process_steps", "?sort=sort"),
      directusFetch("/items/contact_channels", "?sort=sort")
    ]);

    return {
      ...fallbackContent,
      settings: firstOrValue(settings) || fallbackContent.settings,
      navigation: navigation?.length ? navigation : fallbackContent.navigation,
      pages: { ...fallbackContent.pages, [pageKey]: firstOrValue(page) || fallbackContent.pages[pageKey] },
      services: services?.length ? services : fallbackContent.services,
      projects: projects?.length ? projects : fallbackContent.projects,
      facts: facts?.length ? facts : fallbackContent.facts,
      process: process?.length ? process : fallbackContent.process,
      contactLines: contactLines?.length ? contactLines : fallbackContent.contactLines
    };
  } catch (error) {
    console.warn(error);
    return fallbackContent;
  }
}

function firstOrValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function renderNavigation(items) {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;
  nav.innerHTML = items.map((item) => `<a href="${item.url}">${item.label}</a>`).join("");
}

function hydrateText(page) {
  document.querySelectorAll("[data-content]").forEach((element) => {
    const [, field] = element.dataset.content.split(".");
    if (page[field]) element.textContent = page[field];
  });
}

function renderRepeats(content) {
  const services = document.querySelector('[data-repeat="services"]');
  if (services) {
    services.innerHTML = content.services.map((item) => `
      <article class="service-card">
        <span>${item.number || "00"}</span>
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </article>
    `).join("");
  }

  const projects = document.querySelector('[data-repeat="projects"]');
  const featured = document.querySelector('[data-repeat="featured-projects"]');
  const projectCards = content.projects.map(projectCard).join("");
  if (projects) projects.innerHTML = projectCards;
  if (featured) featured.innerHTML = content.projects.filter((item) => item.highlight).map(projectCard).join("");

  const facts = document.querySelector('[data-repeat="facts"]');
  if (facts) {
    facts.innerHTML = content.facts.map((item) => `<div><dt>${item.label}</dt><dd>${item.value}</dd></div>`).join("");
  }

  const process = document.querySelector('[data-repeat="process"]');
  if (process) {
    process.innerHTML = content.process.map((item, index) => `
      <article>
        <span>${String(index + 1).padStart(2, "0")}</span>
        <h2>${item.title}</h2>
        <p>${item.text}</p>
      </article>
    `).join("");
  }

  const contactLines = document.querySelector('[data-repeat="contact-lines"]');
  if (contactLines) {
    contactLines.innerHTML = content.contactLines.map((item) => `
      <a href="${item.url}">
        <span>${item.label}</span>
        <strong>${item.value}</strong>
      </a>
    `).join("");
  }
}

function projectCard(item) {
  return `
    <article class="project-card">
      <div class="project-topline">
        <span>${item.type}</span>
        <span>${item.year}</span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `;
}

function renderFooter(settings) {
  const footer = document.querySelector(".site-footer");
  if (!footer) return;
  footer.innerHTML = `
    <p>${settings.footer_note}</p>
    <div>
      <a href="mailto:${settings.email}">${settings.email}</a>
      <span>${settings.instagram}</span>
    </div>
  `;
}

function setupMenu() {
  const button = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!button || !nav) return;
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });
}

async function submitContactForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector(".form-status");
  status.textContent = "Sende Anfrage...";

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.source = "Lucky Dice Design Website";
  payload.status = "new";

  try {
    if (!config.directusUrl) {
      status.textContent = "Demo-Modus: Directus ist noch nicht verbunden.";
      return false;
    }

    const headers = { "Content-Type": "application/json" };
    if (config.directusToken) headers.Authorization = `Bearer ${config.directusToken}`;

    const response = await fetch(`${config.directusUrl.replace(/\/$/, "")}/items/contact_submissions`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("submission failed");
    form.reset();
    status.textContent = "Danke, deine Anfrage ist angekommen.";
  } catch (error) {
    console.warn(error);
    status.textContent = "Das hat gerade nicht geklappt. Bitte schreib mir direkt per Mail.";
  }

  return false;
}

window.LDD_submitContact = submitContactForm;

function setupContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  if (!form.getAttribute("onsubmit")) {
    form.addEventListener("submit", submitContactForm);
  }
}

function setupD20() {
  const canvas = document.querySelector("#d20-canvas");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  const geometry = new THREE.IcosahedronGeometry(1.55, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x1e3442,
    roughness: 0.55,
    metalness: 0.08,
    flatShading: true
  });
  const dice = new THREE.Mesh(geometry, material);
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0x81e6d9, transparent: true, opacity: 0.8 })
  );
  const diceGroup = new THREE.Group();
  diceGroup.add(dice, wire);

  const positions = geometry.attributes.position;
  for (let face = 0; face < positions.count; face += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(positions, face);
    const b = new THREE.Vector3().fromBufferAttribute(positions, face + 1);
    const c = new THREE.Vector3().fromBufferAttribute(positions, face + 2);
    const center = new THREE.Vector3().addVectors(a, b).add(c).multiplyScalar(1 / 3);
    const normal = center.clone().normalize();
    const label = createDiceNumberMesh(face / 3 + 1);
    label.position.copy(center.add(normal.clone().multiplyScalar(0.035)));
    label.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    diceGroup.add(label);
  }

  scene.add(diceGroup);

  scene.add(new THREE.AmbientLight(0xd9e6ee, 1.3));
  const key = new THREE.DirectionalLight(0x81e6d9, 2);
  key.position.set(3, 4, 5);
  scene.add(key);

  const target = { x: 0.2, y: -0.3 };
  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  };

  window.addEventListener("resize", resize);
  canvas.parentElement.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    target.x = ((event.clientY - rect.top) / rect.height - 0.5) * 1.2;
    target.y = ((event.clientX - rect.left) / rect.width - 0.5) * 1.2;
  });

  resize();
  const animate = () => {
    diceGroup.rotation.x += (target.x - diceGroup.rotation.x) * 0.045;
    diceGroup.rotation.y += (target.y - diceGroup.rotation.y) * 0.045 + 0.002;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();
}

function createDiceNumberMesh(number) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, size, size);

  context.font = "800 54px Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.lineWidth = 9;
  context.strokeStyle = "rgba(3, 12, 16, 0.52)";
  context.strokeText(String(number), size / 2 + 3, size / 2 + 5);

  context.lineWidth = 7;
  context.strokeStyle = "rgba(129, 230, 217, 0.32)";
  context.strokeText(String(number), size / 2 - 3, size / 2 - 3);

  context.lineWidth = 2;
  context.strokeStyle = "rgba(255, 255, 255, 0.4)";
  context.strokeText(String(number), size / 2 - 1, size / 2 - 1);

  context.fillStyle = "rgba(8, 27, 34, 0.72)";
  context.fillText(String(number), size / 2, size / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    side: THREE.FrontSide
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), material);
  return mesh;
}

loadContent().then((content) => {
  setupThemeToggle();
  renderNavigation(content.navigation);
  hydrateText(content.pages[pageKey]);
  renderRepeats(content);
  renderFooter(content.settings);
  setupMenu();
  setupContactForm();
  setupD20();
});
