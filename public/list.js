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

/**
 * Toggles the mobile navigation menu class and icon.
 */
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

/**
 * Displays a persistent message/alert on the page.
 * @param {string} text - The message to show.
 * @param {string} type - 'success' or 'error'.
 */
function showMessage(text, type) {
    messageBox.innerText = text;
    messageBox.className = `message ${type}`; // Use CSS classes for styling success/error
    messageBox.style.display = "block";
    setTimeout(() => messageBox.style.display = "none", 4000);
}


/**
 * Renders the item list, updates total count, and manages button state.
 */
function updateItemList() {
    let totalCount = 0;
    itemListEl.innerHTML = "";

    if (items.length === 0) {
        // Display empty message if the list is empty
        itemListEl.innerHTML = '<li class="empty-list-message">Basket is empty. Add items on the left!</li>';
        submitFinalBtn.disabled = true;
    } else {
        items.forEach((item, index) => {
            totalCount += item.quantity;
            
            // Use Template Literal for clean HTML generation
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${item.quantity} x ${item.name}</span>
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

/**
 * Removes an item from the list by its index.
 * @param {number} index - The index of the item to remove.
 */
function removeItem(index) {
    items.splice(index, 1);
    updateItemList();
}

function logout() {
    // Placeholder for actual logout logic (clear tokens, redirect)
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userToken');
    localStorage.removeItem('firstname');
    alert("Logging out...");
    window.location.href = "login.html"; 
}

// --- EVENT LISTENERS ---

/**
 * Handles adding a new item to the local list.
 */
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

    // Add item (using index for simplicity in removal)
    items.push({ name, quantity });
    
    updateItemList();
    
    // Reset form inputs after successful addition
    nameInput.value = '';
    quantityInput.value = 1; 
});


// --- API/SUBMISSION LOGIC ---

/**
 * Submits the final laundry list to the server.
 */
async function submitLaundry() {
    // CRITICAL FIX: Use the correct localStorage key: "userEmail"
    const email = localStorage.getItem("userEmail"); 
    
    if (!email) {
        showMessage("User email not found. Please log in again.", "error");
        return;
    }
    
    if (items.length === 0) {
        showMessage("Your basket is empty. Add items before submitting.", "error");
        return;
    }

    // Disable button to prevent double submission
    submitFinalBtn.disabled = true;
    submitFinalBtn.textContent = 'Submitting...';

    try {
        const res = await fetch("/laundry/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, items }), // Sending email and items
        });
        
        const msg = await res.text();

        if (res.ok) {
            showMessage("🎉 Order Submitted! Tracking information sent to your email.", "success");
            
            // Clear local state and UI
            items = [];
            updateItemList();
            
            // Redirect user after a short delay
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 2000);
        } else {
            // Handle server-side errors
            showMessage("⚠️ Submission Failed: " + msg, "error");
            submitFinalBtn.disabled = false;
        }
    } catch (error) {
        // Handle network errors
        showMessage("❌ Network Error. Could not connect to the server.", "error");
        console.error("Submission Error:", error);
        submitFinalBtn.disabled = false;
    } finally {
        submitFinalBtn.textContent = 'Confirm & Submit Order'; // Reset button text
    }
}


// --- INITIALIZATION ---

// Initial setup to display the empty list state when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateItemList();
});