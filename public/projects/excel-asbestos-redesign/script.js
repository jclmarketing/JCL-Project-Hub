// ===== Mobile Navigation =====
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.classList.toggle('nav-open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('nav-open');
    });
});

// Close mobile nav on outside click
document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !mobileToggle.contains(e.target)) {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('nav-open');
    }
});

// ===== Sticky Header =====
const header = document.getElementById('header');
let lastScroll = 0;
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const currentScroll = window.scrollY;
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            lastScroll = currentScroll;
            ticking = false;
        });
        ticking = true;
    }
});

// ===== Hero Entry Animations =====
const heroAnimateEls = document.querySelectorAll('.animate-in');
heroAnimateEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s`;
    setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    }, 100);
});

// ===== Scroll Reveal with Stagger =====
const revealElements = document.querySelectorAll('.scroll-reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Find sibling scroll-reveal elements for stagger effect
            const parent = entry.target.parentElement;
            const siblings = parent.querySelectorAll('.scroll-reveal');
            let index = 0;
            siblings.forEach((sib, i) => {
                if (sib === entry.target) index = i;
            });
            entry.target.style.transitionDelay = `${index * 0.08}s`;
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== Counter Animation =====
const counters = document.querySelectorAll('.stat-number');
let countersAnimated = false;

function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const isDecimal = target % 1 !== 0;
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;

            if (isDecimal) {
                counter.textContent = current.toFixed(1);
            } else {
                counter.textContent = Math.floor(current).toLocaleString();
            }

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                if (isDecimal) {
                    counter.textContent = target.toFixed(1);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            }
        }

        requestAnimationFrame(updateCounter);
    });
}

const statsSection = document.querySelector('.stats-bar');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

if (statsSection) {
    statsObserver.observe(statsSection);
}

// ===== FAQ Accordion =====
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all FAQ items
        faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-answer').style.maxHeight = null;
            otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Open clicked if not already open
        if (!isActive) {
            item.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
            question.setAttribute('aria-expanded', 'true');
        }
    });
});

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const headerHeight = header.offsetHeight + 20;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Form Handling =====
function handleFormSubmit(form, formCard) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Sending...
        `;
        btn.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            if (formCard) {
                formCard.innerHTML = `
                    <div class="form-success">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="9 12 11 14 15 10"/>
                        </svg>
                        <h3>Thank You!</h3>
                        <p>We've received your enquiry and will get back to you within 2 hours.</p>
                        <p style="margin-top: 12px; font-size: 0.85rem;">Or call us now: <a href="tel:08000996558" style="color: #010080; font-weight: 600;">08000 996 558</a></p>
                    </div>
                `;
            } else {
                btn.innerHTML = originalText;
                btn.disabled = false;
                form.reset();
                // Show inline success
                const successMsg = document.createElement('div');
                successMsg.className = 'form-inline-success';
                successMsg.innerHTML = '<p>Thank you! We\'ll be in touch soon.</p>';
                form.parentNode.insertBefore(successMsg, form.nextSibling);
                setTimeout(() => successMsg.remove(), 4000);
            }
        }, 1500);
    });
}

const quoteForm = document.getElementById('quoteForm');
const heroFormCard = document.querySelector('.hero-form-card');
if (quoteForm) handleFormSubmit(quoteForm, heroFormCard);

const contactForm = document.getElementById('contactForm');
if (contactForm) handleFormSubmit(contactForm, null);

// ===== Mobile Sticky CTA =====
const mobileCta = document.getElementById('mobileCta');

if (mobileCta) {
    const ctaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && window.innerWidth <= 768) {
                mobileCta.classList.add('visible');
            } else {
                mobileCta.classList.remove('visible');
            }
        });
    }, { threshold: 0 });

    const heroSection = document.getElementById('hero');
    if (heroSection) {
        ctaObserver.observe(heroSection);
    }
}

// ===== Gallery Lightbox Effect =====
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        item.classList.toggle('gallery-expanded');
    });
});

// ===== Parallax on Hero Background =====
const heroBg = document.querySelector('.hero-bg-img');
if (heroBg && window.matchMedia('(min-width: 769px)').matches) {
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                const heroHeight = document.getElementById('hero').offsetHeight;
                if (scrolled < heroHeight) {
                    heroBg.style.transform = `scale(1.1) translateY(${scrolled * 0.15}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ===== Tilt Effect on Service Cards (Desktop) =====
if (window.matchMedia('(min-width: 769px) and (hover: hover)').matches) {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -3;
            const rotateY = (x - centerX) / centerX * 3;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            card.style.transition = 'transform 0.5s ease';
        });
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease';
        });
    });
}

// ===== Active Nav Highlight on Scroll =====
const sections = document.querySelectorAll('section[id]');
const navLinkItems = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinkItems.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, {
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
});

sections.forEach(section => navObserver.observe(section));

// ===== Spin animation for loading state =====
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .form-inline-success {
        margin-top: 16px;
        padding: 16px;
        background: #ecfdf5;
        border-radius: 12px;
        color: #059669;
        font-weight: 600;
        text-align: center;
        animation: fadeIn 0.3s ease;
    }
    .form-inline-success p { margin: 0; }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .nav-links a.active {
        color: #010080;
    }
    body.nav-open {
        overflow: hidden;
    }
`;
document.head.appendChild(styleSheet);
