/*
  script.js — behavior & animations for portfolio
  - Preloader
  - Dark/Light theme toggle (persistent in localStorage)
  - Cursor follower with delayed motion
  - IntersectionObserver for reveal animations
  - Typewriter animation
  - Canvas particles (lightweight)
  - Nav active detection + smooth scrolling
  - Gallery tabs, modal previews and contact form validation
  - Project card tilt effect
*/

/* ------------------ Helpers ------------------ */
const q = (s, el = document) => el.querySelector(s);
const qAll = (s, el = document) => [...el.querySelectorAll(s)];

/* ------------------ Preloader ------------------ */
const preloader = q('#preloader');
window.addEventListener('load', () => {
  // Give a small timeout to show the spinner then fade
  setTimeout(() => {
    preloader.style.opacity = '0';
    setTimeout(() => preloader.style.display = 'none', 600);
  }, 700);
});

/* ------------------ THEME (dark / light) ------------------ */
const root = document.documentElement;
const themeToggle = q('#themeToggle');
const saved = localStorage.getItem('theme');
if (saved === 'light') document.body.classList.add('light');
if (document.body.classList.contains('light')) themeToggle.textContent = '☀️';

themeToggle.addEventListener('click', () => {
  const nowLight = document.body.classList.toggle('light');
  localStorage.setItem('theme', nowLight ? 'light' : 'dark');
  themeToggle.textContent = nowLight ? '☀️' : '🌙';
});

/* ------------------ CURSOR FOLLOWER ------------------ */
const follower = q('#cursorFollower');
let mouseX = 0, mouseY = 0, fx = 0, fy = 0;
document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
function followLoop(){
  fx += (mouseX - fx) * 0.14;
  fy += (mouseY - fy) * 0.14;
  follower.style.transform = `translate(${fx}px, ${fy}px) translate(-50%,-50%)`;
  requestAnimationFrame(followLoop);
}
followLoop();

/* Enlarge cursor on interactive items */
const interactive = ['a', 'button', '.btn', '.project-card', 'input', 'textarea'];
interactive.forEach(sel => qAll(sel).forEach(el => {
  el.addEventListener('mouseenter', () => follower.style.transform += ' scale(1.45)');
  el.addEventListener('mouseleave', () => follower.style.transform = follower.style.transform.replace(' scale(1.45)', ''));
}));

/* ------------------ REVEAL ON SCROLL (IntersectionObserver) ------------------ */
const revealEls = qAll('.reveal');
const observer = new IntersectionObserver(entries => {
  for (const ent of entries) {
    if (ent.isIntersecting) ent.target.classList.add('visible');
  }
}, {threshold: 0.18});
revealEls.forEach(el => observer.observe(el));

/* ------------------ TYPEWRITER (looping) ------------------ */
const typeEl = q('#typewriterText');
const words = [
  'I build with curiosity.',
  'I explore code & design.',
  'I love drawing and discovering beaches.',
];
let wIdx = 0, ch = 0, direction = 1;
function typeLoop(){
  const word = words[wIdx];
  if (direction === 1) {
    ch++;
    typeEl.textContent = word.slice(0, ch);
    if (ch >= word.length) { direction = -1; setTimeout(typeLoop, 1000); return }
  } else {
    ch--;
    typeEl.textContent = word.slice(0, ch);
    if (ch <= 0) { direction = 1; wIdx = (wIdx+1) % words.length; }
  }
  setTimeout(typeLoop, direction === 1 ? 90 : 30);
}
typeLoop();

/* ------------------ PARTICLES CANVAS ------------------ */
const canvas = q('#particlesCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas(){ canvas.width = innerWidth; canvas.height = innerHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();

// create particles & stars
const particles = [];
function createParticles(){
  particles.length = 0;
  const area = canvas.width * canvas.height;
  // scale counts by screen area so stars look good on mobile/desktop
  const dotCount = Math.max(30, Math.floor(area / 140000));
  const starCount = Math.max(70, Math.floor(area / 60000));

  // moving dust / particles (subtle)
  for (let i=0;i<dotCount;i++){
    particles.push({type:'dot', x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.6, r: Math.random()*2+0.2, alpha: Math.random()*0.12+0.03});
  }

  // stars (twinkling + gentle parallax)
  for (let i=0;i<starCount;i++){
    particles.push({
      type:'star',
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*1.6 + 0.4,
      twinkle: Math.random()*Math.PI*2,
      twinkleSpeed: (Math.random()*0.035) + 0.005,
      baseAlpha: Math.random()*0.8 + 0.15,
      parallax: Math.random()*0.8 + 0.2
    });
  }
}
createParticles();

function drawParticles(){
  // slightly darker background layer so stars pop a little
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // small, slowly moving dots
  for (const p of particles){
    if (p.type === 'dot'){
      p.x += p.vx; p.y += p.vy;
      if (p.x < -50) p.x = canvas.width + 20;
      if (p.x > canvas.width + 50) p.x = -20;
      if (p.y < -50) p.y = canvas.height + 20;
      if (p.y > canvas.height + 50) p.y = -20;
      ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${p.alpha})`; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    } else if (p.type === 'star'){
      // twinkling brightness
      p.twinkle += p.twinkleSpeed;
      const t = Math.abs(Math.sin(p.twinkle));
      const a = Math.min(1, p.baseAlpha + t * 0.6);

      // subtle parallax follow for mouse movement (gives depth)
      const px = (mouseX / canvas.width - 0.5) * 30 * p.parallax;
      const py = (mouseY / canvas.height - 0.5) * 30 * p.parallax;

      // multi-ring glow
      ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.arc(p.x + px, p.y + py, p.r * 1.1, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${a*0.6})`; ctx.arc(p.x + px, p.y + py, p.r * 2.6, 0, Math.PI*2); ctx.fill();
    }
  }

  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ------------------ NAV + smooth highlighting ------------------ */
const navLinks = qAll('.nav-link');
function setActiveLink(){
  const scrollPos = window.scrollY + 120; // offset for header
  const sections = ['intro','about','projects','gallery','certs','contact'];
  let active = sections[0];
  for (const id of sections){ const el = q('#'+id); if (!el) continue; if (el.offsetTop <= scrollPos) active = id; }
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#'+active));
}
setActiveLink();
window.addEventListener('scroll', setActiveLink);

/* Mobile hamburger */
const hamburger = q('#hamburger');
hamburger.addEventListener('click', ()=> {
  const nav = q('#navLinks'); nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
});

/* Smooth anchors — we already have CSS smooth behavior but use JS for offset if needed */
qAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const href = a.getAttribute('href'); if (!href || href === '#') return;
  const el = q(href);
  if (el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); history.pushState(null,'',href); }
}));

