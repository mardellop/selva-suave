let currentSlideIndex = 0;
const TOTAL_SLIDES = 15;
let isSlideTransitioning = false;

document.addEventListener('DOMContentLoaded', () => {
  initAudio();
  initWhatsApp();
  initIACards();
  initPresentationDeck();
  initHeaderNav();
  updateWhatsAppStatusTime();
  // Iniciar en la diapositiva solicitada o en la primera
  const urlParams = new URLSearchParams(window.location.search);
  const slideParam = urlParams.get('slide');
  const initialSlide = slideParam !== null ? parseInt(slideParam, 10) : 0;
  goToSlide(isNaN(initialSlide) ? 0 : initialSlide, true);
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

/* ==========================================================================
   SISTEMA DE PRESENTACIÓN HORIZONTAL (SLIDES DECK)
   ========================================================================== */
function initPresentationDeck() {
  const prevBtn = document.getElementById('prev-slide-btn');
  const nextBtn = document.getElementById('next-slide-btn');
  const totalNumEl = document.getElementById('slide-total-num');

  if (totalNumEl) {
    totalNumEl.textContent = String(TOTAL_SLIDES).padStart(2, '0');
  }

  // 1. Clic en las flechas de avanzar y retroceder
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentSlideIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentSlideIndex + 1);
    });
  }

  const hintBtn = document.getElementById('scene1-scroll-hint');
  if (hintBtn) {
    hintBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(1);
    });
  }

  // 2. Navegación por teclado (Flechas Izquierda / Derecha, Espacio, PageUp / PageDown)
  window.addEventListener('keydown', (e) => {
    // Si el usuario está escribiendo en el chat de WhatsApp, no interferir con las flechas de texto
    const activeEl = document.activeElement;
    const tag = (activeEl ? activeEl.tagName : '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      goToSlide(currentSlideIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goToSlide(currentSlideIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(TOTAL_SLIDES - 1);
    }
  });

  // 3. Navegación con la rueda del ratón (desplazamiento horizontal con debounce)
  let wheelTimeout = null;
  let wheelAccumulator = 0;
  const WHEEL_THRESHOLD = 45;

  window.addEventListener('wheel', (e) => {
    // Detectar si el usuario está haciendo scroll dentro del slide que tenga scrollbar activa
    const activeSlide = document.querySelector(`.presentation-slide[data-index="${currentSlideIndex}"]`);
    if (activeSlide && activeSlide.scrollHeight > activeSlide.clientHeight) {
      const atTop = activeSlide.scrollTop <= 2;
      const atBottom = activeSlide.scrollTop + activeSlide.clientHeight >= activeSlide.scrollHeight - 2;

      // Si está scrolleando verticalmente dentro del slide y aún no llega al tope, permitir scroll interno
      if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) {
        return;
      }
    }

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    wheelAccumulator += delta;

    if (Math.abs(wheelAccumulator) >= WHEEL_THRESHOLD && !isSlideTransitioning) {
      if (wheelAccumulator > 0) {
        goToSlide(currentSlideIndex + 1);
      } else {
        goToSlide(currentSlideIndex - 1);
      }
      wheelAccumulator = 0;
    }

    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      wheelAccumulator = 0;
    }, 280);
  }, { passive: true });

  // 4. Navegación táctil (swipe horizontal en tablets y móviles)
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 45;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const deltaX = touchStartX - e.changedTouches[0].clientX;
    const deltaY = touchStartY - e.changedTouches[0].clientY;

    // Solo si el gesto es predominantemente horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        goToSlide(currentSlideIndex + 1);
      } else {
        goToSlide(currentSlideIndex - 1);
      }
    }
  }, { passive: true });
}

let currentTransitionTimeline = null;

/**
 * Transición suave, continua y ultra fluida (60 FPS estables vía GSAP Timeline unificado)
 */
