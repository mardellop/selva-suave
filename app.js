/**
 * BOTÃNICA CLUB â€” SCROLL-DRIVEN STORYTELLING ENGINE
 * Pinned viewport with GSAP-scrubbed master timeline.
 * Text scales, images fly in/out, scenes crossfade â€” all driven by scroll.
 */

// Desactivar la restauraciÃ³n automÃ¡tica de scroll del navegador para empezar siempre arriba al recargar
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Limpiar cualquier hash de ancla al recargar y forzar inicio en (0, 0)
if (window.location.hash) {
  history.replaceState(null, null, window.location.pathname + window.location.search);
}
window.scrollTo(0, 0);

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  initAudio();
  initHeaderScroll();
  initHeaderNav();
  updateWhatsAppStatusTime();
  initPreloader();
});

function updateWhatsAppStatusTime() {
  const statusTimeEl = document.querySelector('.wa-status-time');
  if (statusTimeEl) {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    statusTimeEl.textContent = `${hours}:${minutes} ${ampm}`;
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BACKGROUND AUDIO ENGINE
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
let audioStarted = false;
let audioFadeReq = null;
let userDisabledMusic = false;
let musicAllowedToPlay = false;

const BG_MUSIC_VOLUME = 0.18; // Volumen suave de fondo para no interrumpir al usuario
const BG_MUSIC_FADE_DURATION = 3500; // Entrada suave y gradual de 3.5 segundos

function initAudio() {
  const audio = document.getElementById('bg-music');
  const toggleBtn = document.getElementById('music-toggle');
  if (!audio) return;

  audio.volume = 0;

  // Intentar reproducir mÃºsica inmediatamente al cargar la web
  musicAllowedToPlay = true;
  if (!userDisabledMusic) {
    audio.play().then(() => {
      fadeInAudio(audio, BG_MUSIC_VOLUME, BG_MUSIC_FADE_DURATION);
      updateMusicUI(true);
    }).catch(() => {
      // El navegador bloqueÃ³ el autoplay: se activa con la primera interacciÃ³n del usuario
    });
  }

  // Fallback: desbloquear autoplay en navegadores estrictos (primer gesto del usuario)
  const primeUserGesture = () => {
    if (musicAllowedToPlay && !userDisabledMusic && audio.paused) {
      audio.play().then(() => {
        fadeInAudio(audio, BG_MUSIC_VOLUME, BG_MUSIC_FADE_DURATION);
        updateMusicUI(true);
      }).catch(() => {});
    }
    window.removeEventListener('pointerdown', primeUserGesture);
    window.removeEventListener('touchstart', primeUserGesture);
    window.removeEventListener('keydown', primeUserGesture);
  };
  window.addEventListener('pointerdown', primeUserGesture, { passive: true, once: true });
  window.addEventListener('touchstart', primeUserGesture, { passive: true, once: true });
  window.addEventListener('keydown', primeUserGesture, { passive: true, once: true });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleBackgroundMusic();
    });
  }
}

function updateMusicUI(isPlaying) {
  const toggleBtn = document.getElementById('music-toggle');
  if (!toggleBtn) return;
  const textEl = toggleBtn.querySelector('.music-text');
  if (isPlaying) {
    toggleBtn.classList.add('is-playing');
    toggleBtn.setAttribute('title', 'Desactivar mÃºsica de fondo');
    toggleBtn.setAttribute('aria-pressed', 'true');
    if (textEl) textEl.textContent = 'MÃºsica: On';
  } else {
    toggleBtn.classList.remove('is-playing');
    toggleBtn.setAttribute('title', 'Activar mÃºsica de fondo');
    toggleBtn.setAttribute('aria-pressed', 'false');
    if (textEl) textEl.textContent = 'MÃºsica: Off';
  }
}

function fadeInAudio(audio, targetVolume = BG_MUSIC_VOLUME, duration = BG_MUSIC_FADE_DURATION) {
  if (audioFadeReq) cancelAnimationFrame(audioFadeReq);
  const startTime = performance.now();
  const startVol = audio.volume;

  function step(now) {
    if (audio.paused) return;
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - progress, 2);
    audio.volume = Math.min(1, Math.max(0, startVol + (targetVolume - startVol) * ease));

    if (progress < 1) {
      audioFadeReq = requestAnimationFrame(step);
    } else {
      audioFadeReq = null;
    }
  }
  audioFadeReq = requestAnimationFrame(step);
}

function fadeOutAudio(audio, onComplete, duration = 400) {
  if (audioFadeReq) cancelAnimationFrame(audioFadeReq);
  const startTime = performance.now();
  const startVol = audio.volume;

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    audio.volume = Math.max(0, startVol * (1 - progress));

    if (progress < 1 && !audio.paused) {
      audioFadeReq = requestAnimationFrame(step);
    } else {
      audioFadeReq = null;
      if (onComplete) onComplete();
    }
  }
  audioFadeReq = requestAnimationFrame(step);
}

function playBackgroundMusic() {
  if (userDisabledMusic || !musicAllowedToPlay) return;
  const audio = document.getElementById('bg-music');
  if (!audio) return;
  if (!audio.paused) return; // Ya estÃ¡ sonando fluidamente
  audioStarted = true;

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      fadeInAudio(audio, BG_MUSIC_VOLUME, BG_MUSIC_FADE_DURATION);
      updateMusicUI(true);
    }).catch(() => {
      // PolÃ­tica de Autoplay del navegador: esperar al primer toque o interacciÃ³n
      const triggerPlayback = () => {
        if (userDisabledMusic || !musicAllowedToPlay) return;
        audio.play().then(() => {
          fadeInAudio(audio, BG_MUSIC_VOLUME, BG_MUSIC_FADE_DURATION);
          updateMusicUI(true);
        }).catch(() => {});

        window.removeEventListener('click', triggerPlayback);
        window.removeEventListener('pointerdown', triggerPlayback);
        window.removeEventListener('touchstart', triggerPlayback);
        window.removeEventListener('keydown', triggerPlayback);
        window.removeEventListener('wheel', triggerPlayback);
        window.removeEventListener('scroll', triggerPlayback);
      };

      window.addEventListener('click', triggerPlayback, { once: true });
      window.addEventListener('pointerdown', triggerPlayback, { once: true });
      window.addEventListener('touchstart', triggerPlayback, { once: true });
      window.addEventListener('keydown', triggerPlayback, { once: true });
      window.addEventListener('wheel', triggerPlayback, { once: true, passive: true });
      window.addEventListener('scroll', triggerPlayback, { once: true, passive: true });
    });
  }
}

