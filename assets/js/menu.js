const menuItems = [
  { name: "Obsession Cold Brew", price: 280, img: "/assets/images/hot-deal/cold-brew.jpg", desc: "12hr slow-drip." },
  { name: "Caramel Latte", price: 320, img: "/assets/images/hot-deal/Caramel-Hazelnut-Latte.jpg", desc: "Nutty. Sweet." },
  { name: "Espresso Tonic", price: 290, img: "/assets/images/hot-deal/Espresso-Tonic.jpg", desc: "Bright. Bubbly." },
  { name: "Plain Pizza", price: 490, img: "/assets/images/hot-deal/plain-pizza.jpg", desc: "Testy. Pizza." },
  { name: "Cheese Burger", price: 90, img: "/assets/images/hot-deal/cheese-burger.jpg", desc: "Cheesie. Rock." },
  { name: "Momos", price: 90, img: "/assets/images/hot-deal/momos.jpg", desc: "White. Gold." },
  { name: "French Fries", price: 125, img: "/assets/images/hot-deal/ffries.jpg", desc: "Golden. Stick." },
  { name: "Garlic Bread", price: 99, img: "/assets/images/hot-deal/c-g-bread.jpg", desc: "Soft. Spicy." },
  { name: "Hot Brownie", price: 149, img: "/assets/images/hot-deal/Hot-b.jpg", desc: "Hot. Blend." },
  { name: "Hot Tea", price: 20, img: "/assets/images/hot-deal/tea.jpg", desc: "Refreshment. Totally." },
  // Just add more lines like this to reach 10 items!
];

const menuContainer = document.getElementById('menu-container');

menuItems.forEach(item => {
  menuContainer.innerHTML += `
    <div class="bg-[#1F1717] rounded-xl overflow-hidden hover:scale-[1.03] transition group border border-white/5">
      <img src="${item.img}" alt="${item.name}" class="w-full h-40 object-cover object-[45%_30%]">
      <div class="p-4">
        <h3 class="text-sm font-semibold text-white mb-1 truncate">${item.name}</h3>
        <p class="text-amber-400 text-sm font-bold mb-1">₹${item.price}</p>
        <p class="text-xs text-gray-400 mb-4 line-clamp-1">${item.desc}</p>
        <button data-name="${item.name}" data-price="${item.price}" 
                class="add-to-cart w-full bg-amber-700/70 hover:bg-amber-600 py-2 rounded-lg text-xs transition">
          Add to Cart
        </button>
      </div>
    </div>
  `;
});
// Add to cart (used on menu page)
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const name  = btn.dataset.name;
    const price = Number(btn.dataset.price);

    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1 });
    }

    updateCartDisplay();
  });
});