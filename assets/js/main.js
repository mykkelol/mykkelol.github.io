/* =========================================================
   Micheal Sihavong — portfolio
   ========================================================= */

(function () {
  "use strict";

  var renderPortrait = function () {};
  var drawLinks = function () {};

  /* ---- Wave-line portrait(s) rendered on canvas ----
     Each horizontal scan line is a sine wave whose amplitude is driven by
     the darkness of the underlying pixel: light areas stay nearly flat,
     dark areas oscillate into dense squiggles. Background is gated + vignetted
     so only the subject remains. Renders every `.js-wave` canvas (the small
     circular avatar and the large hub portrait share the same effect). */
  (function () {
    var canvases = Array.prototype.slice.call(document.querySelectorAll(".js-wave"));
    if (!canvases.length) return;

    var ink = "#9c6a43";
    var lineSpacing = 4;
    var wavelength = 4;
    var stepX = 1.4;

    var sample = document.createElement("canvas");
    var sctx = sample.getContext("2d");

    function drawCover(ctx, image, w, h) {
      var ir = image.width / image.height;
      var tr = w / h;
      var dw, dh;
      if (ir > tr) { dh = h; dw = h * ir; }
      else { dw = w; dh = w / ir; }
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(image, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }

    function render(item) {
      if (!item.loaded) return;
      var canvas = item.canvas;
      var img = item.img;
      var ratio = item.ratio;

      var dpr = window.devicePixelRatio || 1;
      var cssW = canvas.clientWidth;
      if (!cssW) return;
      var cssH = cssW * ratio;

      var W = Math.round(cssW * dpr);
      var H = Math.round(cssH * dpr);
      canvas.width = W;
      canvas.height = H;

      var sc = 280;
      var sr = Math.max(1, Math.round(sc * H / W));
      sample.width = sc;
      sample.height = sr;
      drawCover(sctx, img, sc, sr);
      var data = sctx.getImageData(0, 0, sc, sr).data;

      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = ink;
      ctx.lineWidth = Math.max(1, dpr * 0.9);
      ctx.lineJoin = "round";

      var spacing = lineSpacing * dpr;
      var rows = Math.floor(H / spacing);
      var ampMax = spacing * 1.6;
      var k = (Math.PI * 2) / (wavelength * dpr);
      var dx = stepX * dpr;

      // The source is a transparent cutout, so alpha drives the silhouette:
      // transparent background renders as a flat scan line, while the opaque
      // subject oscillates by tone (darker = bigger squiggle).
      for (var r = 0; r < rows; r++) {
        var y0 = (r + 0.5) * spacing;
        var syRow = Math.min(sr - 1, (y0 / H * sr) | 0);
        var rowOff = syRow * sc;
        var phase = r * 0.6;

        ctx.beginPath();
        for (var x = 0; x <= W; x += dx) {
          var sx = Math.min(sc - 1, (x / W * sc) | 0);
          var i = (rowOff + sx) * 4;
          var a = data[i + 3] / 255;
          var lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;

          var amp = (1 - lum) * a * ampMax;
          var y = y0 + Math.sin(x * k + phase) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // The avatar is a genuine, smaller copy of the hub portrait canvas.
      if (canvas.id === "portraitCanvas") copyToAvatar(canvas);
    }

    function copyToAvatar(portrait) {
      var av = document.getElementById("avatarCanvas");
      if (!av || !portrait.width) return;
      var dpr = window.devicePixelRatio || 1;
      var cssW = av.clientWidth;
      var cssH = av.clientHeight;
      if (!cssW || !cssH) return;
      av.width = Math.round(cssW * dpr);
      av.height = Math.round(cssH * dpr);
      var c = av.getContext("2d");
      c.clearRect(0, 0, av.width, av.height);
      c.drawImage(portrait, 0, 0, portrait.width, portrait.height, 0, 0, av.width, av.height);
    }

    var items = canvases.map(function (canvas) {
      var ratio = parseFloat(canvas.getAttribute("data-ratio")) || (4 / 3);
      var item = { canvas: canvas, ratio: ratio, img: new Image(), loaded: false };
      item.img.onload = function () {
        item.loaded = true;
        render(item);
      };
      item.img.src = canvas.getAttribute("data-src");
      return item;
    });

    function renderAll() {
      items.forEach(render);
    }

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(renderAll, 150);
    });

    renderPortrait = renderAll;
  })();

  /* ---- Merge-style converging connectors ----
     Draws a dashed bezier from each category label into the portrait hub. */
  (function () {
    var merge = document.getElementById("merge");
    var links = document.getElementById("mergeLinks");
    var hub = document.getElementById("mergeHub");
    if (!merge || !links || !hub) return;

    var SVGNS = "http://www.w3.org/2000/svg";

    function draw() {
      if (!merge.offsetParent) return; // hidden panel
      var m = merge.getBoundingClientRect();
      var h = hub.getBoundingClientRect();
      if (!m.width || !h.width) return;

      links.setAttribute("width", m.width);
      links.setAttribute("height", m.height);
      links.setAttribute("viewBox", "0 0 " + m.width + " " + m.height);

      var tx = (h.left - m.left) + Math.min(28, h.width * 0.08);
      var ty = (h.top - m.top) + h.height / 2;

      while (links.firstChild) links.removeChild(links.firstChild);

      var labels = merge.querySelectorAll(".merge-cat__label");
      labels.forEach(function (label) {
        var r = label.getBoundingClientRect();
        var sx = (r.right - m.left) + 10;
        var sy = (r.top - m.top) + r.height / 2;
        var dx = tx - sx;

        var c1x = sx + dx * 0.55;
        var c2x = tx - dx * 0.22;
        var d = "M " + sx + " " + sy +
                " C " + c1x + " " + sy + " " + c2x + " " + ty + " " + tx + " " + ty;

        var path = document.createElementNS(SVGNS, "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "rgba(38,37,30,0.30)");
        path.setAttribute("stroke-width", "1");
        path.setAttribute("stroke-dasharray", "4 4");
        links.appendChild(path);
      });

      var dot = document.createElementNS(SVGNS, "circle");
      dot.setAttribute("cx", tx);
      dot.setAttribute("cy", ty);
      dot.setAttribute("r", "3");
      dot.setAttribute("fill", "#aaa0fa");
      links.appendChild(dot);
    }

    draw();
    window.addEventListener("load", draw);
    if ("fonts" in document) document.fonts.ready.then(draw);

    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(draw, 120);
    });
    if (window.ResizeObserver) {
      new ResizeObserver(function () { draw(); }).observe(hub);
    }

    drawLinks = draw;
  })();

  /* ---- Projects: align description start across a row ----
     Project titles run one or two lines depending on viewport width. To keep
     every card's description starting at the same y within a grid row, measure
     the tallest title sharing a row (same top offset) and grow the others to
     match. This avoids permanently reserving two lines (wasted space when all
     titles fit on one) while staying aligned when a title wraps on smaller
     screens. Recomputes on resize and whenever the panel becomes visible. */
  (function () {
    var panel = document.querySelector('.canvas-panel[data-panel="projects"]');
    if (!panel) return;
    var titles = Array.prototype.slice.call(panel.querySelectorAll(".project__title"));
    if (!titles.length) return;

    function equalize() {
      if (panel.hidden) return;
      titles.forEach(function (t) { t.style.minHeight = ""; });
      // Group titles by their top offset; titles on the same row share one.
      var rows = {};
      titles.forEach(function (t) {
        var key = Math.round(t.getBoundingClientRect().top);
        (rows[key] = rows[key] || []).push(t);
      });
      Object.keys(rows).forEach(function (key) {
        var group = rows[key];
        var max = 0;
        group.forEach(function (t) { max = Math.max(max, t.offsetHeight); });
        group.forEach(function (t) { t.style.minHeight = max + "px"; });
      });
    }

    var raf;
    function schedule() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(equalize);
    }

    window.addEventListener("resize", schedule);
    if (window.MutationObserver) {
      new MutationObserver(schedule).observe(panel, {
        attributes: true,
        attributeFilter: ["hidden"]
      });
    }
    schedule();
  })();

  /* ---- Projects: expandable cards that auto-rotate ----
     One card is expanded at a time. A timer advances to the next card by
     shrinking the current and growing the next; clicking a card jumps to it
     and restarts the timer. */
  (function () {
    var groups = Array.prototype.slice.call(document.querySelectorAll(".talks-cards"));
    if (!groups.length) return;

    var DELAY = 4000;

    groups.forEach(function (group) {
      var cards = Array.prototype.slice.call(group.querySelectorAll(".project-card"));
      if (!cards.length) return;

      var delay = parseInt(group.getAttribute("data-delay"), 10) || DELAY;
      var active = 0;
      var timer = null;

      // The expanded card plays its looping preview; collapsed cards show
      // the still image to keep things calm and save decode work.
      function syncMedia(card, isActive) {
        var vid = card.querySelector(".thumbnail-video");
        var still = card.querySelector(".still-thumbnail");
        if (!vid || !still) return;
        if (isActive) {
          still.hidden = true;
          vid.style.display = "block";
          try { vid.currentTime = 0; var p = vid.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
        } else {
          try { vid.pause(); } catch (e) {}
          vid.style.display = "none";
          still.hidden = false;
        }
      }

      function setActive(next) {
        next = (next + cards.length) % cards.length;
        cards[active].classList.remove("is-active");
        syncMedia(cards[active], false);
        cards[next].classList.add("is-active");
        syncMedia(cards[next], true);
        active = next;
      }

      function start() {
        stop();
        timer = setInterval(function () {
          setActive(active + 1);
        }, delay);
      }

      function stop() {
        if (timer) { clearInterval(timer); timer = null; }
      }

      cards.forEach(function (card, i) {
        syncMedia(card, i === active);
        card.addEventListener("click", function (e) {
          // Let the play button open the modal without hijacking the click.
          if (e.target.closest(".play-button")) return;
          if (i !== active) setActive(i);
          start();
        });
      });

      // Pause while the host panel is hidden so the rotation only runs
      // when it's actually on screen.
      var panel = group.closest(".canvas-panel");
      function sync() {
        if (panel && panel.hidden) stop();
        else start();
      }
      if (window.MutationObserver && panel) {
        new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ["hidden"] });
      }
      sync();
    });
  })();

  /* ---- Talks: Netflix-style billboard + rail ----
     The featured talk plays a muted looping preview on a full-bleed hero with
     the title, description, and Play action overlaid. A "Trending Now"
     thumbnail rail below swaps the featured talk (with a crossfade); clicking
     the hero or Play opens the shared video modal (handled below). */
  (function () {
    var root = document.getElementById("talksFeature");
    if (!root) return;
    var billboard = root.querySelector(".billboard");
    var heroVideo = root.querySelector(".billboard__video");
    var playBtn = root.querySelector(".bb-btn--play");
    var ratingEl = root.querySelector(".billboard__rating");
    var railRow = root.querySelector(".talks-rail__row");

    var FADE_MS = 300; // must match the opacity transition in CSS

    // Add talks here as media lands in talks/. Example entry:
    // {
    //   title: "My Talk Title",
    //   tag: "Conference Talk",
    //   year: "2026",
    //   subtext: "30 minutes",
    //   description: "What the talk covers.",
    //   badges: ["Keynote"],
    //   preview: "talks/videos/my-talk-prev.mp4",
    //   still: "talks/images/my-talk.png",
    //   src: "talks/videos/my-talk.mp4",
    //   main: true
    // }
    var videos = [
      {
        title: "Claude Accounting",
        tag: "Agent Demo",
        year: "April 2025",
        subtext: "3 minutes",
        description: "Agentic AI for accountants. My Anthropic x PearVC Hackathon submission, selected as a finalist among 200+ hackers and 75+ teams.",
        preview: "talks/videos/claude-accounting-prev.mp4",
        still: "projects/anthropic/images/claude-code.png",
        src: "talks/videos/claude-accounting.mp4",
        main: true
      },
      {
        title: "Claude Procure to Pay Agent",
        tag: "Agent Demo",
        year: "June 2025",
        subtext: "2 minutes",
        description: "Cross-functional agent that lives directly in your Slack, helping the Procurement and T&E teams expedite spend and expense approvals.",
        preview: "talks/videos/claude-p2p-agent-prev.mp4",
        still: "projects/anthropic/images/claude-person.png",
        src: "talks/videos/claude-p2p-agent.mp4"
      },
      {
        title: "Oracle NetSuite SuiteWorld",
        tag: "Conference Talk",
        year: "October 2025",
        subtext: "4 minutes",
        description: "Billing Agent directly in your ERP of choice. Here, I share how accountants can pair billing with an agent directly in Oracle NetSuite.",
        preview: "talks/videos/suiteworld-prev.mp4",
        src: "talks/videos/suiteworld.mp4"
      }
    ];

    // Nothing to feature yet; keep the billboard hidden until talks land.
    if (!videos.length) {
      root.hidden = true;
      return;
    }

    // Feature the "main" talk first; the rest rotate behind it in order.
    var mainIdx = videos.reduce(function (acc, v, i) { return v.main ? i : acc; }, 0);
    videos = videos.slice(mainIdx).concat(videos.slice(0, mainIdx));

    function esc(s) {
      return String(s).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }

    var panel = root.closest(".canvas-panel");
    var current = -1;
    var switching = false;

    // ---- Trending Now rail ----
    var thumbEls = [];
    videos.forEach(function (v, i) {
      var b = document.createElement("button");
      b.className = "rail-card";
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", "false");
      b.setAttribute("aria-label", "Feature " + v.title);
      b.innerHTML =
        '<span class="rail-card__media-box">' +
          (v.still
            ? '<img class="rail-card__media" src="' + v.still + '" alt="" loading="lazy">'
            : '<video class="rail-card__media" muted playsinline preload="metadata" src="' + v.preview + '"></video>') +
        "</span>" +
        '<span class="rail-card__panel" aria-hidden="true"><span class="rail-card__panel-inner">' +
          '<span class="rail-card__panel-body">' +
            (v.year ? '<span class="rail-card__panel-date">' + esc(v.year) + "</span>" : "") +
            '<span class="rail-card__panel-title">' + esc(v.title) + "</span>" +
            '<span class="rail-card__panel-desc">' + esc(v.description || "") + "</span>" +
            (v.subtext ? '<span class="rail-card__panel-duration">' + esc(v.subtext) + "</span>" : "") +
          "</span>" +
          '<span class="rail-card__panel-foot" data-video="' + v.src + '" data-title="' + esc(v.title) + '">' +
            '<span class="rail-card__panel-cta">Watch now</span>' +
            '<span class="rail-card__go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>' +
          "</span>" +
        "</span></span>";
      b.addEventListener("click", function (e) {
        // "Watch now" opens the player straight away (the shared modal
        // listener picks it up via data-video); feature the card too so the
        // billboard matches when the player closes.
        if (e.target.closest(".rail-card__panel-foot")) {
          select(i);
          return;
        }
        // Featured card acts as a play button; the rest swap the billboard.
        if (b.classList.contains("is-active")) playBtn.click();
        else select(i);
      });
      railRow.appendChild(b);
      thumbEls.push(b);
    });

    function render(v) {
      ratingEl.textContent = v.subtext || "";

      playBtn.setAttribute("data-video", v.src);
      playBtn.setAttribute("data-title", v.title);
      playBtn.setAttribute("data-duration", v.subtext);
      playBtn.setAttribute("aria-label", "Play " + v.title);

      // Looping muted preview; the still acts as a poster while it loads.
      if (v.still) heroVideo.setAttribute("poster", v.still);
      else heroVideo.removeAttribute("poster");
      heroVideo.src = v.preview;
      syncHero();
    }

    // Play the hero preview only while the Talks panel is visible.
    function syncHero() {
      try {
        if (panel && panel.hidden) {
          heroVideo.pause();
        } else {
          heroVideo.currentTime = 0;
          var p = heroVideo.play();
          if (p && p.catch) p.catch(function () {});
        }
      } catch (e) {}
    }

    function select(i) {
      if (i === current || switching) return;
      var first = current === -1;
      current = i;

      thumbEls.forEach(function (el, idx) {
        var on = idx === current;
        el.classList.toggle("is-active", on);
        el.setAttribute("aria-selected", on ? "true" : "false");
      });

      if (first) {
        render(videos[current]);
        return;
      }

      // Crossfade: fade the hero out, swap content, fade back in.
      switching = true;
      billboard.classList.add("is-switching");
      setTimeout(function () {
        render(videos[current]);
        billboard.classList.remove("is-switching");
        switching = false;
      }, FADE_MS);
    }

    // Clicking the hero (outside the action buttons) plays the full video.
    billboard.addEventListener("click", function (e) {
      if (e.target.closest(".bb-btn")) return;
      playBtn.click();
    });

    select(0);

    // Pause/resume the hero preview as the Talks panel hides and shows.
    if (window.MutationObserver && panel) {
      new MutationObserver(syncHero).observe(panel, { attributes: true, attributeFilter: ["hidden"] });
    }
  })();

  /* ---- Projects: play button opens a video modal ---- */
  (function () {
    var modal = document.getElementById("videoModal");
    if (!modal) return;
    var container = document.getElementById("videoModalContainer");
    var closeBtn = modal.querySelector(".video-modal__close");

    function open(src, title) {
      if (!src) return;
      var video = document.createElement("video");
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      if (title) video.setAttribute("aria-label", title);
      var source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4";
      video.appendChild(source);
      container.innerHTML = "";
      container.appendChild(video);

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      container.innerHTML = "";
      document.body.style.overflow = "";
    }

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-video]");
      if (!btn) return;
      e.preventDefault();
      open(btn.getAttribute("data-video"), btn.getAttribute("data-title"));
    });

    if (closeBtn) closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
  })();

  /* ---- Theme toggle: single icon action, persisted ---- */
  (function () {
    var toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;
    var root = document.documentElement;

    // The intro figure lives in an <object>, so page CSS can't theme it.
    // Mirror the theme as a .dark class on the SVG root; the SVG's own styles
    // flip the line art while leaving the logo hover colors untouched.
    var introArt = document.querySelector(".intro-art");
    function syncIntroArt() {
      var doc = introArt && introArt.contentDocument;
      var svg = doc && doc.querySelector("svg");
      if (svg) {
        svg.classList.toggle("dark", root.getAttribute("data-theme") === "dark");
      }
    }
    if (introArt) introArt.addEventListener("load", syncIntroArt);

    function apply(theme) {
      root.setAttribute("data-theme", theme);
      try { localStorage.setItem("theme", theme); } catch (e) {}
      syncIntroArt();
      toggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }

    apply(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

    toggle.addEventListener("click", function () {
      apply(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  })();

  /* ---- Tabs: active-state + swap the left canvas panel ---- */
  (function () {
    var tabs = document.getElementById("tabs");
    if (!tabs) return;
    var panels = document.querySelectorAll(".canvas-panel[data-panel]");
    var copies = document.querySelectorAll(".hero__body[data-copy]");

    tabs.addEventListener("click", function (e) {
      var btn = e.target.closest(".tab");
      if (!btn || !tabs.contains(btn)) return;

      var current = tabs.querySelector(".tab.is-active");
      if (current === btn) return;
      if (current) current.classList.remove("is-active");
      btn.classList.add("is-active");

      var name = btn.getAttribute("data-tab");
      panels.forEach(function (p) {
        p.hidden = p.getAttribute("data-panel") !== name;
      });
      copies.forEach(function (c) {
        c.hidden = c.getAttribute("data-copy") !== name;
      });

      // The Intro panel hosts the portrait + connectors, which need a fresh
      // measure/draw once the panel becomes visible.
      requestAnimationFrame(function () {
        renderPortrait();
        drawLinks();
      });
    });
  })();

  // ---- Hero workflow links: hovering a phrase lights up the matching logo
  // blocks inside the intro SVG (loaded via <object>, same-origin).
  (function () {
    var art = document.querySelector(".intro-art");
    if (!art) return;

    // "js" and "python" live in the shared feet cube and use their own
    // lit classes so each half can light independently.
    function resolve(name) {
      if (name === "js") return { id: "cube-feet", cls: "lit-js" };
      if (name === "python") return { id: "cube-feet", cls: "lit-py" };
      return { id: "cube-" + name, cls: "lit" };
    }

    var wired = false;
    function wire() {
      if (wired) return;
      var doc = art.contentDocument;
      if (!doc || !doc.querySelector("svg")) return;
      wired = true;

      document.querySelectorAll(".flow-link[data-cubes]").forEach(function (link) {
        var targets = link.getAttribute("data-cubes").split(",").map(resolve);

        function toggle(on) {
          targets.forEach(function (t) {
            var el = doc.getElementById(t.id);
            if (el) el.classList.toggle(t.cls, on);
          });
        }

        link.addEventListener("mouseenter", function () { toggle(true); });
        link.addEventListener("mouseleave", function () { toggle(false); });
      });

      // Cube tooltips: hovering a logo block shows the tool's name, matching
      // the Projects tab's icon tooltips. The chip lives in the page document
      // (the SVG is a separate <object> document) and is positioned above the
      // hovered cube.
      var CUBE_NAMES = {
        workday: "Workday",
        stripe: "Stripe",
        snowflake: "Snowflake",
        adp: "ADP",
        aws: "AWS",
        oracle: "Oracle",
        ramp: "Ramp",
        salesforce: "Salesforce",
        coupa: "Coupa",
        avalara: "Avalara",
        airflow: "Airflow",
        postgres: "Postgres",
        workato: "Workato",
        feet: "JavaScript & Python"
      };

      var tip = document.createElement("div");
      tip.className = "intro-tip";
      document.body.appendChild(tip);

      function hideTip() {
        tip.classList.remove("is-visible");
      }

      Array.prototype.slice.call(doc.querySelectorAll('g[id^="cube-"]')).forEach(function (cube) {
        var name = CUBE_NAMES[cube.id.replace("cube-", "")];
        if (!name) return;

        cube.addEventListener("mouseenter", function () {
          var artRect = art.getBoundingClientRect();
          var r = cube.getBoundingClientRect();
          tip.textContent = name;
          tip.style.left = (artRect.left + r.left + r.width / 2) + "px";
          tip.style.top = (artRect.top + r.top) + "px";
          tip.classList.add("is-visible");
        });
        cube.addEventListener("mouseleave", hideTip);
      });

      // Person-figure: hover lights all logos; click toggles pinned (logos stay
      // lit until clicked again).
      var svgRoot = doc.querySelector("svg");
      var personFig = doc.getElementById("person-figure");
      if (svgRoot && personFig) {
        var personPinned = false;
        var personHovering = false;

        function syncAllLit() {
          svgRoot.classList.toggle("all-lit", personHovering || personPinned);
        }

        personFig.addEventListener("mouseenter", function () {
          personHovering = true;
          syncAllLit();
        });
        personFig.addEventListener("mouseleave", function () {
          personHovering = false;
          syncAllLit();
        });
        personFig.addEventListener("click", function () {
          personPinned = !personPinned;
          syncAllLit();
        });
      }
    }

    // The <object>'s placeholder document can report readyState "complete"
    // before the SVG is actually loaded, so try now and again on load.
    wire();
    art.addEventListener("load", wire);
  })();
})();