function toggleBackgroundMusic() {
  const audio = document.getElementById('bg-music');
  if (!audio) return;

  if (audio.paused) {
    userDisabledMusic = false;
    musicAllowedToPlay = true;
    audio.play().then(() => {
      fadeInAudio(audio, BG_MUSIC_VOLUME, 1200);
      updateMusicUI(true);
    }).catch(err => {
      console.warn('Audio playback error:', err);
    });
  } else {
    userDisabledMusic = true;
    fadeOutAudio(audio, () => {
      audio.pause();
      updateMusicUI(false);
    }, 350);
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   HEADER SCROLL BACKGROUND CONTROLLER
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   HEADER NAVIGATION CONTROLLER (SMOOTH SCROLL & SCENE JUMPS)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function initHeaderNav() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const links = header.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Click on logo (# o #top) -> Scroll al inicio
      if (href === '#' || href === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState(null, '', ' ');
        return;
      }

      // 1. "La idea" (#idea o #s5) -> PosiciÃ³n exacta y resting de la Escena 5
      if (href === '#idea' || href === '#s5' || href === '#la-idea') {
        e.preventDefault();
        const stage = document.getElementById('story-stage');
        if (stage) {
          stage.style.opacity = '1';
          stage.style.pointerEvents = 'auto';
        }

        let targetY;
        if (window.storyTimeline && window.storyTimeline.scrollTrigger) {
          const st = window.storyTimeline.scrollTrigger;
          if (typeof st.labelToScroll === 'function') {
            targetY = st.labelToScroll('la_idea');
          } else {
            const labelTime = (window.storyTimeline.labels && window.storyTimeline.labels['la_idea'] !== undefined)
              ? window.storyTimeline.labels['la_idea']
              : (window.storyTimeline.totalDuration() * 0.88);
            const progress = labelTime / window.storyTimeline.totalDuration();
            targetY = st.start + (st.end - st.start) * progress;
          }
        } else {
          const spacer = document.getElementById('scroll-spacer');
          if (spacer) {
            const maxScroll = Math.max(0, spacer.offsetHeight - window.innerHeight);
            targetY = (spacer.offsetTop || 0) + (maxScroll * 0.88);
          }
        }

        if (targetY !== undefined) {
          window.scrollTo({ top: targetY, behavior: 'smooth' });
          history.pushState(null, '', href);
        }
        return;
      }

      // 2. Secciones en post-story: #datos-sector, #razones, #ia, #autoria
      const targetId = href.replace(/^#/, '');
      let targetEl = document.getElementById(targetId);

      // Compatibilidad con alias
      if (!targetEl && (targetId === 'datos-sector' || targetId === 'datos')) {
        targetEl = document.getElementById('post-story');
      }

      if (targetEl) {
        e.preventDefault();
        const headerEl = document.querySelector('.site-header');
        const headerH = headerEl ? headerEl.offsetHeight : 70;
        const targetRect = targetEl.getBoundingClientRect();
        const targetY = targetRect.top + window.pageYOffset - (headerH + 18);

        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: 'smooth'
        });
        history.pushState(null, '', href);
      }
    });
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PRELOADER WITH 3D SEED GERMINATION
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function initPreloader() {
  const el = document.getElementById('preloader');
  const bar = document.getElementById('pre-bar');
  const pct = document.getElementById('pre-pct');
  const brand = document.querySelector('.pre-brand');
  const statusEl = document.getElementById('pre-seed-status');

  if (!el) { 
    boot(); 
    return; 
  }

  // Fade brand in
  gsap.to(brand, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });

  // Initialize 3D Digital Seed
  const seed3D = init3DSeed();

  const statusTexts = [
    { at: 0,  text: 'Preparando la tierra...' },
    { at: 23, text: 'Seleccionando el abono perfecto...' },
    { at: 65, text: 'Empaquetando la caja del mes...' },
    { at: 88, text: 'Â¡Bienvenido a casa!' }
  ];

  // Extended loading duration (+5 seconds, total ~7.8s)
  const TOTAL_DURATION = 7800; // ms
  const startTime = performance.now();
  let completed = false;

  function tick(now) {
    if (completed) return;
    const elapsed = now - startTime;
    const fraction = Math.min(1, elapsed / TOTAL_DURATION);
    const p = fraction * 100;

    if (seed3D) seed3D.setProgress(fraction);

    bar.style.width = p.toFixed(1) + '%';
    pct.textContent = Math.round(p) + '%';

    // Update status text
    if (statusEl) {
      for (let i = statusTexts.length - 1; i >= 0; i--) {
        if (p >= statusTexts[i].at) {
          if (statusEl.textContent !== statusTexts[i].text) {
            statusEl.textContent = statusTexts[i].text;
            if (p >= 96) statusEl.style.color = '#73B839';
          }
          break;
        }
      }
    }

    if (fraction < 1) {
      requestAnimationFrame(tick);
    } else {
      completed = true;
      setTimeout(() => {
        el.classList.add('done');
        setTimeout(() => {
          if (seed3D) seed3D.destroy();
        }, 1200);
        boot();
      }, 600);
    }
  }

  requestAnimationFrame(tick);
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   3D DIGITAL SEED GERMINATION ENGINE (THREE.JS)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function init3DSeed() {
  const container = document.getElementById('seed-canvas-container');
  if (!container || typeof THREE === 'undefined') return null;

  const width = container.clientWidth || 340;
  const height = container.clientHeight || 320;

  const scene = new THREE.Scene();
  // Camera placed at optimal distance (z = 5.4) so the entire plant
  // (seed base to open leaves) fits comfortably without clipping
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
  camera.position.set(0, 0.1, 5.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // Responsive resize handler
  function handleResize() {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w > 0 && h > 0) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
  }
  window.addEventListener('resize', handleResize);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x0E2A1F, 1.4);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.6);
  mainLight.position.set(2.5, 4.5, 3.5);
  scene.add(mainLight);

  const greenPoint = new THREE.PointLight(0x73B839, 2.8, 7);
  greenPoint.position.set(0, 1.2, 1.8);
  scene.add(greenPoint);

  const rimLight = new THREE.DirectionalLight(0xA3E635, 1.1);
  rimLight.position.set(-2.5, -2, -2);
  scene.add(rimLight);

  // Master Floating Group
  const seedMaster = new THREE.Group();
  seedMaster.position.y = -0.25;
  scene.add(seedMaster);

  // 1. Digital Shell (Left & Right halves that split)
  const shellGeo = new THREE.SphereGeometry(0.72, 32, 24, 0, Math.PI);
  // Deform geometry slightly to create natural seed taper towards top
  const posAttr = shellGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const y = posAttr.getY(i);
    const taper = 1.0 - (y * 0.22);
    posAttr.setX(i, posAttr.getX(i) * taper);
    posAttr.setZ(i, posAttr.getZ(i) * taper);
  }
  shellGeo.computeVertexNormals();

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x143A2A,
    roughness: 0.32,
    metalness: 0.3,
    emissive: 0x081E15
  });

  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x73B839,
    wireframe: true,
    transparent: true,
    opacity: 0.22
  });

  // Left Shell Half
  const shellLeft = new THREE.Group();
  shellLeft.add(new THREE.Mesh(shellGeo, shellMat));
  shellLeft.add(new THREE.Mesh(shellGeo, wireMat));
  shellLeft.rotation.y = Math.PI / 2;
  seedMaster.add(shellLeft);

  // Right Shell Half
  const shellRight = new THREE.Group();
  shellRight.add(new THREE.Mesh(shellGeo, shellMat));
  shellRight.add(new THREE.Mesh(shellGeo, wireMat));
  shellRight.rotation.y = -Math.PI / 2;
  seedMaster.add(shellRight);

  // Glowing Core Embryo / Nucleus
  const coreGeo = new THREE.SphereGeometry(0.36, 20, 20);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x56AB2F,
    emissive: 0x2E6B1B,
    roughness: 0.2,
    metalness: 0.15
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.position.y = 0.05;
  seedMaster.add(coreMesh);

  // 2. Emerging Stem (Tallo Germinando)
  const stemHeight = 1.35;
  const stemGeo = new THREE.CylinderGeometry(0.045, 0.075, stemHeight, 16);
  // Shift pivot to bottom of cylinder
  stemGeo.translate(0, stemHeight / 2, 0);

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x73B839,
    emissive: 0x225514,
    roughness: 0.25,
    metalness: 0.12
  });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = 0.1;
  stem.rotation.z = -0.05;
  stem.scale.set(0.001, 0.001, 0.001);
  seedMaster.add(stem);

  // Tip Group at top of stem for leaves
  const tipGroup = new THREE.Group();
  tipGroup.position.set(0, stemHeight, 0);
  stem.add(tipGroup);

  // 3. Emerging Cotyledon Leaves (Hojas que brotan y se abren)
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.bezierCurveTo(0.24, 0.12, 0.36, 0.58, 0, 0.95);
  leafShape.bezierCurveTo(-0.36, 0.58, -0.24, 0.12, 0, 0);

  const leafGeo = new THREE.ShapeGeometry(leafShape, 16);
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x8BE336,
    emissive: 0x2A6B17,
    roughness: 0.3,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  const leafWireMat = new THREE.MeshBasicMaterial({
    color: 0xC4F06A,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
  });

  // Left Leaf
  const leaf1 = new THREE.Group();
  leaf1.add(new THREE.Mesh(leafGeo, leafMat));
  leaf1.add(new THREE.Mesh(leafGeo, leafWireMat));
  leaf1.scale.set(0.001, 0.001, 0.001);
  tipGroup.add(leaf1);

  // Right Leaf
  const leaf2 = new THREE.Group();
  leaf2.add(new THREE.Mesh(leafGeo, leafMat));
  leaf2.add(new THREE.Mesh(leafGeo, leafWireMat));
  leaf2.scale.set(0.001, 0.001, 0.001);
  tipGroup.add(leaf2);

  // Small Apex Bud
  const budGeo = new THREE.SphereGeometry(0.1, 14, 14);
  const budMat = new THREE.MeshStandardMaterial({
    color: 0xC4F06A,
    emissive: 0x4B8F1B,
    roughness: 0.2
  });
  const budMesh = new THREE.Mesh(budGeo, budMat);
  budMesh.position.y = 0.05;
  budMesh.scale.set(0.001, 0.001, 0.001);
  tipGroup.add(budMesh);

  // 4. Bio-digital Swirling Spores / Particles
  const particleCount = 65;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    const radius = 0.9 + Math.random() * 1.3;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    particlePos[i] = radius * Math.cos(phi) * Math.sin(theta);
    particlePos[i + 1] = radius * Math.sin(phi) + 0.3;
    particlePos[i + 2] = radius * Math.cos(phi) * Math.cos(theta);
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x73B839,
    size: 0.055,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Interactive Drag to Rotate
  let isDragging = false;
  let prevMouseX = 0;
  let targetRotY = 0;
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
  });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const delta = e.clientX - prevMouseX;
      targetRotY += delta * 0.012;
      prevMouseX = e.clientX;
    }
  });

  // Touch support for drag
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevMouseX = e.touches[0].clientX;
    }
  }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });
  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      const delta = e.touches[0].clientX - prevMouseX;
      targetRotY += delta * 0.012;
      prevMouseX = e.touches[0].clientX;
    }
  }, { passive: true });

  // Animation State
  let currentProgress = 0;
  let smoothProgress = 0;
  const clock = new THREE.Clock();
  let reqId = null;

  function renderLoop() {
    const elapsed = clock.getElapsedTime();

    // Smooth lerp progress
    smoothProgress += (currentProgress - smoothProgress) * 0.1;
    const p = Math.max(0, Math.min(1, smoothProgress));

    // Master float & spin (dynamically lowers as it grows so visual center stays perfectly aligned)
    const dynamicBaseY = -0.15 - (p * 0.48);
    seedMaster.position.y = dynamicBaseY + Math.sin(elapsed * 2.0) * 0.05;
    seedMaster.rotation.y += 0.012 + (targetRotY - seedMaster.rotation.y) * 0.08;
    seedMaster.rotation.x = Math.sin(elapsed * 1.5) * 0.04;

    // Spore swirl
    particles.rotation.y = elapsed * 0.18;
    particles.rotation.x = Math.sin(elapsed * 0.4) * 0.08;

    // Phase 1: Shell Opening (0% -> 55%)
    if (p < 0.25) {
      const openRatio = p / 0.25;
      shellLeft.rotation.z = -openRatio * 0.12;
      shellRight.rotation.z = openRatio * 0.12;
      shellLeft.position.x = -openRatio * 0.06;
      shellRight.position.x = openRatio * 0.06;
      coreMesh.scale.setScalar(1 + openRatio * 0.2);
    } else {
      const splitProg = Math.min(1, (p - 0.25) / 0.55);
      shellLeft.rotation.z = -0.12 - splitProg * 0.58;
      shellRight.rotation.z = 0.12 + splitProg * 0.58;
      shellLeft.position.x = -0.06 - splitProg * 0.26;
      shellRight.position.x = 0.06 + splitProg * 0.26;
      shellLeft.position.y = -splitProg * 0.16;
      shellRight.position.y = -splitProg * 0.16;
    }

    // Phase 2: Stem Growth (20% -> 85%)
    if (p > 0.18) {
      const stemProg = Math.min(1, (p - 0.18) / 0.65);
      const easeStem = Math.sin((stemProg * Math.PI) / 2);
      stem.scale.set(
        Math.min(1, 0.35 + easeStem * 0.65),
        easeStem,
        Math.min(1, 0.35 + easeStem * 0.65)
      );
      stem.rotation.z = -0.05 + Math.sin(elapsed * 2.5) * 0.025;
    }

    // Phase 3: Leaves Blooming & Unfurling (45% -> 100%)
    if (p > 0.45) {
      const leafProg = Math.min(1, (p - 0.45) / 0.55);
      const leafScale = Math.sin((leafProg * Math.PI) / 2);

      // Left Leaf
      leaf1.scale.set(leafScale * 0.95, leafScale * 0.95, leafScale * 0.95);
      leaf1.rotation.z = -0.1 - leafProg * 0.82;
      leaf1.rotation.x = 0.16 + Math.sin(elapsed * 2.2) * 0.05;
      leaf1.rotation.y = -leafProg * 0.35;

      // Right Leaf
      leaf2.scale.set(leafScale * 0.95, leafScale * 0.95, leafScale * 0.95);
      leaf2.rotation.z = 0.1 + leafProg * 0.82;
      leaf2.rotation.x = -0.16 + Math.sin(elapsed * 2.2 + 1) * 0.05;
      leaf2.rotation.y = leafProg * 0.35;

      // Apex Bud
      if (p > 0.72) {
        const budProg = (p - 0.72) / 0.28;
        budMesh.scale.setScalar(budProg * 1.1);
      }
    }

    // Light pulse towards completion
    if (p > 0.88) {
      greenPoint.intensity = 2.8 + Math.sin(elapsed * 7) * 1.2;
      particleMat.opacity = 0.9;
    }

    renderer.render(scene, camera);
    reqId = requestAnimationFrame(renderLoop);
  }

  reqId = requestAnimationFrame(renderLoop);

  return {
    setProgress: (val) => { currentProgress = val; },
    destroy: () => {
      if (reqId) cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      try {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      } catch (e) {}
    }
  };
}

