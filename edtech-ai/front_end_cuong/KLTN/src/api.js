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
 * Đăng nhập bằng Google — POST /api/v1/auth/google
 * @param {string} googleAccessToken
 */
export async function apiLoginGoogle(googleAccessToken) {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: googleAccessToken }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Đăng nhập Google thất bại");
  }
  return data;
}

/**
 * Đăng xuất — POST /api/v1/auth/logout
 * @param {string} token 
 */
export async function apiLogout(token) {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Đăng xuất thất bại");
  }
  return data;
}

/**
 * Đăng ký — POST /api/v1/auth/register
 * @returns {{ message, user_id }}
 */
export async function apiRegister(name, email, password, phone) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, phone }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Đăng ký thất bại");
  }
  return data;
}

/**
 * Lấy thông tin người dùng — GET /api/v1/auth/me
 * @param {string} token 
 */
export async function apiGetProfile(token) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Không thể lấy thông tin người dùng");
  }
  return data;
}

/**
 * Kiểm tra trạng thái onboarding — GET /api/v1/auth/me/onboarding-status
 * @returns {{ is_new_user, completed_exam_id, score }}
 */
export async function apiGetOnboardingStatus(token) {
  const res = await fetch(`${API_BASE_URL}/auth/me/onboarding-status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Không thể lấy trạng thái onboarding");
  }
  return data;
}

/**
 * Cập nhật thông tin người dùng — PUT /api/v1/auth/me
 * @param {string} token 
 * @param {Object} profileData 
 */
export async function apiUpdateProfile(token, profileData) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(profileData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Cập nhật thất bại");
  }
  return data;
}

/**
 * Cập nhật ảnh đại diện — POST /api/v1/auth/upload-avatar
 * @param {string} token 
 * @param {File} file 
 */
export async function apiUploadAvatar(token, file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/auth/upload-avatar`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Tải lên ảnh thất bại");
  }
  return data;
}

// ─── Exam API ──────────────────────────────────────────────────────────

/**
 * Bắt đầu bài kiểm tra — POST /api/v1/exam/start
 * @returns {{ exam_id, questions, total_questions, time_limit_minutes }}
 */
export async function apiStartExam(token, examType = "DAU_VAO") {
  const res = await fetch(`${API_BASE_URL}/exam/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, exam_type: examType }),
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

/**
 * Lấy thông tin đầu vào cho Final Test — POST /api/v1/exam/final-info
 */
export async function apiGetFinalTestInfo(token) {
  const res = await fetch(`${API_BASE_URL}/exam/final-info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Không thể lấy thông tin khởi tạo Final Test");
  }
  return data;
}

// ─── Roadmap API ───────────────────────────────────────────────────────

/**
 * Sinh lộ trình học cá nhân hóa — POST /api/v1/roadmap/generate
 * @param {string} token
 * @param {string} examId 
 */
export async function apiGenerateRoadmap(token, examId) {
  const res = await fetch(`${API_BASE_URL}/roadmap/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, exam_id: examId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Không thể tạo lộ trình học");
  }
  return data;
}

/**
 * Lấy lộ trình học hiện tại — POST /api/v1/roadmap/me
 * @param {string} token 
 */
export async function apiGetMyRoadmap(token) {
  const res = await fetch(`${API_BASE_URL}/roadmap/me`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Không thể lấy lộ trình học");
  }
  return data;
}

/**
 * Hoàn thành một node trong lộ trình — PATCH /api/v1/roadmap/node/:nodeStateId/complete
 * @param {string} token 
 * @param {string} nodeStateId 
 */
export async function apiCompleteNode(token, nodeStateId) {
  const res = await fetch(`${API_BASE_URL}/roadmap/node/${nodeStateId}/complete`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Không thể hoàn thành node");
  }
  return data;
}
