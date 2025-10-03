// ======= Vegetables List =======
const vegetables = [
  { id: 1, name: "Tomato", pricePerKg: 48, img: "assets/img/tomato.jpg" },
  { id: 2, name: "Potato", pricePerKg: 32, img: "assets/img/potato.jpg" },
  { id: 3, name: "Onion", pricePerKg: 38, img: "assets/img/onion.jpg" },
  { id: 4, name: "Carrot", pricePerKg: 60, img: "assets/img/carrot.jpg" },
  { id: 5, name: "Eggplant (Brinjal)", pricePerKg: 55, img: "assets/img/brinjal.jpg" },
  { id: 6, name: "Spinach", pricePerKg: 30, img: "assets/img/spinach.webp" },
  { id: 7, name: "Cauliflower", pricePerKg: 50, img: "assets/img/cauliflower.webp" },
  { id: 8, name: "Cabbage", pricePerKg: 28, img: "assets/img/cabbage.webp" },
  { id: 9, name: "Green Peas", pricePerKg: 80, img: "assets/img/peas.webp" },
  { id: 10, name: "Capsicum", pricePerKg: 70, img: "assets/img/capsicum.jpg" },
  { id: 11, name: "Lady Finger (Okra)", pricePerKg: 60, img: "assets/img/okra.webp" },
  { id: 12, name: "Bottle Gourd", pricePerKg: 35, img: "assets/img/bottle-gourd.cms" },
  { id: 13, name: "Cucumber", pricePerKg: 40, img: "assets/img/cucumber.webp" },
  { id: 14, name: "Pumpkin", pricePerKg: 25, img: "assets/img/pumpkin.jpeg" },
  { id: 15, name: "Bitter Gourd", pricePerKg: 55, img: "assets/img/bitter-gourd.jpeg" }
];

// ======= Quantity Options =======
const qtyOptions = [
  { label: "1 kg", factor: 1 },
  { label: "2 kg", factor: 2 },
  { label: "250 gm", factor: 0.25 },
  { label: "500 gm", factor: 0.5 },
  
];

// ======= Cart =======
let cart = JSON.parse(localStorage.getItem("sabjiCart")) || [];
let currentLocation = null; // Stores GPS location + address

// ======= Save Cart to LocalStorage =======
function saveCart() {
  localStorage.setItem("sabjiCart", JSON.stringify(cart));
}