let scene1EntrancePlayed = false;

function playScene1Entrance() {
  if (scene1EntrancePlayed) return;
  scene1EntrancePlayed = true;

  const s1 = '#s1';
  gsap.set(s1, { opacity: 1 });

  const entranceTl = gsap.timeline({
    defaults: { ease: 'power3.out' }
  });

  entranceTl
    // Texto entra con suave escala y fundido
    .fromTo(`${s1} .st`,
      { opacity: 0, scale: 0.8, y: 35 },
      { opacity: 1, scale: 1, y: 0, duration: 1.2 }
    )
    // Imagen izquierda vuela desde el lateral
    .fromTo(`${s1} .si1`,
      { opacity: 0, x: '-110%', rotation: -8 },
      { opacity: 1, x: '0%', rotation: 0, duration: 1.4 },
      '<0.15'
    )
    // Imagen derecha vuela desde el lateral
    .fromTo(`${s1} .si2`,
      { opacity: 0, x: '110%', rotation: 6 },
      { opacity: 1, x: '0%', rotation: 0, duration: 1.4 },
      '<0.1'
    )
    // Indicador sutil de scroll para avisar al usuario
    .fromTo('#scene1-scroll-hint',
      { opacity: 0, y: 15 },
      { opacity: 0.85, y: 0, duration: 0.8 },
      '-=0.4'
    );

  const onFirstScroll = () => {
    if (entranceTl && entranceTl.isActive()) {
      entranceTl.progress(1);
    }
    window.removeEventListener('scroll', onFirstScroll);
  };
  window.addEventListener('scroll', onFirstScroll, { passive: true });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BOOT â€” Register GSAP, build storytelling timeline
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function boot() {
  gsap.registerPlugin(ScrollTrigger);
  if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.clearScrollMemory) {
    ScrollTrigger.clearScrollMemory('manual');
  }
  window.scrollTo(0, 0);
  buildStoryTimeline();
  initPostStoryReveals();
  initWhatsApp();
  initCalc();
  initIACards();
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
  playScene1Entrance();
  // Espera un tick para que ScrollTrigger calcule bien los offsets antes de iniciar el autoscroll
  requestAnimationFrame(() => requestAnimationFrame(() => initSceneAutoScroll()));
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   AUTO-SCROLL POR ESCENAS â€” navega automÃ¡ticamente de
   una escena a la siguiente al detectar cualquier gesto
   de scroll, y se detiene cuando el texto/imagen reposa.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function initSceneAutoScroll() {
  const spacer     = document.getElementById('scroll-spacer');
  const postStory  = document.getElementById('post-story');
  if (!spacer || !postStory) return;

  const tl = window.storyTimeline;
  if (!tl || !tl.scrollTrigger) return;

  const st = tl.scrollTrigger;

  /* â”€â”€ Calcula el offset de scroll que corresponde a cada label â”€â”€ */
  function labelToScrollY(labelName) {
    const labelTime = tl.labels[labelName];
    if (labelTime === undefined) return null;
    const progress  = labelTime / tl.totalDuration();
    return st.start + (st.end - st.start) * progress;
  }

  // Los 5 puntos de reposo + el inicio del post-story
  const sceneScrollY = [
    0,                              // Scene 1 (top of page)
    labelToScrollY('scene_2'),      // Scene 2 resting
    labelToScrollY('scene_3'),      // Scene 3 resting
    labelToScrollY('scene_4'),      // Scene 4 resting
    labelToScrollY('scene_5'),      // Scene 5 resting (la_idea)
  ].map(v => v === null ? 0 : Math.round(v));

  const SCENE_COUNT        = sceneScrollY.length;   // 5
  const POST_STORY_TOP     = () => postStory.getBoundingClientRect().top + window.pageYOffset;
  const POST_STORY_GUARD   = 80;   // px desde la cima del post-story donde aÃºn captamos scroll-up

  let currentScene         = 0;
  let isTransitioning      = false;
  let transitionTween      = null;

  /* â”€â”€ Sincroniza currentScene con la posiciÃ³n real de scroll â”€â”€ */
  function syncCurrentScene() {
    const y = window.pageYOffset;
    let idx = 0;
    for (let i = 0; i < SCENE_COUNT; i++) {
      if (y >= sceneScrollY[i] - 30) idx = i;
    }
    currentScene = idx;
  }

  /* â”€â”€ Anima el scroll hasta el offset objetivo y llama onDone â”€â”€ */
  function scrollToY(targetY, onDone) {
    if (transitionTween) { transitionTween.kill(); }
    const obj = { y: window.pageYOffset };
    transitionTween = gsap.to(obj, {
      y: targetY,
      duration: 3.8,
      ease: 'power3.out',
      onUpdate: () => window.scrollTo(0, obj.y),
      onComplete: () => {
        isTransitioning = false;
        transitionTween = null;
        if (onDone) onDone();
      },
      onInterrupt: () => {
        isTransitioning = false;
        transitionTween = null;
      }
    });
  }

  /* â”€â”€ TransiciÃ³n a escena N (0-4) â”€â”€ */
  function goToScene(idx) {
    idx = Math.max(0, Math.min(SCENE_COUNT - 1, idx));
    if (isTransitioning) return;
    isTransitioning = true;
    currentScene = idx;
    scrollToY(sceneScrollY[idx], () => syncCurrentScene());
  }

  /* â”€â”€ TransiciÃ³n al inicio del post-story â”€â”€ */
  function goToPostStory() {
    if (isTransitioning) return;
    isTransitioning = true;
    scrollToY(POST_STORY_TOP() - 10, () => { isTransitioning = false; });
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // WHEEL
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  window.addEventListener('wheel', (e) => {
    const y          = window.pageYOffset;
    const postTop    = POST_STORY_TOP();
    const inStory    = y < postTop - POST_STORY_GUARD;
    const atPostTop  = !inStory && y <= postTop + POST_STORY_GUARD;
    const delta      = e.deltaY;

    // Dentro de la zona del storytelling
    if (inStory) {
      e.preventDefault();
      if (Math.abs(delta) < 0) return;   // filtra microgesto
      if (isTransitioning) return;

      syncCurrentScene();

      if (delta > 0) {
        // scroll hacia abajo
        if (currentScene < SCENE_COUNT - 1) {
          goToScene(currentScene + 1);
        } else {
          // Ãšltima escena: va al post-story
          goToPostStory();
        }
      } else {
        // scroll hacia arriba
        if (currentScene > 0) {
          goToScene(currentScene - 1);
        }
        // Si ya estamos en scene 0, no hacemos nada (tope superior)
      }
      return;
    }

    // En el borde superior del post-story y scrolleando hacia arriba: vuelve a escena 5
    if (atPostTop && delta < 0) {
      e.preventDefault();
      if (!isTransitioning) {
        currentScene = SCENE_COUNT - 1;
        scrollToY(sceneScrollY[SCENE_COUNT - 1], () => syncCurrentScene());
      }
    }
    // MÃ¡s abajo en post-story: scroll nativo, sin interceptar
  }, { passive: false });

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // TOUCH SWIPE
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 40;

  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const y       = window.pageYOffset;
    const postTop = POST_STORY_TOP();
    if (y >= postTop + POST_STORY_GUARD) return;   // post-story nativo

    const deltaY = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) < SWIPE_THRESHOLD) return;

    const inStory   = y < postTop - POST_STORY_GUARD;
    const atPostTop = !inStory && y <= postTop + POST_STORY_GUARD;

    syncCurrentScene();

    if (inStory) {
      e.preventDefault();
      if (isTransitioning) return;
      if (deltaY > 0) {
        if (currentScene < SCENE_COUNT - 1) goToScene(currentScene + 1);
        else goToPostStory();
      } else {
        if (currentScene > 0) goToScene(currentScene - 1);
      }
    } else if (atPostTop && deltaY < 0) {
      e.preventDefault();
      if (!isTransitioning) {
        currentScene = SCENE_COUNT - 1;
        scrollToY(sceneScrollY[SCENE_COUNT - 1], () => syncCurrentScene());
      }
    }
  }, { passive: false });

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // TECLADO (flechas, espacio, re/avpag)
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  window.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    const y       = window.pageYOffset;
    const postTop = POST_STORY_TOP();
    if (y >= postTop + POST_STORY_GUARD) return;   // post-story: teclado nativo

    const DOWN_KEYS = ['ArrowDown', 'PageDown', ' '];
    const UP_KEYS   = ['ArrowUp',  'PageUp'];

    if (DOWN_KEYS.includes(e.key)) {
      e.preventDefault();
      if (isTransitioning) return;
      syncCurrentScene();
      if (currentScene < SCENE_COUNT - 1) goToScene(currentScene + 1);
      else goToPostStory();
    } else if (UP_KEYS.includes(e.key)) {
      const inStory   = y < postTop - POST_STORY_GUARD;
      const atPostTop = !inStory && y <= postTop + POST_STORY_GUARD;
      if (!inStory && !atPostTop) return;
      e.preventDefault();
      if (isTransitioning) return;
      syncCurrentScene();
      if (inStory && currentScene > 0) goToScene(currentScene - 1);
      else if (atPostTop) {
        currentScene = SCENE_COUNT - 1;
        scrollToY(sceneScrollY[SCENE_COUNT - 1], () => syncCurrentScene());
      }
    }
  });

  // Sincroniza el Ã­ndice si el usuario llega desde el header nav o skipBtn
  window.addEventListener('scroll', () => {
    if (!isTransitioning) syncCurrentScene();
  }, { passive: true });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STORYTELLING TIMELINE â€” The Heart of the Experience
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

   Each "scene" is a sequence of GSAP tweens on a master
   timeline that is scrubbed by scroll position.
   The stage is position:fixed so only the timeline moves.

   Pattern per scene:
   1. Fade in text at normal size + images fly in from edges
   2. Text scales up massively while images drift/rotate
   3. Everything fades/flies out â†’ next scene begins
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildStoryTimeline() {
  const stage = document.getElementById('story-stage');
  const spacer = document.getElementById('scroll-spacer');
  const skipBtn = document.getElementById('skip-btn');

  if (!stage || !spacer) return;

  // Each scene = ~3 "screens" worth of scroll (3 * 100vh)
  const sceneCount = 5;
  const scrollPerScene = 3;
  const totalScrollScreens = sceneCount * scrollPerScene;
  spacer.style.height = (totalScrollScreens * 100) + 'vh';

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: spacer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0,
      onUpdate: (self) => {
        // Hide skip button once story ends
        if (self.progress > 0.95 && skipBtn) skipBtn.classList.add('hidden');
      },
      onLeave: () => {
        // Hide the stage when we pass into post-story content
        stage.style.opacity = '0';
        stage.style.pointerEvents = 'none';
      },
      onEnterBack: () => {
        stage.style.opacity = '1';
        stage.style.pointerEvents = 'auto';
      }
    }
  });

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     SCENE 1: "DESCUBRE TU KIT BOTÃNICO..."
     â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const s1 = '#s1';
  tl
    .addLabel('scene_1')
    // Estado inicial en reposo cuando el scroll estÃ¡ arriba
    .set(s1, { opacity: 1 })
    .set(`${s1} .st`, { opacity: 1, scale: 1, y: 0 })
    .set(`${s1} .si1`, { opacity: 1, x: '0%', y: '0%', rotation: 0 })
    .set(`${s1} .si2`, { opacity: 1, x: '0%', y: '0%', rotation: 0 })
    .set('#scene1-scroll-hint', { opacity: 0.85, y: 0 })
    // Pausa breve para que el usuario empiece a hacer scroll a su propio ritmo
    .to({}, { duration: 1.5 })
    // Al deslizar, se desvanece el hint de scroll
    .to('#scene1-scroll-hint', { opacity: 0, y: -20, duration: 0.8 }, '<')
    // Text scales up MASSIVELY while images drift
    .to(`${s1} .st`, { scale: 5, opacity: 0.15, duration: 4, ease: 'power1.in' })
    .to(`${s1} .si1`, { x: '-40%', scale: 1.3, rotation: -12, duration: 4, ease: 'power1.in' }, '<')
    .to(`${s1} .si2`, { x: '50%', scale: 1.4, y: '-20%', rotation: 8, duration: 4, ease: 'power1.in' }, '<')
    // Fade out everything
    .to(s1, { opacity: 0, duration: 1.5 });

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     SCENE 2: "ENTRA EN EL MUNDO DE LAS PLANTAS..."
     â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const s2 = '#s2';
  tl
    .set(s2, { opacity: 1 })
    .fromTo(`${s2} .st`, { opacity: 0, scale: 0.5, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: 2.5, ease: 'power2.out' })
    .fromTo(`${s2} .si1`, { x: '-100%', y: '30%', opacity: 0, rotation: -10, scale: 0.8 },
      { x: '0%', y: '0%', opacity: 1, rotation: -3, scale: 1, duration: 3, ease: 'power3.out' }, '<0.4')
    .fromTo(`${s2} .si2`, { x: '100%', y: '-20%', opacity: 0, rotation: 6, scale: 0.7 },
      { x: '0%', y: '0%', opacity: 1, rotation: 2, scale: 1, duration: 3, ease: 'power3.out' }, '<0.3')
    .addLabel('scene_2')
    .to({}, { duration: 1.5 })
    .to(`${s2} .st`, { scale: 6, opacity: 0.1, duration: 4, ease: 'power1.in' })
    .to(`${s2} .si1`, { x: '-60%', y: '40%', scale: 1.5, rotation: -15, duration: 4, ease: 'power1.in' }, '<')
    .to(`${s2} .si2`, { x: '60%', y: '-30%', scale: 1.6, rotation: 12, duration: 4, ease: 'power1.in' }, '<')
    .to(s2, { opacity: 0, duration: 1.5 });

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     SCENE 3: "CADA MES. SIN ESFUERZO."
     â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const s3 = '#s3';
  tl
    .set(s3, { opacity: 1 })
    .fromTo(`${s3} .st`, { opacity: 0, y: 80, scale: 0.7 },
      { opacity: 1, y: 0, scale: 1, duration: 2.5, ease: 'power3.out' })
    .fromTo(`${s3} .ss`, { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 2, ease: 'power2.out' }, '-=1.5')
    .fromTo(`${s3} .si1`, { y: '100%', opacity: 0, scale: 0.6 },
      { y: '0%', opacity: 1, scale: 1, duration: 3, ease: 'power3.out' }, '<0.2')
    .fromTo(`${s3} .si2`, { x: '100%', y: '50%', opacity: 0, rotation: 10 },
      { x: '0%', y: '0%', opacity: 1, rotation: 3, duration: 3, ease: 'power3.out' }, '<0.4')
    .addLabel('scene_3')
    .to({}, { duration: 1.5 })
    .to(`${s3} .st`, { scale: 4.5, y: -100, opacity: 0.12, duration: 4, ease: 'power1.in' })
    .to(`${s3} .ss`, { opacity: 0, y: -50, duration: 2 }, '<')
    .to(`${s3} .si1`, { y: '-60%', scale: 1.4, duration: 4, ease: 'power1.in' }, '<')
    .to(`${s3} .si2`, { x: '50%', y: '-40%', scale: 1.5, rotation: 15, duration: 4 }, '<')
    .to(s3, { opacity: 0, duration: 1.5 });

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     SCENE 4: "24,90 â‚¬ AL MES" (Price reveal)
     â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const s4 = '#s4';
  tl
    .set(s4, { opacity: 1 })
    .fromTo(`${s4} .st`, { opacity: 0, scale: 0.3 },
      { opacity: 1, scale: 1, duration: 3, ease: 'back.out(1.4)' })
    .fromTo(`${s4} .ss`, { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 2, ease: 'power2.out' }, '-=1.5')
    .fromTo(`${s4} .si1`, { x: '-80%', y: '20%', opacity: 0, rotation: -5 },
      { x: '0%', y: '0%', opacity: 1, rotation: 0, duration: 3, ease: 'power3.out' }, '<0.3')
    .addLabel('scene_4')
    .to({}, { duration: 1.5 })
    .to(`${s4} .st`, { scale: 3, opacity: 0.15, duration: 3.5, ease: 'power1.in' })
    .to(`${s4} .ss`, { opacity: 0, y: -40, duration: 2 }, '<')
    .to(`${s4} .si1`, { x: '-50%', scale: 1.3, rotation: -8, duration: 3.5 }, '<')
    .to(s4, { opacity: 0, duration: 1.5 });

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     SCENE 5: "COMIENZA TU JUNGLA URBANA" (Final)
     â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const s5 = '#s5';
  tl
    .set(s5, { opacity: 1 })
    .fromTo(`${s5} .st`, { opacity: 0, scale: 0.4 },
      { opacity: 1, scale: 1, duration: 3, ease: 'power3.out' })
    .fromTo(`${s5} .si1`, { scale: 0.5, opacity: 0, rotation: 10 },
      { scale: 1, opacity: 1, rotation: 0, duration: 3, ease: 'power3.out' }, '<0.5')
    .fromTo(`${s5} .si2`, { x: '-80%', opacity: 0 },
      { x: '0%', opacity: 1, duration: 3, ease: 'power3.out' }, '<0.3')
    .fromTo(`${s5} .ss`, { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 2 }, '-=1.5')
    .addLabel('scene_5')
    .addLabel('la_idea')
    .to({}, { duration: 2.5 })
    // Final zoom out â€” everything shrinks into distance
    .to(`${s5} .st`, { scale: 0.3, opacity: 0, duration: 3, ease: 'power2.in' })
    .to(`${s5} .si1`, { scale: 0.4, opacity: 0, duration: 3 }, '<')
    .to(`${s5} .si2`, { scale: 0.4, opacity: 0, duration: 3 }, '<')
    .to(`${s5} .ss`, { opacity: 0, duration: 2 }, '<')
    .to(s5, { opacity: 0, duration: 1 });

  window.storyTimeline = tl;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   POST-STORY REVEAL ANIMATIONS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function initPostStoryReveals() {
  gsap.utils.toArray('.rv').forEach(el => {
    gsap.to(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
    });
  });

  // Animated counters
  gsap.utils.toArray('[data-count-to]').forEach(el => {
    const target = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.countSuffix || '';
    const prefix = el.dataset.countPrefix || '';
    const decimals = parseInt(el.dataset.countDecimals || '0', 10);
    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el, start: 'top 88%',
      onEnter: () => {
        gsap.to(obj, {
          val: target, duration: 2, ease: 'power2.out',
          onUpdate: () => { el.textContent = prefix + obj.val.toFixed(decimals).replace('.', ',') + suffix; }
        });
      }, once: true,
    });
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   WHATSAPP INTERACTIVE BOT ENGINE (SELBOT / VÃ‰RTICA)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function initWhatsApp() {
  const body = document.getElementById('wa-body');
  const resetBtn = document.getElementById('wa-reset-btn');
  const sendBtn = document.getElementById('wa-send-btn');
  const inputField = document.getElementById('wa-input-field');
  if (!body) return;

  const getTimeStr = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const updateStatusBarTime = () => {
    const statusTimeEl = document.querySelector('.wa-status-time');
    if (statusTimeEl) {
      statusTimeEl.textContent = getTimeStr();
    }
  };
  updateStatusBarTime();
  setInterval(updateStatusBarTime, 15000);

  const checkIconSvg = `
    <span class="wa-meta-checks">
      <svg width="15" height="11" viewBox="0 0 16 11" fill="none">
        <path d="M11.05.5a.62.62 0 0 0-.44.18L4.69 6.6 2.39 4.3a.62.62 0 1 0-.88.88l2.74 2.74c.24.24.64.24.88 0l6.36-6.36A.62.62 0 0 0 11.05.5z" fill="#53bdeb"/>
        <path d="M14.55.5a.62.62 0 0 0-.44.18L8.19 6.6l-.88-.88a.62.62 0 1 0-.88.88l1.32 1.32c.24.24.64.24.88 0l6.36-6.36A.62.62 0 0 0 14.55.5z" fill="#53bdeb"/>
      </svg>
    </span>
  `;

  function appendUserMessage(text) {
    const el = document.createElement('div');
    el.className = 'wa-msg wa-msg-out';
    el.innerHTML = `
      <div class="wa-msg-content">${text}</div>
      <div class="wa-meta">${getTimeStr()} ${checkIconSvg}</div>
    `;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function appendBotMessage(htmlContent) {
    const el = document.createElement('div');
    el.className = 'wa-msg wa-msg-in';
    el.innerHTML = `
      <span class="wa-sender">Selbot:</span>
      <div class="wa-msg-content">${htmlContent}</div>
    `;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function showTypingIndicator(duration = 600) {
    return new Promise(resolve => {
      const typingEl = document.createElement('div');
      typingEl.className = 'wa-typing';
      typingEl.innerHTML = `
        <span class="wa-dot"></span>
        <span class="wa-dot"></span>
        <span class="wa-dot"></span>
      `;
      body.appendChild(typingEl);
      body.scrollTop = body.scrollHeight;

      setTimeout(() => {
        if (typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
        resolve();
      }, duration);
    });
  }

  // Predefined questions
  const defaultQuestions = [
    { id: 'monstera', label: 'ðŸŒ¿ Mi Monstera tiene manchas amarillas', query: 'Mi Monstera tiene manchas amarillas. Â¿QuÃ© puede ser?' },
    { id: 'riego', label: 'ðŸ’§ Â¿Cada cuÃ¡nto debo regar mis plantas?', query: 'Â¿Cada cuÃ¡nto debo regar mis plantas de interior?' },
    { id: 'kit', label: 'ðŸ“¦ Â¿CÃ³mo usar el abono?', query: 'Â¿CÃ³mo usar el abono?' },
    { id: 'plaga', label: 'ðŸ¦Ÿ Hay bichos blancos en las hojas', query: 'Hay bichos blancos en las hojas de mi planta' },
    { id: 'otros', label: 'âœ¨ Otros / Hablar con un asesor', query: 'Quiero consultar sobre otro tema' }
  ];

  // 1. Initial Greeting with Question Options
  async function renderGreeting() {
    body.innerHTML = '';
    await showTypingIndicator(500);

    let pillsHtml = '<div class="wa-options-wrap" id="wa-preset-options">';
    defaultQuestions.forEach(q => {
      pillsHtml += `<button type="button" class="wa-btn-pill pill-stacked" data-qid="${q.id}">${q.label}</button>`;
    });
    pillsHtml += '</div>';

    const greetingText = `
      Â¡Hola! Soy <strong>Selbot</strong>, tu asistente de cuidado botÃ¡nico de Selva Suave ðŸŒ±âœ¨<br>
      Â¿En quÃ© te puedo ayudar hoy? Elige una consulta frecuente o <em>escribe tu duda</em> abajo:
      <div class="wa-meta">${getTimeStr()}</div>
      ${pillsHtml}
    `;
    appendBotMessage(greetingText);

    const presetWrap = document.getElementById('wa-preset-options');
    if (!presetWrap) return;

    presetWrap.querySelectorAll('.wa-btn-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = btn.dataset.qid;
        const qObj = defaultQuestions.find(item => item.id === qid);
        if (!qObj) return;
        presetWrap.querySelectorAll('.wa-btn-pill').forEach(b => b.disabled = true);
        btn.classList.add('selected');
        handleUserQuery(qObj.query, qid);
      });
    });
  }

  // Process user input (from clicking preset or typing)
  async function handleUserQuery(text, forcedCategory = null) {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();

    // Disable any active option buttons in chat
    body.querySelectorAll('.wa-btn-pill').forEach(b => b.disabled = true);

    appendUserMessage(cleanText);
    if (inputField) inputField.value = '';

    await showTypingIndicator(750);

    const lower = cleanText.toLowerCase();

    // 1. Saludos tÃ­picos (Hola, buenos dÃ­as, etc.)
    if (/^(hola|buen(as|os)?\s*(d[iÃ­]as|tardes|noches)?|qu[eÃ©]\s*tal|c[oÃ³]mo\s*est[aÃ¡]s|hey|buenas)$/i.test(lower.trim()) ||
        (lower.startsWith('hola') && lower.length < 15)) {
      appendBotMessage(`
        Â¡Hola! ðŸ‘‹ QuÃ© alegrÃ­a saludarte. Soy <strong>Selbot</strong>, tu asistente de cuidado vegetal.<br><br>
        Â¿CÃ³mo estÃ¡n tus plantas hoy? CuÃ©ntame quÃ© notas o selecciona una duda para empezar:
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-hello-options">
          <button type="button" class="wa-btn-pill" data-expert="menu">Ver preguntas frecuentes</button>
          <button type="button" class="wa-btn-pill" data-expert="yes">Hablar con un asesor</button>
        </div>
      `);
      bindPostHelpOptions('wa-hello-options');
      return;
    }

    // 2. Agradecimientos (Gracias, muchas gracias, etc.)
    if (/^(gracias|muchas\s*gracias|mil\s*gracias|te\s*lo\s*agradezco|perfecto\s*gracias|vale\s*gracias)$/i.test(lower.trim()) ||
        lower.includes('gracias')) {
      appendBotMessage(`
        Â¡De nada! ðŸŒ¿ðŸ’š Para eso estamos en Selva Suave: para que cuidar tus plantas sea fÃ¡cil, relajante y sin complicaciones.<br><br>
        Si surge cualquier otra duda, Â¡aquÃ­ me tienes siempre disponible!
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-thanks-options">
          <button type="button" class="wa-btn-pill" data-expert="menu">Hacer otra consulta</button>
        </div>
      `);
      bindPostHelpOptions('wa-thanks-options');
      return;
    }

    // 3. Despedidas (AdiÃ³s, hasta luego, chao, etc.)
    if (/^(adi[oÃ³]s|hasta\s*luego|hasta\s*pronto|chao|chau|nos\s*vemos|bye|hasta\s*maÃ±ana)$/i.test(lower.trim()) ||
        lower.includes('adios') || lower.includes('adiÃ³s') || lower.includes('hasta luego')) {
      appendBotMessage(`
        Â¡Hasta pronto! Que tengas un dÃ­a genial y que tus plantas sigan creciendo felices y llenas de vida ðŸª´âœ¨<br>
        Â¡Vuelve cuando quieras!
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-bye-options">
          <button type="button" class="wa-btn-pill" data-expert="menu">ðŸ”„ Reiniciar chat</button>
        </div>
      `);
      bindPostHelpOptions('wa-bye-options');
      return;
    }

    // 4. OpciÃ³n 'Otros' / Consulta libre sobre suscripciÃ³n, envÃ­os, etc.
    if (forcedCategory === 'otros' || lower === 'otros' || lower.includes('otro tema') || lower.includes('asesor') || lower.includes('precio') || lower.includes('suscripci') || lower.includes('envio') || lower.includes('envÃ­o')) {
      appendBotMessage(`
        Â¡Por supuesto! En <strong>Selva Suave</strong> te ayudamos con cualquier tema:<br>
        â€¢ ðŸŒ¿ <strong>DiagnÃ³stico botÃ¡nico personalizado</strong> con fotos.<br>
        â€¢ ðŸ“¦ <strong>Estado de envÃ­os y suscripciÃ³n mensual</strong> (24,90 â‚¬/mes).<br>
        â€¢ ðŸª´ <strong>RecomendaciÃ³n de plantas</strong> para la luz de tu casa.<br><br>
        Â¿Te gustarÃ­a que te comunique directamente con un especialista botÃ¡nico humano de nuestro equipo?
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-others-options">
          <button type="button" class="wa-btn-pill" data-expert="yes">ðŸ‘¤ SÃ­, hablar con un humano</button>
          <button type="button" class="wa-btn-pill" data-expert="menu">ðŸŒ¿ Ver dudas frecuentes</button>
        </div>
      `);
      bindPostHelpOptions('wa-others-options');
      return;
    }

    if (forcedCategory === 'monstera' || lower.includes('monstera') || lower.includes('amarill')) {
      // Flow 1: Monstera yellow leaves & diagnosis tree
      const botText = `
        Â¡Entendido! Para diagnosticar tu Monstera, por favor confirma:<br>
        Â¿Tiene puntos negros en el envÃ©s de la hoja o filamentos finos?
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-monstera-options">
          <button type="button" class="wa-btn-pill" data-choice="A">A. Puntos negros</button>
          <button type="button" class="wa-btn-pill" data-choice="B">B. Filamentos/telaraÃ±as</button>
          <button type="button" class="wa-btn-pill" data-choice="C">C. Ninguno</button>
        </div>
      `;
      appendBotMessage(botText);

      const monWrap = document.getElementById('wa-monstera-options');
      if (monWrap) {
        monWrap.querySelectorAll('.wa-btn-pill').forEach(btn => {
          btn.addEventListener('click', async () => {
            const choice = btn.dataset.choice;
            btn.classList.add('selected');
            monWrap.querySelectorAll('.wa-btn-pill').forEach(b => b.disabled = true);
            appendUserMessage(`<strong>${choice}</strong>`);
            await showTypingIndicator(800);
            renderMonsteraDiagnosis(choice);
          });
        });
      }
    } else if (forcedCategory === 'plaga' || lower.includes('bicho') || lower.includes('plaga') || lower.includes('cochinilla') || lower.includes('araÃ±a')) {
      // Flow 2: Bugs / Pests
      appendBotMessage(`
        Los bichitos blancos suelen ser <strong>cochinilla algodonosa</strong> o trips en fase ninfa.
        <div class="wa-media-row">
          <div class="wa-media-text">
            AÃ­sla la planta, retÃ­ralos con el pincel del kit impregnado en alcohol suave y pulveriza la soluciÃ³n fitosanitaria natural incluida este mes. Consulta aquÃ­ la guÃ­a: <span class="wa-link">[Ver GuÃ­a Antiplagas]</span>.
          </div>
          <div class="wa-media-thumb">
            <img src="hoja-plaga.jpg" alt="Plaga en hoja" />
          </div>
        </div>
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-plaga-options">
          <button type="button" class="wa-btn-pill" data-expert="yes">Hablar con Experto Humano</button>
          <button type="button" class="wa-btn-pill" data-expert="menu">Ver mÃ¡s preguntas</button>
        </div>
      `);
      bindPostHelpOptions('wa-plaga-options');
    } else if (forcedCategory === 'riego' || lower.includes('riego') || lower.includes('regar') || lower.includes('agua') || lower.includes('humedad')) {
      // Flow 3: Watering Advice
      appendBotMessage(`
        ðŸ’§ <strong>Regla de oro de Selva Suave:</strong> No riegues por calendario fijo, riega segÃºn la humedad del sustrato.
        <br><br>
        Introduce el dedo 2-3 cm en la tierra. Si sale seco, aplica agua reposada y dosifica con la pipeta de nutriciÃ³n de tu kit. Si notas humedad, Â¡espera 3 o 4 dÃ­as mÃ¡s!
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-riego-options">
          <button type="button" class="wa-btn-pill" data-expert="yes">Consultar a un BotÃ¡nico</button>
          <button type="button" class="wa-btn-pill" data-expert="menu">MenÃº principal</button>
        </div>
      `);
      bindPostHelpOptions('wa-riego-options');
    } else if (forcedCategory === 'kit' || lower.includes('kit') || lower.includes('abono') || lower.includes('caja') || lower.includes('sustrato')) {
      // Flow 4: Kit contents & care
      appendBotMessage(`
        ðŸ“¦ Tu caja mensual de Selva Suave contiene:<br>
        â€¢ ðŸ’§ <strong>NutriciÃ³n lÃ­quida:</strong> Dosis justa segÃºn la estaciÃ³n del aÃ±o.<br>
        â€¢ ðŸª´ <strong>Enmienda y sustrato:</strong> Formato compacto sin sacos gigantes.<br>
        â€¢ âœ‚ï¸ <strong>Herramienta de autor:</strong> Para poda o trasplante.<br>
        â€¢ ðŸ“± <strong>Acceso a Doctor Planta</strong> para resolver cualquier duda botÃ¡nica.
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-kit-options">
          <button type="button" class="wa-btn-pill" data-expert="yes">Conectar con un asesor</button>
          <button type="button" class="wa-btn-pill" data-expert="menu">Hacer otra consulta</button>
        </div>
      `);
      bindPostHelpOptions('wa-kit-options');
    } else {
      // General NLP fallback with intelligent assistance
      appendBotMessage(`
        He analizado tu consulta sobre "<em>${cleanText}</em>". Para darte un diagnÃ³stico 100% exacto segÃºn la especie de tu planta y las condiciones de luz de tu casa, Â¿te gustarÃ­a que te conecte con nuestro equipo botÃ¡nico humano?
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-general-options">
          <button type="button" class="wa-btn-pill" data-expert="yes">SÃ­, conectar con Experto</button>
          <button type="button" class="wa-btn-pill" data-expert="menu">Ver preguntas frecuentes</button>
        </div>
      `);
      bindPostHelpOptions('wa-general-options');
    }
  }

  // Render Monstera diagnosis with leaf picture
  async function renderMonsteraDiagnosis(choice) {
    let diagnosisIntro = 'Entendido. Esto parece una infestaciÃ³n de araÃ±a roja, una plaga comÃºn.';
    if (choice === 'A') {
      diagnosisIntro = 'Entendido. Los puntos negros sugieren trips o cochinilla en fase activa.';
    } else if (choice === 'C') {
      diagnosisIntro = 'Entendido. Al no haber telaraÃ±as ni puntos, es probable que se trate de clorosis o exceso de riego.';
    }

    const botDiagnosisHtml = `
      ${diagnosisIntro}
      <div class="wa-media-row">
        <div class="wa-media-text">
          He filtrado tu caso y parece un diagnÃ³stico claro. Revisa nuestra guÃ­a de tratamiento y el producto anti-plagas de tu kit aquÃ­: <span class="wa-link">[Enlace]</span>.
        </div>
        <div class="wa-media-thumb">
          <img src="hoja-plaga.jpg" alt="Hoja de monstera afectada" />
        </div>
      </div>
      <div class="wa-meta">${getTimeStr()}</div>
    `;
    appendBotMessage(botDiagnosisHtml);

    await showTypingIndicator(800);

    const botEscalationHtml = `
      Como es una plaga persistente, Â¿te gustarÃ­a que te conecte con un Experto Humano para un mayor diagnÃ³stico y plan personalizado?
      <div class="wa-meta">${getTimeStr()}</div>
      <div class="wa-options-wrap" id="wa-step2-options">
        <button type="button" class="wa-btn-pill" data-choice="yes">SÃ­, conectar</button>
        <button type="button" class="wa-btn-pill" data-choice="no">No, sigo la guÃ­a</button>
      </div>
    `;
    appendBotMessage(botEscalationHtml);

    const step2Wrap = document.getElementById('wa-step2-options');
    if (!step2Wrap) return;

    step2Wrap.querySelectorAll('.wa-btn-pill').forEach(btn => {
      btn.addEventListener('click', async () => {
        const isYes = btn.dataset.choice === 'yes';
        btn.classList.add('selected');
        step2Wrap.querySelectorAll('.wa-btn-pill').forEach(b => b.disabled = true);

        if (isYes) {
          appendUserMessage('SÃ­, conectar');
          await showTypingIndicator(700);
          appendBotMessage(`
            Â¡Claro! Derivando tu caso. Un experto humano se unirÃ¡ en breve.
            <div class="wa-meta">${getTimeStr()}</div>
            <div class="wa-options-wrap" id="wa-end-options">
              <button type="button" class="wa-btn-pill" data-expert="menu">ðŸ”„ Volver al inicio</button>
            </div>
          `);
          bindPostHelpOptions('wa-end-options');
        } else {
          appendUserMessage('No, sigo la guÃ­a');
          await showTypingIndicator(600);
          appendBotMessage(`
            Â¡Perfecto! Tienes las dosis y el calendario detallado en tu app y kit del mes. Â¡AquÃ­ estarÃ© si notas cualquier cambio! ðŸª´âœ¨
            <div class="wa-meta">${getTimeStr()}</div>
            <div class="wa-options-wrap" id="wa-end-options-2">
              <button type="button" class="wa-btn-pill" data-expert="menu">ðŸ”„ Volver al inicio</button>
            </div>
          `);
          bindPostHelpOptions('wa-end-options-2');
        }
      });
    });
  }

  function bindPostHelpOptions(containerId) {
    const wrap = document.getElementById(containerId);
    if (!wrap) return;

    wrap.querySelectorAll('.wa-btn-pill').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.expert;
        wrap.querySelectorAll('.wa-btn-pill').forEach(b => b.disabled = true);
        btn.classList.add('selected');

        if (action === 'yes') {
          appendUserMessage('SÃ­, por favor conectar con un Experto Humano');
          await showTypingIndicator(700);
          appendBotMessage(`
            Â¡Solicitud recibida! Un botÃ¡nico de nuestro equipo revisarÃ¡ tu caso y te responderÃ¡ por este chat en menos de 15 minutos ðŸ©ºðŸŒ¿.
            <div class="wa-meta">${getTimeStr()}</div>
            <div class="wa-options-wrap" id="wa-back-wrap">
              <button type="button" class="wa-btn-pill" data-expert="menu">ðŸ”„ Volver al menÃº de preguntas</button>
            </div>
          `);
          bindPostHelpOptions('wa-back-wrap');
        } else if (action === 'menu') {
          appendUserMessage('Ver opciones principales');
          renderGreeting();
        }
      });
    });
  }

  // Handle manual typing via input field
  function submitInput() {
    if (!inputField) return;
    const val = inputField.value.trim();
    if (val) {
      handleUserQuery(val);
    }
  }

  if (inputField) {
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitInput();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (inputField && inputField.value.trim()) {
        submitInput();
      } else {
        renderGreeting();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderGreeting();
    });
  }

  // Initial Boot: Bot begins greeting and offering options
  renderGreeting();
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   USO DE LA IA - 3D FLIP CARDS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function initIACards() {
  document.querySelectorAll('.ia-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('is-flipped');
      }
    });
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FINANCIAL CALCULATOR + CHART.JS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
let fChart = null;

