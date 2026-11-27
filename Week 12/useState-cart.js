const { useEffect, useMemo, useState } = React;

const products = [
  { id: "coffee", name: "Iced coffee", price: 4500, icon: "☕" },
  { id: "sandwich", name: "Garden sandwich", price: 6800, icon: "🥪" },
  { id: "tea", name: "Citrus tea", price: 3900, icon: "🍵" },
  { id: "cookie", name: "Chocolate cookie", price: 2500, icon: "🍪" },
  { id: "salad", name: "Green salad", price: 7200, icon: "🥗" },
  { id: "juice", name: "Orange juice", price: 4200, icon: "🍊" },
];

const money = (amount) => `${amount.toLocaleString("ko-KR")}원`;

function readSavedCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("alisher-week12-cart") || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((line) => products.some((product) => product.id === line.id) && Number.isInteger(line.quantity) && line.quantity > 0);
  } catch {
    return [];
  }
}

function ShoppingCart() {
  const [cart, setCart] = useState(readSavedCart);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("alisher-week12-cart", JSON.stringify(cart));
  }, [cart]);

  const total = useMemo(() => cart.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.id);
    return sum + (product ? product.price * line.quantity : 0);
  }, 0), [cart]);

  function addProduct(id) {
    setCart((current) => {
      const found = current.some((line) => line.id === id);
      return found
        ? current.map((line) => line.id === id ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { id, quantity: 1 }];
    });
    const product = products.find((item) => item.id === id);
    setNotice(`${product.name} added to your cart.`);
  }

  function changeQuantity(id, difference) {
    setCart((current) => current
      .map((line) => line.id === id ? { ...line, quantity: line.quantity + difference } : line)
      .filter((line) => line.quantity > 0));
    setNotice("Cart quantity updated.");
  }

  function resetCart() {
    setCart([]);
    setNotice("Cart cleared. Your saved cart is empty.");
  }

  return (
    <div className="layout">
      <section className="panel" aria-labelledby="products-title">
        <div className="panel-heading"><h2 id="products-title">Today’s menu</h2><span className="mono">6 ITEMS</span></div>
        <div className="products">
          {products.map((product) => (
            <article className="product" key={product.id}>
              <span className="product-icon" aria-hidden="true">{product.icon}</span>
              <div><h3>{product.name}</h3><p>{money(product.price)}</p></div>
              <button className="btn small" type="button" onClick={() => addProduct(product.id)} aria-label={`Add ${product.name}`}>Add</button>
            </article>
          ))}
        </div>
      </section>
      <aside className="panel" aria-labelledby="cart-title">
        <div className="panel-heading"><h2 id="cart-title">Your cart</h2><span className="mono">{cart.reduce((sum, line) => sum + line.quantity, 0)} ITEMS</span></div>
        {cart.length === 0 ? <p className="empty">Your cart is empty. Add something from the menu.</p> : (
          <ul className="cart-list">
            {cart.map((line) => {
              const product = products.find((item) => item.id === line.id);
              return (
                <li className="cart-line" key={line.id}>
                  <div><strong>{product.name}</strong><small>{money(product.price)} each</small></div>
                  <div className="quantity">
                    <button className="btn small" type="button" onClick={() => changeQuantity(line.id, -1)} aria-label={`Remove one ${product.name}`}>−</button>
                    <output aria-label={`${product.name} quantity`}>{line.quantity}</output>
                    <button className="btn small" type="button" onClick={() => changeQuantity(line.id, 1)} aria-label={`Add one ${product.name}`}>+</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="total"><span>Total</span><strong>{money(total)}</strong></div>
        <button className="btn primary" type="button" onClick={resetCart}>Reset cart</button>
        <p className="message" role="status">{notice}</p>
        <p className="muted" style={{ fontSize: ".78rem" }}>Your cart is saved in this browser on this device.</p>
      </aside>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("cart-app")).render(<ShoppingCart />);
