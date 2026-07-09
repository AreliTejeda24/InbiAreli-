/* ============================================================
   ARELI TEJEDA — Ingeniería Biomédica
   Doble hélice de ADN en canvas que gira con el scroll,
   scroll mantequilla (Lenis + GSAP) y reveals cinematográficos.
   ============================================================ */

const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
if (burger && nav) {
    burger.addEventListener('click', () => nav.classList.toggle('nav-active'));
    document.querySelectorAll('.nav-links a').forEach(a =>
        a.addEventListener('click', () => nav.classList.remove('nav-active')));
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   MONITOR DE SIGNOS VITALES — fondo a pantalla completa.
   Señal de EKG verde (como un monitor real) + onda de
   respiración violeta sobre cuadrícula de osciloscopio.
   El trazo avanza amarrado al scroll, como papel de
   electrocardiógrafo: al deslizar, la señal corre contigo.
   ============================================================ */
(function () {
    const cv = document.getElementById('vitals-canvas');
    if (!cv) return;
    const cx = cv.getContext('2d');

    const GREEN  = [74, 222, 128];    // verde monitor (EKG)
    const VIOLET = [139, 92, 246];    // violeta (respiración)
    const LILAC  = [192, 132, 252];   // lila (motas y cuadrícula)

    let W, H, DPR, motes;

    function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth; H = window.innerHeight;
        cv.width = W * DPR; cv.height = H * DPR;
        cv.style.width = W + 'px'; cv.style.height = H + 'px';
        cx.setTransform(DPR, 0, 0, DPR, 0, 0);

        const count = W < 700 ? 14 : 30;
        motes = Array.from({ length: count }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            r: 0.8 + Math.random() * 2,
            vy: 0.1 + Math.random() * 0.3,
            drift: Math.random() * Math.PI * 2,
            alpha: 0.06 + Math.random() * 0.18,
            color: Math.random() < 0.6 ? LILAC : VIOLET,
        }));
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* Avance del trazo ligado al scroll, con inercia */
    let offTarget = 0, offSmooth = 0, t = 0;
    function onScroll() { offTarget = (window.scrollY || 0) * 0.9; }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function rgba(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

    /* Complejo PQRST de un latido (p ∈ [0,1)) como suma de gaussianas */
    function ekg(p) {
        const g = (c, w, h) => h * Math.exp(-((p - c) ** 2) / (2 * w * w));
        return g(0.18, 0.028, 0.14)     // onda P
             + g(0.30, 0.009, -0.20)    // Q
             + g(0.32, 0.011, 1.00)     // R (el pico)
             + g(0.345, 0.010, -0.26)   // S
             + g(0.55, 0.050, 0.30);    // onda T
    }

    /* Cuadrícula de osciloscopio, muy tenue */
    function grid() {
        const cell = 54;
        for (let x = 0, i = 0; x <= W; x += cell, i++) {
            cx.strokeStyle = rgba(LILAC, i % 4 === 0 ? 0.055 : 0.028);
            cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, H); cx.stroke();
        }
        for (let y = 0, i = 0; y <= H; y += cell, i++) {
            cx.strokeStyle = rgba(LILAC, i % 4 === 0 ? 0.055 : 0.028);
            cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke();
        }
    }

    /* Traza una señal de EKG que corre de derecha a izquierda */
    function ekgTrace(baseY, amp, wavelength, offset, color, alphaMul, lw) {
        cx.beginPath();
        for (let x = -12; x <= W + 12; x += 2.5) {
            let p = ((x + offset) / wavelength) % 1;
            if (p < 0) p += 1;
            const y = baseY - ekg(p) * amp;
            x <= -12 ? cx.moveTo(x, y) : cx.lineTo(x, y);
        }
        // halo exterior + núcleo brillante (mismo path, dos pasadas)
        cx.lineJoin = 'round';
        cx.strokeStyle = rgba(color, 0.10 * alphaMul); cx.lineWidth = lw * 3.4; cx.stroke();
        cx.strokeStyle = rgba(color, 0.80 * alphaMul); cx.lineWidth = lw; cx.stroke();
    }

    /* Onda suave de respiración / pletismografía */
    function breathTrace(baseY, amp, offset, color, alphaMul) {
        cx.beginPath();
        for (let x = -12; x <= W + 12; x += 3) {
            const k = (x + offset * 0.6) * 0.012;
            const y = baseY + Math.sin(k) * amp + Math.sin(k * 0.37 + 1.4) * amp * 0.5;
            x <= -12 ? cx.moveTo(x, y) : cx.lineTo(x, y);
        }
        cx.strokeStyle = rgba(color, 0.09 * alphaMul); cx.lineWidth = 6; cx.stroke();
        cx.strokeStyle = rgba(color, 0.45 * alphaMul); cx.lineWidth = 1.6; cx.stroke();
    }

    function drawMotes() {
        for (const m of motes) {
            m.y -= m.vy;
            m.x += Math.sin(t * 0.008 + m.drift) * 0.2;
            if (m.y < -12) { m.y = H + 12; m.x = Math.random() * W; }
            cx.beginPath();
            cx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
            cx.fillStyle = rgba(m.color, m.alpha);
            cx.fill();
        }
    }

    function draw(offset) {
        cx.clearRect(0, 0, W, H);
        grid();
        drawMotes();
        const mobile = W <= 900;
        const alpha = mobile ? 0.55 : 1;
        // Respiración arriba (violeta, lenta y suave)
        breathTrace(H * 0.22, mobile ? 16 : 26, offset, VIOLET, alpha);
        // EKG secundario tenue a media pantalla (lila, desfasado)
        ekgTrace(H * 0.47, mobile ? 30 : 52, Math.min(W * 0.62, 860), offset * 0.7 + 320, LILAC, 0.28 * alpha, 1.2);
        // EKG protagonista abajo (VERDE monitor)
        ekgTrace(H * 0.76, mobile ? 60 : Math.min(H * 0.15, 120), Math.min(W * 0.45, 640), offset, GREEN, alpha, 2);
    }

    if (reducedMotion) { draw(180); return; }

    function frame() {
        offSmooth += (offTarget - offSmooth) * 0.08;   // inercia: sigue al scroll
        const offset = offSmooth + t * 0.7;            // avance constante en reposo
        draw(offset);
        t++;
        requestAnimationFrame(frame);
    }
    frame();
})();