function goToSlide(targetIndex, instant = false) {
  // Proteger la fluidez mientras dura la transición
  if (isSlideTransitioning && !instant) return;

  targetIndex = Math.max(0, Math.min(TOTAL_SLIDES - 1, targetIndex));
  if (targetIndex === currentSlideIndex && !instant) return;

  const prevSlideIndex = currentSlideIndex;
  currentSlideIndex = targetIndex;
  isSlideTransitioning = true;

  const track = document.getElementById('presentation-track');
  const prevBtn = document.getElementById('prev-slide-btn');
  const nextBtn = document.getElementById('next-slide-btn');
  const currentNumEl = document.getElementById('slide-current-num');
  const progressFill = document.getElementById('progress-fill');

  // Actualizar estado de las flechas
  if (prevBtn) {
    const isFirst = currentSlideIndex === 0;
    prevBtn.disabled = isFirst;
    prevBtn.classList.toggle('disabled', isFirst);
  }

  if (nextBtn) {
    const isLast = currentSlideIndex === TOTAL_SLIDES - 1;
    nextBtn.disabled = isLast;
    nextBtn.classList.toggle('disabled', isLast);
  }

  // Actualizar contador numérico
  if (currentNumEl) {
    currentNumEl.textContent = String(currentSlideIndex + 1).padStart(2, '0');
  }

  // Actualizar barra de progreso inferior
  if (progressFill) {
    const pct = ((currentSlideIndex + 1) / TOTAL_SLIDES) * 100;
    progressFill.style.width = `${pct}%`;
  }

  // Actualizar menú superior activo
  updateHeaderActiveLink(currentSlideIndex);

  // Inicialización instantánea (primer render)
  if (instant || prevSlideIndex === currentSlideIndex) {
    if (track) {
      gsap.killTweensOf(track);
      gsap.set(track, { x: -currentSlideIndex * window.innerWidth });
    }
    playSlideAnimations(currentSlideIndex, true);
    isSlideTransitioning = false;
    return;
  }

  // Detener timeline previa si hubiera alguna activa
  if (currentTransitionTimeline) {
    currentTransitionTimeline.kill();
  }

  const outgoingSlide = document.querySelector(`.presentation-slide[data-index="${prevSlideIndex}"]`);
  const outTexts = outgoingSlide ? outgoingSlide.querySelectorAll('.scene-text, .scene-subtext, .stats-heading, .ps-stats, .stats-footer, .ps-section-title, .ps-heading, .razones-intro-box') : null;
  const outImages = outgoingSlide ? outgoingSlide.querySelectorAll('.scene-img, .ps-img-wrap') : null;

  // Timeline unificada: elimina cualquier conflicto entre CSS y JS, garantizando fluidez total
  const tl = gsap.timeline({
    onComplete: () => {
      isSlideTransitioning = false;
      // Restaurar estado limpio del slide que salió
      if (outTexts && outTexts.length > 0) gsap.set(outTexts, { clearProps: 'transform,opacity' });
      if (outImages && outImages.length > 0) gsap.set(outImages, { clearProps: 'transform,opacity' });
    }
  });
  currentTransitionTimeline = tl;

  // 1. FASE DE ZOOM IN: El texto se acerca suavemente a la pantalla hasta disolverse al pasar a la siguiente diapositiva
  if (outTexts && outTexts.length > 0) {
    tl.to(outTexts, {
      scale: 2.2,
      opacity: 0,
      duration: 0.65,
      ease: 'power1.in',
      transformOrigin: 'center center'
    }, 0);
  }

  if (outImages && outImages.length > 0) {
    tl.to(outImages, {
      opacity: 0.3,
      scale: 1.05,
      duration: 0.55,
      ease: 'power1.out'
    }, 0);
  }

  // 2. FASE DE DESPLAZAMIENTO: Cuando el texto se ha acercado a la pantalla, la pista viaja con máxima suavidad
  if (track) {
    tl.to(track, {
      x: -currentSlideIndex * window.innerWidth,
      duration: 1.15,
      ease: 'power2.inOut'
    }, 0.32);
  }

  // 3. FASE DE ENTRADA: El contenido del nuevo slide entra de forma fluida y cinematográfica
  playSlideAnimations(currentSlideIndex, false, tl, 0.72);
}

/**
 * Resalta en el menú superior qué sección está activa
 */
