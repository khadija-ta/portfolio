(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Typing line (skipped for reduced motion: the static sentence stays) */
  var title = document.getElementById("hero-title");
  var typed = document.getElementById("typed");
  if (!reduce && title && typed) {
    var roles = title.dataset.roles.split("|");
    var r = 0, i = 0, deleting = false;
    title.classList.add("is-typing");
    (function tick() {
      var word = roles[r];
      if (!deleting) {
        i++;
        typed.textContent = word.slice(0, i);
        if (i === word.length) { deleting = true; return setTimeout(tick, 1800); }
        return setTimeout(tick, 70);
      }
      i--;
      typed.textContent = word.slice(0, i);
      if (i === 0) { deleting = false; r = (r + 1) % roles.length; return setTimeout(tick, 350); }
      setTimeout(tick, 35);
    })();
  }

  /* 2. Photo shrinks from the hero into the header corner (transform only) */
  var avatar = document.querySelector(".avatar");
  var slot = document.querySelector(".photo-slot");
  var anchor = document.querySelector(".avatar-anchor");
  var header = document.getElementById("site-header");
  var sx, sy, ex, ey, end, dist, queued = false;

  function measure() {
    var s = slot.getBoundingClientRect(), a = anchor.getBoundingClientRect();
    sx = s.left; sy = s.top + window.scrollY;
    ex = a.left; ey = a.top;
    end = a.width / avatar.offsetWidth;
    dist = Math.max(1, sy - ey);
    update();
  }
  function update() {
    var y = window.scrollY, p = Math.min(1, y / dist);
    var q = reduce ? (p >= 1 ? 1 : 0) : p; /* reduced motion: swap instead of animate */
    var scale = 1 + (end - 1) * q;
    avatar.style.transform = "translate(" + (sx + (ex - sx) * q) + "px," + Math.max(ey, sy - y) + "px) scale(" + scale + ")";
    avatar.style.setProperty("--inv", 1 / scale);
    header.classList.toggle("is-scrolled", y > 8);
    avatar.classList.add("is-ready");
    queued = false;
  }
  if (avatar && slot && anchor) {
    window.addEventListener("scroll", function () {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    measure();
  }

  /* 3. Project filter */
  var filters = document.getElementById("filters");
  if (filters) {
    var buttons = filters.querySelectorAll("button");
    var cards = document.querySelectorAll(".card");
    var status = document.getElementById("filter-status");
    filters.hidden = false;
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.dataset.filter, n = 0;
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", b === btn); });
        cards.forEach(function (c) {
          var show = f === "all" || c.dataset.tags.split(" ").indexOf(f) > -1;
          c.hidden = !show;
          if (show) n++;
        });
        status.textContent = "Showing " + n + (f === "all" ? "" : " " + f) + " project" + (n === 1 ? "" : "s");
      });
    });
  }
})();