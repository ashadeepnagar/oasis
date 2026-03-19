// --- MANAGE YOUR ITEMS HERE ---
    const menuData = {
      drinks: { title: "Shake", accent: "amber", items: [
        { name: "Banana", price: 80, img: "/assets/images/shakes/banana.jpg" },
        { name: "Chocolate", price: 100, img: "/assets/images/shakes/chocolate.jpg" },
        { name: "Cold-Coffee", price: 50, img: "/assets/images/shakes/cold-coffee.jpg" },
        { name: "Kit-Kat", price: 90, img: "/assets/images/shakes/kit-kat.jpg" },
        { name: "Mango", price: 90, img: "/assets/images/shakes/mango.jpg" },
        { name: "Oreo", price: 110, img: "/assets/images/shakes/oreo.jpg" }
      ]},
      pizza: { title: "Pizza", accent: "red", items: [
        { name: "Margherita", price: 350, img: "/assets/images/pizza/margherita.jpg" },
        { name: "Farmhouse", price: 420, img: "/assets/images/pizza/farm-h.jpg" },
        { name: "Spice-Paneer", price: 220, img: "/assets/images/pizza/spice-paneer.jpg" },
        { name: "Cheese-Corn", price: 220, img: "/assets/images/pizza/cheese-corn.jpg" },
        { name: "Mashroom", price: 420, img: "/assets/images/pizza/mashroom.jpg" },
        { name: "Vaggie-Lover", price: 320, img: "/assets/images/pizza/vaggie-lover.jpg" },
        { name: "Dubble-cheese-Delight", price: 350, img: "/assets/images/pizza/d-cheese.jpg" },
        { name: "Cheese-Brust", price: 520, img: "/assets/images/pizza/c-brust.jpg" },
        { name: "Achari-do-Pyaza", price: 220, img: "/assets/images/pizza/achari-do-pyaza.jpg" }
      ]},
      burgers: { title: "Burger", accent: "orange", items: [
        { name: "Veggie Supreme", price: 180, img: "/assets/images/burgers/burger.jpg" }
      ]},
      tea: { title: "Tea", accent: "blue", items: [
        { name: "Mashala", price: 1, img: "/assets/images/tea/mashala.jpg" },
        { name: "Ice", price: 2, img: "/assets/images/tea/ice-tea.jpg" },
        { name: "Green", price: 3, img: "/assets/images/tea/green-tea.jpg" }
      ]},
      momos: { title: "Momos", accent: "emerald", items: [
        { name: "Steam", price: 90, img: "/assets/images/momos/steam.jpg" },
        { name: "Fry", price: 110, img: "/assets/images/momos/fry.jpg" }
      ] }
        
    };

    // 2. RENDER CATEGORIES & ITEMS
  const nav = document.getElementById('category-nav');
  const main = document.getElementById('category-sections');

  Object.keys(menuData).forEach(key => {
    const cat = menuData[key];
    
    // Inject Nav Link
    nav.innerHTML += `<a href="#${key}" class="whitespace-nowrap hover:text-amber-400 transition capitalize">${cat.title}</a>`;

    // Generate Items HTML
    let itemsHtml = cat.items.map(item => `
      <div class="bg-[#2A201E] rounded-2xl p-4 border border-white/5 hover:border-${cat.accent}-500/30 transition group">
        <img src="${item.img}" class="w-full h-32 object-cover rounded-xl mb-4 group-hover:scale-105 transition duration-300">
        <h3 class="text-sm font-semibold mb-1">${item.name}</h3>
        <p class="text-${cat.accent}-400 font-bold text-sm mb-3">₹${item.price}</p>
        <button data-name="${item.name}" data-price="${item.price}" data-category="${cat.title}"
                class="add-to-cart w-full py-2 bg-${cat.accent}-700/20 border border-${cat.accent}-700/50 hover:bg-${cat.accent}-600 rounded-lg text-xs transition">
          Add to Cart
        </button>
      </div>`).join('');

    // Inject Section
    main.innerHTML += `
      <section id="${key}" class="mb-20 pt-10 border-t border-white/5 first:border-t-0">
        <div class="flex items-center gap-4 mb-8">
          <div class="h-1 w-12 bg-${cat.accent}-500 rounded-full"></div>
          <h2 class="text-3xl font-bold tracking-tight">${cat.title}</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          ${itemsHtml || '<p class="text-gray-500 italic">Coming soon...</p>'}
        </div>
      </section>`;
  });
// 3. ADD TO CART LOGIC (Matches your script.js exactly)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (btn) {
      const name = btn.getAttribute('data-name');
      const price = Number(btn.getAttribute('data-price'));
      const category = btn.getAttribute('data-category');
      const displayName = `${name}-${category}`;

      // This logic mirrors your index.html/menu.js logic
      const existing = cart.find(item => item.name === displayName);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ name: displayName, price, quantity: 1 });
      }

      // Calls the shared update function in script.js
      if (typeof updateCartDisplay === "function") {
        updateCartDisplay();
      }
    }
  });