function updateHeaderActiveLink(index) {
  const headerLinks = document.querySelectorAll('.header-right a[data-slide-target]');
  headerLinks.forEach(link => link.classList.remove('active'));

  let activeTarget = null;
  if (index === 4) activeTarget = '4';                     // La idea
  else if (index === 5) activeTarget = '5';                // Datos del sector
  else if (index >= 6 && index <= 10) activeTarget = '6';  // Por qué funciona (Intro + 4 razones)
  else if (index === 11 || index === 12) activeTarget = '11'; // Uso de la IAG (Partes 1 y 2)
  else if (index === 13) activeTarget = '13';              // Bibliografía
  else if (index === 14) activeTarget = '14';              // Autoría

  if (activeTarget) {
    const activeLink = document.querySelector(`.header-right a[data-slide-target="${activeTarget}"]`);
    if (activeLink) activeLink.classList.add('active');
  }
}

/**
 * Configurar los clics del menú superior para saltar a las diapositivas
 */
function initHeaderNav() {
  const links = document.querySelectorAll('.site-header a[data-slide-target]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSlide = parseInt(link.getAttribute('data-slide-target'), 10);
      if (!isNaN(targetSlide)) {
        goToSlide(targetSlide);
      }
    });
  });
}

/**
 * ANIMACIONES GSAP PARA CADA DIAPOSITIVA (Fluidez máxima a 60 FPS coordinada con el Timeline)
 */
