function wishlistMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

function removeWishlist(productId) {
  const user = getCurrentUser();
  if (!user) return;
  const next = readJSON(STORE_KEYS.wishlist, []).filter(
    (item) => !(item.email === user.email && item.productId === productId)
  );
  writeJSON(STORE_KEYS.wishlist, next);
  renderWishlist();
  showSnackbar("Item removed from wishlist.");
}

function moveWishlistToCart(productId) {
  const user = getCurrentUser();
  if (!user) return;
  const wishlist = readJSON(STORE_KEYS.wishlist, []);
  const item = wishlist.find((i) => i.email === user.email && i.productId === productId);
  if (!item) return;
  addToCart({
    id: item.productId,
    title: item.title,
    price: item.price,
    image: item.image,
    alt: item.alt
  });
}

function renderWishlist() {
  const user = getCurrentUser();
  const list = document.querySelector("#wishlistList");
  if (!list) return;
  if (!user) {
    list.innerHTML = "<p>Please log in to view your wishlist.</p>";
    return;
  }
  const items = getUserItems(STORE_KEYS.wishlist, user.email);
  if (!items.length) {
    list.innerHTML = "<p>Your wishlist is empty.</p>";
    return;
  }
  list.innerHTML = "";
  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "panel item-row";
    article.innerHTML = `
      <img class="item-thumb" src="${item.image}" alt="${item.alt}">
      <div>
        <strong>${item.title}</strong>
        <div>${wishlistMoney(item.price)}</div>
      </div>
      <div class="btn secondary" data-move-cart="${item.productId}">Add to Cart</div>
      <div class="btn danger" data-remove-wishlist="${item.productId}">Remove</div>
    `;
    list.appendChild(article);
  });
}

function initWishlist() {
  const list = document.querySelector("#wishlistList");
  if (!list) return;
  list.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("[data-remove-wishlist]");
    if (removeBtn) {
      removeWishlist(removeBtn.getAttribute("data-remove-wishlist"));
      return;
    }
    const moveBtn = event.target.closest("[data-move-cart]");
    if (moveBtn) {
      moveWishlistToCart(moveBtn.getAttribute("data-move-cart"));
    }
  });
  renderWishlist();
}

document.addEventListener("DOMContentLoaded", initWishlist);
