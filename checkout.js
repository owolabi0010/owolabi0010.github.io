(function () {
  const shop = window.SHOP;
  if (!shop) return;
  const money = (n) => "\u20a6" + Number(n).toLocaleString("en-NG");
  const waLink = (text) => "https://wa.me/" + shop.whatsapp + "?text=" + encodeURIComponent(text);
  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value || ""; };
  const keyReady = shop.paystackPublicKey && !String(shop.paystackPublicKey).includes("REPLACE_ME") && String(shop.paystackPublicKey).startsWith("pk_");
  document.title = shop.name + " \u2014 Shop online";
  setText("logo", shop.name);
  setText("footer-name", shop.name);
  setText("eyebrow", shop.location);
  setText("headline", shop.headline);
  setText("intro", shop.intro);
  setText("shop-title", shop.shopTitle);
  setText("shop-subtitle", shop.shopSubtitle);
  setText("footer-note", shop.footerNote);
  setText("featured-label", shop.featuredLabel || "Today\u2019s pick");
  const waHeader = document.getElementById("wa-header");
  if (waHeader) waHeader.href = waLink("Hi, I want to order from " + shop.name);
  const featured = shop.products.find((p) => p.featured) || shop.products[0];
  if (featured) {
    setText("featured-name", featured.name);
    setText("featured-desc", featured.desc);
    setText("featured-price", money(featured.priceNaira));
    const btn = document.getElementById("featured-buy");
    if (btn) { btn.dataset.buy = featured.id; btn.textContent = keyReady ? "Pay with Paystack" : "Order on WhatsApp"; }
  }
  const grid = document.getElementById("product-grid");
  if (grid) {
    const thumbs = ["t1", "t2", "t3", "t4"];
    grid.innerHTML = shop.products.filter((p) => !p.featured).map(function (p, i) {
      return '<article class="card"><div class="thumb ' + thumbs[i % thumbs.length] + '">' + String(i + 1).padStart(2, "0") + "</div><h3>" + p.name + "</h3><p>" + p.desc + '</p><div class="card-foot"><span class="price">' + money(p.priceNaira) + '</span><button class="btn btn-small" type="button" data-buy="' + p.id + '">Buy</button></div></article>';
    }).join("");
  }
  const steps = document.getElementById("steps");
  if (steps && shop.steps) {
    steps.innerHTML = shop.steps.map(function (s) { return "<li><strong>" + s.title + "</strong><span>" + s.text + "</span></li>"; }).join("");
  }
  function payWithPaystack(product, email) {
    if (typeof PaystackPop === "undefined") { alert("Paystack failed to load."); return; }
    const ref = "MM-" + product.id + "-" + Date.now();
    const popup = new PaystackPop();
    popup.newTransaction({
      key: shop.paystackPublicKey, email: email, amount: product.priceNaira * 100, currency: shop.currency || "NGN", ref: ref,
      metadata: { custom_fields: [{ display_name: "Product", variable_name: "product", value: product.name }] },
      onSuccess: function (tranx) { window.location.href = waLink("Hi, I just paid for " + product.name + " (" + money(product.priceNaira) + "). Paystack reference: " + (tranx.reference || ref)); },
      onCancel: function () {}
    });
  }
  function openModal(product) {
    const overlay = document.getElementById("pay-overlay");
    setText("pay-title", product.name); setText("pay-price", money(product.priceNaira));
    document.getElementById("pay-email").value = ""; setText("pay-error", "");
    overlay.hidden = false; overlay.dataset.productId = product.id; document.getElementById("pay-email").focus();
  }
  function closeModal() { document.getElementById("pay-overlay").hidden = true; }
  function currentProduct() { return shop.products.find((p) => p.id === document.getElementById("pay-overlay").dataset.productId); }
  document.addEventListener("click", function (e) {
    const buy = e.target.closest("[data-buy]");
    if (buy) {
      const product = shop.products.find((p) => p.id === buy.dataset.buy);
      if (!product) return;
      if (keyReady) openModal(product);
      else window.open(waLink("I want " + product.name + " for " + money(product.priceNaira)), "_blank");
    }
    if (e.target.closest("[data-close-pay]")) closeModal();
    if (e.target.closest("[data-whatsapp]")) {
      const product = currentProduct();
      if (product) window.open(waLink("I want " + product.name + " for " + money(product.priceNaira)), "_blank");
    }
  });
  document.getElementById("pay-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const product = currentProduct();
    const email = document.getElementById("pay-email").value.trim();
    const err = document.getElementById("pay-error");
    if (!product) return;
    if (!/[^\s@]+@[^\s@]+\.[^\s@]+/.test(email)) { err.textContent = "Enter a valid email."; return; }
    err.textContent = ""; payWithPaystack(product, email);
  });
  document.getElementById("pay-overlay").addEventListener("click", function (e) { if (e.target.id === "pay-overlay") closeModal(); });
  const note = document.getElementById("pay-mode");
  if (note) note.textContent = keyReady ? "Card, bank transfer, and USSD via Paystack" : "Orders go to WhatsApp 0805 728 2729";
})();
