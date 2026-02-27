(function () {
  const SUPABASE_URL = window.SUPABASE_URL || "https://wygjotgkmyqmemqsdqxk.supabase.co";
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "sb_publishable_hTmIIlzIe6io-QkzeVnayw_X_fNRbS5";
  const FAVORITES_KEY = "tmc_favorites_v1";
  const REVIEWS_TABLE = "member_reviews";

  const memberNameEl = document.getElementById("memberName");
  const heartedGrid = document.getElementById("heartedGrid");
  const heartedEmpty = document.getElementById("heartedEmpty");
  const clearHeartedBtn = document.getElementById("clearHeartedBtn");
  const reviewForm = document.getElementById("reviewForm");
  const reviewProduct = document.getElementById("reviewProduct");
  const reviewRating = document.getElementById("reviewRating");
  const reviewText = document.getElementById("reviewText");
  const reviewMessage = document.getElementById("reviewMessage");
  const reviewGrid = document.getElementById("reviewGrid");

  if (!window.supabase || !window.supabase.createClient) {
    window.location.href = "login.html";
    return;
  }

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: window.localStorage,
    },
  });
  let favoritesState = [];

  initialize().catch(function () {
    setMessage("Unable to load your member page.", true);
  });

  async function initialize() {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error || !data || !data.user) {
      window.location.href = "login.html";
      return;
    }

    const user = data.user;
    const memberName = formatDisplayName(getDisplayName(user));
    memberNameEl.textContent = memberName;

    favoritesState = getFavorites();
    refreshFavoritesUI();

    clearHeartedBtn.addEventListener("click", function () {
      if (!favoritesState.length) return;
      favoritesState = [];
      saveFavorites(favoritesState);
      refreshFavoritesUI();
      setMessage("Cleared all hearted products.", false);
    });

    await loadReviews(user.id);

    reviewForm.addEventListener("submit", function (event) {
      event.preventDefault();
      submitReview(user.id);
    });
  }

  async function loadReviews(userId) {
    const { data, error } = await supabaseClient
      .from(REVIEWS_TABLE)
      .select("id,product_id,product_label,rating,review_text,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      renderReviews([]);
      setMessage(getReviewErrorMessage(error), true);
      return;
    }

    renderReviews(data || []);
  }

  async function submitReview(userId) {
    const productId = reviewProduct.value;
    const rating = Number(reviewRating.value);
    const text = reviewText.value.trim();

    if (!productId || !Number.isFinite(rating) || rating < 1 || rating > 5 || !text) {
      setMessage("Pick a product, choose a rating, and write a review.", true);
      return;
    }

    const productLabel = reviewProduct.options[reviewProduct.selectedIndex].text;

    setMessage("Submitting review...", false);

    const { error } = await supabaseClient.from(REVIEWS_TABLE).insert({
      user_id: userId,
      product_id: productId,
      product_label: productLabel,
      rating,
      review_text: text,
    });

    if (error) {
      setMessage(getReviewErrorMessage(error), true);
      return;
    }

    reviewForm.reset();
    setMessage("Thank you for your review. You have unlocked your 15% member discount.", false);
    await loadReviews(userId);
  }

  function getFavorites() {
    try {
      const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }

  function renderFavorites(favorites) {
    heartedGrid.innerHTML = "";
    clearHeartedBtn.hidden = !favorites.length;

    if (!favorites.length) {
      heartedEmpty.hidden = false;
      return;
    }

    heartedEmpty.hidden = true;

    favorites.forEach(function (item) {
      const card = document.createElement("article");
      card.className = "member-card";

      const thumbWrap = document.createElement("a");
      thumbWrap.className = "member-thumb-wrap";
      thumbWrap.href = toProductLink(item);

      const img = document.createElement("img");
      img.className = "member-thumb";
      img.src = item.img || "";
      img.alt = item.title || "Hearted product";
      thumbWrap.appendChild(img);

      const name = document.createElement("h3");
      name.className = "member-name";
      name.textContent = item.title || "Product";

      const price = document.createElement("p");
      price.className = "member-price";
      price.textContent = "$" + Number(item.price || 0).toFixed(0);

      const link = document.createElement("a");
      link.className = "member-link";
      link.href = toProductLink(item);
      link.textContent = "View Product";

      const removeBtn = document.createElement("button");
      removeBtn.className = "member-remove-btn";
      removeBtn.type = "button";
      removeBtn.textContent = "Unheart";
      removeBtn.addEventListener("click", function () {
        favoritesState = favoritesState.filter(function (fav) {
          return fav.id !== item.id;
        });
        saveFavorites(favoritesState);
        refreshFavoritesUI();
        setMessage("Removed from hearted products.", false);
      });

      card.appendChild(thumbWrap);
      card.appendChild(name);
      card.appendChild(price);
      card.appendChild(link);
      card.appendChild(removeBtn);
      heartedGrid.appendChild(card);
    });
  }

  function hydrateReviewProductSelect(favorites) {
    const previous = reviewProduct.value;
    reviewProduct.innerHTML = '<option value="">Choose a product</option>';

    favorites.forEach(function (item) {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.title;
      reviewProduct.appendChild(option);
    });

    if (favorites.some(function (item) { return item.id === previous; })) {
      reviewProduct.value = previous;
    }
  }

  function renderReviews(reviews) {
    reviewGrid.innerHTML = "";

    if (!reviews.length) {
      const empty = document.createElement("p");
      empty.className = "members-empty";
      empty.textContent = "No reviews yet.";
      reviewGrid.appendChild(empty);
      return;
    }

    reviews.forEach(function (review) {
      const card = document.createElement("article");
      card.className = "review-card";

      const meta = document.createElement("div");
      meta.className = "review-meta";

      const product = document.createElement("span");
      product.className = "review-product";
      product.textContent = review.product_label || review.product_id;

      const stars = document.createElement("span");
      stars.textContent = "★".repeat(Number(review.rating) || 0);

      meta.appendChild(product);
      meta.appendChild(stars);

      const text = document.createElement("p");
      text.className = "review-text";
      text.textContent = review.review_text || "";

      card.appendChild(meta);
      card.appendChild(text);
      reviewGrid.appendChild(card);
    });
  }

  function setMessage(text, isError) {
    reviewMessage.textContent = text || "";
    reviewMessage.classList.toggle("error", !!isError);
  }

  function getDisplayName(user) {
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

  function toProductLink(item) {
    const params = new URLSearchParams({
      id: item.id || "",
      name: item.title || "Product",
      price: String(item.price || 0),
      img: item.img || "",
      img2: item.img2 || item.img || "",
    });

    return "product.html?" + params.toString();
  }

  function refreshFavoritesUI() {
    renderFavorites(favoritesState);
    hydrateReviewProductSelect(favoritesState);
  }

  function getReviewErrorMessage(error) {
    const code = error && error.code ? String(error.code) : "";
    const text = error && error.message ? String(error.message).toLowerCase() : "";

    if (code === "42P01" || text.includes("relation") || text.includes("does not exist")) {
      return "Review table missing in Supabase. Create table 'member_reviews' and enable RLS policies.";
    }

    if (code === "42501" || text.includes("permission denied") || text.includes("row-level security")) {
      return "Review permissions blocked by RLS. Add SELECT and INSERT policies for authenticated users.";
    }

    return "Could not sync reviews with Supabase.";
  }
})();
