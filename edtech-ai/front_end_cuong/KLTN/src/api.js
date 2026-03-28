const API_BASE_URL = "http://localhost:8000/api/v1";

/**
 * Đăng nhập — POST /api/v1/auth/login
 * @returns {{ access_token, token_type, user_name }}
 */
export async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Đăng nhập thất bại");
  }
  return data;
}

/**
 * Đăng ký — POST /api/v1/auth/register
 * @returns {{ message, user_id }}
 */
export async function apiRegister(name, email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Đăng ký thất bại");
  }
  return data;
}
