# Areli Tejeda — Ingeniería Biomédica

Sitio de una página con **monitor de signos vitales animado**: señal de EKG
verde y onda de respiración violeta sobre cuadrícula de osciloscopio, que
**avanzan amarradas al scroll** como papel de electrocardiógrafo. Scroll
mantequilla (Lenis + GSAP), reveals cinematográficos y tema oscuro morado.

## Cómo verlo

```bash
python3 -m http.server 8000
# Abre http://localhost:8000
```

O simplemente abre `index.html` con doble clic (todo funciona sin servidor).

## Estructura

```
areli-biomedica/
├── index.html      Página (hero, sobre mí, servicios, método, frase, contacto)
├── styles.css      Estilos (tema laboratorio nocturno morado)
├── script.js       Monitor de signos vitales en canvas + scroll mantequilla
└── libs/           gsap, ScrollTrigger, lenis (locales, sin CDN)
```

## El monitor de signos vitales 💚

Las señales están dibujadas en canvas de forma procedural (sin imágenes ni
videos): un EKG verde con complejo PQRST real (ondas P, QRS y T como suma de
gaussianas), un EKG secundario lila y una onda de respiración violeta, sobre
cuadrícula de osciloscopio. Su avance está amarrado al scroll con inercia —
al deslizar, el trazo corre como papel de electrocardiógrafo. En reposo
avanza lentamente solo.

Puedes ajustarlo en `script.js`:

- **Velocidad con el scroll:** `offTarget = window.scrollY * 0.9`
  (sube el número para que corra más rápido al deslizar)
- **Avance en reposo:** `t * 0.7`
- **Posición de cada señal:** en `draw()` — `H * 0.76` es la altura del EKG
  verde, `H * 0.22` la de la respiración.
- **Colores:** constantes `GREEN`, `VIOLET`, `LILAC` al inicio.

## Datos ya integrados

- **WhatsApp:** 33 2794 9715 · **Correo:** areli.tejeda24@gmail.com
- **LinkedIn:** https://mx.linkedin.com/in/areli-tejeda-492b61229
- **Trayectoria** (del CV): Hospital Real San José Valle Real, Premium
  Systems, Instituto Jalisciense de Cancerología, UdeG CUCEI
- **Fotos reales** en `img/`: Da Vinci, laparoscopía, calibración,
  capacitación, imagenología, piso hospitalario, quirófano (banner) y retrato

## Colores

Todos en `:root` de `styles.css`: `--cyan`, `--violet`, `--green`, `--bg`.

## Publicar gratis

- **GitHub Pages:** sube la carpeta a un repo → Settings → Pages → rama main
- **Netlify:** arrastra la carpeta en https://app.netlify.com/drop
