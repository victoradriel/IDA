function formatDate(value) {
  return new Date(value).toLocaleString();
}

function orderMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

function deleteOrder(orderId) {
  const user = getCurrentUser();
  if (!user) return;
  const next = readJSON(STORE_KEYS.orders, []).filter(
    (o) => !(o.email === user.email && o.id === orderId)
  );
  writeJSON(STORE_KEYS.orders, next);
  renderOrders();
  showSnackbar("Order removed.");
}

function renderOrders() {
  const user = getCurrentUser();
  const container = document.querySelector("#ordersContainer");
  if (!container) return;
  if (!user) {
    container.innerHTML = "<p>Please log in to view orders.</p>";
    return;
  }
  const orders = getUserItems(STORE_KEYS.orders, user.email);
  if (!orders.length) {
    container.innerHTML = "<p>You have no orders yet.</p>";
    return;
  }
  container.innerHTML = "";
  orders
    .slice()
    .reverse()
    .forEach((order) => {
      const section = document.createElement("section");
      section.className = "panel";
      const items = order.items
        .map((item) => `<li>${item.qty} x ${item.title} - ${orderMoney(item.price * item.qty)}</li>`)
        .join("");
      section.innerHTML = `
        <h2>Order ${order.id}</h2>
        <p><strong>Date:</strong> ${formatDate(order.date)}</p>
        <p><strong>Address:</strong> ${order.address}</p>
        <p><strong>Payment:</strong> ${order.payment}</p>
        <ul>${items}</ul>
        <p><strong>Total:</strong> ${orderMoney(order.total)}</p>
        <button class="btn danger" data-delete-order="${order.id}">Delete Order</button>
      `;
      container.appendChild(section);
    });
}

function initOrders() {
  const container = document.querySelector("#ordersContainer");
  if (!container) return;
  container.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-delete-order]");
    if (!btn) return;
    deleteOrder(btn.getAttribute("data-delete-order"));
  });
  renderOrders();
}

document.addEventListener("DOMContentLoaded", initOrders);
