class MKGallery {
  componentDidMount() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    this.initCurtainReveal();
    this.initThreeJS();
    this.initScrollReveals();
    this.initCardTilt();
    this.initSwatchParallax();
    this.initCountUp();
    this.initModals();
    this.initHamburger();
    this.initPerformance();
    this.initFabricFall();
  }

  initFabricFall() {
    const fabric = document.getElementById('hero-fabric');
    if (!fabric) return;
    fabric.style.clipPath = 'inset(0 0 92% 0 round 0 0 14px 14px)';
    fabric.style.animation = 'none';
    const doUnroll = () => {
      setTimeout(() => {
        fabric.style.animation = 'unrollFabric 2.6s cubic-bezier(0.215,0.61,0.355,1) forwards';
        setTimeout(() => {
          fabric.style.clipPath = 'none';
          fabric.style.animation = 'fabricFloat 9s ease-in-out infinite';
        }, 2700);
      }, 400);
    };
    // Drop the fabric down when the hero scrolls into view (Visit Us now sits above it)
    const hero = document.getElementById('hero');
    if (hero) {
      const io = new IntersectionObserver((entries, ob) => {
        entries.forEach(en => {
          if (en.isIntersecting) { doUnroll(); ob.disconnect(); }
        });
      }, { threshold: 0.35 });
      io.observe(hero);
    } else {
      window.addEventListener('curtainClosed', doUnroll, { once: true });
    }
  }

  initPerformance() {
    // Add content-visibility to off-screen heavy sections for faster paint
    ['catalog-section','hotel-section','testimonials-section','contact-section','site-footer'].forEach(cls => {
      const el = document.querySelector('.' + cls) || document.querySelector('#' + cls);
      if (el) el.style.contentVisibility = 'auto';
    });
    // Cap pixel ratio on mobile
    if (window.innerWidth < 768) {
      document.documentElement.style.setProperty('--dur', '0.25s');
      document.documentElement.style.setProperty('--dur-slow', '0.4s');
    }
  }

  initHamburger() {
    const btn = document.getElementById('hamburger-btn');
    const nav = document.getElementById('mobile-nav');
    if (!btn || !nav) return;
    const close = () => {
      btn.classList.remove('open');
      nav.classList.remove('open');
      nav.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    btn.addEventListener('click', () => {
      const isOpen = nav.classList.contains('open');
      if (isOpen) { close(); } else {
        btn.classList.add('open');
        nav.classList.add('open');
        nav.setAttribute('aria-hidden', 'false');
        btn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }

  initCurtainReveal() {
    const curtain = document.getElementById('curtain-reveal');
    const mainWrapper = document.getElementById('main-wrapper');
    if (!curtain) return;

    // Reduced motion: instant skip
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      curtain.style.display = 'none';
      document.body.classList.remove('scroll-locked');
      if (mainWrapper) { mainWrapper.removeAttribute('aria-hidden'); mainWrapper.removeAttribute('inert'); }
      return;
    }
    const isMobile = window.innerWidth < 768;

    if (mainWrapper) {
      mainWrapper.setAttribute('aria-hidden', 'true');
      mainWrapper.setAttribute('inert', '');
    }

    const curtainLeft = curtain.querySelector('.left-panel');
    const curtainRight = curtain.querySelector('.right-panel');
    const logoOverlay = curtain.querySelector('.logo-overlay');
    let targetProgress = 0, currentProgress = 0, animFrameId = null, introCompleted = false;

    const logoTimer = setTimeout(() => {
      if (!introCompleted) curtain.classList.add('revealed-logo');
    }, 600);

    const completeIntro = () => {
      introCompleted = true;
      curtain.style.display = 'none';
      curtain.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.classList.remove('scroll-locked');
        if (mainWrapper) {
          mainWrapper.removeAttribute('aria-hidden');
          mainWrapper.removeAttribute('inert');
        }
        window.dispatchEvent(new CustomEvent('curtainClosed'));
      }, 500);
      if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    };

    const updateCurtain = () => {
      if (introCompleted) return;
      currentProgress += (targetProgress - currentProgress) * 0.075;
      const S = 1 - currentProgress * 0.85;
      const T_left = (1 - currentProgress) / S - 1;
      const T_right = 1 - (1 - currentProgress) / S;
      if (curtainLeft) curtainLeft.style.transform = `scaleX(${S}) translateX(${T_left * 100}%)`;
      if (curtainRight) curtainRight.style.transform = `scaleX(${S}) translateX(${T_right * 100}%)`;
      if (logoOverlay) {
        logoOverlay.style.opacity = Math.max(0, 1 - currentProgress * 1.6);
        logoOverlay.style.transform = `scale(${1 - currentProgress * 0.04}) translateY(-${currentProgress * 25}px)`;
      }
      if (currentProgress < 0.998) {
        animFrameId = requestAnimationFrame(updateCurtain);
      } else {
        if (curtainLeft) curtainLeft.style.transform = 'scaleX(0.15) translateX(-100%)';
        if (curtainRight) curtainRight.style.transform = 'scaleX(0.15) translateX(100%)';
        completeIntro();
      }
    };

    const startAnim = () => { if (!animFrameId) animFrameId = requestAnimationFrame(updateCurtain); };

    window.addEventListener('wheel', (e) => {
      if (introCompleted) return;
      e.preventDefault();
      targetProgress = Math.max(0, Math.min(1, targetProgress + e.deltaY * 0.0012));
      if (logoOverlay) logoOverlay.style.transition = 'none';
      startAnim();
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
      if (introCompleted) return;
      const keys = [' ', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const delta = (e.key === 'ArrowUp' || e.key === 'PageUp') ? -0.08 : 0.08;
      targetProgress = Math.max(0, Math.min(1, targetProgress + delta));
      if (logoOverlay) logoOverlay.style.transition = 'none';
      startAnim();
    });

    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => { if (!introCompleted) touchStartY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (introCompleted) return;
      e.preventDefault();
      const delta = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      targetProgress = Math.max(0, Math.min(1, targetProgress + delta * 0.0035));
      if (logoOverlay) logoOverlay.style.transition = 'none';
      startAnim();
    }, { passive: false });

    curtain.addEventListener('click', () => {
      if (!introCompleted) {
        clearTimeout(logoTimer);
        targetProgress = 1;
        if (logoOverlay) logoOverlay.style.transition = 'none';
        startAnim();
      }
    });

    // On mobile: auto-open after 1.8s — filter already removed via CSS
    if (isMobile) {
      setTimeout(() => {
        if (!introCompleted) {
          targetProgress = 1;
          if (logoOverlay) logoOverlay.style.transition = 'none';
          startAnim();
        }
      }, 1800);
    }

    document.body.classList.add('scroll-locked');
  }

  initThreeJS() {
    // Skip Three.js on mobile and low-end devices to save battery/CPU
    if (window.innerWidth < 768 || !window.matchMedia('(hover: hover)').matches) {
      const container = document.getElementById('canvas-container');
      if (container) container.style.display = 'none';
      // Use a simple CSS gradient background instead
      const hero = document.getElementById('hero');
      if (hero) hero.style.background = 'radial-gradient(ellipse at 60% 40%, rgba(201,168,76,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(92,31,64,0.10) 0%, transparent 55%), var(--color-ivory)';
      return;
    }
    const THREE = window.THREE;
    if (!THREE) return;
    const container = document.getElementById('canvas-container');
    if (!container) return;

    let width = container.clientWidth, height = container.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5ebf2);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dl1 = new THREE.DirectionalLight(0xc9a84c, 1.0);
    dl1.position.set(5, 5, 4); scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0x9b4060, 0.7);
    dl2.position.set(-5, -3, 3); scene.add(dl2);

    const goldLight = new THREE.PointLight(0xc9a84c, 1.4, 25); scene.add(goldLight);
    const warmLight = new THREE.PointLight(0xc06080, 0.9, 25); scene.add(warmLight);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(12, 8, 60, 60);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xfaf6ee, roughness: 0.35, metalness: 0.12,
      clearcoat: 0.5, clearcoatRoughness: 0.25, side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const ringGeo = new THREE.TorusGeometry(0.5, 0.12, 16, 80);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, metalness: 0.9, roughness: 0.18 });
    const rings = [
      { x: -3.2, y: 1.5, z: 1.2, sx: 0.9, sy: 0.006, sz: 0.008 },
      { x: -4.0, y: -1.8, z: -0.5, sx: 0.7, sy: 0.008, sz: 0.006 }
    ].map(c => {
      const r = new THREE.Mesh(ringGeo, goldMat);
      r.position.set(c.x, c.y, c.z); r.scale.setScalar(c.sx);
      scene.add(r); return { mesh: r, cfg: c };
    });

    const clock = new THREE.Clock();
    let mouseX = 0, mouseY = 0, heroVisible = true;
    window.addEventListener('mousemove', e => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const hero = document.getElementById('hero');
    const about = document.getElementById('about');
    let heroVis = true, aboutVis = false;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.target.id === 'hero') heroVis = e.isIntersecting;
        else if (e.target.id === 'about') aboutVis = e.isIntersecting;
        heroVisible = heroVis || aboutVis;
        container.style.opacity = heroVisible ? '1' : '0';
        container.style.visibility = heroVisible ? 'visible' : 'hidden';
      });
    }, { threshold: 0.01 });
    if (hero) obs.observe(hero);
    if (about) obs.observe(about);

    const animate = () => {
      requestAnimationFrame(animate);
      if (!heroVisible) return;
      const t = clock.getElapsedTime();
      camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.05;
      const visH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const scrollOff = window.scrollY * (visH / window.innerHeight);
      if (!camera.userData.py) camera.userData.py = 0;
      camera.userData.py += (mouseY * 0.4 - camera.userData.py) * 0.05;
      camera.position.y = camera.userData.py - scrollOff;
      camera.lookAt(camera.position.x, -scrollOff, 0);

      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        pos.setZ(i, Math.sin(x * 1.2 + t * 0.7) * 0.15 + Math.sin(y * 1.8 + t * 0.5) * 0.1 + Math.cos((x + y) * 0.8 + t * 0.9) * 0.06);
      }
      pos.needsUpdate = true;
      geometry.computeVertexNormals();

      goldLight.position.set(Math.sin(t * 0.8) * 5.5, Math.cos(t * 0.6) * 3.8, 3.5 + Math.sin(t * 0.4) * 0.8);
      warmLight.position.set(Math.cos(t * 0.7) * 5.5, Math.sin(t * 0.9) * 3.8, 3.5 + Math.cos(t * 0.5) * 0.8);
      rings.forEach(r => { r.mesh.rotation.x += r.cfg.sy; r.mesh.rotation.y += r.cfg.sz; });

      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
      width = container.clientWidth; height = container.clientHeight;
      camera.aspect = width / height; camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
  }

  initScrollReveals() {
    const els = document.querySelectorAll('.scroll-reveal');
    const obs = new IntersectionObserver((entries, ob) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('reveal-active'); ob.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    els.forEach(el => obs.observe(el));
  }

  initCardTilt() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        card.style.transform = `perspective(1000px) rotateX(${-(y / (r.height / 2)) * 8}deg) rotateY(${(x / (r.width / 2)) * 8}deg) translateY(-8px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  initSwatchParallax() {
    const area = document.querySelector('.about-visual-column');
    const swatches = document.querySelectorAll('.fabric-swatch');
    if (!area || !swatches.length || !window.matchMedia('(hover: hover)').matches) return;
    area.addEventListener('mousemove', e => {
      const r = area.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      swatches.forEach(s => {
        const d = parseFloat(s.getAttribute('data-depth')) || 1;
        s.style.transform = `translate(${x * 0.08 * d}px,${y * 0.08 * d}px) scale(1.02)`;
      });
    });
    area.addEventListener('mouseleave', () => swatches.forEach(s => s.style.transform = ''));
  }

  initCountUp() {
    const nums = document.querySelectorAll('.spec-number');
    if (!nums.length) return;
    nums.forEach(el => { el.textContent = '0' + (el.getAttribute('data-suffix') || ''); });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.getAttribute('data-target')) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        let start = null;
        const step = ts => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / 2000, 1);
          el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target) + suffix;
          if (p < 1) requestAnimationFrame(step); else el.textContent = target + suffix;
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.1 });
    nums.forEach(el => obs.observe(el));
  }

  initModals() {
    const modal = document.getElementById('consultation-modal');
    const drawer = document.getElementById('estimate-drawer');
    const form = document.getElementById('space-planner-form');
    const successView = document.querySelector('.modal-success-view');
    let currentStep = 1;

    const openModal = m => { if (m) { m.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; } };
    const closeModal = m => { if (m) { m.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; } };

    const resetForm = () => {
      currentStep = 1;
      if (form) { form.style.display = 'block'; form.reset(); }
      if (successView) successView.style.display = 'none';
      document.querySelectorAll('.form-step').forEach(s => {
        s.classList.toggle('step-active', parseInt(s.getAttribute('data-step')) === 1);
      });
    };

    document.querySelectorAll('.btn-trigger-consultation').forEach(b => {
      b.addEventListener('click', e => { e.preventDefault(); openModal(modal); resetForm(); });
    });

    // Product / collection cards redirect to Clavyk.com
    document.querySelectorAll('#catalog .product-card, .btn-trigger-estimate').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        window.open('https://clavyk.com', '_blank', 'noopener');
      });
    });

    document.querySelectorAll('.modal-close-btn').forEach(b => b.addEventListener('click', () => closeModal(modal)));
    document.querySelectorAll('.drawer-close-btn').forEach(b => b.addEventListener('click', () => closeModal(drawer)));
    window.addEventListener('click', e => {
      if (e.target === modal) closeModal(modal);
      if (e.target === drawer) closeModal(drawer);
    });

    if (form) {
      form.querySelectorAll('.form-btn-next').forEach(b => b.addEventListener('click', () => {
        if (currentStep < 3) { currentStep++; document.querySelectorAll('.form-step').forEach(s => s.classList.toggle('step-active', parseInt(s.getAttribute('data-step')) === currentStep)); }
      }));
      form.querySelectorAll('.form-btn-prev').forEach(b => b.addEventListener('click', () => {
        if (currentStep > 1) { currentStep--; document.querySelectorAll('.form-step').forEach(s => s.classList.toggle('step-active', parseInt(s.getAttribute('data-step')) === currentStep)); }
      }));
      form.addEventListener('submit', e => {
        e.preventDefault();
        const d = new FormData(form);
        const msg = `*New Space Planner Request*\n\n*Name:* ${d.get('client_name')}\n*Contact:* ${d.get('client_contact')}\n*Project:* ${d.get('project_type')}\n*Needs:* ${d.getAll('styling_needs').join(', ')}\n*Notes:* ${d.get('client_notes')}`;
        const link = document.getElementById('success-wa-link');
        if (link) link.href = `https://wa.me/917030063006?text=${encodeURIComponent(msg)}`;
        form.style.display = 'none';
        if (successView) successView.style.display = 'block';
      });
    }
  }

  setupCalc(product, price, type) {
    const cont = document.getElementById('calculator-inputs-container');
    const disp = document.getElementById('estimate-price-display');
    const submitBtn = document.getElementById('btn-submit-estimate');
    if (!cont || !disp) return;

    let html = '';
    if (type === 'size') {
      html = `<div class="form-field"><label>Select Size</label><select id="calc-size" style="width:100%;padding:0.85rem 1rem;border:1px solid rgba(0,0,0,0.1);border-radius:6px;font-family:DM Sans,sans-serif;font-size:1rem;background:white;"><option value="1">Single (Base)</option><option value="1.5">Queen (+50%)</option><option value="2">King (+100%)</option></select></div>`;
    } else if (type === 'measure') {
      html = `<div class="form-field"><label>Estimated Area (Sq.Ft)</label><input type="number" id="calc-area" min="10" value="100" style="width:100%;padding:0.85rem 1rem;border:1px solid rgba(0,0,0,0.1);border-radius:6px;font-family:DM Sans,sans-serif;font-size:1rem;background:white;"></div>`;
    } else if (type === 'curtain') {
      html = `<div class="form-field"><label>Window Width (Ft)</label><input type="number" id="calc-width" min="3" value="5" style="width:100%;padding:0.85rem 1rem;border:1px solid rgba(0,0,0,0.1);border-radius:6px;font-family:DM Sans,sans-serif;font-size:1rem;background:white;margin-bottom:1rem;"></div><div class="form-field"><label>Window Height (Ft)</label><input type="number" id="calc-height" min="5" value="7" style="width:100%;padding:0.85rem 1rem;border:1px solid rgba(0,0,0,0.1);border-radius:6px;font-family:DM Sans,sans-serif;font-size:1rem;background:white;"></div>`;
    } else {
      html = `<div class="form-field"><label>Quantity</label><input type="number" id="calc-qty" min="1" value="1" style="width:100%;padding:0.85rem 1rem;border:1px solid rgba(0,0,0,0.1);border-radius:6px;font-family:DM Sans,sans-serif;font-size:1rem;background:white;"></div>`;
    }
    cont.innerHTML = html;

    const calc = () => {
      let fp = parseInt(price);
      if (type === 'size') { fp = Math.round(fp * parseFloat(document.getElementById('calc-size').value || 1)); }
      else if (type === 'measure') { fp = Math.round(fp * (parseInt(document.getElementById('calc-area').value) || 0)); }
      else if (type === 'curtain') { fp = Math.round(fp * (parseInt(document.getElementById('calc-width').value) || 0) * (parseInt(document.getElementById('calc-height').value) || 0)); }
      else { fp = Math.round(fp * (parseInt(document.getElementById('calc-qty').value) || 0)); }
      disp.textContent = '₹' + fp.toLocaleString('en-IN');
      if (submitBtn) submitBtn.onclick = () => window.open(`https://wa.me/917030063006?text=${encodeURIComponent(`Hi MK Gallery, I'd like to enquire about ${product}. Estimated price: ₹${fp.toLocaleString('en-IN')}.`)}`, '_blank');
    };
    cont.querySelectorAll('input,select').forEach(el => el.addEventListener('input', calc));
    calc();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  try { new MKGallery().componentDidMount(); }
  catch (e) { console.error('MK Gallery init error', e); }
});
