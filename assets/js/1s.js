const vegetables = [
  { id: 1, name: "Tomato", pricePerKg: 40, img: "assets/img/tomato.jpg" },
  { id: 2, name: "Potato", pricePerKg: 30, img: "assets/img/potato.jpg" },
  { id: 3, name: "Onion", pricePerKg: 50, img: "assets/img/onion.jpg" },
  { id: 4, name: "Capsicum", pricePerKg: 60, img: "assets/img/capsicum.jpg" },
  { id: 5, name: "Cabbage", pricePerKg: 35, img: "assets/img/cabbage.jpg" }
];

const qtyOptions = [
  { label: "250 gm", factor: 0.25 },
  { label: "500 gm", factor: 0.5 },
  { label: "1 Kg", factor: 1 }
];

let cart = JSON.parse(localStorage.getItem("sabjiCart")) || [];

function saveCart() { localStorage.setItem("sabjiCart", JSON.stringify(cart)); }

// Generate veg cards
function renderVegCards() {
  const list = document.getElementById("veg-list");
  list.innerHTML = vegetables.map(v => `
    <div class="col-md-3">
      <div class="card shadow-sm h-100">
        <img src="${v.img}" class="card-img-top" alt="${v.name}">
        <div class="card-body d-flex flex-column">
          <h5>${v.name}</h5>
          <p>₹${v.pricePerKg}/Kg</p>
          <select id="qty-${v.id}" class="form-select mb-2">
            ${qtyOptions.map(q=>`<option value="${q.factor}">${q.label}</option>`).join("")}
          </select>
          <button class="btn btn-success mt-auto" onclick="addToCart(${v.id})">Add to Cart</button>
        </div>
      </div>
    </div>`).join("");
}

function addToCart(vegId) {
  const veg = vegetables.find(x=>x.id===vegId);
  const select = document.getElementById(`qty-${vegId}`);
  const factor = +select.value;
  const qtyLabel = qtyOptions.find(q=>q.factor===factor).label;
  const amount = +(veg.pricePerKg * factor).toFixed(2);
  cart.push({ id: veg.id, name: veg.name, qtyLabel, qtyFactor: factor, pricePerKg: veg.pricePerKg, amount });
  saveCart();
  renderCartPanel();
}

function removeFromCart(idx) {
  cart.splice(idx,1);
  saveCart();
  renderCartPanel();
  renderOrderSummary();
}

function updateCartQty(idx, newFactor) {
  const item = cart[idx];
  const factor = +newFactor;
  const qtyLabel = qtyOptions.find(q=>q.factor===factor).label;
  cart[idx] = { ...item, qtyFactor: factor, qtyLabel, amount: +(item.pricePerKg*factor).toFixed(2)};
  saveCart();
  renderCartPanel();
  renderOrderSummary();
}

function renderCartPanel() {
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartBadge = document.getElementById("cartBadge");

  if(cart.length===0){
    cartItemsEl.innerHTML = '<p class="text-muted">Cart is empty.</p>';
    cartTotalEl.textContent = "₹0.00";
    cartBadge.textContent = "0";
    return;
  }

  cartItemsEl.innerHTML = cart.map((it,idx)=>`
    <div class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <strong>${it.name}</strong><br>
        <select class="form-select form-select-sm mt-1" style="width:120px"
          onchange="updateCartQty(${idx}, this.value)">
          ${qtyOptions.map(q=>`
            <option value="${q.factor}" ${q.factor===it.qtyFactor?'selected':''}>${q.label}</option>`).join("")}
        </select>
      </div>
      <div class="text-end">
        <div>₹${it.amount.toFixed(2)}</div>
        <button class="btn btn-sm btn-outline-danger mt-1" onclick="removeFromCart(${idx})">❌</button>
      </div>
    </div>`).join("");

  const total = cart.reduce((s,it)=>s+it.amount,0);
  cartTotalEl.textContent = `₹${total.toFixed(2)}`;
  cartBadge.textContent = cart.length;
}

const billingModal = new bootstrap.Modal(document.getElementById("billingModal"));
function openBilling() { renderOrderSummary(); billingModal.show(); }

function renderOrderSummary(){
  const orderSummaryEl = document.getElementById("order-summary");
  const modalTotalEl = document.getElementById("modalTotal");

  if(cart.length===0){
    orderSummaryEl.innerHTML = "<p>No items</p>";
    modalTotalEl.textContent="₹0.00"; return;
  }

  orderSummaryEl.innerHTML = `
    <table class="table table-sm">
      <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th><th></th></tr>
      ${cart.map((it,idx)=>`
        <tr>
          <td>${it.name}</td>
          <td>
            <select class="form-select form-select-sm" onchange="updateCartQty(${idx}, this.value)">
              ${qtyOptions.map(q=>`<option value="${q.factor}" ${q.factor===it.qtyFactor?'selected':''}>${q.label}</option>`).join("")}
            </select>
          </td>
          <td>₹${it.pricePerKg}</td>
          <td>₹${it.amount.toFixed(2)}</td>
          <td><button class="btn btn-sm btn-danger" onclick="removeFromCart(${idx})">❌</button></td>
        </tr>`).join("")}
    </table>`;
  modalTotalEl.textContent = `₹${cart.reduce((s,it)=>s+it.amount,0).toFixed(2)}`;
}

// Current location
function fillCurrentLocation() {
  if(!navigator.geolocation){ alert("Geolocation not supported"); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat = pos.coords.latitude.toFixed(6);
    const lon = pos.coords.longitude.toFixed(6);
    const link = `https://maps.google.com/?q=${lat},${lon}`;
    document.getElementById("address").value += `\nMy Location: ${lat},${lon}\n${link}`;
  },()=>alert("Unable to get location"));
}

// Submit → WhatsApp
function submitOrder(){
  if(cart.length===0) return alert("Cart is empty!");
  const address = document.getElementById("address").value.trim();
  if(!address) return alert("Please enter address");

  let msg="🛒 Sabji Bazaar Order\n";
  cart.forEach(it=>{ msg+=`${it.name} - ${it.qtyLabel} - ₹${it.amount}\n`; });
  msg+=`\nTotal: ₹${cart.reduce((s,it)=>s+it.amount,0).toFixed(2)}\nAddress: ${address}`;
  const phone="916261627344";
  const url=`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url,"_blank");
}

renderVegCards();
renderCartPanel();
