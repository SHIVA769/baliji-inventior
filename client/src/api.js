const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getProducts: () => request("/products"),
  createProduct: (product) =>
    request("/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),
  updateProduct: (id, product) =>
    request(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(product),
    }),
  changeStock: (id, payload) =>
    request(`/products/${id}/stock`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: "DELETE",
    }),
  getTransactions: () => request("/transactions"),
};
