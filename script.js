/**
 * GoldBazaar — Main JavaScript
 * Handles: Loader, Navbar, Dark Mode, Gold Calculator,
 *          FAQ Accordion, Scroll Reveal, Back-to-Top, Live Rate Simulation
 */

'use strict';

/* ──────────────────────────────────────────
   1. CONSTANTS & CONFIG
────────────────────────────────────────── */

// Base gold price per gram (24K, INR) — simulated MCX spot
const BASE_GOLD_RATE = 6842;
const PLATFORM_FEE_PERCENT = 6;

// Carat purity ratios
const CARAT_PURITY = {
  24: 1.000,
  22: 0.916,
  18: 0.750,
  14: 0.585,
};

/* ──────────────────────────────────────────
   2. LOADER
────────────────────────────────────────── */

const loader = document.getElementById('loader');

window.addEventListener('load', () => {
  // Give the bar animation ~1.8s to complete, then hide
  setTimeout(() => {
    loader.classList.add('hidden');
    // Remove from DOM after transition ends so it doesn't block clicks
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }, 2000);
});

/* ──────────────────────────────────────────
   3. NAVBAR — Scroll Behaviour & Active Links
────────────────────────────────────────── */

const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function updateNavbar() {
  const scrolled = window.scrollY > 30;
  navbar.classList.toggle('scrolled', scrolled);
}

function updateActiveLink() {
  let currentId = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) {
      currentId = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', href === currentId);
  });
}

window.addEventListener('scroll', () => {
  updateNavbar();
  updateActiveLink();
  revealOnScroll();
  updateBackToTop();
}, { passive: true });

updateNavbar(); // Initial call

/* ──────────────────────────────────────────
   4. MOBILE HAMBURGER MENU
────────────────────────────────────────── */

const hamburger = document.getElementById('hamburger');
const mobileNavLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = mobileNavLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close on nav link click
mobileNavLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNavLinks.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ──────────────────────────────────────────
   5. DARK MODE TOGGLE
────────────────────────────────────────── */

const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Persist preference
const savedTheme = localStorage.getItem('gb-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('gb-theme', next);
});

/* ──────────────────────────────────────────
   6. LIVE GOLD RATE SIMULATION
────────────────────────────────────────── */

let currentRate = BASE_GOLD_RATE;
let dailyChange = 38; // Initial "today's change" in INR

const rateValueEl    = document.getElementById('liveRate');
const heroRateEl     = document.getElementById('heroLiveRate');
const rateChangeEl   = document.getElementById('rateChange');
const rateTimeEl     = document.getElementById('rateTime');
const price24El      = document.getElementById('price24');
const price22El      = document.getElementById('price22');
const price18El      = document.getElementById('price18');
const tickerTrackEl  = document.getElementById('tickerTrack');

function formatINR(value) {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function updateRateDisplay() {
  // Simulate small random fluctuation (±0.1% per tick)
  const delta = (Math.random() - 0.5) * currentRate * 0.002;
  currentRate = Math.max(6200, Math.min(7200, currentRate + delta));
  dailyChange += (Math.random() - 0.48) * 5;

  const roundedRate = Math.round(currentRate);
  const roundedChange = Math.round(dailyChange);
  const isPositive = roundedChange >= 0;

  rateValueEl.textContent  = formatINR(roundedRate);
  heroRateEl.textContent   = formatINR(roundedRate);
  price24El.textContent    = formatINR(Math.round(roundedRate * 1.000));
  price22El.textContent    = formatINR(Math.round(roundedRate * 0.916));
  price18El.textContent    = formatINR(Math.round(roundedRate * 0.750));

  rateChangeEl.classList.toggle('positive', isPositive);
  rateChangeEl.classList.toggle('negative', !isPositive);
  rateChangeEl.innerHTML = `<span>${isPositive ? '▲' : '▼'}</span> ${isPositive ? '+' : ''}₹${Math.abs(roundedChange)} today`;

  // Update time
  const now = new Date();
  rateTimeEl.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Flash animation on rate value
  rateValueEl.style.transition = 'color 0.2s';
  rateValueEl.style.color = isPositive ? '#16A34A' : '#DC2626';
  setTimeout(() => {
    rateValueEl.style.color = '';
  }, 400);
}

function buildTicker() {
  const items = [
    { label: '24K Gold', value: formatINR(Math.round(currentRate)) },
    { label: '22K Gold', value: formatINR(Math.round(currentRate * 0.916)) },
    { label: '18K Gold', value: formatINR(Math.round(currentRate * 0.750)) },
    { label: 'Silver (1kg)', value: '94,200' },
    { label: 'USD/INR', value: '83.42' },
    { label: 'Platinum', value: '31,880' },
    { label: '24K Gold', value: formatINR(Math.round(currentRate)) },
    { label: '22K Gold', value: formatINR(Math.round(currentRate * 0.916)) },
    { label: '18K Gold', value: formatINR(Math.round(currentRate * 0.750)) },
    { label: 'Silver (1kg)', value: '94,200' },
    { label: 'USD/INR', value: '83.42' },
    { label: 'Platinum', value: '31,880' },
  ];

  tickerTrackEl.innerHTML = items.map(i =>
    `<span class="ticker-item">${i.label}: <span>₹${i.value}</span></span>`
  ).join('');
}

buildTicker();
updateRateDisplay();
// Update live rate every 4 seconds
setInterval(updateRateDisplay, 4000);

/* ──────────────────────────────────────────
   7. GOLD PAYOUT CALCULATOR
────────────────────────────────────────── */

const weightInput    = document.getElementById('goldWeight');
const caratSelect    = document.getElementById('goldCarat');
const calcBtn        = document.getElementById('calcBtn');
const calcBreakdown  = document.getElementById('calcBreakdown');
const marketValueEl  = document.getElementById('marketValue');
const platformFeeEl  = document.getElementById('platformFee');
const payoutEl       = document.getElementById('estimatedPayout');

function calculatePayout() {
  const weight = parseFloat(weightInput.value);
  const carat  = parseInt(caratSelect.value, 10);

  if (!weight || weight <= 0) {
    weightInput.focus();
    weightInput.style.borderColor = '#DC2626';
    setTimeout(() => { weightInput.style.borderColor = ''; }, 1500);
    return;
  }

  const purity      = CARAT_PURITY[carat] || 1;
  const marketValue = Math.round(currentRate * purity * weight);
  const fee         = Math.round(marketValue * PLATFORM_FEE_PERCENT / 100);
  const payout      = marketValue - fee;

  marketValueEl.textContent = `₹${formatINR(marketValue)}`;
  platformFeeEl.textContent = `−₹${formatINR(fee)}`;
  payoutEl.textContent      = `₹${formatINR(payout)}`;

  calcBreakdown.classList.add('visible');

  // Animate button text
  calcBtn.textContent = 'Recalculate';
}

calcBtn.addEventListener('click', calculatePayout);

// Auto-calculate on input change
[weightInput, caratSelect].forEach(el => {
  el.addEventListener('change', () => {
    if (calcBreakdown.classList.contains('visible')) {
      calculatePayout();
    }
  });
});

// Allow Enter key to trigger calculation
weightInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') calculatePayout();
});

