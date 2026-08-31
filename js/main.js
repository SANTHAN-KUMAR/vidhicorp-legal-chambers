/* VidhiCorp Legal Chambers — site behaviour */
(function(){
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header ---------- */
  var header = document.querySelector(".site-header");
  function onScroll(){
    if(!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
    var toTop = document.querySelector(".to-top");
    if(toTop) toTop.classList.toggle("is-visible", window.scrollY > 700);
  }
  document.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  /* ---------- Mobile drawer ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var drawer = document.querySelector(".mobile-drawer");
  if(navToggle && drawer){
    navToggle.addEventListener("click", function(){
      var open = drawer.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    drawer.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){
        drawer.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Hero entrance ---------- */
  var hero = document.querySelector(".hero");
  if(hero){
    requestAnimationFrame(function(){
      setTimeout(function(){ hero.classList.add("is-ready"); }, 60);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  if(revealEls.length){
    if(reduceMotion || !("IntersectionObserver" in window)){
      revealEls.forEach(function(el){ el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, {threshold:0.15, rootMargin:"0px 0px -60px 0px"});
      revealEls.forEach(function(el){ io.observe(el); });
    }
  }

  /* ---------- Animated stat counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if(counters.length){
    var animateCount = function(el){
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = el.getAttribute("data-count").indexOf(".") > -1 ? 1 : 0;
      if(reduceMotion){ el.textContent = target + suffix; return; }
      var start = null, dur = 1400;
      function step(ts){
        if(!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = (target * eased).toFixed(decimals);
        el.textContent = val + suffix;
        if(p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
    };
    if("IntersectionObserver" in window){
      var cio = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ animateCount(entry.target); cio.unobserve(entry.target); }
        });
      }, {threshold:0.6});
      counters.forEach(function(el){ cio.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------- Quote / testimonial rotator ---------- */
  var slides = document.querySelectorAll(".quote-slide");
  var dotsWrap = document.querySelector(".quote-dots");
  if(slides.length > 1 && dotsWrap){
    var current = 0;
    dotsWrap.innerHTML = "";
    slides.forEach(function(_, i){
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Show testimonial " + (i+1));
      if(i === 0) b.classList.add("is-active");
      b.addEventListener("click", function(){ show(i); resetTimer(); });
      dotsWrap.appendChild(b);
    });
    function show(i){
      slides[current].classList.remove("is-active");
      dotsWrap.children[current].classList.remove("is-active");
      current = i;
      slides[current].classList.add("is-active");
      dotsWrap.children[current].classList.add("is-active");
    }
    var timer;
    function resetTimer(){
      clearInterval(timer);
      if(reduceMotion) return;
      timer = setInterval(function(){ show((current + 1) % slides.length); }, 6500);
    }
    resetTimer();
  }

  /* ---------- Contact form (front-end only) ---------- */
  var form = document.querySelector("#enquiry-form");
  if(form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var status = form.querySelector(".form-status");
      var required = form.querySelectorAll("[required]");
      var valid = true;
      required.forEach(function(field){
        if(!field.value.trim()){ valid = false; field.style.borderColor = "var(--error)"; }
        else { field.style.borderColor = ""; }
      });
      if(!valid){
        status.textContent = "Please complete the required fields before sending your enquiry.";
        status.className = "form-status is-error";
        return;
      }
      var btn = form.querySelector("button[type=submit]");
      var originalLabel = btn.textContent;
      btn.textContent = "Sending…";
      btn.disabled = true;
      setTimeout(function(){
        status.textContent = "Thank you. Your enquiry has been received — a member of the chambers will respond within one business day.";
        status.className = "form-status is-success";
        form.reset();
        btn.textContent = originalLabel;
        btn.disabled = false;
      }, 900);
    });
  }

  /* ---------- Entry disclaimer (Bar Council of India Rule 36) ---------- */
  var modal = document.querySelector(".disclaimer-modal");
  if(modal){
    var KEY = "vidhicorp_disclaimer_ack";
    var accepted = false;
    try { accepted = sessionStorage.getItem(KEY) === "1"; } catch(err){}
    if(!accepted){
      setTimeout(function(){ modal.classList.add("is-open"); }, 400);
    }
    var acceptBtn = modal.querySelector("[data-accept]");
    if(acceptBtn){
      acceptBtn.addEventListener("click", function(){
        modal.classList.remove("is-open");
        try { sessionStorage.setItem(KEY, "1"); } catch(err){}
      });
    }
  }

  /* ---------- Back to top ---------- */
  var toTopBtn = document.querySelector(".to-top");
  if(toTopBtn){
    toTopBtn.addEventListener("click", function(){
      window.scrollTo({top:0, behavior: reduceMotion ? "auto" : "smooth"});
    });
  }

  /* ---------- Active nav link ---------- */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-drawer a").forEach(function(a){
    var href = a.getAttribute("href");
    if(href === path || (path === "" && href === "index.html")){
      a.classList.add("active");
    }
  });

})();