function initCalc() {
  const sS = document.getElementById('sl-subs');
  const sC = document.getElementById('sl-churn');
  const sA = document.getElementById('sl-cac');
  if (!sS) return;

  function upd() {
    const subs = +sS.value, churn = +sC.value, cac = +sA.value;
    const $ = id => document.getElementById(id);
    $('v-subs').textContent = subs.toLocaleString('es-ES');
    $('v-churn').textContent = churn.toFixed(1) + '%';
    $('v-cac').textContent = cac.toFixed(1) + ' â‚¬';

    const t = 24.90, mrr = subs * t, arr = mrr * 12;
    const ltv = t / (churn / 100), ratio = (ltv / cac).toFixed(1);

    $('kpi-mrr').textContent = Math.round(mrr).toLocaleString('es-ES') + ' â‚¬';
    $('kpi-arr').textContent = Math.round(arr).toLocaleString('es-ES') + ' â‚¬';
    $('kpi-ltv').textContent = Math.round(ltv).toLocaleString('es-ES') + ' â‚¬';
    $('kpi-ratio').textContent = ratio + 'x';

    updChart(subs, churn / 100);
  }

  sS.addEventListener('input', upd);
  sC.addEventListener('input', upd);
  sA.addEventListener('input', upd);

  // Init chart
  const ctx = document.getElementById('fin-chart');
  if (ctx) {
    fChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12'],
        datasets: [
          { label: 'MRR (â‚¬)', data: [], borderColor: '#73B839', backgroundColor: 'rgba(115,184,57,0.06)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 2, pointBackgroundColor: '#73B839' },
          { label: 'Margen (â‚¬)', data: [], borderColor: '#D46A38', borderDash: [5,4], backgroundColor: 'transparent', tension: 0.4, borderWidth: 1.5, pointRadius: 1.5, pointBackgroundColor: '#D46A38' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { color: 'rgba(255,255,255,0.4)', font: { family: 'Space Grotesk', size: 9 } } } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: 'rgba(255,255,255,0.25)', font: { size: 8 } } },
          x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.25)', font: { size: 8 } } }
        }
      }
    });
  }
  upd();
}

function updChart(subs, cr) {
  if (!fChart) return;
  const m = [], p = [];
  for (let i = 1; i <= 12; i++) {
    const s = Math.round(subs * Math.pow(i/12, 1.2) * (1 - cr*0.2));
    const mrr = s * 24.90;
    m.push(mrr); p.push(mrr * 0.60);
  }
  fChart.data.datasets[0].data = m;
  fChart.data.datasets[1].data = p;
  fChart.update();
}


