let PRODUCTS = [];
const PAGE_SIZE = 3;
const carouselState = {};

function money(value) {
  return `$${Number(value).toFixed(2)}`;
}

async function loadProducts() {
  const response = await fetch("./data/products.json");
  PRODUCTS = await response.json();
}

function createProductCard(product) {
  const article = document.createElement("article");
  article.className = "product-card";
  article.innerHTML = `
    <button class="product-media-btn" data-open-product="${product.id}" aria-label="Open details for ${product.title}">
      <img src="${product.image}" alt="${product.alt}">
    </button>
    <div class="product-body">
      <button class="product-title-btn" data-open-product="${product.id}">${product.title}</button>
      <div class="price">${money(product.price)}</div>
      <button class="btn" data-add-cart="${product.id}" aria-label="Add ${product.title} to cart">Add to Cart</button>
    </div>
  `;
  return article;
}

function renderCarousel(category) {
  const track = document.querySelector(`[data-track="${category}"]`);
  if (!track) return;
  const categoryItems = PRODUCTS.filter((p) => p.category === category);
  const offset = carouselState[category] || 0;
  const view = categoryItems.slice(offset, offset + PAGE_SIZE);
  track.innerHTML = "";
  view.forEach((product) => track.appendChild(createProductCard(product)));
}

function setupCarouselControls() {
  document.querySelectorAll(".carousel-shell").forEach((shell) => {
    const category = shell.dataset.category;
    const items = PRODUCTS.filter((p) => p.category === category);
    carouselState[category] = 0;
    shell.querySelector('[data-action="next"]').addEventListener("click", () => {
      const maxOffset = Math.max(0, items.length - PAGE_SIZE);
      carouselState[category] = Math.min(maxOffset, carouselState[category] + 1);
      renderCarousel(category);
    });
    shell.querySelector('[data-action="prev"]').addEventListener("click", () => {
      carouselState[category] = Math.max(0, carouselState[category] - 1);
      renderCarousel(category);
    });
    renderCarousel(category);
  });
}

function setupProductModal() {
  const modal = document.querySelector("#productModal");
  const closeBtn = document.querySelector("#productModalClose");
  const content = document.querySelector("#productModalContent");
  if (!modal || !closeBtn || !content) return;

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("click", (event) => {
    const cardOpen = event.target.closest("[data-open-product]");
    if (cardOpen) {
      const id = cardOpen.getAttribute("data-open-product");
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return;
      content.innerHTML = `
        <img src="${product.image}" alt="${product.alt}">
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <p class="price">${money(product.price)}</p>
        <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
          <button class="btn" id="modalAddCart">Add to Cart</button>
          <button class="btn secondary" id="modalAddWishlist">Add to Wishlist</button>
        </div>
      `;
      content.querySelector("#modalAddCart").addEventListener("click", () => addToCart(product));
      content
        .querySelector("#modalAddWishlist")
        .addEventListener("click", () => addToWishlist(product));
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      return;
    }

    const addBtn = event.target.closest("[data-add-cart]");
    if (!addBtn) return;
    const id = addBtn.getAttribute("data-add-cart");
    const product = PRODUCTS.find((p) => p.id === id);
    if (product) addToCart(product);
  });
}

async function initHome() {
  await loadProducts();
  setupCarouselControls();
  setupProductModal();
}

document.addEventListener("DOMContentLoaded", initHome);
