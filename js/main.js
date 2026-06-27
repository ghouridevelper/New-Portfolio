const plasmaCursor = document.getElementById('plasmaCursor');
const plasmaCursorInner = document.getElementById('plasmaCursorInner');
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');
const navLinks = document.querySelectorAll('.nav-link');
const interactiveItems = document.querySelectorAll('a, button, .icon-link, .contact-item');
const skillCards = document.querySelectorAll('.skill-card');
const revealElements = document.querySelectorAll('.reveal');
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

function updateCursor(event) {
  const { clientX, clientY } = event;
  plasmaCursor.style.left = `${clientX}px`;
  plasmaCursor.style.top = `${clientY}px`;
  plasmaCursorInner.style.left = `${clientX}px`;
  plasmaCursorInner.style.top = `${clientY}px`;
}

function toggleCursorHover(active) {
  document.body.classList.toggle('cursor-hover', active);
}

function handleScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 24);

  revealElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight - 120) {
      element.classList.add('visible');
    }
  });
}

function setSkillProgress() {
  skillCards.forEach((card) => {
    const fill = card.querySelector('.skill-fill');
    const percentage = card.dataset.level || 0;
    fill.style.width = `${percentage}%`;
  });
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
}

function highlightActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const offset = window.scrollY + window.innerHeight * 0.35;
  let activeId = 'home';

  sections.forEach((section) => {
    if (section.offsetTop <= offset) {
      activeId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.section === activeId);
  });
}

window.addEventListener('mousemove', updateCursor);
window.addEventListener('scroll', () => {
  handleScroll();
  highlightActiveLink();
});
window.addEventListener('load', () => {
  setSkillProgress();
  handleScroll();
  highlightActiveLink();
});

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!contactForm.action || contactForm.action.includes('your-form-id')) {
      formStatus.textContent = 'Please replace the form action URL with your Formspree endpoint to send messages.';
      formStatus.classList.add('form-status-error');
      return;
    }

    const formData = new FormData(contactForm);
    formStatus.textContent = 'Sending...';
    formStatus.classList.remove('form-status-error');

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        contactForm.reset();
        formStatus.textContent = 'Message sent successfully — I will reply soon.';
      } else {
        const data = await response.json();
        formStatus.textContent = data.error || 'Unable to send message. Please try again later.';
        formStatus.classList.add('form-status-error');
      }
    } catch (error) {
      formStatus.textContent = 'Network error sending your message. Please try again later.';
      formStatus.classList.add('form-status-error');
    }
  });
}

interactiveItems.forEach((item) => {
  item.addEventListener('mouseenter', () => toggleCursorHover(true));
  item.addEventListener('mouseleave', () => toggleCursorHover(false));
});

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

mobileLinks.forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});

/* ===== PLASMA FIELD: particles that float and gather per-section ===== */
const plasmaField = document.getElementById('plasmaField');
const sections = document.querySelectorAll('section[id]');
let particles = [];
let animating = false;
const PARTICLE_COUNT = 18;

function rand(min, max) { return Math.random() * (max - min) + min; }

function createParticles() {
  if (!plasmaField) return;
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'plasma-dot wobble';
    if (i % 5 === 0) el.classList.add('large');
    if (i % 3 === 0) el.classList.add('small');
    plasmaField.appendChild(el);

    const p = {
      el,
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      vx: rand(-0.12, 0.12),
      // buoyant upward starting velocity for bubble effect
      vy: rand(-0.6, -0.08),
      buoyancy: rand(0.0008, 0.0045),
      target: null,
      gathered: false
    };
    el.style.left = `${p.x}px`;
    el.style.top = `${p.y}px`;
    particles.push(p);
  }
}

function animateParticles() {
  particles.forEach((p, i) => {
    if (p.target) {
      // move toward target
      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      p.vx = p.vx * 0.8 + dx * 0.06;
      p.vy = p.vy * 0.8 + dy * 0.06;
    } else {
      // buoyant upward drift with gentle horizontal wander
      p.vx += rand(-0.015, 0.015);
      p.vy -= p.buoyancy; // constant upward pull
      p.vx *= 0.995; p.vy *= 0.996;
    }

    p.x += p.vx;
    p.y += p.vy;

    // keep on screen (wrap horizontally, respawn at bottom when rising past top)
    if (p.x < -300) p.x = window.innerWidth + 300;
    if (p.x > window.innerWidth + 300) p.x = -300;
    if (p.y < -280) p.y = window.innerHeight + rand(40, 220);
    if (p.y > window.innerHeight + 400) p.y = -200;

    p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
  });
  if (animating) requestAnimationFrame(animateParticles);
}

