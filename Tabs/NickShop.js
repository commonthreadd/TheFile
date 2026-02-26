/* ====================== CART STORAGE ====================== */
const CART_KEY = "tmc_cart_v1";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(p => p.id === item.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
}

function cartCount() {
  return getCart().reduce((sum, p) => sum + (p.qty || 1), 0);
}

function updateCartBadge() {
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = String(cartCount());
  });
}

function money(n) {
  return `$${Number(n).toFixed(0)}`;
}

/* ====================== HELPERS: GET ITEM DATA FROM A CARD ====================== */
function itemFromCard(card, fallbackIdx = 0) {
  const title =
    card.querySelector(".product-title")?.textContent?.trim() ||
    `Item ${fallbackIdx + 1}`;

  const priceText = card.querySelector(".product-price")?.textContent?.trim() || "$0";
  const price = Number(priceText.replace(/[^0-9.]/g, "")) || 0;

  // Prefer the front image if present, otherwise first img
  const img =
    card.querySelector("img.img-front")?.getAttribute("src") ||
    card.querySelector("img")?.getAttribute("src") ||
    "";

  // Stable id from title (good enough for demo)
  const id = title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

  return { id, title, price, img };
}

/* ====================== SHOP / NEW ARRIVALS: CLICK MEDIA -> CART + REDIRECT ====================== */
/*
  Clicking the product image adds to cart then goes to CartNick.html
*/
document.querySelectorAll(".product-card .product-media").forEach((a, idx) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();

    const card = a.closest(".product-card");
    if (!card) return;

    const item = itemFromCard(card, idx);
    addToCart(item);

    window.location.href = "CartNick.html";
  });
});

/* ====================== SHOP: ADD TO CART BUTTON (NO REDIRECT) ====================== */
/*
  Clicking "Add to Cart" adds item and stays on the shop page.
  If you WANT it to redirect too, uncomment the window.location line.
*/
document.querySelectorAll(".product-card .add-to-cart").forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".product-card");
    if (!card) return;

    const item = itemFromCard(card, idx);
    addToCart(item);

    // If you want button click to go to cart as well, uncomment:
    // window.location.href = "CartNick.html";
  });
});

/* ====================== CART PAGE RENDER ====================== */
function renderCartPage() {
  const itemsWrap = document.getElementById("cartItems");
  const empty = document.getElementById("cartEmpty");
  const subtotalEl = document.getElementById("subtotal");
  const shippingEl = document.getElementById("shipping");
  const totalEl = document.getElementById("total");
  const clearBtn = document.getElementById("clearCartBtn");

  // Not on cart page (or missing markup) — safely bail
  if (!itemsWrap || !subtotalEl || !shippingEl || !totalEl) return;

  const cart = getCart();

  // If you have an empty-state element, toggle it. If not, that's fine.
  if (cart.length === 0) {
    if (empty) empty.hidden = false;
    itemsWrap.innerHTML = "";
    subtotalEl.textContent = "$0";
    shippingEl.textContent = "$0";
    totalEl.textContent = "$0";
    return;
  }

  if (empty) empty.hidden = true;

  itemsWrap.innerHTML = cart.map(item => {
    return `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-thumb" src="${item.img}" alt="${item.title}">
        <div class="cart-meta">
          <div class="cart-name">${item.title}</div>
          <div class="cart-price">${money(item.price)}</div>
        </div>
        <div class="cart-controls">
          <div class="qty">
            <button class="qty-btn" data-action="dec" type="button">−</button>
            <div class="qty-num">${item.qty}</div>
            <button class="qty-btn" data-action="inc" type="button">+</button>
          </div>
          <button class="remove-btn" data-action="remove" type="button">Remove</button>
        </div>
      </div>
    `;
  }).join("");

  const subtotal = cart.reduce((sum, p) => sum + (p.price * p.qty), 0);
  const shipping = subtotal > 0 ? 0 : 0; // keep 0 for now
  const total = subtotal + shipping;

  subtotalEl.textContent = money(subtotal);
  shippingEl.textContent = money(shipping);
  totalEl.textContent = money(total);

  // IMPORTANT: prevent stacking multiple listeners on re-render
  // Use one delegated listener, but only attach once by checking a flag.
  if (!itemsWrap.dataset.bound) {
    itemsWrap.dataset.bound = "true";

    itemsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const row = e.target.closest(".cart-item");
      if (!row) return;

      const id = row.getAttribute("data-id");
      const action = btn.getAttribute("data-action");

      const cartNow = getCart();
      const item = cartNow.find(p => p.id === id);
      if (!item) return;

      if (action === "inc") item.qty += 1;
      if (action === "dec") item.qty = Math.max(1, item.qty - 1);

      if (action === "remove") {
        const next = cartNow.filter(p => p.id !== id);
        saveCart(next);
        renderCartPage();
        return;
      }

      saveCart(cartNow);
      renderCartPage();
    });
  }

  if (clearBtn) {
    clearBtn.onclick = () => {
      saveCart([]);
      renderCartPage();
    };
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      alert("Checkout is for fiirin dee adeer for now. Next step: connect Stripe.");
    };
  }
}

/* ====================== RUN ON LOAD ====================== */
updateCartBadge();
renderCartPage();

