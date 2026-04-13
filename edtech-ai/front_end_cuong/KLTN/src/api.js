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

// ─── Exam API ──────────────────────────────────────────────────────────

/**
 * Bắt đầu bài kiểm tra — POST /api/v1/exam/start
 * @returns {{ exam_id, questions, total_questions, time_limit_minutes }}
 */
export async function apiStartExam(token) {
  const res = await fetch(`${API_BASE_URL}/exam/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Không thể bắt đầu bài kiểm tra");
  }
  return data;
}

/**
 * Nộp bài kiểm tra — POST /api/v1/exam/submit
 * @param {string} token
 * @param {string} examId
 * @param {Array} answers - [{question_id, selected, time_spent}]
 * @returns {{ exam_id, score, correct_count, total_questions }}
 */
export async function apiSubmitExam(token, examId, answers) {
  const res = await fetch(`${API_BASE_URL}/exam/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, exam_id: examId, answers }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Nộp bài thất bại");
  }
  return data;
}

/**
 * Lấy kết quả chi tiết — POST /api/v1/exam/result/:examId
 * @returns {{ exam_id, score, correct_count, wrong_count, total_questions, details }}
 */
export async function apiGetExamResult(token, examId) {
  const res = await fetch(`${API_BASE_URL}/exam/result/${examId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Không thể lấy kết quả");
  }
  return data;
}
