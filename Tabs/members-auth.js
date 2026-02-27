(function () {
  const SUPABASE_URL = window.SUPABASE_URL || "https://wygjotgkmyqmemqsdqxk.supabase.co";
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "sb_publishable_hTmIIlzIe6io-QkzeVnayw_X_fNRbS5";

  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const messageEl = document.getElementById("auth-message");
  const resetPasswordBtn = document.getElementById("reset-password-btn");
  const signOutBtn = document.getElementById("sign-out-btn");
  const memberPanel = document.getElementById("member-panel");
  const memberEmail = document.getElementById("member-email");

  if (!window.supabase || !window.supabase.createClient) {
    setMessage("Supabase SDK failed to load.", true);
    return;
  }

  const isConfigured =
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("YOUR_PROJECT_ID") &&
    !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY");

  if (!isConfigured) {
    setMessage("Add your Supabase URL and anon key in members-auth.js (or set window.SUPABASE_URL / window.SUPABASE_ANON_KEY).", true);
    form.classList.remove("hidden");
    return;
  }

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: window.localStorage,
    },
  });

  initialize();

  function initialize() {
    form.addEventListener("submit", onSignIn);
    resetPasswordBtn.addEventListener("click", onResetPassword);
    signOutBtn.addEventListener("click", onSignOut);

    supabaseClient.auth.onAuthStateChange(function (_event, session) {
      renderSession(session);
    });

    supabaseClient.auth.getSession().then(function ({ data, error }) {
      if (error) {
        setMessage(error.message || "Unable to load your session.", true);
        return;
      }
      renderSession(data.session || null);
    });
  }

  async function onSignIn(event) {
    event.preventDefault();
    setMessage("Signing in...", false);

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      setMessage("Enter email and password.", true);
      return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message || "Sign in failed.", true);
      return;
    }

    const nameHint = email.split("@")[0] || "Member";
    sessionStorage.setItem("tmc_welcome_name", nameHint);
    localStorage.setItem("tmc_site_unlocked", "1");
    passwordInput.value = "";
    setMessage("Welcome back. Redirecting to cart...", false);
    window.location.href = "cart.html?welcome=1";
  }

  async function onResetPassword() {
    const email = emailInput.value.trim();
    if (!email) {
      setMessage("Enter your email first, then click Forgot password.", true);
      return;
    }

    setMessage("Sending password reset email...", false);

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });

    if (error) {
      setMessage(error.message || "Password reset failed.", true);
      return;
    }

    setMessage("Password reset email sent.", false);
  }

  async function onSignOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      setMessage(error.message || "Sign out failed.", true);
      return;
    }

    localStorage.removeItem("tmc_site_unlocked");
    sessionStorage.removeItem("tmc_code_unlocked");
    setMessage("Signed out.", false);
  }

  function renderSession(session) {
    const loggedIn = !!session && !!session.user;

    if (loggedIn) {
      memberEmail.textContent = session.user.email || "Unknown email";
      memberPanel.classList.remove("hidden");
      form.classList.add("hidden");
    } else {
      memberPanel.classList.add("hidden");
      form.classList.remove("hidden");
      memberEmail.textContent = "";
    }
  }

  function setMessage(text, isError) {
    messageEl.textContent = text || "";
    messageEl.classList.toggle("error", !!isError);
    messageEl.classList.toggle("success", !isError && !!text);
  }

})();
