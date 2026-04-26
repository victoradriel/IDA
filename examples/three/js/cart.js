function cartMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

function renderCart() {
  const user = getCurrentUser();
  const list = document.querySelector("#cartList");
  const totalEl = document.querySelector("#cartTotal");
  const empty = document.querySelector("#cartEmpty");
  const checkoutForm = document.querySelector("#checkoutForm");
  if (!list || !totalEl || !empty || !checkoutForm) return;

  if (!user) {
    list.innerHTML = "";
    totalEl.textContent = "$0.00";
    empty.hidden = false;
    empty.textContent = "Please log in to manage your cart.";
    checkoutForm.hidden = true;
    return;
  }

  const cart = getUserItems(STORE_KEYS.cart, user.email);
  checkoutForm.hidden = false;
  if (!cart.length) {
    list.innerHTML = "";
    totalEl.textContent = "$0.00";
    empty.hidden = false;
    empty.textContent = "Your cart is currently empty.";
    return;
  }

  empty.hidden = true;
  list.innerHTML = "";
  cart.forEach((item) => {
    const li = document.createElement("li");
    li.className = "item-row";
    li.innerHTML = `
      <img class="item-thumb" src="${item.image}" alt="${item.alt}">
      <div>
        <strong>${item.title}</strong>
        <div>${cartMoney(item.price)}</div>
      </div>
      <label>
        <span class="visually-hidden">Quantity for ${item.title}</span>
        <input type="number" min="1" value="${item.qty}" data-qty="${item.productId}" aria-label="Quantity for ${item.title}" style="width:72px;">
      </label>
      <button class="btn secondary" data-remove="${item.productId}">Remove</button>
    `;
    list.appendChild(li);
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  totalEl.textContent = cartMoney(total);
}

function updateQty(productId, qty) {
  const user = getCurrentUser();
  if (!user) return;
  const cart = readJSON(STORE_KEYS.cart, []);
  const item = cart.find((i) => i.email === user.email && i.productId === productId);
  if (!item) return;
  item.qty = Math.max(1, qty);
  writeJSON(STORE_KEYS.cart, cart);
  updateCartCount();
  renderCart();
}

function removeCartItem(productId) {
  const user = getCurrentUser();
  if (!user) return;
  const next = readJSON(STORE_KEYS.cart, []).filter(
    (i) => !(i.email === user.email && i.productId === productId)
  );
  writeJSON(STORE_KEYS.cart, next);
  updateCartCount();
  renderCart();
}

function submitCheckout(event) {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    showSnackbar("Please log in to checkout.");
    return;
  }
  const cart = getUserItems(STORE_KEYS.cart, user.email);
  if (!cart.length) {
    showSnackbar("Your cart is empty.");
    return;
  }
  const data = new FormData(event.target);
  const address = String(data.get("address") || "").trim();
  const payment = String(data.get("payment") || "").trim();
  if (!address || !payment) {
    showSnackbar("Address and payment option are required.");
    return;
  }
  const order = {
    id: `ord-${Date.now()}`,
    email: user.email,
    date: new Date().toISOString(),
    address,
    payment,
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  };
  const orders = readJSON(STORE_KEYS.orders, []);
  orders.push(order);
  writeJSON(STORE_KEYS.orders, orders);
  const remaining = readJSON(STORE_KEYS.cart, []).filter((item) => item.email !== user.email);
  writeJSON(STORE_KEYS.cart, remaining);
  updateCartCount();
  renderCart();
  event.target.reset();
  showSnackbar("Warning: Order was made successfully.");
}

function initCart() {
  const list = document.querySelector("#cartList");
  const form = document.querySelector("#checkoutForm");
  if (!list || !form) return;
  list.addEventListener("change", (event) => {
    const input = event.target.closest("[data-qty]");
    if (!input) return;
    updateQty(input.getAttribute("data-qty"), Number(input.value));
  });
  list.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-remove]");
    if (!btn) return;
    removeCartItem(btn.getAttribute("data-remove"));
  });
  form.addEventListener("submit", submitCheckout);
  renderCart();
}

document.addEventListener("DOMContentLoaded", initCart);
