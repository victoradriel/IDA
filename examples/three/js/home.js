let productList = [];

function productsMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

function makeCard(product) {
  const article = document.createElement("article");
  article.className = "product-card";
  article.innerHTML = `
    <button class="product-media-btn" data-open-product="${product.id}" aria-label="Open details for ${product.title}">
      <img src="${product.image}" alt="${product.alt}">
    </button>
    <div class="product-body">
      <button class="product-title-btn" data-open-product="${product.id}">${product.title}</button>
      <div class="price">${productsMoney(product.price)}</div>
      <button class="btn" data-add-cart="${product.id}" aria-label="Add ${product.title} to cart">Add to Cart</button>
    </div>
  `;
  return article;
}

async function loadProductsPage() {
  const res = await fetch("./data/products.json");
  productList = await res.json();
  const container = document.querySelector("#productsGrid");
  if (!container) return;
  container.innerHTML = "";
  productList.forEach((product) => container.appendChild(makeCard(product)));
}

function setupProductsModal() {
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

  document.addEventListener("mousedown", (event) => {
    const opener = event.target.closest("[data-open-product]");
    if (opener) {
      const id = opener.getAttribute("data-open-product");
      const product = productList.find((item) => item.id === id);
      if (!product) return;
      content.innerHTML = `
        <img src="${product.image}" alt="${product.alt}">
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <p class="price">${productsMoney(product.price)}</p>
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
    const product = productList.find((item) => item.id === addBtn.getAttribute("data-add-cart"));
    if (product) addToCart(product);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  setupProductsModal();
  await loadProductsPage();
});
