(function () {
  const SUPABASE_URL = window.SUPABASE_URL || "https://wygjotgkmyqmemqsdqxk.supabase.co";
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "sb_publishable_hTmIIlzIe6io-QkzeVnayw_X_fNRbS5";

  const form = document.getElementById("create-form");
  const emailInput = document.getElementById("create-email");
  const passwordInput = document.getElementById("create-password");
  const confirmInput = document.getElementById("confirm-password");
  const messageEl = document.getElementById("create-message");

  if (!form || !window.supabase || !window.supabase.createClient) {
    return;
  }

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: window.localStorage,
    },
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    if (!email || !password) {
      setMessage("Enter email and password.", true);
      return;
    }

    if (password !== confirm) {
      setMessage("Passwords do not match.", true);
      return;
    }

    setMessage("Creating account...", false);

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/login.html",
      },
    });

    if (error) {
      setMessage(error.message || "Account creation failed.", true);
      return;
    }

    passwordInput.value = "";
    confirmInput.value = "";

    if (data && data.user && data.session) {
      setMessage("Thank you and welcome to The MenDen. As a valued member, enjoy 15% off your next visit.", false);
      return;
    }

    setMessage("Thank you and welcome to The MenDen. Your account is created. Confirm your email to unlock your 15% membership offer for your next visit.", false);
  });

  function setMessage(text, isError) {
    messageEl.textContent = text || "";
    messageEl.classList.toggle("error", !!isError);
    messageEl.classList.toggle("success", !isError && !!text);
  }
})();
