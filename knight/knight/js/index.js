/* ------------------------------------------------------------------
   A Knight of the Seven Provinces: lógica principal de la tienda
   1) Saludo con el nombre del visitante
   2) Catálogo de productos + filtros por categoría
   3) Carrito de compras (se guarda en el navegador)
   4) Menú móvil
------------------------------------------------------------------- */
(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);

  /* ---------- Almacenamiento seguro (puede fallar en modo privado) ---------- */
  const store = {
    get(key) {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch (e) { /* ignorar */ }
    }
  };

  const NAME_KEY = "knight-name";
  const CART_KEY = "knight-cart";

  function formatPrice(amount) {
    return "₡" + Number(amount).toLocaleString("en-US");
  }

  function el(tag, props, children) {
    const node = document.createElement(tag);
    Object.entries(props || {}).forEach(function (entry) {
      const key = entry[0], value = entry[1];
      if (key === "text") node.textContent = value;
      else if (key === "class") node.className = value;
      else node.setAttribute(key, value);
    });
    (children || []).forEach(function (child) { node.appendChild(child); });
    return node;
  }

  const liveStatus = $("#live-status");
  function announce(message) {
    if (liveStatus) liveStatus.textContent = message;
  }

  /* ---------- Aviso flotante ---------- */
  let toastNode = null;
  let toastTimer = null;
  function toast(message) {
    if (!toastNode) {
      toastNode = el("div", { class: "toast", "aria-hidden": "true" });
      document.body.appendChild(toastNode);
    }
    toastNode.textContent = message;
    toastNode.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastNode.classList.remove("toast--show"); }, 1800);
    announce(message);
  }

  /* ==================================================================
     1) Saludo con el nombre
     ================================================================== */
  const subtitle = $("#shop-title");
  const baseSubtitle = subtitle ? subtitle.textContent : "";
  let visitorName = "";

  function applyName(name) {
    visitorName = name;
    if (subtitle) subtitle.textContent = name ? name + ", " + baseSubtitle : baseSubtitle;
  }

  function cleanName(raw) {
    const name = String(raw || "").trim();
    // Misma regla de tu versión original: vacío o más de 12 letras no se usa
    return name === "" || name.length > 12 ? "" : name;
  }

  const savedName = cleanName(store.get(NAME_KEY));
  if (savedName) applyName(savedName);

  const nameForm = $("#name-form");
  if (nameForm) {
    const nameInput = $("#knight-name");
    if (savedName) nameInput.value = savedName;

    nameForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = cleanName(nameInput.value);
      if (!name) {
        toast("Write a name of up to 12 letters, knight.");
        return;
      }
      store.set(NAME_KEY, name);
      applyName(name);
      if (name === "Moises") console.log("Viva Messi");
      toast("Welcome, " + name + "!");
    });
  }

  /* ==================================================================
     2) Productos y filtros
     ================================================================== */
  const grid = $("#products-grid");
  const countLabel = $("#products-count");
  const CATEGORY_LABELS = { WEAPON: "Weapon", ARMOUR: "Armour", SHIELD: "Shield" };
  let currentFilter = "ALL";

  function productCard(product) {
    const image = el("img", {
      class: "product-card__img",
      src: product.image,
      alt: product.name,
      loading: "lazy"
    });
    const button = el("button", {
      type: "button",
      class: "product-card__btn",
      "data-add": String(product.id),
      "aria-label": "Add " + product.name + " to cart",
      text: "Add to cart"
    });
    const body = el("div", { class: "product-card__body" }, [
      el("span", { class: "product-card__tag", text: CATEGORY_LABELS[product.category] || product.category }),
      el("h3", { class: "product-card__name", text: product.name }),
      el("p", { class: "product-card__desc", text: product.description }),
      el("p", { class: "product-card__price", text: formatPrice(product.price) }),
      button
    ]);
    return el("article", { class: "product-card" }, [image, body]);
  }

  function renderProducts() {
    if (!grid || typeof PRODUCTS === "undefined") return;
    const list = PRODUCTS.filter(function (p) {
      return currentFilter === "ALL" || p.category === currentFilter;
    });
    grid.replaceChildren.apply(grid, list.map(productCard));
    if (countLabel) {
      countLabel.textContent = list.length + (list.length === 1 ? " item" : " items");
    }
  }

  // Esta función la llaman los botones del HTML (onclick="filtrarCategoria('WEAPON')")
  function filtrarCategoria(category) {
    currentFilter = CATEGORY_LABELS[category] ? category : "ALL";

    document.querySelectorAll(".filters__btn").forEach(function (btn) {
      btn.classList.toggle("filters__btn--active", btn.dataset.filter === currentFilter);
    });
    document.querySelectorAll(".about__icons").forEach(function (card) {
      card.classList.toggle("about__icons--active", card.dataset.category === currentFilter);
    });

    renderProducts();

    // Si la lista quedó muy abajo, llévala a la vista
    if (grid && grid.getBoundingClientRect().top > window.innerHeight * 0.75) {
      grid.scrollIntoView({ block: "start" });
    }
  }
  window.filtrarCategoria = filtrarCategoria;

  if (grid) {
    grid.addEventListener("click", function (event) {
      const button = event.target.closest("[data-add]");
      if (button) addToCart(Number(button.dataset.add));
    });
  }

  /* ==================================================================
     3) Carrito
     ================================================================== */
  const cartPanel = $("#cart");
  const cartOverlay = $("#cart-overlay");
  const cartBody = $("#cart-body");
  const cartFoot = $("#cart-foot");
  const cartTotal = $("#cart-total");
  const cartCount = $("#cart-count");
  const openButton = $("#cart-open");
  const closeButton = $("#cart-close");
  const checkoutButton = $("#cart-checkout");
  const clearButton = $("#cart-clear");

  let cart = loadCart();
  let orderPlaced = false;
  let lastFocus = null;

  function loadCart() {
    try {
      const parsed = JSON.parse(store.get(CART_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      // Solo productos que todavía existen en el catálogo
      return parsed.filter(function (line) {
        return line && PRODUCTS.some(function (p) { return p.id === line.id; }) && line.qty > 0;
      });
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    store.set(CART_KEY, JSON.stringify(cart));
  }

  function findProduct(id) {
    return PRODUCTS.find(function (p) { return p.id === id; });
  }

  function addToCart(id) {
    const product = findProduct(id);
    if (!product) return;
    const line = cart.find(function (item) { return item.id === id; });
    if (line) line.qty += 1;
    else cart.push({ id: id, qty: 1 });
    orderPlaced = false;
    saveCart();
    renderCart();
    toast(product.name + " added to your cart");
  }

  function changeQty(id, delta) {
    const line = cart.find(function (item) { return item.id === id; });
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter(function (item) { return item.id !== id; });
    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(function (item) { return item.id !== id; });
    saveCart();
    renderCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  function cartLine(line) {
    const product = findProduct(line.id);
    const info = el("div", {}, [
      el("p", { class: "cart-item__name", text: product.name }),
      el("p", { class: "cart-item__price", text: formatPrice(product.price) + " each" }),
      el("div", { class: "cart-item__qty" }, [
        el("button", { type: "button", "data-qty": "-1", "data-id": String(product.id), "aria-label": "Decrease quantity of " + product.name, text: "−" }),
        el("span", { "aria-label": "Quantity", text: String(line.qty) }),
        el("button", { type: "button", "data-qty": "1", "data-id": String(product.id), "aria-label": "Increase quantity of " + product.name, text: "+" })
      ])
    ]);
    const side = el("div", { class: "cart-item__sub" }, [
      el("p", { text: formatPrice(product.price * line.qty) }),
      el("button", { type: "button", class: "cart-item__remove", "data-remove": String(product.id), "aria-label": "Remove " + product.name, text: "Remove" })
    ]);
    return el("div", { class: "cart-item" }, [
      el("img", { class: "cart-item__img", src: product.image, alt: "" }),
      info,
      side
    ]);
  }

  function renderCart() {
    const units = cart.reduce(function (sum, line) { return sum + line.qty; }, 0);
    const total = cart.reduce(function (sum, line) {
      return sum + findProduct(line.id).price * line.qty;
    }, 0);

    cartCount.textContent = String(units);
    openButton.setAttribute("aria-label", "Open cart, " + units + (units === 1 ? " item" : " items"));
    cartTotal.textContent = formatPrice(total);

    if (orderPlaced) {
      const who = visitorName || "knight";
      cartBody.replaceChildren(el("div", { class: "cart__thanks" }, [
        el("h3", { text: "Thank you, " + who + "!" }),
        el("p", { text: "Your order is on its way through the provinces." }),
        el("p", { text: "This is a demo store, so no payment was taken and nothing will really ship." })
      ]));
      cartFoot.hidden = true;
      return;
    }

    cartFoot.hidden = false;
    checkoutButton.disabled = cart.length === 0;
    clearButton.hidden = cart.length === 0;

    if (cart.length === 0) {
      cartBody.replaceChildren(el("p", { class: "cart__empty", text: "Your cart is empty. Pick some gear, knight." }));
    } else {
      cartBody.replaceChildren.apply(cartBody, cart.map(cartLine));
    }
  }

  function focusables() {
    return Array.from(cartPanel.querySelectorAll("button:not([disabled]), [href], input, [tabindex]:not([tabindex='-1'])"))
      .filter(function (node) { return node.offsetParent !== null; });
  }

  function openCart() {
    lastFocus = document.activeElement;
    orderPlaced = false;
    renderCart();
    cartOverlay.hidden = false;
    cartPanel.classList.add("cart--open");
    cartPanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function closeCart() {
    cartOverlay.hidden = true;
    cartPanel.classList.remove("cart--open");
    cartPanel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function isCartOpen() {
    return cartPanel.classList.contains("cart--open");
  }

  openButton.addEventListener("click", function () {
    closeMenu();
    openCart();
  });
  closeButton.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);
  clearButton.addEventListener("click", clearCart);

  checkoutButton.addEventListener("click", function () {
    if (cart.length === 0) return;
    orderPlaced = true;
    cart = [];
    saveCart();
    renderCart();
  });

  cartBody.addEventListener("click", function (event) {
    const qtyButton = event.target.closest("[data-qty]");
    if (qtyButton) {
      changeQty(Number(qtyButton.dataset.id), Number(qtyButton.dataset.qty));
      return;
    }
    const removeButton = event.target.closest("[data-remove]");
    if (removeButton) removeFromCart(Number(removeButton.dataset.remove));
  });

  // Mantener el foco dentro del carrito mientras está abierto
  cartPanel.addEventListener("keydown", function (event) {
    if (event.key !== "Tab") return;
    const nodes = focusables();
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ==================================================================
     4) Menú móvil
     ================================================================== */
  const menuButton = $(".nav__menu");
  const menu = $("#nav-links");

  function closeMenu() {
    if (!menu || !menuButton) return;
    menu.classList.remove("nav__link--open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
  }

  if (menu && menuButton) {
    menuButton.addEventListener("click", function () {
      const open = menu.classList.toggle("nav__link--open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".nav")) closeMenu();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (isCartOpen()) closeCart();
    closeMenu();
  });

  /* ---------- Inicio ---------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  renderProducts();
  renderCart();
})();
