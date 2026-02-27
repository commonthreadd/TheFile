(function () {
  var SUPABASE_URL = window.SUPABASE_URL || "https://wygjotgkmyqmemqsdqxk.supabase.co";
  var SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "sb_publishable_hTmIIlzIe6io-QkzeVnayw_X_fNRbS5";
  var LOCK_KEY = "tmc_site_unlocked";
  var CODE_UNLOCK_KEY = "tmc_code_unlocked";

  var accessForm = document.getElementById("drop-access");
  var accessCodeInput = document.getElementById("drop-code");
  var form = document.getElementById("drop-login");
  var emailInput = document.getElementById("drop-email");
  var passwordInput = document.getElementById("drop-password");
  var msg = document.getElementById("drop-msg");
  var daysEl = document.getElementById("count-days");
  var hoursEl = document.getElementById("count-hours");
  var minsEl = document.getElementById("count-mins");
  var secsEl = document.getElementById("count-secs");
  var dropTitle = document.getElementById("drop-title");
  var dropCard = document.querySelector(".drop-card");
  var DROP_TARGET_ISO = window.DROP_TARGET_ISO || "2026-07-27T12:00:00Z";
  var DROP_TARGET = new Date(DROP_TARGET_ISO).getTime();
  var hasCodeAccess = window.sessionStorage.getItem(CODE_UNLOCK_KEY) === "1";

  if (!form || !accessForm || !window.supabase || !window.supabase.createClient) return;

  if (hasCodeAccess) {
    revealLogin();
  }
  animateEntrance();
  startCountdown();

  var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: window.localStorage,
    },
  });

  supabaseClient.auth.getSession().then(function (result) {
    var session = result && result.data ? result.data.session : null;
    if (session && session.user) {
      window.localStorage.setItem(LOCK_KEY, "1");
      window.location.replace("/");
    }
  });

  accessForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    var code = String(accessCodeInput.value || "").trim();
    if (!code) {
      setMessage("Enter your access code.", true);
      return;
    }

    setMessage("Verifying access code...", false);

    var check = await verifyAccessCode(code);
    if (!check.ok) {
      setMessage(check.message || "Access code is invalid.", true);
      return;
    }

    window.sessionStorage.setItem(CODE_UNLOCK_KEY, "1");
    revealLogin();
    setMessage("Access code accepted. Member login unlocked.", false);
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!hasCodeAccess) {
      setMessage("Enter access code first.", true);
      return;
    }

    var email = String(emailInput.value || "").trim();
    var password = String(passwordInput.value || "");

    if (!email || !password) {
      setMessage("Enter email and password.", true);
      return;
    }

    setMessage("Verifying access...", false);

    var response = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (response.error) {
      setMessage(response.error.message || "Unable to sign in.", true);
      return;
    }

    window.localStorage.setItem(LOCK_KEY, "1");
    setMessage("Access approved. Entering site...", false);
    window.location.replace("/");
  });

  function setMessage(text, isError) {
    msg.textContent = text || "";
    msg.classList.toggle("error", !!isError);
    msg.classList.toggle("success", !isError && !!text);
  }

  function revealLogin() {
    hasCodeAccess = true;
    form.classList.remove("hidden");
    accessForm.classList.add("hidden");
    emailInput.focus();
  }

  async function verifyAccessCode(code) {
    try {
      var response = await fetch("/api/verify-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code }),
      });

      var payload = {};
      try {
        payload = await response.json();
      } catch (_parseErr) {
        payload = {};
      }

      if (response.ok && payload && payload.ok === true) {
        return { ok: true };
      }

      if (response.status === 500) {
        return { ok: false, message: "Server access code is not configured on Vercel." };
      }

      if (response.status === 404 || response.status === 405) {
        return { ok: false, message: "Access API is unavailable. Redeploy with /api/verify-access." };
      }

      return { ok: false, message: "Access code is invalid." };
    } catch (_err) {
      return { ok: false, message: "Cannot reach access server. Check Vercel deployment." };
    }
  }

  function startCountdown() {
    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

  function updateCountdown() {
    var now = Date.now();
    var diff = DROP_TARGET - now;

    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minsEl.textContent = "00";
      secsEl.textContent = "00";
      if (dropTitle) dropTitle.textContent = "Drop Is Live";
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var mins = Math.floor((totalSeconds % 3600) / 60);
    var secs = totalSeconds % 60;

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent = pad(mins);
    secsEl.textContent = pad(secs);
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function animateEntrance() {
    if (!dropCard) return;
    window.requestAnimationFrame(function () {
      dropCard.classList.add("is-ready");
    });
  }

})();
