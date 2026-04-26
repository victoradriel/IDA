const STORE_KEYS = {
  users: "store_users",
  session: "store_session",
  cart: "store_cart",
  wishlist: "store_wishlist",
  orders: "store_orders",
  addresses: "store_addresses",
  payments: "store_payments"
};

function readJSON(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function deleteJSON(key) {
  localStorage.removeItem(key);
}

function getUsers() {
  return readJSON(STORE_KEYS.users, []);
}

function getSession() {
  return readJSON(STORE_KEYS.session, null);
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  return getUsers().find((u) => u.email === session.email) || null;
}

function upsertUser(user) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.email === user.email);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  writeJSON(STORE_KEYS.users, users);
}

function ensureArrayStore(key) {
  if (!Array.isArray(readJSON(key, null))) writeJSON(key, []);
}

function setupBaseStores() {
  Object.values(STORE_KEYS).forEach((key) => {
    if (key !== STORE_KEYS.session) ensureArrayStore(key);
  });
}

function getUserItems(key, email) {
  return readJSON(key, []).filter((item) => item.email === email);
}

function setAuthLabel() {
  const btn = document.querySelector("#authTrigger");
  const btnUser = document.querySelector("#profileToggle");;
  if (!btn) return;
  btn.hidden = (getCurrentUser() ? true : false);
  btnUser.hidden = !btn.hidden;
  const user = getCurrentUser();
  btnUser.textContent = user ? `Hi, ${user.name}` : "Profile Menu";
}

function showSnackbar(message) {
  const snackbar = document.querySelector("#snackbar");
  if (!snackbar) return;
  snackbar.textContent = message;
  snackbar.classList.add("show");
  clearTimeout(showSnackbar.timer);
  showSnackbar.timer = setTimeout(() => snackbar.classList.remove("show"), 2600);
}

function updateCartCount() {
  const cartBadge = document.querySelector("#cartCount");
  const user = getCurrentUser();
  if (!cartBadge) return;
  if (!user) {
    cartBadge.textContent = "0";
    return;
  }
  const cartItems = getUserItems(STORE_KEYS.cart, user.email);
  const total = cartItems.reduce((sum, item) => sum + item.qty, 0);
  cartBadge.textContent = String(total);
}

function addToCart(product) {
  const user = getCurrentUser();
  if (!user) {
    showSnackbar("Please log in before adding to cart.");
    return false;
  }
  const cart = readJSON(STORE_KEYS.cart, []);
  const existing = cart.find((i) => i.email === user.email && i.productId === product.id);
  if (existing) existing.qty += 1;
  else {
    cart.push({
      email: user.email,
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      alt: product.alt,
      qty: 1
    });
  }
  writeJSON(STORE_KEYS.cart, cart);
  updateCartCount();
  showSnackbar(`${product.title} added to cart.`);
  return true;
}

function addToWishlist(product) {
  const user = getCurrentUser();
  if (!user) {
    showSnackbar("Please log in before adding to wishlist.");
    return false;
  }
  const wishlist = readJSON(STORE_KEYS.wishlist, []);
  const exists = wishlist.some((i) => i.email === user.email && i.productId === product.id);
  if (!exists) {
    wishlist.push({
      email: user.email,
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      alt: product.alt
    });
    writeJSON(STORE_KEYS.wishlist, wishlist);
  }
  showSnackbar(exists ? "Item already in wishlist." : `${product.title} added to wishlist.`);
  return true;
}

function setupProfileDropdown() {
  const toggle = document.querySelector("#profileToggle");
  const menu = document.querySelector("#profileDropdown");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (event) => {
    if (!menu.classList.contains("open")) return;
    if (!menu.contains(event.target) && event.target !== toggle) {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function setupAuthModal() {
  const modal = document.querySelector("#authModal");
  const trigger = document.querySelector("#authTrigger");
  const close = document.querySelector("#authClose");
  const loginForm = document.querySelector("#loginForm");
  const registerForm = document.querySelector("#registerForm");
  const tabs = document.querySelectorAll(".tab-btn");
  if (!modal || !trigger || !close || !loginForm || !registerForm) return;

  function openModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    modal.focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  trigger.addEventListener("focus", openModal);
  close.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isLogin = btn.dataset.tab === "login";
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t === btn)));
      loginForm.hidden = !isLogin;
      registerForm.hidden = isLogin;
    });
  });

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(registerForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    if (!name || !email || !password) return;
    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      showSnackbar("Email already registered.");
      return;
    }
    upsertUser({ name, email, password });
    writeJSON(STORE_KEYS.session, { email });
    setAuthLabel();
    updateCartCount();
    registerForm.reset();
    closeModal();
    showSnackbar("Registration successful.");
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    const user = getUsers().find((u) => u.email === email && u.password === password);
    if (!user) {
      showSnackbar("Invalid email or password.");
      return;
    }
    writeJSON(STORE_KEYS.session, { email: user.email });
    setAuthLabel();
    updateCartCount();
    loginForm.reset();
    closeModal();
    showSnackbar("Login successful.");
  });

  profileLogout.addEventListener("click", () => {
    const session = getSession();
    const btnUser = document.querySelector("#profileToggle");
    if (session){
      deleteJSON(STORE_KEYS.session);
      btnUser.click();
    } 
    setAuthLabel();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupBaseStores();
  setupProfileDropdown();
  setupAuthModal();
  setAuthLabel();
  updateCartCount();
});
