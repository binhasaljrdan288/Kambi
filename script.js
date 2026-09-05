/**
 * KAMBI - Exclusive Booking Experience (Fictional Prank Demo)
 * Pure Vanilla JavaScript Client-Side Engine
 */

(function () {
  'use strict';

  // --- Audio Synthesis via Web Audio API (No external assets required) ---
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  function playClickSound() {
    playTone(600, 'sine', 0.08, 0.08);
  }

  function playSuccessChime() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          playTone(freq, 'triangle', 0.4, 0.15);
        }, idx * 120);
      });
    } catch (e) {}
  }

  function playComedicFanfare() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const chord = [392, 523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, i) => {
        setTimeout(() => {
          playTone(freq, 'sine', 0.8, 0.2);
        }, i * 90);
      });
    } catch (e) {}
  }

  // --- Confetti Particle System (Pure Canvas Implementation) ---
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let confettiAnimId = null;
  const confettiColors = ['#f59e0b', '#fcd34d', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#ffffff'];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function createConfettiBurst(count = 140) {
    if (!canvas || !ctx) return;
    resizeCanvas();
    particles = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.4;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 8 + Math.random() * 18;
      particles.push({
        x: centerX + (Math.random() - 0.5) * 100,
        y: centerY + (Math.random() - 0.5) * 50,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 6,
        size: 7 + Math.random() * 9,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        wobble: 0,
        wobbleSpeed: 0.05 + Math.random() * 0.1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        alpha: 1,
        gravity: 0.35
      });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    animateConfetti();
  }

  function animateConfetti() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeCount = 0;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotation += p.rotSpeed;
      p.wobble += p.wobbleSpeed;

      if (p.y > canvas.height * 0.8) {
        p.alpha -= 0.02;
      }

      if (p.alpha > 0.05 && p.y < canvas.height + 50) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    });

    if (activeCount > 0) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiAnimId = null;
    }
  }

  // --- State & DOM References ---
  const bookingModal = document.getElementById('bookingModal');
  const checkoutModal = document.getElementById('checkoutModal');
  const finalScreenModal = document.getElementById('finalScreenModal');
  const processingOverlay = document.getElementById('processingOverlay');
  const imageLightbox = document.getElementById('imageLightbox');
  const toastNotice = document.getElementById('toastNotice');

  // Input & summary elements
  const guestNameInput = document.getElementById('guestName');
  const bookingDateInput = document.getElementById('bookingDate');
  const specialRequestInput = document.getElementById('specialRequest');
  const summaryGuestName = document.getElementById('summaryGuestName');
  const summaryDate = document.getElementById('summaryDate');
  const summaryTime = document.getElementById('summaryTime');
  const checkoutGuestName = document.getElementById('checkoutGuestName');
  const finalGuestGreeting = document.getElementById('finalGuestGreeting');

  let selectedTimeSlot = '12:00 PM (Sharp)';

  // Initialize date selector default (tomorrow)
  if (bookingDateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    bookingDateInput.value = dateStr;
    bookingDateInput.min = new Date().toISOString().split('T')[0];
  }

  // --- UI Helpers ---
  function showToast(msg) {
    if (!toastNotice) return;
    toastNotice.textContent = msg;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 3200);
  }

  function updateBookingSummary() {
    const name = guestNameInput && guestNameInput.value.trim() ? guestNameInput.value.trim() : 'Honored Guest';
    const dateVal = bookingDateInput && bookingDateInput.value ? bookingDateInput.value : 'Tomorrow';
    
    if (summaryGuestName) summaryGuestName.textContent = name;
    if (summaryDate) summaryDate.textContent = dateVal;
    if (summaryTime) summaryTime.textContent = selectedTimeSlot;
    if (checkoutGuestName) checkoutGuestName.textContent = name;
    if (finalGuestGreeting) finalGuestGreeting.textContent = `Get ready, ${name}!`;
  }

  function openModal(modalEl) {
    initAudio();
    playClickSound();
    if (modalEl) {
      modalEl.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalEl) {
    playClickSound();
    if (modalEl) {
      modalEl.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function closeAllModals() {
    [bookingModal, checkoutModal, finalScreenModal, imageLightbox].forEach(m => {
      if (m) m.classList.remove('active');
    });
    if (processingOverlay) processingOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // --- Event Listeners Setup ---

  // 1. Audio Toggle Button
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      isSoundEnabled = !isSoundEnabled;
      initAudio();
      audioToggleBtn.innerHTML = isSoundEnabled
        ? '<span>🔊</span> Sound: ON'
        : '<span>🔇</span> Sound: OFF';
      if (isSoundEnabled) playTone(440, 'sine', 0.1, 0.1);
    });
  }

  // 2. Open Booking Modal Trigger Buttons
  const bookTriggers = document.querySelectorAll('.open-booking-trigger');
  bookTriggers.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      updateBookingSummary();
      openModal(bookingModal);
    });
  });

  // 3. Close Buttons for Modals
  const closeBtns = document.querySelectorAll('.close-modal-trigger');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      if (targetId) {
        closeModal(document.getElementById(targetId));
      } else {
        closeAllModals();
      }
    });
  });

  // Close modal when clicking on overlay background
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // 4. Live Updates on Form Inputs
  if (guestNameInput) {
    guestNameInput.addEventListener('input', updateBookingSummary);
  }
  if (bookingDateInput) {
    bookingDateInput.addEventListener('change', updateBookingSummary);
  }

  // Time slot buttons
  const timeSlotBtns = document.querySelectorAll('.time-slot-btn');
  timeSlotBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      timeSlotBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTimeSlot = btn.getAttribute('data-time') || btn.textContent.trim();
      updateBookingSummary();
    });
  });

  // 5. Continue to Demo Checkout Button
  const continueCheckoutBtn = document.getElementById('continueCheckoutBtn');
  if (continueCheckoutBtn) {
    continueCheckoutBtn.addEventListener('click', () => {
      playClickSound();
      updateBookingSummary();
      closeModal(bookingModal);
      setTimeout(() => {
        openModal(checkoutModal);
      }, 150);
    });
  }

  // 6. Payment Modes Simulation Tabs
  const payTabs = document.querySelectorAll('.pay-tab');
  payTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playClickSound();
      payTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.getAttribute('data-mode');
      const simCardNumber = document.getElementById('simCardNumber');
      if (simCardNumber) {
        if (mode === 'upi') {
          simCardNumber.textContent = 'sreehari@kambibank (0 OTP)';
        } else if (mode === 'vibe') {
          simCardNumber.textContent = 'TELEPATHIC TRANSFER 100%';
        } else {
          simCardNumber.textContent = '•••• •••• •••• 0000 (DEMO)';
        }
      }
    });
  });

  // 7. Simulate Demo Payment Click Handler
  const simulatePaymentBtn = document.getElementById('simulatePaymentBtn');
  const processingStepText = document.getElementById('processingStepText');

  const processingSteps = [
    'Connecting to Sreehari Suresh GPS Navigation...',
    'Checking front door clearance...',
    'Calibrating 12:00 PM punctuality meter...',
    'Authorizing ₹0.00 zero-rupee prank transaction...',
    'VIP Clearance Granted: Sreehari has been dispatched!'
  ];

  if (simulatePaymentBtn) {
    simulatePaymentBtn.addEventListener('click', () => {
      playSuccessChime();

      if (processingOverlay) {
        processingOverlay.classList.add('active');
      }

      let stepIdx = 0;
      if (processingStepText) {
        processingStepText.textContent = processingSteps[0];
      }

      const stepInterval = setInterval(() => {
        stepIdx++;
        if (stepIdx < processingSteps.length) {
          if (processingStepText) {
            processingStepText.textContent = processingSteps[stepIdx];
          }
          playTone(400 + stepIdx * 100, 'sine', 0.1, 0.08);
        } else {
          clearInterval(stepInterval);
          // Transition to Final Screen
          setTimeout(() => {
            if (processingOverlay) {
              processingOverlay.classList.remove('active');
            }
            closeModal(checkoutModal);

            // Open Final Celebration Screen!
            openModal(finalScreenModal);
            createConfettiBurst(180);
            playComedicFanfare();

            // Extra confetti burst after 800ms
            setTimeout(() => {
              createConfettiBurst(120);
            }, 800);
          }, 600);
        }
      }, 700);
    });
  }

  // 8. Share Prank Feature
  const sharePrankBtn = document.getElementById('sharePrankBtn');
  if (sharePrankBtn) {
    sharePrankBtn.addEventListener('click', () => {
      playClickSound();
      const guestName = guestNameInput && guestNameInput.value.trim() ? guestNameInput.value.trim() : 'a friend';
      const prankText = `Bro, I just booked Sreehari Suresh on "KAMBI WITH sreehari suresh 🫦" to visit ${guestName} at 12 PM! 😂 DON'T CLOSE YOUR DOORS! Check it out: ${window.location.href}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(prankText).then(() => {
          showToast('📋 Prank message copied to clipboard! Share it with friends!');
        }).catch(() => {
          prompt('Copy this prank message:', prankText);
        });
      } else {
        prompt('Copy this prank message:', prankText);
      }
    });
  }

  // WhatsApp Share button
  const shareWhatsAppBtn = document.getElementById('shareWhatsAppBtn');
  if (shareWhatsAppBtn) {
    shareWhatsAppBtn.addEventListener('click', () => {
      playClickSound();
      const guestName = guestNameInput && guestNameInput.value.trim() ? guestNameInput.value.trim() : 'you';
      const msg = encodeURIComponent(`Bro, Sreehari Suresh is coming at 12 PM! DON'T CLOSE YOUR DOORS! 😂 Check out KAMBI WITH sreehari suresh 🫦: ${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
    });
  }

  // 9. Reset Demo / Book Again
  const resetDemoBtn = document.getElementById('resetDemoBtn');
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', () => {
      playClickSound();
      closeAllModals();
      if (guestNameInput) guestNameInput.value = '';
      updateBookingSummary();
      showToast('🔄 Demo reset! Feel free to prank someone else.');
    });
  }

  // 10. Gallery Photo Lightbox
  const galleryCards = document.querySelectorAll('.gallery-card, .gallery-card-duo');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');

  galleryCards.forEach(card => {
    card.addEventListener('click', e => {
      // If user clicked inside a booking button, do not open lightbox
      if (e.target.closest('.open-booking-trigger')) {
        return;
      }
      playClickSound();
      const img = card.querySelector('.gallery-img, .gallery-duo-img');
      const title = card.querySelector('.gallery-card-title');
      const desc = card.querySelector('.gallery-card-desc');

      if (lightboxImg && img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || 'Sreehari Suresh';
      }
      if (lightboxCaption) {
        lightboxCaption.innerHTML = `<strong>${title ? title.textContent : 'Sreehari Suresh'}</strong><br><span style="font-size:12px;color:#a1a1aa;">${desc ? desc.textContent : ''}</span>`;
      }
      openModal(imageLightbox);
    });
  });

  // Handle ESC key to close active modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Initial update
  updateBookingSummary();
})();
