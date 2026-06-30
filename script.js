document.addEventListener('DOMContentLoaded', () => {

    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobLinks = document.querySelectorAll('.mob-link');

    mobileToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        const icon = mobileToggle.querySelector('i');
        if(mobileMenu.classList.contains('open')) {
            icon.classList.remove('ph-list');
            icon.classList.add('ph-x');
            document.body.style.overflow = 'hidden';
        } else {
            icon.classList.remove('ph-x');
            icon.classList.add('ph-list');
            document.body.style.overflow = '';
        }
    });

    mobLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            mobileToggle.querySelector('i').classList.remove('ph-x');
            mobileToggle.querySelector('i').classList.add('ph-list');
            document.body.style.overflow = '';
        });
    });

    // 3. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { root: null, threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('active'));
    }

    // 4. Background Decorative Lines
    const bgLinesContainer = document.getElementById('bgLines');
    if(bgLinesContainer) {
        const frag = document.createDocumentFragment();
        for(let i = 1; i <= 5; i++) {
            let line = document.createElement('div');
            line.className = 'hero-line v';
            line.style.left = `${i * 20}%`; line.style.top = '0'; line.style.height = '100%';
            frag.appendChild(line);
        }
        for(let i = 1; i <= 3; i++) {
            let line = document.createElement('div');
            line.className = 'hero-line h';
            line.style.top = `${i * 30}%`; line.style.left = '0'; line.style.width = '100%';
            frag.appendChild(line);
        }
        bgLinesContainer.appendChild(frag);
    }

    // 5. Counters
    const statNumbers = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateValue(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (!prefersReducedMotion) {
        statNumbers.forEach(num => counterObserver.observe(num));
    } else {
        statNumbers.forEach(num => num.textContent = num.getAttribute('data-target'));
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            obj.innerHTML = Math.floor(ease * (end - start) + start);
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    // 6. Modal
    const modal = document.getElementById('calendarModal');
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
    const closeBtn = document.getElementById('closeModal');
    const iframeContainer = document.getElementById('iframeContainer');
    const calUrl = "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ36iaj8R3wecIJpTMzNH5Tu-AWyO6SrPMzBLwbeW3fM52Uox5olFDAxhcUMC5Tv22qc96c2-iHx?gv=true";

    let iframeLoaded = false;

    function openModal() {
        modal.classList.add('active'); modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if(!iframeLoaded) {
            iframeContainer.innerHTML = `<iframe src="${calUrl}" title="Book an appointment with Wideout X" loading="lazy"></iframe>`;
            iframeLoaded = true;
        }
        if(mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
            mobileToggle.querySelector('i').classList.remove('ph-x');
            mobileToggle.querySelector('i').classList.add('ph-list');
        }
    }

    function closeModal() {
        modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    modalTriggers.forEach(trigger => { trigger.addEventListener('click', (e) => { e.preventDefault(); openModal(); }); });
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });
});
