(function () {
  const SUPABASE_URL = window.SUPABASE_URL || "https://wygjotgkmyqmemqsdqxk.supabase.co";
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "sb_publishable_hTmIIlzIe6io-QkzeVnayw_X_fNRbS5";

  if (!window.supabase || !window.supabase.createClient) return;

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: window.localStorage,
    },
  });
  setupFooterUpdateSignup();
  let footerRedirectTimer = null;

  supabaseClient.auth.getUser().then(function ({ data, error }) {
    if (error || !data || !data.user) {
      setAccountIcons(null);
      setMembersTabVisibility(false);
      return;
    }

    const user = data.user;
    const name = formatDisplayName(getUserDisplayName(user));

    setAccountIcons(name);
    setMembersTabVisibility(true);
    maybeShowWelcomeBanner(name);
  });

  function setAccountIcons(name) {
    const accountIcons = document.querySelectorAll('a.icon-btn[aria-label="Account"]');

    accountIcons.forEach(function (icon) {
      clearAccountMenu(icon);

      if (!name) {
        icon.classList.remove("account-auth");
        icon.setAttribute("href", "login.html");
        icon.removeAttribute("data-user-label");
        icon.setAttribute("title", "Account");
        return;
      }

      icon.classList.add("account-auth");
      icon.setAttribute("href", "members.html");
      icon.setAttribute("title", "Signed in: " + name);
      addAccountMenu(icon, name);
    });
  }

  function setMembersTabVisibility(isLoggedIn) {
    const membersLinks = document.querySelectorAll('a.nav-link[href="login.html"]');
    membersLinks.forEach(function (link) {
      const item = link.closest("li");
      if (item) {
        item.style.display = isLoggedIn ? "none" : "";
        return;
      }
      link.style.display = isLoggedIn ? "none" : "";
    });
  }

  function maybeShowWelcomeBanner(name) {
    const isCartPage = /\/cart\.html$/i.test(window.location.pathname);
    if (!isCartPage) return;

    const params = new URLSearchParams(window.location.search);
    const hasWelcomeQuery = params.get("welcome") === "1";
    const queuedWelcome = sessionStorage.getItem("tmc_welcome_name");

    if (!hasWelcomeQuery && !queuedWelcome) return;

    const topbar = document.querySelector(".topbar");
    if (!topbar || !topbar.parentNode) return;

    const banner = document.createElement("div");
    banner.className = "welcome-banner";
    banner.textContent = "Welcome back, " + formatDisplayName(queuedWelcome || name) + ". Your cart is ready.";
    topbar.parentNode.insertBefore(banner, topbar.nextSibling);

    window.setTimeout(function () {
      banner.classList.add("hide");
      window.setTimeout(function () {
        banner.remove();
      }, 350);
    }, 4000);

    sessionStorage.removeItem("tmc_welcome_name");
      sessionStorage.removeItem("tmc_code_unlocked");

    if (hasWelcomeQuery) {
      params.delete("welcome");
      const next = window.location.pathname + (params.toString() ? "?" + params.toString() : "") + window.location.hash;
      window.history.replaceState({}, "", next);
    }
  }

  function getUserDisplayName(user) {
    const meta = user.user_metadata || {};
    const fullName = meta.full_name || meta.name || meta.display_name;

    if (fullName && String(fullName).trim()) {
      return String(fullName).trim();
    }

    const email = user.email || "";
    if (!email) return "Member";

    return email.split("@")[0];
  }

  function formatDisplayName(value) {
    const base = String(value || "Member").trim();
    if (!base) return "Member";

    const spaced = base.replace(/[._-]+/g, " ");
    return spaced
      .split(/\s+/)
      .filter(Boolean)
      .map(function (part) {
        const lower = part.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(" ");
  }

  function addAccountMenu(icon, name) {
    const menu = document.createElement("div");
    menu.className = "account-hover-menu";
    menu.innerHTML =
      '<div class="account-hover-name">' +
      escapeHtml(name) +
      '</div>' +
      '<button class="account-signout-btn" type="button">Sign Out</button>';

    const signOutBtn = menu.querySelector(".account-signout-btn");
    signOutBtn.addEventListener("click", async function (event) {
      event.preventDefault();
      event.stopPropagation();

      await supabaseClient.auth.signOut();
      sessionStorage.removeItem("tmc_welcome_name");
      sessionStorage.removeItem("tmc_site_unlocked");
      sessionStorage.removeItem("tmc_code_unlocked");
      window.location.href = "login.html";
    });

    icon.insertAdjacentElement("afterend", menu);
  }

  function clearAccountMenu(icon) {
    const next = icon.nextElementSibling;
    if (next && next.classList.contains("account-hover-menu")) {
      next.remove();
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupFooterUpdateSignup() {
    const forms = document.querySelectorAll(".footer-email-form");

    forms.forEach(function (form) {
      if (form.dataset.bound === "true") return;
      form.dataset.bound = "true";

      form.addEventListener("submit", function (event) {
        event.preventDefault();

        const input = form.querySelector('input[type="email"]');
        if (!input) return;

        const email = String(input.value || "").trim();
        if (!email) return;

        showFooterSignupMessage(
          form,
          "Thank you for joining The MenDen updates. Your private 15% member welcome will arrive by email."
        );
        showFooterSignupPopout("Welcome to The MenDen. Redirecting you to your private updates page...");
        scheduleFooterWelcomeRedirect();
        form.reset();
      });
    });
  }

  function showFooterSignupMessage(form, text) {
    let message = form.parentElement.querySelector(".footer-signup-message");
    if (!message) {
      message = document.createElement("p");
      message.className = "footer-signup-message";
      form.insertAdjacentElement("afterend", message);
    }

    message.textContent = text;
  }

  function showFooterSignupPopout(text) {
    const existing = document.querySelector(".updates-popout");
    if (existing) existing.remove();

    const popout = document.createElement("div");
    popout.className = "updates-popout";
    popout.textContent = text;
    document.body.appendChild(popout);

    window.requestAnimationFrame(function () {
      popout.classList.add("show");
    });

    window.setTimeout(function () {
      popout.classList.remove("show");
      window.setTimeout(function () {
        popout.remove();
      }, 260);
    }, 1400);
  }

  function scheduleFooterWelcomeRedirect() {
    if (footerRedirectTimer) {
      window.clearTimeout(footerRedirectTimer);
    }

    footerRedirectTimer = window.setTimeout(function () {
      window.location.href = "updates-welcome.html";
    }, 1500);
  }
})();
