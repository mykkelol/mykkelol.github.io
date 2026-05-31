/* =========================================================
   Micheal Sihavong — portfolio
   Builds the contribution-style banner grid using a
   neutral/purple palette inspired by cursor.com (light mode).
   ========================================================= */

(function () {
  "use strict";

  var grid = document.getElementById("bannerGrid");
  if (!grid) return;

  // Cursor-flavored light palette: mostly faint gray with
  // occasional purple "active" cells.
  var palette = [
    "#ececec", "#ececec", "#ececec", "#e4e4e4",
    "#e6e2f6", "#d9d2f3", "#c5b8ee", "#aaa0fa", "#6049b3"
  ];

  function weightedColor() {
    // Bias heavily toward the empty/faint end of the palette.
    var r = Math.random();
    var idx;
    if (r < 0.55) idx = 0 + Math.floor(Math.random() * 4);      // faint grays
    else if (r < 0.85) idx = 4 + Math.floor(Math.random() * 2); // light purple
    else idx = 6 + Math.floor(Math.random() * 3);               // strong purple
    return palette[Math.min(idx, palette.length - 1)];
  }

  function buildGrid() {
    var styles = getComputedStyle(grid);
    var padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    var cell = 14, gap = 5;
    var usableWidth = grid.clientWidth - padX;
    var cols = Math.max(1, Math.floor((usableWidth + gap) / (cell + gap)));
    var rows = 8;
    var total = cols * rows;

    var frag = document.createDocumentFragment();
    for (var i = 0; i < total; i++) {
      var span = document.createElement("span");
      span.className = "banner__cell";
      span.style.background = weightedColor();
      frag.appendChild(span);
    }
    grid.innerHTML = "";
    grid.appendChild(frag);
  }

  buildGrid();

  // Debounced rebuild on resize so the grid stays full-width.
  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(buildGrid, 150);
  });
})();