/* ===== SCROLL MANTEQUILLA: Lenis + GSAP ===== */
if (window.Lenis && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ duration: 1.25 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    // Anclas suaves
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -72 }); }
        });
    });

    // Barra de progreso
    gsap.to('#scroll-progress', {
        scaleX: 1, ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
    });

    // Reveals escalonados
    ScrollTrigger.batch('.reveal', {
        start: 'top 85%', once: true,
        onEnter: batch => batch.forEach((el, i) => gsap.delayedCall(i * 0.1, () => el.classList.add('visible')))
    });

    if (!reducedMotion) {
        // El hero se disuelve al bajar: sensación de plano cinematográfico
        gsap.to('.hero-content', {
            y: -70, opacity: 0.15, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 35%', scrub: 0.6 }
        });

        // La frase de la franja crece al cruzarla (scrub)
        gsap.fromTo('.banner-quote',
            { scale: 0.9, opacity: 0.25 },
            {
                scale: 1, opacity: 1, ease: 'none',
                scrollTrigger: { trigger: '.banner', start: 'top 90%', end: 'center center', scrub: 0.5 }
            });
        gsap.fromTo('.banner-author',
            { opacity: 0, y: 18 },
            {
                opacity: 1, y: 0, ease: 'none',
                scrollTrigger: { trigger: '.banner', start: 'top 60%', end: 'center center', scrub: 0.5 }
            });

        // Imágenes "vivas": pan + zoom ligados al scroll (efecto video)
        document.querySelectorAll('.parallax-img').forEach(img => {
            gsap.fromTo(img,
                { yPercent: -6, scale: 1.15 },
                {
                    yPercent: 6, scale: 1.06, ease: 'none',
                    scrollTrigger: {
                        trigger: img.closest('.gallery-item') || img,
                        start: 'top bottom', end: 'bottom top', scrub: 0.6
                    }
                });
        });

        // Franja: el quirófano se desplaza más lento que la página
        const bannerMedia = document.querySelector('.banner-media');
        if (bannerMedia) {
            gsap.fromTo(bannerMedia, { yPercent: -10 }, {
                yPercent: 10, ease: 'none',
                scrollTrigger: { trigger: '.banner', start: 'top bottom', end: 'bottom top', scrub: 0.5 }
            });
        }

        // Tarjeta credencial: entra con leve rotación 3D
        gsap.fromTo('.id-card',
            { rotateY: -10, y: 40, opacity: 0 },
            {
                rotateY: 0, y: 0, opacity: 1, duration: 1, ease: 'power2.out',
                scrollTrigger: { trigger: '.id-card', start: 'top 80%', once: true }
            });
    }
} else {
    // Fallback sin librerías
    const obs = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