/* ------------------ Gallery tabs */
const tabs = qAll('.tab');
tabs.forEach(t => t.addEventListener('click', ()=>{
  tabs.forEach(x => x.classList.remove('active')); t.classList.add('active');
  const name = t.dataset.tab; qAll('.gallery-grid .collection').forEach(c => c.classList.toggle('active', c.dataset.collection === name));
}));

/* ------------------ Contact Form Validation ------------------ */
const form = q('#contactForm');
if (form) form.addEventListener('submit', ev => {
  ev.preventDefault();
  const name = q('#name').value.trim();
  const contactVal = q('#contact').value.trim();
  const msg = q('#message').value.trim();
  if (!name || !contactVal || !msg) { alert('Please fill all fields before sending.'); return; }

  // Compose mailto link to open user's email client with prefilled content
  const to = 'blythdsouza@gmail.com';
  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const bodyLines = [
    `Name: ${name}`,
    `Contact: ${contactVal}`,
    '',
    msg
  ];
  const body = encodeURIComponent(bodyLines.join('\n'));
  const mailto = `mailto:${to}?subject=${subject}&body=${body}`;

  // Try to open the user's mail client
  window.location.href = mailto;
  // Optionally reset form after a short delay to avoid instant clearing for some mail clients
  setTimeout(() => form.reset(), 800);
});

/* ------------------ Projects modal and file preview ------------------ */
window.openProjectModal = function(btn){
  const modal = q('#projectModal'); modal.setAttribute('aria-hidden','false'); q('#modalContent').textContent = 'Project details & previews (demo).';
}
window.closeProjectModal = function(){
  const modal = q('#projectModal'); modal.setAttribute('aria-hidden','true');
}

const certUpload = q('#certUpload');
if (certUpload){
  certUpload.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const reader = new FileReader(); reader.onload = () => {
      const html = `<img style="max-width:100%;border-radius:8px;" src="${reader.result}" alt="Uploaded cert">`;
      q('#modalContent').innerHTML = html; q('#projectModal').setAttribute('aria-hidden','false');
    };
    reader.readAsDataURL(f);
  });
}

q('#previewCert')?.addEventListener('click', () => {
  if (certUpload.files && certUpload.files[0]) {
    certUpload.dispatchEvent(new Event('change'));
  } else alert('No certificate selected. Use Upload Certificate button first.');
});

/* ------------------ Tilt effect for project cards */
qAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const cx = rect.width/2; const cy = rect.height/2;
    const dx = (x - cx) / cx; const dy = (y - cy) / cy;
    card.style.transform = `perspective(700px) rotateX(${dy*6}deg) rotateY(${dx*10}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ------------------ Tilt effect for large sections (subtle) ------------------ */
// To avoid heavy transforms on small/touch devices, enable only on non-touch and wide screens
if (!('ontouchstart' in window) && innerWidth > 640) {
  const sectionEls = qAll('.section');
  sectionEls.forEach(sec => {
    sec.classList.add('tilt-section');
    sec.addEventListener('mousemove', e => {
      // Use smaller multipliers so large sections tilt subtly
      const rect = sec.getBoundingClientRect();
      const x = e.clientX - rect.left; const y = e.clientY - rect.top;
      const cx = rect.width / 2; const cy = rect.height / 2;
      const dx = (x - cx) / cx; const dy = (y - cy) / cy;
      const rx = (dy * 2.5); // rotateX (smaller)
      const ry = (dx * 5);   // rotateY (slightly larger horizontally)
      const tz = 6; // slight depth translation
      sec.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${tz}px)`;
    });
    sec.addEventListener('mouseleave', () => sec.style.transform = '');
  });
}

/* ------------------ Accessibility: close modals with Esc */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProjectModal(); });

/* End of script.js */