function playSlideAnimations(index, instant = false, timeline = null, startTime = 0) {
  const tl = timeline;
  const anim = (target, fromVars, toVars, offset = 0) => {
    if (tl) {
      tl.fromTo(target, fromVars, toVars, startTime + offset);
    } else {
      toVars.delay = (toVars.delay || 0) + (instant ? 0 : offset);
      gsap.fromTo(target, fromVars, toVars);
    }
  };

  switch (index) {
    case 0:
      // Diapositiva 1: Escena 1
      anim('#s1 .st',
        { opacity: 0, scale: 0.8, y: 18 },
        { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power2.out' },
        0
      );
      anim('#s1 .si1',
        { opacity: 0, x: '-60%', rotation: -6 },
        { opacity: 1, x: '0%', rotation: 0, duration: 1.0, ease: 'power2.out' },
        0.1
      );
      anim('#s1 .si2',
        { opacity: 0, x: '60%', rotation: 5 },
        { opacity: 1, x: '0%', rotation: 0, duration: 1.0, ease: 'power2.out' },
        0.18
      );
      anim('#scene1-scroll-hint',
        { opacity: 0, y: 15 },
        { opacity: 0.9, y: 0, duration: 0.8 },
        0.35
      );
      break;

    case 1:
      // Diapositiva 2: Escena 2
      anim('#s2 .st',
        { opacity: 0, scale: 0.8, y: 18 },
        { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power2.out' },
        0
      );
      anim('#s2 .si1',
        { opacity: 0, x: '-70%', rotation: -8 },
        { opacity: 1, x: '0%', rotation: -3, duration: 1.0, ease: 'power2.out' },
        0.1
      );
      anim('#s2 .si2',
        { opacity: 0, x: '70%', rotation: 6 },
        { opacity: 1, x: '0%', rotation: 2, duration: 1.0, ease: 'power2.out' },
        0.18
      );
      break;

    case 2:
      // Diapositiva 3: Escena 3
      anim('#s3 .st',
        { opacity: 0, scale: 0.82, y: 22 },
        { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power2.out' },
        0
      );
      anim('#s3 .si1',
        { opacity: 0, x: '-50%', y: '10%' },
        { opacity: 1, x: '0%', y: '0%', duration: 1.0, ease: 'power2.out' },
        0.1
      );
      anim('#s3 .si2',
        { opacity: 0, x: '50%', y: '10%' },
        { opacity: 1, x: '0%', y: '0%', duration: 1.0, ease: 'power2.out' },
        0.18
      );
      break;

    case 3:
      // Diapositiva 4: Escena 4 (Precio mensual)
      anim('#s4 .st',
        { opacity: 0, scale: 0.45 },
        { opacity: 1, scale: 1, duration: 1.15, ease: 'back.out(1.15)' },
        0
      );
      anim('#s4 .si1',
        { opacity: 0, x: '-50%', rotation: -5 },
        { opacity: 1, x: '0%', rotation: 0, duration: 1.0, ease: 'power2.out' },
        0.12
      );
      break;

    case 4:
      // Diapositiva 5: Escena 5 (La idea)
      anim('#s5 .st',
        { opacity: 0, scale: 0.78, y: 18 },
        { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power2.out' },
        0
      );
      anim('#s5 .ss',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' },
        0.18
      );
      anim('#s5 .si1',
        { opacity: 0, scale: 0.7, rotation: 6 },
        { opacity: 1, scale: 1, rotation: 0, duration: 1.0, ease: 'power2.out' },
        0.1
      );
      anim('#s5 .si2',
        { opacity: 0, x: '-50%' },
        { opacity: 1, x: '0%', duration: 1.0, ease: 'power2.out' },
        0.18
      );
      break;

    case 5:
      // Diapositiva 6: Estadísticas del sector (animación de ampliación para título, cuerpo de porcentajes y footer)
      anim('#datos-sector .stats-heading',
        { opacity: 0, scale: 0.85, y: -12 },
        { opacity: 1, scale: 1, y: 0, duration: 1.0, ease: 'power2.out' },
        0
      );
      anim('#datos-sector .ps-stats',
        { opacity: 0, scale: 0.88, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.95, ease: 'power2.out' },
        0.08
      );
      anim('#datos-sector .stats-footer',
        { opacity: 0, scale: 0.9, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.85, ease: 'power2.out' },
        0.18
      );
      if (tl) {
        tl.call(animateCounters, null, startTime + 0.15);
      } else {
        animateCounters();
      }
      break;

    default:
      // Diapositivas 7 a 15: Revelar elementos con suavidad
      const currentSlideEl = document.querySelector(`.presentation-slide[data-index="${index}"]`);
      if (currentSlideEl) {
        const reveals = currentSlideEl.querySelectorAll('.rv');
        if (reveals.length > 0) {
          if (tl) {
            tl.fromTo(reveals,
              { opacity: 0, scale: 0.93, y: 18 },
              { opacity: 1, scale: 1, y: 0, duration: 0.95, stagger: 0.08, ease: 'power2.out' },
              startTime + 0.05
            );
          } else {
            gsap.fromTo(reveals,
              { opacity: 0, scale: 0.93, y: 18 },
              { opacity: 1, scale: 1, y: 0, duration: 0.95, stagger: 0.08, ease: 'power2.out' }
            );
          }
        }
      }
      break;
  }
}

/**
 * Animación de los contadores estadísticos en la diapositiva 6
 */
function animateCounters() {
  document.querySelectorAll('[data-count-to]').forEach(el => {
    const target = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.countSuffix || '';
    const prefix = el.dataset.countPrefix || '';
    const decimals = parseInt(el.dataset.countDecimals || '0', 10);
    const obj = { val: 0 };

    gsap.to(obj, {
      val: target,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = prefix + obj.val.toFixed(decimals).replace('.', ',') + suffix;
      }
    });
  });
}

/* ==========================================================================
   BACKGROUND AUDIO ENGINE
   ========================================================================== */
let audioStarted = false;
let audioFadeReq = null;
let userDisabledMusic = false;
let musicAllowedToPlay = false;

const BG_MUSIC_VOLUME = 0.18;
const BG_MUSIC_FADE_DURATION = 3500;

function initAudio() {
  const audio = document.getElementById('bg-music');
  const toggleBtn = document.getElementById('music-toggle');
  if (!audio) return;

  audio.volume = 0;
  musicAllowedToPlay = true;

  if (!userDisabledMusic) {
    audio.play().then(() => {
      fadeInAudio(audio, BG_MUSIC_VOLUME, BG_MUSIC_FADE_DURATION);
      updateMusicUI(true);
    }).catch(() => {});
  }

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
    toggleBtn.setAttribute('title', 'Desactivar música de fondo');
    toggleBtn.setAttribute('aria-pressed', 'true');
    if (textEl) textEl.textContent = 'Música: On';
  } else {
    toggleBtn.classList.remove('is-playing');
    toggleBtn.setAttribute('title', 'Activar música de fondo');
    toggleBtn.setAttribute('aria-pressed', 'false');
    if (textEl) textEl.textContent = 'Música: Off';
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

/* ==========================================================================
   WHATSAPP INTERACTIVE BOT ENGINE (SELBOT)
   ========================================================================== */
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

  const defaultQuestions = [
    { id: 'monstera', label: '¿Mi Monstera tiene manchas amarillas?', query: 'Mi Monstera tiene manchas amarillas. ¿Qué puede ser?' },
    { id: 'riego', label: '¿Cada cuánto debo regar mis plantas?', query: '¿Cada cuánto debo regar mis plantas de interior?' },
    { id: 'kit', label: '¿Cómo usar el abono?', query: '¿Cómo usar el abono?' },
    { id: 'plaga', label: 'Hay bichos blancos en las hojas', query: 'Hay bichos blancos en las hojas de mi planta' },
    { id: 'otros', label: 'Otros / Hablar con un asesor', query: 'Quiero consultar sobre otro tema' }
  ];

  async function renderGreeting() {
    body.innerHTML = '';
    await showTypingIndicator(450);

    let pillsHtml = '<div class="wa-options-wrap" id="wa-preset-options">';
    defaultQuestions.forEach(q => {
      pillsHtml += `<button type="button" class="wa-btn-pill pill-stacked" data-qid="${q.id}">${q.label}</button>`;
    });
    pillsHtml += '</div>';

    const greetingText = `
      ¡Hola! Soy <strong>Selbot</strong>, tu asistente de cuidado botánico de Selva Suave<br>
      ¿En qué te puedo ayudar hoy? Elige una consulta frecuente o <em>escribe tu duda</em> abajo:
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

  async function handleUserQuery(text, forcedCategory = null) {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();

    body.querySelectorAll('.wa-btn-pill').forEach(b => b.disabled = true);
    appendUserMessage(cleanText);
    if (inputField) inputField.value = '';

    await showTypingIndicator(700);
    const lower = cleanText.toLowerCase();

    // Saludos
    if (/^(hola|buen(as|os)?\s*(d[ií]as|tardes|noches)?|qu[eé]\s*tal|c[oó]mo\s*est[aá]s|hey|buenas)$/i.test(lower.trim()) ||
        (lower.startsWith('hola') && lower.length < 15)) {
      appendBotMessage(`
        ¡Hola! Qué alegría saludarte. Soy <strong>Selbot</strong>, tu asistente de cuidado vegetal.<br><br>
        ¿Cómo están tus plantas hoy? Cuéntame qué notas o selecciona una duda para empezar:
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-hello-options">
          <button type="button" class="wa-btn-pill" data-expert="menu">Ver preguntas frecuentes</button>
          <button type="button" class="wa-btn-pill" data-expert="yes">Hablar con un asesor</button>
        </div>
      `);
      bindPostHelpOptions('wa-hello-options');
      return;
    }

    // Agradecimientos
    if (/^(gracias|muchas\s*gracias|mil\s*gracias|te\s*lo\s*agradezco|perfecto\s*gracias|vale\s*gracias)$/i.test(lower.trim()) ||
        lower.includes('gracias')) {
      appendBotMessage(`
        ¡De nada! Para eso estamos en Selva Suave: para que cuidar tus plantas sea fácil, relajante y sin complicaciones.<br><br>
        Si surge cualquier otra duda, ¡aquí me tienes siempre disponible!
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-thanks-options">
          <button type="button" class="wa-btn-pill" data-expert="menu">Hacer otra consulta</button>
        </div>
      `);
      bindPostHelpOptions('wa-thanks-options');
      return;
    }

    // Despedidas
    if (/^(adi[oó]s|hasta\s*luego|hasta\s*pronto|chao|chau|nos\s*vemos|bye|hasta\s*mañana)$/i.test(lower.trim()) ||
        lower.includes('adios') || lower.includes('adiós') || lower.includes('hasta luego')) {
      appendBotMessage(`
        ¡Hasta pronto! Que tengas un día genial y que tus plantas sigan creciendo felices y llenas de vida<br>
        ¡Vuelve cuando quieras!
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-bye-options">
          <button type="button" class="wa-btn-pill" data-expert="menu">Reiniciar chat</button>
        </div>
      `);
      bindPostHelpOptions('wa-bye-options');
      return;
    }

    // Opción 'Otros' / Consulta libre
    if (forcedCategory === 'otros' || lower === 'otros' || lower.includes('otro tema') || lower.includes('asesor') || lower.includes('precio') || lower.includes('suscripci') || lower.includes('envio') || lower.includes('envío')) {
      appendBotMessage(`
        ¡Por supuesto! En <strong>Selva Suave</strong> te ayudamos con cualquier tema:<br>
        • <strong>Diagnóstico botánico personalizado</strong> con fotos.<br>
        • <strong>Estado de envíos y suscripción mensual</strong> (24,99€/mes).<br>
        • <strong>Recomendación de plantas</strong> para la luz de tu casa.<br><br>
        ¿Te gustaría que te comunique directamente con un especialista botánico humano de nuestro equipo?
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-others-options">
          <button type="button" class="wa-btn-pill" data-expert="yes">Sí, hablar con un humano</button>
          <button type="button" class="wa-btn-pill" data-expert="menu">Ver dudas frecuentes</button>
        </div>
      `);
      bindPostHelpOptions('wa-others-options');
      return;
    }

    // Monstera
    if (forcedCategory === 'monstera' || lower.includes('monstera') || lower.includes('amarill')) {
      const botText = `
        ¡Entendido! Para diagnosticar tu Monstera, por favor confirma:<br>
        ¿Tiene puntos negros en el envés de la hoja o filamentos finos?
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-monstera-options">
          <button type="button" class="wa-btn-pill" data-choice="A">A. Puntos negros</button>
          <button type="button" class="wa-btn-pill" data-choice="B">B. Filamentos/telarañas</button>
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
            await showTypingIndicator(700);
            renderMonsteraDiagnosis(choice);
          });
        });
      }
    } else if (forcedCategory === 'plaga' || lower.includes('bicho') || lower.includes('plaga') || lower.includes('cochinilla') || lower.includes('araña')) {
      appendBotMessage(`
        Los bichitos blancos suelen ser <strong>cochinilla algodonosa</strong> o trips en fase ninfa.
        <div class="wa-media-row">
          <div class="wa-media-text">
            Aísla la planta, retíralos con el pincel del kit impregnado en alcohol suave y pulveriza la solución fitosanitaria natural incluida este mes. Consulta aquí la guía: <span class="wa-link">[Ver Guía Antiplagas]</span>.
          </div>
          <div class="wa-media-thumb">
            <img src="hoja-plaga.jpg" alt="Plaga en hoja" />
          </div>
        </div>
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-plaga-options">
          <button type="button" class="wa-btn-pill" data-expert="yes">Hablar con Experto Humano</button>
          <button type="button" class="wa-btn-pill" data-expert="menu">Ver más preguntas</button>
        </div>
      `);
      bindPostHelpOptions('wa-plaga-options');
    } else if (forcedCategory === 'riego' || lower.includes('riego') || lower.includes('regar') || lower.includes('agua') || lower.includes('humedad')) {
      appendBotMessage(`
        <strong>Regla de oro de Selva Suave:</strong> No riegues por calendario fijo, riega según la humedad del sustrato.
        <br><br>
        Introduce el dedo 2-3 cm en la tierra. Si sale seco, aplica agua reposada y dosifica con la pipeta de nutrición de tu kit. Si notas humedad, ¡espera 3 o 4 días más!
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-riego-options">
          <button type="button" class="wa-btn-pill" data-expert="yes">Consultar a un Botánico</button>
          <button type="button" class="wa-btn-pill" data-expert="menu">Menú principal</button>
        </div>
      `);
      bindPostHelpOptions('wa-riego-options');
    } else if (forcedCategory === 'kit' || lower.includes('kit') || lower.includes('abono') || lower.includes('caja') || lower.includes('sustrato')) {
      appendBotMessage(`
        Tu caja mensual de Selva Suave contiene:<br>
        • <strong>Nutrición líquida:</strong> Dosis justa según la estación del año.<br>
        • <strong>Enmienda y sustrato:</strong> Formato compacto sin sacos gigantes.<br>
        • <strong>Herramienta de autor:</strong> Para poda o trasplante.<br>
        • <strong>Acceso a Doctor Planta</strong> para resolver cualquier duda botánica.
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-kit-options">
          <button type="button" class="wa-btn-pill" data-expert="yes">Conectar con un asesor</button>
          <button type="button" class="wa-btn-pill" data-expert="menu">Hacer otra consulta</button>
        </div>
      `);
      bindPostHelpOptions('wa-kit-options');
    } else {
      appendBotMessage(`
        He analizado tu consulta sobre "<em>${cleanText}</em>". Para darte un diagnóstico 100% exacto según la especie de tu planta y las condiciones de luz de tu casa, ¿te gustaría que te conecte con nuestro equipo botánico humano?
        <div class="wa-meta">${getTimeStr()}</div>
        <div class="wa-options-wrap" id="wa-general-options">
          <button type="button" class="wa-btn-pill" data-expert="yes">Sí, conectar con Experto</button>
          <button type="button" class="wa-btn-pill" data-expert="menu">Ver preguntas frecuentes</button>
        </div>
      `);
      bindPostHelpOptions('wa-general-options');
    }
  }

  async function renderMonsteraDiagnosis(choice) {
    let diagnosisIntro = 'Entendido. Esto parece una infestación de araña roja, una plaga común.';
    if (choice === 'A') {
      diagnosisIntro = 'Entendido. Los puntos negros sugieren trips o cochinilla en fase activa.';
    } else if (choice === 'C') {
      diagnosisIntro = 'Entendido. Al no haber telarañas ni puntos, es probable que se trate de clorosis o exceso de riego.';
    }

    const botDiagnosisHtml = `
      ${diagnosisIntro}
      <div class="wa-media-row">
        <div class="wa-media-text">
          He filtrado tu caso y parece un diagnóstico claro. Revisa nuestra guía de tratamiento y el producto anti-plagas de tu kit aquí: <span class="wa-link">[Enlace]</span>.
        </div>
        <div class="wa-media-thumb">
          <img src="hoja-plaga.jpg" alt="Hoja de monstera afectada" />
        </div>
      </div>
      <div class="wa-meta">${getTimeStr()}</div>
    `;
    appendBotMessage(botDiagnosisHtml);

    await showTypingIndicator(750);

    const botEscalationHtml = `
      Como es una plaga persistente, ¿te gustaría que te conecte con un Experto Humano para un mayor diagnóstico y plan personalizado?
      <div class="wa-meta">${getTimeStr()}</div>
      <div class="wa-options-wrap" id="wa-step2-options">
        <button type="button" class="wa-btn-pill" data-choice="yes">Sí, conectar</button>
        <button type="button" class="wa-btn-pill" data-choice="no">No, sigo la guía</button>
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
          appendUserMessage('Sí, conectar');
          await showTypingIndicator(650);
          appendBotMessage(`
            ¡Claro! Derivando tu caso. Un experto humano se unirá en breve.
            <div class="wa-meta">${getTimeStr()}</div>
            <div class="wa-options-wrap" id="wa-end-options">
              <button type="button" class="wa-btn-pill" data-expert="menu">Volver al inicio</button>
            </div>
          `);
          bindPostHelpOptions('wa-end-options');
        } else {
          appendUserMessage('No, sigo la guía');
          await showTypingIndicator(550);
          appendBotMessage(`
            ¡Perfecto! Tienes las dosis y el calendario detallado en tu app y kit del mes. ¡Aquí estaré si notas cualquier cambio!
            <div class="wa-meta">${getTimeStr()}</div>
            <div class="wa-options-wrap" id="wa-end-options-2">
              <button type="button" class="wa-btn-pill" data-expert="menu">Volver al inicio</button>
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
          appendUserMessage('Sí, por favor conectar con un Experto Humano');
          await showTypingIndicator(650);
          appendBotMessage(`
            ¡Solicitud recibida! Un botánico de nuestro equipo revisará tu caso y te responderá por este chat en menos de 15 minutos.
            <div class="wa-meta">${getTimeStr()}</div>
            <div class="wa-options-wrap" id="wa-back-wrap">
              <button type="button" class="wa-btn-pill" data-expert="menu">Volver al menú de preguntas</button>
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

  renderGreeting();
}

/* ==========================================================================
   USO DE LA IA - 3D FLIP CARDS
   ========================================================================== */
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

