const CART_KEY = "tmc_cart_v1";

const products = {
  "model-g10": {
    id: "model-g10",
    name: "Model G10",
    subtitle: "Black Square Sunglasses",
    price: 50,
    reference: "Reference: TCT-G10",
    description: "A contemporary square silhouette with lightweight acetate construction and subtle temple detailing.",
    sizeFit: "Lens width 53 mm, bridge 20 mm, temple length 145 mm. Designed for a medium universal fit with a balanced front profile.",
    delivery: "Complimentary delivery in 2-4 business days. Express options available at checkout. Easy returns within 14 days in original condition.",
    images: ["assets/products/G10.jpg.avif", "assets/products/G101.jpg.avif"]
  },
  "model-g20": {
    id: "model-g20",
    name: "Model G20",
    subtitle: "Black Square Sunglasses",
    price: 55,
    reference: "Reference: TCT-G20",
    description: "Raw craftsmanship with a sharp profile, finished for everyday wear and elevated styling.",
    sizeFit: "Lens width 54 mm, bridge 19 mm, temple length 145 mm. Comfort-fit acetate arms for stable all-day wear.",
    delivery: "Complimentary delivery in 2-4 business days. Signature gift packaging included. Returns accepted within 14 days.",
    images: ["assets/products/G20.avif", "assets/products/G201.jpg.avif"]
  },
  "model-30": {
    id: "model-30",
    name: "Model 30",
    subtitle: "Slim Rectangular Sunglasses",
    price: 85,
    reference: "Reference: TCT-30",
    description: "A narrower frame with refined hardware and a confident tailored character.",
    sizeFit: "Lens width 51 mm, bridge 21 mm, temple length 142 mm. Slim profile made for a close and lightweight fit.",
    delivery: "Standard delivery in 2-4 business days. Next-day shipping available in select regions. Free returns within 14 days.",
    images: ["assets/products/30.avif", "assets/products/G301.avif"]
  },
  "model-g80": {
    id: "model-g80",
    name: "Model G80",
    subtitle: "Gradient Lens Sunglasses",
    price: 120,
    reference: "Reference: TCT-G80",
    description: "Statement proportions balanced with minimal lines and polished fit details.",
    sizeFit: "Lens width 56 mm, bridge 18 mm, temple length 148 mm. Slightly wider fit with smooth weight distribution.",
    delivery: "Delivery estimate 2-4 business days with tracking. Premium packaging included. Returns available within 14 days.",
    images: ["assets/products/G80.jpg.avif", "assets/products/G701.jpg.avif"]
  }
};

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
  const existing = cart.find((p) => p.id === item.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  saveCart(cart);
}

function cartCount() {
  return getCart().reduce((sum, p) => sum + (p.qty || 1), 0);
}

function updateCartBadge() {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = String(cartCount());
  });
}

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

function setMainImage(src, alt) {
  const hero = document.getElementById("heroImage");
  hero.src = src;
  hero.alt = alt;
}

function renderThumbs(product) {
  const rail = document.getElementById("thumbRail");
  const sideGrid = document.getElementById("sideGrid");
  rail.innerHTML = "";
  sideGrid.innerHTML = "";

  function setActiveImage(idx) {
    const src = product.images[idx];
    setMainImage(src, `${product.name} view ${idx + 1}`);
    rail.querySelectorAll(".thumb-btn").forEach((el, i) => {
      el.classList.toggle("is-active", i === idx);
    });
    sideGrid.querySelectorAll(".side-view").forEach((el, i) => {
      el.classList.toggle("is-active", i === idx);
    });
  }

  product.images.forEach((src, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `thumb-btn${idx === 0 ? " is-active" : ""}`;
    btn.innerHTML = `<img src="${src}" alt="${product.name} view ${idx + 1}">`;

    btn.addEventListener("click", () => setActiveImage(idx));

    rail.appendChild(btn);

    const sideBtn = document.createElement("button");
    sideBtn.type = "button";
    sideBtn.className = `side-view${idx === 0 ? " is-active" : ""}`;
    sideBtn.innerHTML = `<img src="${src}" alt="${product.name} view ${idx + 1}">`;
    sideBtn.addEventListener("click", () => setActiveImage(idx));
    sideGrid.appendChild(sideBtn);
  });
}

function boot() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "model-g10";
  const fallback = products["model-g10"];

  const dynamicName = params.get("name");
  const dynamicImg = params.get("img");
  const dynamicPrice = Number(params.get("price"));
  const dynamicImg2 = params.get("img2") || dynamicImg;

  const product = products[id] || (
    dynamicName && dynamicImg ? {
      id,
      name: dynamicName,
      subtitle: "Signature Piece",
      price: Number.isFinite(dynamicPrice) ? dynamicPrice : fallback.price,
      reference: `Reference: ${id.toUpperCase()}`,
      description: "Crafted with refined detailing and contemporary structure for everyday elevated wear.",
      sizeFit: "Classic proportions with a balanced fit. Detailed measurements may vary by model.",
      delivery: "Standard delivery in 2-4 business days. Easy returns within 14 days.",
      images: [dynamicImg, dynamicImg2 || dynamicImg]
    } : fallback
  );

  document.getElementById("pdTitle").textContent = product.name;
  document.getElementById("pdSubtitle").textContent = product.subtitle;
  document.getElementById("pdRef").textContent = product.reference;
  document.getElementById("pdPrice").textContent = money(product.price);
  const pdDesc = document.getElementById("pdDesc");
  pdDesc.textContent = product.description;

  setMainImage(product.images[0], `${product.name} main image`);
  renderThumbs(product);

  const add = document.getElementById("addToCartBtn");
  add.addEventListener("click", () => {
    addToCart({
      id: product.id,
      title: product.name,
      price: product.price,
      img: product.images[0]
    });
    window.location.href = "cart.html";
  });

  updateCartBadge();

  const tabContent = {
    description: product.description,
    size_fit: product.sizeFit || "Sizing details will be updated soon.",
    delivery: product.delivery || "Delivery details will be updated soon."
  };

  const tabs = Array.from(document.querySelectorAll(".tab[data-tab]"));
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.getAttribute("data-tab");
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      pdDesc.textContent = tabContent[key] || "";
    });
  });

  const menuToggle = document.getElementById("menuToggle");
  const menuClose = document.getElementById("menuClose");
  const menu = document.getElementById("sideMenu");
  const overlay = document.getElementById("menuOverlay");

  function openMenu() {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    menuToggle?.setAttribute("aria-expanded", "true");
    overlay.hidden = false;
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    menuToggle?.setAttribute("aria-expanded", "false");
    overlay.hidden = true;
  }

  menuToggle?.addEventListener("click", openMenu);
  menuClose?.addEventListener("click", closeMenu);
  overlay?.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  menu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

boot();
