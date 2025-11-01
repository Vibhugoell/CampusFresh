// --- DOM ELEMENT CACHING ---
const navMenu = document.getElementById("navMenu");
const form = document.getElementById("laundryForm");
const itemListEl = document.getElementById("itemList");
const itemListSection = document.getElementById("itemListSection");
const totalItemsCountEl = document.getElementById("totalItemsCount");
const submitFinalBtn = document.querySelector(".submit-final-btn");
const messageBox = document.getElementById("messageBox");

let items = []; // Local storage for laundry items

// --- UTILITY FUNCTIONS ---

function myMenuFunction() {
  navMenu.className = navMenu.className === "nav-menu" ? "nav-menu responsive" : "nav-menu";
  const menuIcon = document.querySelector(".nav-menu-btn i");
  if (navMenu.classList.contains("responsive")) {
    menuIcon.classList.remove("bx-menu");
    menuIcon.classList.add("bx-x");
  } else {
    menuIcon.classList.remove("bx-x");
    menuIcon.classList.add("bx-menu");
  }
}

function showMessage(text, type) {
  messageBox.innerText = text;
  messageBox.className = `message ${type}`;
  messageBox.style.display = "block";
  setTimeout(() => (messageBox.style.display = "none"), 4000);
}

function updateItemList() {
  let totalCount = 0;
  itemListEl.innerHTML = "";

  if (items.length === 0) {
    itemListEl.innerHTML = '<li class="empty-list-message">Basket is empty. Add items on the left!</li>';
    submitFinalBtn.disabled = true;
  } else {
    items.forEach((item, index) => {
      totalCount += item.quantity;
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${item.quantity} × ${item.name}</span>
        <button class="remove-btn" onclick="removeItem(${index})">
          <i class='bx bx-trash'></i>
        </button>
      `;
      itemListEl.appendChild(li);
    });
    submitFinalBtn.disabled = false;
  }

  totalItemsCountEl.textContent = totalCount;
}

function removeItem(index) {
  items.splice(index, 1);
  updateItemList();
}

function logout() {
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userToken");
  localStorage.removeItem("firstname");
  localStorage.removeItem("hostel");
  alert("Logging out...");
  window.location.href = "login.html";
}

// --- EVENT LISTENERS ---
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const nameInput = document.getElementById("itemName");
  const quantityInput = document.getElementById("quantity");

  const name = nameInput.value.trim();
  const quantity = parseInt(quantityInput.value.trim());

  if (!name || isNaN(quantity) || quantity <= 0) {
    showMessage("Please enter a valid item name and quantity (min 1).", "error");
    return;
  }

  items.push({ name, quantity });
  updateItemList();

  nameInput.value = "";
  quantityInput.value = 1;
});

// --- API/SUBMISSION LOGIC ---
async function submitLaundry() {
  const email = localStorage.getItem("userEmail");
  const hostel = localStorage.getItem("hostel"); // ✅ ADDED hostel

  if (!email) {
    showMessage("User email not found. Please log in again.", "error");
    return;
  }

  if (!hostel) {
    showMessage("Please select your hostel before submitting laundry.", "error");
    return;
  }

  if (items.length === 0) {
    showMessage("Your basket is empty. Add items before submitting.", "error");
    return;
  }

  submitFinalBtn.disabled = true;
  submitFinalBtn.textContent = "Submitting...";

  try {
    const res = await fetch("/laundry/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, hostel, items }), // ✅ include hostel now
    });

    const data = await res.json();

    if (res.ok) {
      showMessage("🎉 Order Submitted! Redirecting to Dashboard...", "success");
      items = [];
      updateItemList();
      setTimeout(() => (window.location.href = "dashboard.html"), 2000);
    } else {
      showMessage("⚠️ Submission Failed: " + data.message, "error");
      submitFinalBtn.disabled = false;
    }
  } catch (error) {
    showMessage("❌ Network Error. Could not connect to the server.", "error");
    console.error("Submission Error:", error);
    submitFinalBtn.disabled = false;
  } finally {
    submitFinalBtn.textContent = "Confirm & Submit Order";
  }
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  updateItemList();
});
