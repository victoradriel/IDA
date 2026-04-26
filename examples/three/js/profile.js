function renderProfileLists() {
  const user = getCurrentUser();
  const addressList = document.querySelector("#addressList");
  const paymentList = document.querySelector("#paymentList");
  if (!addressList || !paymentList) return;
  if (!user) {
    addressList.innerHTML = "<li>Please log in to manage addresses.</li>";
    paymentList.innerHTML = "<li>Please log in to manage payment options.</li>";
    return;
  }

  const addresses = getUserItems(STORE_KEYS.addresses, user.email);
  const payments = getUserItems(STORE_KEYS.payments, user.email);

  addressList.innerHTML = addresses.length
    ? addresses
        .map(
          (addr) =>
            `<li class="item-row"><span>${addr.value}</span><button class="btn secondary" data-del-address="${addr.id}">Delete</button></li>`
        )
        .join("")
    : "<li>No address saved yet.</li>";

  paymentList.innerHTML = payments.length
    ? payments
        .map(
          (pay) =>
            `<li class="item-row"><span>${pay.value}</span><button class="btn secondary" data-del-payment="${pay.id}">Delete</button></li>`
        )
        .join("")
    : "<li>No payment option saved yet.</li>";
}

function addAddress(event) {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    showSnackbar("Please log in first.");
    return;
  }
  const value = String(new FormData(event.target).get("address") || "").trim();
  if (!value) return;
  const addresses = readJSON(STORE_KEYS.addresses, []);
  addresses.push({ id: `addr-${Date.now()}`, email: user.email, value });
  writeJSON(STORE_KEYS.addresses, addresses);
  event.target.reset();
  renderProfileLists();
  showSnackbar("Address added.");
}

function addPayment(event) {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    showSnackbar("Please log in first.");
    return;
  }
  const value = String(new FormData(event.target).get("payment") || "").trim();
  if (!value) return;
  const payments = readJSON(STORE_KEYS.payments, []);
  payments.push({ id: `pay-${Date.now()}`, email: user.email, value });
  writeJSON(STORE_KEYS.payments, payments);
  event.target.reset();
  renderProfileLists();
  showSnackbar("Payment option added.");
}

function deleteProfileItem(type, id) {
  const user = getCurrentUser();
  if (!user) return;
  const key = type === "address" ? STORE_KEYS.addresses : STORE_KEYS.payments;
  const next = readJSON(key, []).filter((item) => !(item.email === user.email && item.id === id));
  writeJSON(key, next);
  renderProfileLists();
}

function initProfile() {
  const addressForm = document.querySelector("#addressForm");
  const paymentForm = document.querySelector("#paymentForm");
  const addressList = document.querySelector("#addressList");
  const paymentList = document.querySelector("#paymentList");
  if (!addressForm || !paymentForm || !addressList || !paymentList) return;
  addressForm.addEventListener("submit", addAddress);
  paymentForm.addEventListener("submit", addPayment);
  addressList.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-del-address]");
    if (!btn) return;
    deleteProfileItem("address", btn.getAttribute("data-del-address"));
  });
  paymentList.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-del-payment]");
    if (!btn) return;
    deleteProfileItem("payment", btn.getAttribute("data-del-payment"));
  });
  renderProfileLists();
}

document.addEventListener("DOMContentLoaded", initProfile);
