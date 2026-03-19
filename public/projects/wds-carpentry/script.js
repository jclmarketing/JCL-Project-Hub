const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  nav.classList.toggle('open');
  const s = burger.querySelectorAll('span');
  if (nav.classList.contains('open')) {
    s[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    s[1].style.opacity = '0';
    s[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else { s.forEach(x => { x.style.transform = ''; x.style.opacity = ''; }); }
});
document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
  nav.classList.remove('open');
  burger.querySelectorAll('span').forEach(x => { x.style.transform = ''; x.style.opacity = ''; });
}));

const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 40 ? '0 2px 20px rgba(0,0,0,.05)' : 'none';
});

const form = document.getElementById('contactForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = 'Sending...'; btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Enquiry Sent!'; btn.style.background = '#10b981';
    form.reset();
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
  }, 800);
});

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; obs.unobserve(e.target); }});
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.svc-card,.step,.review-card,.folio-card,.trust-item,.faq-item,.area-pill').forEach(el => {
  el.style.opacity='0'; el.style.transform='translateY(16px)'; el.style.transition='opacity .5s ease, transform .5s ease'; obs.observe(el);
});
