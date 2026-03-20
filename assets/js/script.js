// ==========================================
// Caffeine Oasis - Shared JavaScript (script.js)
// Used by ALL pages
// ==========================================

// 1. Smooth scrolling for internal links (#home, #menu, etc.)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#') && href.length > 1) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// 2. Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// 3. Cart Logic (used in cart/index.html and menu pages)
// Initialize cart from localStorage instead of a blank array
let cart = JSON.parse(localStorage.getItem('caffeine_oasis_cart')) || [];
//let cart = [];
const GST_RATE = 0.05;

// Create a helper function to save the cart whenever it changes
function saveCartToStorage() {
    localStorage.setItem('caffeine_oasis_cart', JSON.stringify(cart));
}

// Elements (will be null on pages that don't have them — that's fine)
const cartToggle      = document.getElementById('cart-toggle');
const cartDrawer      = document.getElementById('cart-drawer');
const closeCart       = document.getElementById('close-cart');
const continueBtn     = document.getElementById('continue-shopping');
const drawerItems     = document.getElementById('drawer-items');
const drawerSubtotal  = document.getElementById('drawer-subtotal');
const drawerGst       = document.getElementById('drawer-gst');
const drawerTotal     = document.getElementById('drawer-total');
const whatsappDrawer  = document.getElementById('whatsapp-from-drawer');
const printDrawer     = document.getElementById('print-from-drawer');
const customerName    = document.getElementById('customer-name');
const addressInput    = document.getElementById('delivery-address');
const cartCountBadge  = document.getElementById('cart-count');

// Open / Close cart drawer
if (cartToggle && cartDrawer) {
  cartToggle.addEventListener('click', () => {
    cartDrawer.classList.remove('hidden');
    setTimeout(() => {
      const drawerContent = cartDrawer.querySelector('.translate-x-full');
      if (drawerContent) drawerContent.classList.remove('translate-x-full');
    }, 10);
  });
}

function closeDrawer() {
  const drawerContent = cartDrawer?.querySelector('.translate-x-full, .right-0');
  if (drawerContent) {
    drawerContent.classList.add('translate-x-full');
  }
  setTimeout(() => {
    cartDrawer?.classList.add('hidden');
  }, 350);
}

if (closeCart) closeCart.addEventListener('click', closeDrawer);
if (continueBtn) continueBtn.addEventListener('click', closeDrawer);

// Close when clicking outside drawer
if (cartDrawer) {
  cartDrawer.addEventListener('click', (e) => {
    if (e.target === cartDrawer) closeDrawer();
  });
}


// Quantity change & remove
window.changeQuantity = function(index, delta) {
  if (cart[index]) {
    cart[index].quantity = Math.max(1, cart[index].quantity + delta);
    if (cart[index].quantity === 0) {
      cart.splice(index, 1);
    }
    updateCartDisplay();
  }
};

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  updateCartDisplay();
};

// Update cart display if cart empty then option is disabled (badge + drawer)
function updateCartDisplay() {
  saveCartToStorage();
  // Cart count badge
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountBadge) {
    cartCountBadge.textContent = totalItems;
    if (totalItems > 0) {
      cartCountBadge.classList.remove('hidden');
    } else {
      cartCountBadge.classList.add('hidden');
    }
  }
  // Disable/Enable WhatsApp button based on cart content if empty then now showing
  if (whatsappDrawer) {
    if (cart.length === 0) {
      whatsappDrawer.classList.add('opacity-50', 'cursor-not-allowed');
      whatsappDrawer.style.pointerEvents = 'none'; // Optional: makes it unclickable
    } else {
      whatsappDrawer.classList.remove('opacity-50', 'cursor-not-allowed');
      whatsappDrawer.style.pointerEvents = 'auto';
    }
  }
  // Disable/Enable Make Payment button based on cart content if empty then now showing
  const payBtn = document.getElementById('pay-button'); // The ID we fixed earlier
  const qrBtn = document.getElementById('qr-section'); // Also targeting the container if needed
  
  if (payBtn) {
    if (cart.length === 0) {
      // Disable the button
      payBtn.disabled = true;
      payBtn.classList.add('opacity-50', 'cursor-not-allowed', 'grayscale');
      payBtn.innerText = "Cart Empty";
    } else {
      // Enable the button
      payBtn.disabled = false;
      payBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'grayscale');
      payBtn.innerText = "Make Payment";
    }
  }

  // Hide the QR section automatically if the cart becomes empty
  if (cart.length === 0 && qrSection) {
    qrSection.classList.add('hidden');
  }

  // Drawer content
  if (drawerItems) {
    drawerItems.innerHTML = cart.map((item, i) => `
      <div class="flex justify-between items-center bg-[#2A201E]/60 p-4 rounded-lg">
        <div class="flex-1">
          <div class="font-medium">${item.name}</div>
          <div class="text-amber-400">₹${item.price} × ${item.quantity}</div>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="changeQuantity(${i}, -1)" class="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/50">
            <i class="fas fa-minus"></i>
          </button>
          <span class="font-medium w-8 text-center">${item.quantity}</span>
          <button onclick="changeQuantity(${i}, 1)" class="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/50">
            <i class="fas fa-plus"></i>
          </button>
          <button onclick="removeFromCart(${i})" class="text-red-400 hover:text-red-300 ml-2">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('') || '<p class="text-center text-gray-400 py-10">Your cart is empty</p>';
  }

  // Calculations
  const subtotal   = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gstAmount  = subtotal * GST_RATE;
  const grandTotal = subtotal + gstAmount;

  if (drawerSubtotal) drawerSubtotal.textContent = `₹${subtotal.toFixed(0)}`;
  if (drawerGst)      drawerGst.textContent      = `₹${gstAmount.toFixed(0)}`;
  if (drawerTotal)    drawerTotal.textContent    = `₹${grandTotal.toFixed(0)}`;

  // WhatsApp message
  if (whatsappDrawer) {
    const name = customerName?.value.trim() || 'Customer';
    const address = addressInput?.value.trim() || '(not provided)';
    const orderLines = cart.map(item => `• ${item.name} × ${item.quantity} = ₹${(item.price * item.quantity).toFixed(0)}`);

    const message = 
`Hi Caffeine Oasis!

Order from: ${name}

${orderLines.join('\n')}

Subtotal: ₹${subtotal.toFixed(0)}
GST (5%): ₹${gstAmount.toFixed(0)}
Grand Total: ₹${grandTotal.toFixed(0)}

Delivery Address:
${address}

Pickup or Delivery? Thank you! ☕`;

    const encoded = encodeURIComponent(message);
    whatsappDrawer.href = `https://wa.me/917062214305?text=${encoded}`;
  }
}

