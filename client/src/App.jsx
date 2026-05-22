import React, { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Home,
  KeyRound,
  LogOut,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { api } from "./api.js";

const emptyForm = {
  name: "",
  size: "",
  unit: "kg",
  quantity: 0,
  lowStockLimit: 5,
};

// Modal Component
function Modal({ isOpen, title, message, children, onConfirm, onCancel, confirmText = "OK", cancelText = "Cancel", isDanger = false }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        {message && <div className="modal-message">{message}</div>}
        {children && <div className="modal-content">{children}</div>}
        <div className="modal-footer">
          <button className="secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={isDanger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const demoProducts = [
  { _id: "demo-1", name: "Steel Rod", size: "12 mm", unit: "pcs", quantity: 24, lowStockLimit: 10 },
  { _id: "demo-2", name: "Copper Wire", size: "2.5 mm", unit: "meter", quantity: 8, lowStockLimit: 15 },
  { _id: "demo-3", name: "Cement", size: "50 kg", unit: "bundle", quantity: 31, lowStockLimit: 8 },
];

const demoTransactions = [
  {
    _id: "trans-1",
    productName: "Steel Rod",
    action: "add",
    quantity: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    note: "Stock replenishment",
  },
  {
    _id: "trans-2",
    productName: "Copper Wire",
    action: "reduce",
    quantity: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    note: "Sold to customer",
  },
  {
    _id: "trans-3",
    productName: "Cement",
    action: "add",
    quantity: 20,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    note: "Warehouse received",
  },
  {
    _id: "trans-4",
    productName: "Steel Rod",
    action: "reduce",
    quantity: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    note: "Order #2024-05-001",
  },
];

function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Main app state
  const [activeTab, setActiveTab] = useState("home");
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOfflineDemo, setIsOfflineDemo] = useState(false);

  // Modal states
  const [modals, setModals] = useState({
    addProduct: false,
    editProduct: false,
    deleteProduct: false,
    changeStock: false,
    changePassword: false,
  });
  const [stockModal, setStockModal] = useState({ product: null, action: null, quantity: "" });
  const [deleteModal, setDeleteModal] = useState({ product: null });
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.toLowerCase();
      return [product.name, product.size, product.unit].some((value) =>
        String(value).toLowerCase().includes(query)
      );
    });
  }, [products, search]);

  const lowStockCount = products.filter((product) => product.quantity <= product.lowStockLimit).length;
  const totalQuantity = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);

  // Load data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  // Login handler
  function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    
    if (!loginUsername || !loginPassword) {
      setLoginError("Username and password are required");
      return;
    }
    
    // Simple demo login (in production, this would authenticate with backend)
    if (loginUsername === "admin" && loginPassword === "admin") {
      setIsLoggedIn(true);
      setLoginUsername("");
      setLoginPassword("");
    } else {
      setLoginError("Invalid username or password");
      setLoginPassword("");
    }
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setLoginUsername("");
    setLoginPassword("");
    setActiveTab("home");
  }

  async function loadData() {
    setLoading(true);
    try {
      const [productData, transactionData] = await Promise.all([
        api.getProducts(),
        api.getTransactions(),
      ]);
      setProducts(productData);
      setTransactions(transactionData);
      setIsOfflineDemo(false);
      setMessage("");
    } catch (error) {
      setProducts(demoProducts);
      setTransactions(demoTransactions);
      setIsOfflineDemo(true);
      setMessage("Backend is not connected yet. Showing demo data.");
    } finally {
      setLoading(false);
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    closeModal("addProduct");
    closeModal("editProduct");
  }

  // Modal helpers
  function openModal(name) {
    setModals((current) => ({ ...current, [name]: true }));
  }

  function closeModal(name) {
    setModals((current) => ({ ...current, [name]: false }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      quantity: Number(form.quantity),
      lowStockLimit: Number(form.lowStockLimit),
    };

    if (isOfflineDemo) {
      const id = editingId || crypto.randomUUID();
      setProducts((current) =>
        editingId
          ? current.map((product) => (product._id === editingId ? { ...payload, _id: editingId } : product))
          : [{ ...payload, _id: id }, ...current]
      );
      setMessage(editingId ? "Product updated in demo mode." : "Product added in demo mode.");
      resetForm();
      return;
    }

    try {
      const saved = editingId
        ? await api.updateProduct(editingId, payload)
        : await api.createProduct(payload);
      setProducts((current) =>
        editingId
          ? current.map((product) => (product._id === editingId ? saved : product))
          : [saved, ...current]
      );
      setMessage(editingId ? "Product updated." : "Product added.");
      resetForm();
      loadTransactions();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadTransactions() {
    try {
      setTransactions(await api.getTransactions());
    } catch {
      setTransactions([]);
    }
  }

  function startEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      size: product.size,
      unit: product.unit,
      quantity: product.quantity,
      lowStockLimit: product.lowStockLimit,
    });
    openModal("editProduct");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openStockModal(product, action) {
    setStockModal({ product, action, quantity: "" });
    openModal("changeStock");
  }

  async function confirmChangeStock() {
    if (!stockModal.quantity || Number(stockModal.quantity) < 1) {
      setMessage("Please enter a valid quantity");
      return;
    }

    const quantity = Number(stockModal.quantity);
    const { product, action } = stockModal;

    if (isOfflineDemo) {
      setProducts((current) =>
        current.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: action === "add" ? item.quantity + quantity : Math.max(0, item.quantity - quantity),
              }
            : item
        )
      );
      closeModal("changeStock");
      setStockModal({ product: null, action: null, quantity: "" });
      setMessage(`Stock ${action === "add" ? "increased" : "reduced"} successfully.`);
      return;
    }

    try {
      const updated = await api.changeStock(product._id, { action, quantity });
      setProducts((current) => current.map((item) => (item._id === product._id ? updated : item)));
      closeModal("changeStock");
      setStockModal({ product: null, action: null, quantity: "" });
      loadTransactions();
      setMessage(`Stock ${action === "add" ? "increased" : "reduced"} successfully.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function openDeleteModal(product) {
    setDeleteModal({ product });
    openModal("deleteProduct");
  }

  async function confirmDelete() {
    const product = deleteModal.product;

    if (isOfflineDemo) {
      setProducts((current) => current.filter((item) => item._id !== product._id));
      closeModal("deleteProduct");
      setDeleteModal({ product: null });
      setMessage("Product deleted.");
      return;
    }

    try {
      await api.deleteProduct(product._id);
      setProducts((current) => current.filter((item) => item._id !== product._id));
      closeModal("deleteProduct");
      setDeleteModal({ product: null });
      loadTransactions();
      setMessage("Product deleted.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError("");

    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.new.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    // Simple demo password change (in production, validate with backend)
    if (passwordForm.current === "admin") {
      setMessage("Password changed successfully!");
      setPasswordForm({ current: "", new: "", confirm: "" });
      closeModal("changePassword");
    } else {
      setPasswordError("Current password is incorrect");
    }
  }

  // If not logged in, show login page
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <Boxes size={40} />
            <h1>Stock Admin</h1>
            <p>Inventory Control System</p>
          </div>
          <form onSubmit={handleLogin}>
            <label>
              Username
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter username"
                autoFocus
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
              />
            </label>
            {loginError && <div className="error-message">{loginError}</div>}
            <p className="login-hint">Demo: username: <strong>admin</strong>, password: <strong>admin</strong></p>
            <button type="submit" className="primary">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Boxes size={28} />
          <div>
            <strong>Stock Admin</strong>
            <span>Inventory control</span>
          </div>
        </div>

        <nav className="nav">
          <button className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>
            <Home size={18} /> Home
          </button>
          <button
            className={activeTab === "transactions" ? "active" : ""}
            onClick={() => setActiveTab("transactions")}
          >
            <RefreshCw size={18} /> Transactions
          </button>
          <button
            className={activeTab === "password" ? "active" : ""}
            onClick={() => setActiveTab("password")}
          >
            <KeyRound size={18} /> Change Password
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Sign Out
          </button>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p>Admin Panel</p>
            <h1>{activeTab === "home" ? "Products" : activeTab === "transactions" ? "Transactions" : "Security"}</h1>
          </div>
          <button className="ghost" onClick={loadData}>
            <RefreshCw size={17} /> Refresh
          </button>
        </header>

        {message && <div className={isOfflineDemo ? "notice warning" : "notice"}>{message}</div>}

        {activeTab === "home" && (
          <>
            <section className="stats">
              <div>
                <span>Total Products</span>
                <strong>{products.length}</strong>
              </div>
              <div>
                <span>Total Quantity</span>
                <strong>{totalQuantity}</strong>
              </div>
              <div>
                <span>Low Stock</span>
                <strong>{lowStockCount}</strong>
              </div>
            </section>

            <section className="workspace">
              <form className="product-form" onSubmit={handleSubmit}>
                <div className="section-title">
                  <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
                  {editingId && (
                    <button type="button" className="ghost small" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>

                <label>
                  Name
                  <input value={form.name} onChange={(event) => updateForm("name", event.target.value)} required />
                </label>

                <div className="grid-2">
                  <label>
                    Product Size
                    <input value={form.size} onChange={(event) => updateForm("size", event.target.value)} required />
                  </label>
                  <label>
                    Product Unit
                    <select value={form.unit} onChange={(event) => updateForm("unit", event.target.value)}>
                      <option value="kg">kg</option>
                      <option value="meter">meter</option>
                      <option value="pcs">pcs</option>
                      <option value="bundle">bundle</option>
                    </select>
                  </label>
                </div>

                <div className="grid-2">
                  <label>
                    Quantity
                    <input
                      type="number"
                      min="0"
                      value={form.quantity}
                      onChange={(event) => updateForm("quantity", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Low Stock
                    <input
                      type="number"
                      min="0"
                      value={form.lowStockLimit}
                      onChange={(event) => updateForm("lowStockLimit", event.target.value)}
                      required
                    />
                  </label>
                </div>

                <button className="primary" type="submit">
                  <Save size={18} /> {editingId ? "Save Changes" : "Add Product"}
                </button>
              </form>

              <section className="table-panel">
                <div className="table-header">
                  <div className="search">
                    <Search size={17} />
                    <input
                      placeholder="Search products"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Product Size</th>
                        <th>Product Unit</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6">Loading products...</td>
                        </tr>
                      ) : filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="6">No products found.</td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => (
                          <tr key={product._id}>
                            <td>{product.name}</td>
                            <td>{product.size}</td>
                            <td>{product.unit}</td>
                            <td>{product.quantity}</td>
                            <td>
                              <span className={product.quantity <= product.lowStockLimit ? "badge danger" : "badge"}>
                                {product.quantity <= product.lowStockLimit ? "Low stock" : "In stock"}
                              </span>
                            </td>
                            <td>
                              <div className="actions">
                                <button title="Reduce stock" onClick={() => openStockModal(product, "reduce")}>
                                  <Minus size={16} />
                                </button>
                                <button title="Add stock" onClick={() => openStockModal(product, "add")}>
                                  <Plus size={16} />
                                </button>
                                <button title="Edit product" onClick={() => startEdit(product)}>
                                  <Pencil size={16} />
                                </button>
                                <button title="Delete product" onClick={() => openDeleteModal(product)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </section>
          </>
        )}

        {activeTab === "transactions" && (
          <section className="table-panel full">
            <div className="section-title">
              <h2>Recent Transactions</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Action</th>
                    <th>Quantity</th>
                    <th>Date</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5">No transactions yet.</td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td>{transaction.productName}</td>
                        <td>{transaction.action}</td>
                        <td>{transaction.quantity}</td>
                        <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                        <td>{transaction.note}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "password" && (
          <section className="password-panel">
            <h2>Change Password</h2>
            <p className="password-hint">For security, please enter your current password and a new password.</p>
            <form onSubmit={handleChangePassword}>
              <label>
                Current Password
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
              </label>
              <label>
                New Password
                <input
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  placeholder="Enter new password (min 6 characters)"
                  required
                />
              </label>
              <label>
                Confirm Password
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  placeholder="Confirm new password"
                  required
                />
              </label>
              {passwordError && <div className="error-message">{passwordError}</div>}
              <button className="primary" type="submit">
                <KeyRound size={18} /> Update Password
              </button>
            </form>
          </section>
        )}

        {/* Modals */}
        <Modal
          isOpen={modals.changeStock}
          title={`${stockModal.action === "add" ? "Add" : "Reduce"} Stock`}
          message={`Enter the quantity to ${stockModal.action} for ${stockModal.product?.name || ""}`}
          onConfirm={confirmChangeStock}
          onCancel={() => {
            closeModal("changeStock");
            setStockModal({ product: null, action: null, quantity: "" });
          }}
          confirmText="Confirm"
        >
          <input
            type="number"
            min="1"
            value={stockModal.quantity}
            onChange={(e) => setStockModal({ ...stockModal, quantity: e.target.value })}
            placeholder="Enter quantity"
            autoFocus
          />
        </Modal>

        <Modal
          isOpen={modals.deleteProduct}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteModal.product?.name || ""}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            closeModal("deleteProduct");
            setDeleteModal({ product: null });
          }}
          confirmText="Delete"
          cancelText="Cancel"
          isDanger={true}
        />
      </main>
    </div>
  );
}

export default App;