/* ──────────────────────────────────────────
   8. FAQ ACCORDION
────────────────────────────────────────── */

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  const answer   = item.querySelector('.faq-answer');

  question.addEventListener('click', () => {
    const isExpanded = question.getAttribute('aria-expanded') === 'true';

    // Close all other items
    faqItems.forEach(other => {
      if (other !== item) {
        const otherQ = other.querySelector('.faq-question');
        const otherA = other.querySelector('.faq-answer');
        otherQ.setAttribute('aria-expanded', 'false');
        otherA.style.maxHeight = '0';
      }
    });

    // Toggle current item
    const newState = !isExpanded;
    question.setAttribute('aria-expanded', newState);

    if (newState) {
      // Expand: set max-height to scrollHeight so CSS transition animates
      answer.style.maxHeight = answer.scrollHeight + 'px';
    } else {
      answer.style.maxHeight = '0';
    }
  });
});

/* ──────────────────────────────────────────
   9. SCROLL REVEAL
────────────────────────────────────────── */

const revealEls = document.querySelectorAll('.reveal');

function revealOnScroll() {
  const triggerPoint = window.innerHeight * 0.88;
  revealEls.forEach(el => {
    if (el.getBoundingClientRect().top < triggerPoint) {
      const delay = el.dataset.delay || 0;
      setTimeout(() => {
        el.classList.add('visible');
      }, parseInt(delay, 10));
    }
  });
}

// Initial check (for elements already in view on page load)
setTimeout(revealOnScroll, 300);

/* ──────────────────────────────────────────
   10. BACK TO TOP
────────────────────────────────────────── */

const backToTopBtn = document.getElementById('backToTop');

function updateBackToTop() {
  backToTopBtn.classList.toggle('visible', window.scrollY > 400);
}

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ──────────────────────────────────────────
   11. SMOOTH SCROLL FOR ALL ANCHOR LINKS
────────────────────────────────────────── */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 8;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});

/* ──────────────────────────────────────────
   12. JEWELLER CARD STACK — subtle hover parallax
────────────────────────────────────────── */

const cardStack = document.querySelector('.jeweller-card-stack');
const jCards = document.querySelectorAll('.j-card');

if (cardStack) {
  cardStack.addEventListener('mousemove', (e) => {
    const rect = cardStack.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
    const cy = (e.clientY - rect.top) / rect.height - 0.5;

    jCards.forEach((card, i) => {
      const depth = (i + 1) * 0.4;
      card.style.transform = `
        rotate(${i === 2 ? 0.5 : i === 1 ? -1.5 : -4}deg)
        translateY(${i === 2 ? 0 : i === 1 ? 12 : 24}px)
        rotateX(${cy * -8 * depth}deg)
        rotateY(${cx * 8 * depth}deg)
        translateZ(${i * 8}px)
      `;
    });
  });

  cardStack.addEventListener('mouseleave', () => {
    jCards.forEach((card, i) => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
    });
  });
}

/* ──────────────────────────────────────────
   13. NAVBAR — ensure visible on dark hero
────────────────────────────────────────── */

// Ensure links are visible on light hero bg
updateNavbar();