// Print Receipt (from drawer)
if (printDrawer) {
  printDrawer.addEventListener('click', () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const subtotal   = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gstAmount  = subtotal * GST_RATE;
    const grandTotal = subtotal + gstAmount;

    const name = customerName?.value.trim() || 'Customer';
    const address = addressInput?.value.trim() || 'Pickup / Not specified';

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Caffeine Oasis</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 15mm; font-size: 14px; color: #111; line-height: 1.5; }
          h1 { text-align: center; color: #D97706; margin-bottom: 8px; font-size: 24px; }
          .info { text-align: center; font-size: 13px; color: #444; margin-bottom: 20px; }
          .customer { font-weight: bold; margin: 10px 0; text-align: center; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 8px 0; text-align: left; border-bottom: 1px solid #ddd; }
          th { font-weight: bold; color: #222; }
          .total { font-weight: bold; border-top: 2px dashed #999; padding-top: 12px; margin-top: 12px; }
          .thanks { text-align: center; margin-top: 30px; font-style: italic; color: #555; }
          @media print { body { margin: 10mm; } }
        </style>
      </head>
      <body onload="window.print(); window.focus();">
        <h1>Caffeine Oasis</h1>
        <div class="info">
          Balriya Fatak, Choru Road, CKB<br>
          Phone: +91 7062214305<br>
          ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </div>

        <div class="customer">
          Customer: ${name}
        </div>

        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th class="text-right">Amount</th></tr>
          </thead>
          <tbody>
            ${cart.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td class="text-right">₹${(item.price * item.quantity).toFixed(0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total">
          <div class="flex justify-between">
            <span>Subtotal:</span> <span>₹${subtotal.toFixed(0)}</span>
          </div>
          <div class="flex justify-between">
            <span>GST (5%):</span> <span>₹${gstAmount.toFixed(0)}</span>
          </div>
          <div class="flex justify-between text-lg mt-3">
            <span>Grand Total:</span> <span>₹${grandTotal.toFixed(0)}</span>
          </div>
        </div>

        ${address !== 'Pickup / Not specified' ? `
          <p class="mt-5"><strong>Delivery to:</strong><br>${address.replace(/\n/g, '<br>')}</p>
        ` : ''}

        <p class="thanks mt-8">Thank you, ${name}!<br>Visit us again soon ☕</p>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    } else {
      alert("Popup blocked! Allow popups to print the receipt.");
    }
  });
}
// QR code event listeners in script.js
const payBtn = document.getElementById('pay-button');
const qrSection = document.getElementById('qr-section');
const printBtn = document.getElementById('print-from-drawer');

if (payBtn && qrSection) {
  payBtn.addEventListener('click', () => {
    // Show the QR code section only on non-mobile devices
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
      qrSection.classList.toggle('hidden');
    }
    // Also show the Print Receipt button now that they are paying
    if (printBtn) {
      printBtn.classList.remove('hidden');
    }
  });
}
// Add Pay via App" script.js
  const payButton = document.getElementById('pay-button');
  if (payButton) {
    payButton.addEventListener('click', function() {
      const totalAmount = document.getElementById('drawer-total').textContent.replace('₹', '');
      const upiID = "7062214305"; // REPLACE WITH YOUR ACTUAL UPI ID
      const merchantName = "Caffeine Oasis";
      
      // Create the standard UPI Intent string
      const upiUrl = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount}&cu=INR`;

      // Detect Mobile
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
          // Show the special "Pay via App" button and trigger it
          const intentLink = document.getElementById('upi-intent-link');
        intentLink.href = upiUrl;
        intentLink.classList.remove('hidden');
        intentLink.target = "_blank";
        intentLink.click(); // Triggers the UPI app chooser
        // Automatically send order via WhatsApp after payment intent
        const whatsappDrawer = document.getElementById('whatsapp-from-drawer');
        if (whatsappDrawer) {
          whatsappDrawer.click();
        }
        // Optionally: You can keep window.location.href = upiUrl; as a fallback, but it may not work in all browsers
        // window.location.href = upiUrl;
    } else {
        // On Desktop, just show the QR Code as we did before
        const qrSection = document.getElementById('qr-section');
        if (qrSection) {
            qrSection.classList.remove('hidden');
        }
    }
    
    // Show the print button
    const printBtn = document.getElementById('print-from-drawer');
    if (printBtn) printBtn.classList.remove('hidden');
  });
}
// Initial cart update on page load
updateCartDisplay();