function gatherTo(x, y, sectionEl) {
  if (!plasmaField) return;
  // mark plasma gather state (visual only)
  plasmaField.classList.add('plasma-gather');
  animating = true;
  // arrange particles in a loose circle around target
  const radius = Math.min(220, window.innerWidth * 0.18);
  particles.forEach((p, idx) => {
    const angle = (idx / particles.length) * Math.PI * 2 + (idx % 2 ? 0.15 : -0.15);
    const tx = x + Math.cos(angle) * (radius + rand(-40, 40));
    const ty = y + Math.sin(angle) * (radius + rand(-30, 30));
    p.target = { x: tx, y: ty };
  });

  // add highlight to the section to subtly tint it
  sections.forEach(s => s.classList.remove('plasma-anchor-highlight'));
  if (sectionEl) sectionEl.classList.add('plasma-anchor-highlight');

  // after gather settle and reveal content in that section
  setTimeout(() => {
    // reveal the section's reveal children
    const reveals = sectionEl ? sectionEl.querySelectorAll('.reveal') : document.querySelectorAll('.reveal');
    reveals.forEach(r => r.classList.add('visible'));

    // clear targets so dots slowly drift again but stay loosely gathered
    particles.forEach(p => { p.target = null; p.gathered = true; });
    plasmaField.classList.remove('plasma-gather');
  }, 900);
}

function observeSections() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
        const rect = entry.target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2 + window.scrollX;
        const centerY = rect.top + rect.height / 3 + window.scrollY;
        gatherTo(centerX, centerY, entry.target);
      }
    });
  }, { threshold: [0.45, 0.6] });
  sections.forEach(s => observer.observe(s));
}

window.addEventListener('resize', () => {
  // keep particles within new bounds
  particles.forEach(p => {
    p.x = Math.max(0, Math.min(window.innerWidth, p.x));
    p.y = Math.max(0, Math.min(window.innerHeight, p.y));
  });
});

// Scroll start / stop detection to show bubbles while user scrolls
let scrollTimer = null;
let isUserScrolling = false;

function onScrollStart() {
  isUserScrolling = true;
  // make particles more visible and energetic
  particles.forEach(p => {
    p.el.classList.add('wobble');
    p.el.style.opacity = '';
    p.vx += rand(-1.2, 1.2);
    p.vy += rand(-0.8, 0.8);
    p.gathered = false;
  });
}

function onScrollStop() {
  isUserScrolling = false;
  // pick nearest section to center of viewport and gather there
  const centerY = window.scrollY + window.innerHeight / 2;
  let nearest = null; let minDist = Infinity;
  sections.forEach(s => {
    const mid = s.offsetTop + s.offsetHeight / 2;
    const d = Math.abs(mid - centerY);
    if (d < minDist) { minDist = d; nearest = s; }
  });
  if (nearest) {
    const rect = nearest.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 + window.scrollX;
    const cy = rect.top + rect.height / 3 + window.scrollY;
    // move particles from surroundings stronger: nudge positions to edges if too close
    particles.forEach(p => {
      if (Math.abs(p.x - cx) < 120 && Math.abs(p.y - cy) < 120) {
        // push to a random edge spot to simulate gathering from surroundings
        if (Math.random() > 0.5) p.x = Math.random() > 0.5 ? -200 : window.innerWidth + 200;
        else p.y = Math.random() > 0.5 ? -200 : window.innerHeight + 200;
      }
    });
    gatherTo(cx, cy, nearest);
  }
}

window.addEventListener('scroll', () => {
  if (!isUserScrolling) onScrollStart();
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => { onScrollStop(); }, 260);
});

// gentle cursor attraction when particles are gathered
window.addEventListener('mousemove', (e) => {
  if (!particles.length) return;
  // apply small temporary targets near the cursor when user moves
  particles.forEach((p, i) => {
    if (p.gathered) {
      const j = (i % 8) / 8;
      p.vx += (e.clientX + Math.cos(i) * 8 - p.x) * 0.0025;
      p.vy += (e.clientY + Math.sin(i) * 8 - p.y) * 0.0025;
    }
  });
});

// initialize
createParticles();
animating = true;
requestAnimationFrame(animateParticles);
// on load, start particle observation but do NOT gather automatically
window.addEventListener('load', () => {
  observeSections();
});
