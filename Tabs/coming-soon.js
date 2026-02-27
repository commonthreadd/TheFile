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
  var hasCodeAccess = window.sessionStorage.getItem(CODE_UNLOCK_KEY) === "1";

  if (!form || !accessForm || !window.supabase || !window.supabase.createClient) return;

  if (hasCodeAccess) {
    revealLogin();
  }

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
      window.location.replace("index.html");
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

    var allowed = await verifyAccessCode(code);
    if (!allowed) {
      setMessage("Access code is invalid.", true);
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
    window.location.replace("index.html");
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

      if (!response.ok) return false;
      var payload = await response.json();
      return payload && payload.ok === true;
    } catch (_err) {
      return false;
    }
  }
})();
