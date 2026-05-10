(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector("#nav-links");
  const navAnchors = document.querySelectorAll(".nav-links a");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navAnchors.forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const page = document.body.dataset.page;
  navAnchors.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const map = {
      home: "index.html",
      about: "about.html",
      license: "license.html",
      privacy: "privacy.html",
      accessibility: "accessibility.html",
      contact: "contact.html",
      impressum: "impressum.html",
    };
    if (page && map[page] && href === map[page]) {
      link.setAttribute("aria-current", "page");
    }
  });

  const cartState = document.querySelector("#cart-state");
  const orderMessage = document.querySelector("#order-message");
  const selectedPlan = { name: "", price: 0 };

  function getStoredValue(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function setStoredValue(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      return;
    }
  }

  function removeStoredValue(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      return;
    }
  }

  function playClickTone() {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextCtor();

    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    const gain2 = audioContext.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, audioContext.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.15);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(587, audioContext.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(392, audioContext.currentTime + 0.2);

    gain1.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

    gain2.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.04, audioContext.currentTime + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(audioContext.destination);
    gain2.connect(audioContext.destination);

    osc1.start();
    osc2.start();
    osc1.stop(audioContext.currentTime + 0.22);
    osc2.stop(audioContext.currentTime + 0.28);

    window.setTimeout(() => {
      audioContext.close().catch(() => {});
    }, 350);
  }

  const orderSummary = document.querySelector("#order-summary");
  const summaryPlan = document.querySelector("#summary-plan");
  const summaryPrice = document.querySelector("#summary-price");

  function updateOrderSummary() {
    if (!orderSummary || !summaryPlan || !summaryPrice) return;
    if (selectedPlan.name) {
      summaryPlan.textContent = selectedPlan.name;
      summaryPrice.textContent = `${selectedPlan.price} €`;
      orderSummary.hidden = false;
    } else {
      orderSummary.hidden = true;
    }
  }

  document.querySelectorAll(".add-plan").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".price-card");
      selectedPlan.name = card?.dataset.plan || "Paket";
      selectedPlan.price = Number(card?.dataset.price || 0);
      setStoredValue("soniklair-plan", JSON.stringify(selectedPlan));
      if (cartState) {
        cartState.textContent = `${selectedPlan.name} ausgewählt: ${selectedPlan.price} € pro Monat inkl. USt.`;
      }
      updateOrderSummary();
      playClickTone();
    });
  });

  const storedPlan = getStoredValue("soniklair-plan");
  if (storedPlan && cartState) {
    try {
      const plan = JSON.parse(storedPlan);
      selectedPlan.name = plan.name;
      selectedPlan.price = plan.price;
      cartState.textContent = `${plan.name} ausgewählt: ${plan.price} € pro Monat inkl. USt.`;
      updateOrderSummary();
    } catch {
      removeStoredValue("soniklair-plan");
    }
  }

  const checkoutForm = document.querySelector("#checkout-form");
  if (checkoutForm && orderMessage) {
    checkoutForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!selectedPlan.name) {
        orderMessage.textContent = "Bitte wählen Sie zuerst ein Paket aus.";
        return;
      }
      const planName = selectedPlan.name;
      orderMessage.textContent = `Eingangsbestätigung (Demo-Bestellung): Anfrage für ${planName} erfasst. Diese Website löst keine Zahlung aus. In einem echten Betrieb würde jetzt automatisch eine Eingangsbestätigung per E-Mail gemäß § 9 ECG versandt.`;
      checkoutForm.reset();
      if (orderSummary) orderSummary.hidden = true;
    });
  }

  const contactForm = document.querySelector("#contact-form");
  const contactMessage = document.querySelector("#contact-message");
  if (contactForm && contactMessage) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      contactMessage.textContent = "Danke. Ihre Nachricht wurde bestätigt. Der serverseitige Versand ist auf dieser Website derzeit nicht aktiv.";
      contactForm.reset();
    });
  }

  const privacyForm = document.querySelector("#privacy-form");
  const privacyMessage = document.querySelector("#privacy-message");
  if (privacyForm && privacyMessage) {
    const checkbox = document.querySelector("#analytics-consent");
    const storedConsent = getStoredValue("soniklair-analytics");
    if (checkbox && storedConsent === "true") checkbox.checked = true;
    privacyForm.addEventListener("submit", (event) => {
      event.preventDefault();
      setStoredValue("soniklair-analytics", String(Boolean(checkbox?.checked)));
      privacyMessage.textContent = "Cookie-Einstellungen lokal gespeichert.";
    });
  }

  const deleteSettingsBtn = document.querySelector("#delete-settings");
  if (deleteSettingsBtn) {
    deleteSettingsBtn.addEventListener("click", () => {
      removeStoredValue("soniklair-plan");
      removeStoredValue("soniklair-analytics");
      const checkbox = document.querySelector("#analytics-consent");
      if (checkbox) checkbox.checked = false;
      const privMsg = document.querySelector("#privacy-message");
      if (privMsg) privMsg.textContent = "Alle lokalen Einstellungen wurden gelöscht.";
    });
  }

  const playButton = document.querySelector("#play-sound");
  if (playButton) {
    playButton.addEventListener("click", playClickTone);
  }

  const canvas = document.querySelector("#signal-canvas");
  if (canvas) {
    const context = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const colors = {
      bg: "#1b3a2f",
      grid: "rgba(200, 230, 212, 0.08)",
      wave: "#c8e6d4",
      highlight: "#e85d3b",
      highlightBg: "rgba(232, 93, 59, 0.15)",
      text: "#faf7f2",
      textMuted: "#c8e6d4"
    };

    function draw() {
      if (!context) return;
      const width = canvas.width;
      const height = canvas.height;

      context.fillStyle = colors.bg;
      context.fillRect(0, 0, width, height);

      context.strokeStyle = colors.grid;
      context.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      const clipStart = width * 0.42;
      const clipEnd = width * 0.62;
      context.fillStyle = colors.highlightBg;
      context.fillRect(clipStart, 60, clipEnd - clipStart, height - 120);

      context.fillStyle = colors.highlight;
      context.fillRect(clipStart, 60, 4, height - 120);
      context.fillRect(clipEnd - 4, 60, 4, height - 120);

      context.lineWidth = 6;
      context.lineCap = "round";
      context.lineJoin = "round";

      context.strokeStyle = colors.wave;
      context.beginPath();
      for (let x = 30; x < width - 30; x += 6) {
        const progress = x / width;
        const baseFreq = 18 + Math.sin(progress * 6) * 8;
        const wave1 = Math.sin(progress * baseFreq + frame * 0.04) * 55;
        const wave2 = Math.sin(progress * 42 - frame * 0.025) * 25;
        const wave3 = Math.sin(progress * 8 + frame * 0.015) * 15;
        const envelope = Math.sin(progress * Math.PI) * 0.7 + 0.3;
        const y = height / 2 + (wave1 + wave2 + wave3) * envelope;
        if (x === 30) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();

      context.shadowColor = "transparent";
      context.fillStyle = colors.text;
      context.font = "600 24px system-ui, sans-serif";
      context.fillText("Clip 04:21 – 05:06", 32, 44);

      context.fillStyle = colors.textMuted;
      context.font = "500 16px system-ui, sans-serif";
      context.fillText("Transkript synchronisiert", 32, height - 28);

      context.font = "500 14px system-ui, sans-serif";
      context.fillStyle = colors.textMuted;
      const timeText = formatTime(frame * 0.016);
      context.fillText(timeText, width - 80, height - 28);

      if (!prefersReducedMotion) {
        frame += 1;
        requestAnimationFrame(draw);
      }
    }

    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60) % 60;
      const secs = Math.floor(seconds) % 60;
      return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    draw();
  }
})();
