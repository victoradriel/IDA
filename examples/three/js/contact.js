const CONTACT_KEY = "store_contact_messages";

function getContactMessages() {
  return readJSON(CONTACT_KEY, []);
}

function saveContactMessages(messages) {
  writeJSON(CONTACT_KEY, messages);
}

function renderContactMessages() {
  const list = document.querySelector("#contactMessages");
  if (!list) return;
  const messages = getContactMessages();
  if (!messages.length) {
    list.innerHTML = "<li>No messages submitted yet.</li>";
    return;
  }

  list.innerHTML = "";
  messages
    .slice()
    .reverse()
    .forEach((msg) => {
      const item = document.createElement("li");
      item.className = "panel";
      item.innerHTML = `
        <p><strong>${msg.subject}</strong></p>
        <p>From: ${msg.name} (${msg.email})</p>
        <p>${msg.message}</p>
        <button class="btn secondary" data-delete-message="${msg.id}">Delete</button>
      `;
      list.appendChild(item);
    });
}

function handleContactSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    id: `msg-${Date.now()}`,
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    subject: String(formData.get("subject") || "").trim(),
    message: String(formData.get("message") || "").trim()
  };
  if (!payload.name || !payload.email || !payload.subject || !payload.message) return;
  const messages = getContactMessages();
  messages.push(payload);
  saveContactMessages(messages);
  event.target.reset();
  renderContactMessages();
  showSnackbar("Message submitted.");
}

function deleteMessage(id) {
  const next = getContactMessages().filter((msg) => msg.id !== id);
  saveContactMessages(next);
  renderContactMessages();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contactForm");
  const list = document.querySelector("#contactMessages");
  if (form) form.addEventListener("submit", handleContactSubmit);
  if (list) {
    list.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-delete-message]");
      if (btn) deleteMessage(btn.getAttribute("data-delete-message"));
    });
  }
  renderContactMessages();
});
