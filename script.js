/* An unintrusive little sky: appearance controls, saved locally,
   and two ambient layers that stay out of the way. */
(function () {
  "use strict";

  var root = document.documentElement;
  var modeKey = "gastermmt-theme";
  var hueKey = "gastermmt-hue";
  var effectsKey = "gastermmt-effects";
  var modeChoices = ["auto", "light", "dark"];
  var presets = [
    { name: "晴空", hue: 205 },
    { name: "雾蓝", hue: 220 },
    { name: "薄荷", hue: 160 },
    { name: "樱花", hue: 335 },
    { name: "晚霞", hue: 26 },
    { name: "星紫", hue: 268 }
  ];

  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  var themeColor = document.querySelector('meta[name="theme-color"]');
  var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-appearance-toggle]"));
  var panel = document.getElementById("appearance-panel");
  var closeButton = panel ? panel.querySelector(".appearance-close") : null;
  var modeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-theme-choice]"));
  var swatches = Array.prototype.slice.call(document.querySelectorAll("[data-hue]"));
  var hueSlider = document.getElementById("theme-hue");
  var hueName = document.getElementById("hue-name");
  var effectsToggle = document.getElementById("effects-toggle");
  var resetButton = panel ? panel.querySelector(".appearance-reset") : null;
  var lastTrigger = null;

  var state = {
    mode: validMode(root.dataset.theme) ? root.dataset.theme : "auto",
    hue: readHue(),
    effects: root.dataset.effects === "off" ? "off" : "on"
  };

  function validMode(value) {
    return modeChoices.indexOf(value) !== -1;
  }

  function readHue() {
    var inline = parseFloat(root.style.getPropertyValue("--hue"));
    if (isFinite(inline)) return clampHue(inline);
    var computed = parseFloat(getComputedStyle(root).getPropertyValue("--hue"));
    return isFinite(computed) ? clampHue(computed) : 205;
  }

  function clampHue(value) {
    value = Math.round(Number(value));
    if (!isFinite(value)) return 205;
    return Math.max(0, Math.min(360, value));
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {
      /* Storage may be unavailable; the current page still works. */
    }
  }

  function isDark(mode) {
    return mode === "dark" || (mode === "auto" && systemDark.matches);
  }

  function syncMeta() {
    if (!themeColor) return;
    var lightness = isDark(state.mode) ? "6.5%" : "96%";
    var saturation = isDark(state.mode) ? "30%" : "44%";
    themeColor.setAttribute("content", "hsl(" + state.hue + " " + saturation + " " + lightness + ")");
  }

  function applyMode(mode, persist) {
    if (!validMode(mode)) mode = "auto";
    state.mode = mode;
    root.dataset.theme = mode;

    modeButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === mode));
    });

    syncMeta();
    if (persist) save(modeKey, mode);
  }

  function findPreset(hue) {
    for (var i = 0; i < presets.length; i++) {
      if (Math.abs(presets[i].hue - hue) <= 1) return presets[i];
    }
    return null;
  }

  function applyHue(value, persist) {
    var hue = clampHue(value);
    state.hue = hue;
    root.style.setProperty("--hue", String(hue));

    if (hueSlider) {
      hueSlider.value = String(hue);
      hueSlider.setAttribute("aria-valuetext", hue + " 度");
    }

    var preset = findPreset(hue);
    if (hueName) hueName.textContent = preset ? preset.name : "自定义";
    swatches.forEach(function (swatch) {
      swatch.setAttribute("aria-pressed", String(Number(swatch.dataset.hue) === hue));
    });

    syncMeta();
    if (persist) save(hueKey, hue);
  }

  function applyEffects(value, persist) {
    state.effects = value === "off" ? "off" : "on";
    root.dataset.effects = state.effects;
    if (effectsToggle) effectsToggle.checked = state.effects === "on";
    if (persist) save(effectsKey, state.effects);
  }

  function openPanel(trigger) {
    if (!panel) return;
    lastTrigger = trigger || null;
    panel.hidden = false;
    triggers.forEach(function (item) {
      item.setAttribute("aria-expanded", "true");
    });
    if (closeButton) closeButton.focus();
  }

  function closePanel(restoreFocus) {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    triggers.forEach(function (item) {
      item.setAttribute("aria-expanded", "false");
    });
    if (restoreFocus && lastTrigger) lastTrigger.focus();
  }

  function isPanelClick(target) {
    return panel && target instanceof Node && panel.contains(target);
  }

  // Initial paint state is set by the inline head script. This applies
  // the controls without writing anything back on first load.
  applyMode(state.mode, false);
  applyHue(state.hue, false);
  applyEffects(state.effects, false);
  root.classList.add("theme-ready");

  modeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      applyMode(button.dataset.themeChoice, true);
    });
  });

  swatches.forEach(function (swatch) {
    swatch.addEventListener("click", function () {
      applyHue(Number(swatch.dataset.hue), true);
    });
  });

  if (hueSlider) {
    hueSlider.addEventListener("input", function () {
      applyHue(hueSlider.value, false);
    });
    hueSlider.addEventListener("change", function () {
      save(hueKey, state.hue);
    });
  }

  if (effectsToggle) {
    effectsToggle.addEventListener("change", function () {
      applyEffects(effectsToggle.checked ? "on" : "off", true);
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      applyMode("auto", true);
      applyHue(205, true);
      applyEffects("on", true);
    });
  }

  if (panel) {
    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        if (panel.hidden) openPanel(trigger);
        else closePanel(true);
      });
    });

    if (closeButton) {
      closeButton.addEventListener("click", function () {
        closePanel(true);
      });
    }

    document.addEventListener("click", function (event) {
      if (panel.hidden) return;
      var target = event.target;
      if (isPanelClick(target)) return;
      if (target instanceof Element && target.closest("[data-appearance-toggle]")) return;
      closePanel(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) closePanel(true);
    });
  }

  systemDark.addEventListener("change", function () {
    if (state.mode === "auto") syncMeta();
  });

  window.addEventListener("storage", function (event) {
    if (event.key === modeKey && validMode(event.newValue)) {
      applyMode(event.newValue, false);
    } else if (event.key === hueKey && event.newValue !== null) {
      applyHue(event.newValue, false);
    } else if (event.key === effectsKey) {
      applyEffects(event.newValue, false);
    }
  });

  /* ---------- Ambient sky ---------- */

  var twinkleLayer = document.querySelector(".ambient-twinkles");
  var petalLayer = document.querySelector(".ambient-petals");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function makeTwinkles() {
    if (!twinkleLayer) return;
    var count = window.innerWidth < 720 ? 8 : 16;
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var star = document.createElement("span");
      var dot = Math.random() < 0.32;
      var size = dot ? random(1.6, 3) : random(4, 9);
      star.className = "ambient-twinkle" + (dot ? " is-dot" : "");
      star.style.left = random(1, 99).toFixed(2) + "%";
      star.style.top = random(1, 99).toFixed(2) + "%";
      star.style.setProperty("--size", size.toFixed(1) + "px");
      star.style.setProperty("--duration", random(3.4, 8.5).toFixed(2) + "s");
      star.style.setProperty("--delay", (-random(1, 8)).toFixed(2) + "s");
      fragment.appendChild(star);
    }
    twinkleLayer.appendChild(fragment);
  }

  function makePetals() {
    if (!petalLayer || reduceMotion) return;
    var count = window.innerWidth < 720 ? 5 : 9;
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var petal = document.createElement("span");
      petal.className = "ambient-petal";
      petal.style.setProperty("--x", random(2, 98).toFixed(2) + "%");
      petal.style.setProperty("--size", random(9, 17).toFixed(1) + "px");
      petal.style.setProperty("--duration", random(18, 34).toFixed(1) + "s");
      petal.style.setProperty("--delay", (-random(1, 24)).toFixed(1) + "s");
      petal.style.setProperty("--drift", random(-70, 70).toFixed(0) + "px");
      petal.style.setProperty("--spin", random(180, 560).toFixed(0) + "deg");
      fragment.appendChild(petal);
    }
    petalLayer.appendChild(fragment);
  }

  makeTwinkles();
  makePetals();
})();
