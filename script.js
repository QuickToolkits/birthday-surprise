
/* =====================================
   ROMANTIC BIRTHDAY WEBSITE
   File: script.js
===================================== */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) =>
    root.querySelector(selector);

  /* =====================================
     1. CREATE TWINKLING STARS
  ===================================== */

  const stars = $("#stars");

  if (stars) {
    for (let i = 0; i < 75; i++) {
      const star = document.createElement("span");

      star.className = "star";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.setProperty(
        "--dur",
        1.5 + Math.random() * 4 + "s"
      );
      star.style.animationDelay = Math.random() * 4 + "s";

      stars.appendChild(star);
    }
  }

  /* =====================================
     2. FLOATING HEARTS AND SPARKLES
  ===================================== */

  const floatLayer = $("#floatLayer");
  const symbols = ["♡", "♥", "✦", "✧", "💗", "💕"];

  if (floatLayer) {
    for (let i = 0; i < 28; i++) {
      const heart = document.createElement("span");

      heart.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];

      heart.style.position = "absolute";
      heart.style.left = Math.random() * 100 + "%";
      heart.style.bottom = "-40px";
      heart.style.fontSize = 12 + Math.random() * 22 + "px";
      heart.style.color = i % 2 ? "#ff8ab8" : "#ffd6e7";
      heart.style.opacity = "0";
      heart.style.textShadow = "0 0 15px #ff4d91";
      heart.style.pointerEvents = "none";

      const duration = 10 + Math.random() * 12;

      heart.style.animation =
        `floatUp ${duration}s linear ${Math.random() * 12}s infinite`;

      floatLayer.appendChild(heart);
    }

    const floatingStyle = document.createElement("style");

    floatingStyle.textContent = `
      @keyframes floatUp {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 0;
        }

        12% {
          opacity: 0.65;
        }

        85% {
          opacity: 0.5;
        }

        100% {
          transform: translateY(-115vh) rotate(240deg);
          opacity: 0;
        }
      }
    `;

    document.head.appendChild(floatingStyle);
  }

  /* =====================================
     3. SCROLL REVEAL ANIMATIONS
  ===================================== */

  const revealElements = document.querySelectorAll(
    ".reveal, [data-photo-card]"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  /* =====================================
     4. OPEN LOVE LETTER BUTTON
  ===================================== */

  const openBtn = $("#openBtn");
  const letterSection = $("#letterSection");

  if (openBtn && letterSection) {
    openBtn.addEventListener("click", () => {
      letterSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      startTune();
      burstConfetti(80);
    });
  }

  /* =====================================
     5. PHOTO PREVIEW
  ===================================== */

  document.querySelectorAll("[data-photo-input]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Bhai, please ek valid image select karo. ❤️");
        return;
      }

      const imageId = input.dataset.photoInput;
      const placeholderId = input.dataset.placeholder;

      const image = document.getElementById(imageId);
      const placeholder = document.getElementById(placeholderId);

      if (!image || !placeholder) return;

      const reader = new FileReader();

      reader.onload = () => {
        image.src = reader.result;
        image.style.display = "block";
        placeholder.style.display = "none";
      };

      reader.readAsDataURL(file);
    });
  });

  /* =====================================
     6. BIRTHDAY TUNE
     Synthesized melody using Web Audio API
  ===================================== */

  let audioContext = null;
  let masterGain = null;
  let tuneOn = false;
  let tuneTimer = null;
  let noteIndex = 0;

  const musicBtn = $("#musicBtn");

  const melody = [
    392, 392, 440, 392, 523, 494,
    392, 392, 440, 392, 587, 523,
    392, 392, 784, 659, 523, 494,
    440, 698, 698, 659, 523, 587, 523,
  ];

  const durations = [
    0.28, 0.28, 0.55, 0.55, 0.55, 1,
    0.28, 0.28, 0.55, 0.55, 0.55, 1,
    0.28, 0.28, 0.55, 0.55, 0.55, 0.55,
    1, 0.28, 0.28, 0.55, 0.55, 0.55, 1,
  ];

  function updateMusicButton() {
    if (!musicBtn) return;

    musicBtn.textContent = tuneOn
      ? "♫ Birthday tune: ON"
      : "♫ Play birthday tune";

    musicBtn.setAttribute(
      "aria-pressed",
      String(tuneOn)
    );
  }

  function playNote(frequency, duration) {
    if (!audioContext || !masterGain) return;

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const noteGain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(
      0.12,
      now + 0.025
    );

    noteGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration * 0.9
    );

    oscillator.connect(noteGain);
    noteGain.connect(masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  function playNextNote() {
    if (!tuneOn) return;

    const duration = durations[noteIndex];

    playNote(melody[noteIndex], duration);

    noteIndex = (noteIndex + 1) % melody.length;

    tuneTimer = setTimeout(
      playNextNote,
      duration * 1000 + 60
    );
  }

  async function startTune() {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        if (musicBtn) {
          musicBtn.textContent = "Audio not supported";
        }
        return;
      }

      if (!audioContext) {
        audioContext = new AudioContextClass();

        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.65;
        masterGain.connect(audioContext.destination);
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (tuneOn) return;

      tuneOn = true;
      updateMusicButton();
      playNextNote();
    } catch (error) {
      console.warn("Birthday tune could not start:", error);
    }
  }

  function stopTune() {
    tuneOn = false;

    clearTimeout(tuneTimer);
    updateMusicButton();

    if (masterGain && audioContext) {
      masterGain.gain.setTargetAtTime(
        0.0001,
        audioContext.currentTime,
        0.04
      );
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener("click", async () => {
      if (tuneOn) {
        stopTune();
      } else {
        if (masterGain && audioContext) {
          masterGain.gain.setTargetAtTime(
            0.65,
            audioContext.currentTime,
            0.04
          );
        }

        await startTune();
      }
    });
  }

  /* =====================================
     7. CONFETTI ANIMATION
  ===================================== */

  const canvas = $("#confetti");
  const ctx = canvas?.getContext("2d");

  let confettiPieces = [];
  let animationFrame = null;

  function resizeCanvas() {
    if (!canvas || !ctx) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  if (canvas && ctx) {
    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
  }

  function burstConfetti(count = 120) {
    if (!canvas || !ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < count; i++) {
      confettiPieces.push({
        x: width * (0.2 + Math.random() * 0.6),
        y: height * (0.15 + Math.random() * 0.3),
        vx: (Math.random() - 0.5) * 8,
        vy: -2 - Math.random() * 7,
        size: 3 + Math.random() * 6,
        life: 80 + Math.random() * 50,
        hue: 325 + Math.random() * 70,
        rotation: Math.random() * 6,
        spin: (Math.random() - 0.5) * 0.2,
      });
    }

    if (!animationFrame) {
      drawConfetti();
    }
  }

  function drawConfetti() {
    if (!canvas || !ctx) return;

    ctx.clearRect(
      0,
      0,
      window.innerWidth,
      window.innerHeight
    );

    confettiPieces = confettiPieces.filter(
      (piece) =>
        piece.life > 0 &&
        piece.y < window.innerHeight + 40
    );

    confettiPieces.forEach((piece) => {
      piece.x += piece.vx;
      piece.y += piece.vy;

      piece.vy += 0.13;
      piece.vx *= 0.992;
      piece.rotation += piece.spin;
      piece.life--;

      ctx.save();

      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);

      ctx.fillStyle = `hsl(${piece.hue} 90% 72%)`;

      ctx.fillRect(
        -piece.size / 2,
        -piece.size / 2,
        piece.size,
        piece.size * 1.6
      );

      ctx.restore();
    });

    if (confettiPieces.length > 0) {
      animationFrame = requestAnimationFrame(drawConfetti);
    } else {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;

      ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
      );
    }
  }

  /* =====================================
     8. FINAL BIRTHDAY WISH BUTTON
  ===================================== */

  const wishBtn = $("#wishBtn");
  const wishMessage = $("#wishMessage");

  if (wishBtn && wishMessage) {
    wishBtn.addEventListener("click", () => {
      wishMessage.hidden = false;

      wishMessage.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      burstConfetti(180);
      startTune();

      wishBtn.textContent = "I Love You, Meri Jaan ❤️";
    });
  }

  /* =====================================
     9. INITIAL STATE
  ===================================== */

  updateMusicButton();

  // Music is started after a user interaction because
  // browsers commonly block automatic audio playback.
});
