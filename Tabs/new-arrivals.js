// new-arrivals.js
// New Arrivals (GRID) interactions — replaces the slider JS completely.

document.addEventListener("DOMContentLoaded", () => {
  // Favorite (heart) toggle — visual only
  const favButtons = document.querySelectorAll(".icon-fav");
  favButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle("is-on");
    });
  });

  // If an image fails, hide it so card chrome stays clean.
  const imgs = document.querySelectorAll(".product-media img");
  imgs.forEach((img) => {
    img.addEventListener("error", () => {
      img.style.opacity = "0";
    });
  });

  const cards = document.querySelectorAll(".product-card[data-product-id]");
  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button, .product-actions")) return;
      const id = card.getAttribute("data-product-id");
      if (!id) return;
      window.location.href = `product.html?id=${encodeURIComponent(id)}`;
    });
  });

  const utilButtons = document.querySelectorAll(".icon-util");
  utilButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const card = btn.closest(".product-card");
      const id = card?.getAttribute("data-product-id");
      if (!id) return;
      window.location.href = `product.html?id=${encodeURIComponent(id)}`;
    });
  });
});