// ======= Render Vegetables =======
function renderVegCards() {
  const list = document.getElementById("veg-list");
  list.innerHTML = vegetables.map(v => `
    <div class="col-md-4 col-lg-3 mb-4">
      <div class="card shadow-sm h-100 veg-card border-0 rounded-4">
        <img src="${v.img}" class="card-img-top veg-img rounded-top-4" alt="${v.name}" style="height:180px;object-fit:cover;">
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 class="card-title fw-semibold mb-1">${v.name}</h5>
            <p class="text-success fw-bold mb-2">₹${v.pricePerKg.toFixed(2)} <span class="text-muted fw-normal">/Kg</span></p>
          </div>
          <div class="d-flex gap-2 align-items-center mt-auto">
            <select id="qty-${v.id}" class="form-select form-select-sm rounded-pill" style="max-width:100px;">
              ${qtyOptions.map(q=>`<option value="${q.factor}">${q.label}</option>`).join("")}
            </select>
            <button class="btn btn-success btn-sm rounded-pill px-3 shadow-sm" onclick="addToCart(${v.id})">
              <span class="me-1">🛒</span>Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

// ======= Add Item to Cart =======
function addToCart(vegId) {
  const veg = vegetables.find(x => x.id === vegId);
  const select = document.getElementById(`qty-${vegId}`);
  const factor = +select.value;
  const qtyLabel = qtyOptions.find(q => q.factor === factor).label;
  const amount = +(veg.pricePerKg * factor).toFixed(2);

  cart.push({ id: veg.id, name: veg.name, qtyLabel, qtyFactor: factor, pricePerKg: veg.pricePerKg, amount });
  saveCart();
  renderCartPanel();
}

// ======= Remove Item =======
function removeFromCart(idx) {
  cart.splice(idx, 1);
  saveCart();
  renderCartPanel();
  renderOrderSummary();
}

// ======= Update Item Quantity =======
function updateCartQty(idx, newFactor) {
  const item = cart[idx];
  const factor = +newFactor;
  const qtyLabel = qtyOptions.find(q => q.factor === factor).label;
  cart[idx] = { ...item, qtyFactor: factor, qtyLabel, amount: +(item.pricePerKg * factor).toFixed(2) };
  saveCart();
  renderCartPanel();
  renderOrderSummary();
}

// ======= Render Cart Panel =======
function renderCartPanel() {
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartBadge = document.getElementById("cartBadge");

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
    cartTotalEl.textContent = "₹0.00";
    cartBadge.textContent = "0";
    return;
  }

  cartItemsEl.innerHTML = cart.map((it, idx) => `
    <div class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <strong>${it.name}</strong><br>
        <select class="form-select form-select-sm mt-1" style="width:120px"
          onchange="updateCartQty(${idx}, this.value)">
          ${qtyOptions.map(q=>`<option value="${q.factor}" ${q.factor===it.qtyFactor?'selected':''}>${q.label}</option>`).join("")}
        </select>
      </div>
      <div class="text-end">
        <div>₹${it.amount.toFixed(2)}</div>
        <button class="btn btn-sm btn-outline-danger mt-1" onclick="removeFromCart(${idx})">❌</button>
      </div>
    </div>
  `).join("");

  const total = cart.reduce((s,it)=>s+it.amount,0);
  cartTotalEl.textContent = `₹${total.toFixed(2)}`;
  cartBadge.textContent = cart.length;
}

// ======= Billing Modal =======
const billingModal = new bootstrap.Modal(document.getElementById("billingModal"));
function openBilling() {
  renderOrderSummary();
  billingModal.show();
}

// ======= Render Order Summary =======
function renderOrderSummary() {
  const orderSummaryEl = document.getElementById("order-summary");
  const modalTotalEl = document.getElementById("modalTotal");

  if (cart.length === 0) {
    orderSummaryEl.innerHTML = "<p>No items in cart.</p>";
    modalTotalEl.textContent = "₹0.00";
    return;
  }

  orderSummaryEl.innerHTML = cart.map((it, idx) => 
    `${idx+1}. ${it.name} — ${it.qtyLabel} — ₹${it.amount.toFixed(2)}`
  ).join("\n");

  const total = cart.reduce((s,it)=>s+it.amount,0);
  modalTotalEl.textContent = `₹${total.toFixed(2)}`;
}

// ======= Current Location =======
function fillCurrentLocation() {
  if (!navigator.geolocation) { alert("Geolocation not supported."); return; }

  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude.toFixed(6);
    const lon = pos.coords.longitude.toFixed(6);
    const link = `https://maps.google.com/?q=${lat},${lon}`;

    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
      const data = await resp.json();
      const addressText = data.display_name || "";
      currentLocation = { lat, lon, link, addressText };
      document.getElementById("address").value = `${addressText}\n${link}`;
    } catch(err) {
      currentLocation = { lat, lon, link, addressText:"" };
      document.getElementById("address").value = `${lat},${lon}\n${link}`;
    }
  }, () => alert("Unable to get location"));
}

// ======= Submit Order to WhatsApp =======
function submitOrder() {
  if (cart.length === 0) return alert("Cart is empty!");
  let address = document.getElementById("address").value.trim();
  if (!address) return alert("Please enter address");

  let msg = "🛒 *Sabji Bazaar Order*\n\n*Items:*\n";
  cart.forEach((it, idx) => {
    msg += `${idx+1}. ${it.name} — ${it.qtyLabel} — ₹${it.amount.toFixed(2)}\n`;
  });

  const total = cart.reduce((s,it)=>s+it.amount,0);
  msg += `\n*Total Amount:* ₹${total.toFixed(2)}\n\n*Delivery Address:*\n${address}\n\nPlease confirm. Thank you!`;

  const phone = "916261627344";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");

  cart = [];
  saveCart();
  renderCartPanel();
  document.getElementById("address").value = "";
  currentLocation = null;
  billingModal.hide();
}

// ======= Initialize =======
renderVegCards();
renderCartPanel();
