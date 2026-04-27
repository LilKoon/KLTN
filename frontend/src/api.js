const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Đăng nhập — POST /api/v1/auth/login
 * @returns {{ access_token, token_type, user_name }}
 */
export async function apiLogin(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    const errMsg = data?.error?.message || data?.detail || "Đăng nhập thất bại";
    throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
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
    body: JSON.stringify({ TenNguoiDung: name, email: email, MatKhau: password }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errMsg = data?.error?.message || data?.detail || "Đăng ký thất bại";
    throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
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

/**
 * Đổi mật khẩu — PUT /api/v1/auth/change-password
 * @param {string} token 
 * @param {string} currentPassword 
 * @param {string} newPassword 
 */
export async function apiChangePassword(token, currentPassword, newPassword) {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errMsg = data?.error?.message || data?.detail || "Đổi mật khẩu thất bại";
    throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
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

// ─── Placement & Daily Review API ──────────────────────────────────────

export async function apiGetExamPlacementTest(token) {
  const res = await fetch(`${API_BASE_URL}/exam/placement-test`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Không thể tải bài test đầu vào");
  return res.json();
}

export async function apiSubmitExamPlacementTest(token, answers) {
  const res = await fetch(`${API_BASE_URL}/exam/placement-submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ answers })
  });
  if (!res.ok) throw new Error("Lỗi khi nộp bài test");
  return res.json();
}

export async function apiGetDailyReview(token) {
  const res = await fetch(`${API_BASE_URL}/exam/daily-review`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Không thể tải ôn tập hằng ngày");
  return res.json();
}

export async function apiGetPlacementTestStatus(token) {
  const res = await fetch(`${API_BASE_URL}/exam/placement-test/status`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Không thể tải trạng thái bài test");
  return res.json();
}

export async function apiSubmitDailyReview(token, results) {
  const res = await fetch(`${API_BASE_URL}/exam/daily-review-submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ results })
  });
  if (!res.ok) throw new Error("Lỗi khi nộp kết quả ôn tập");
  return res.json();
}

// ─── Section Tests (Vocabulary, Grammar, Listening, Final) ─────────────

export async function apiGetSectionTest(token, type) {
  const res = await fetch(`${API_BASE_URL}/exam/section-test?type=${type}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Không thể tải bài test");
  return res.json();
}

export async function apiSubmitSectionTest(token, type, answers) {
  const res = await fetch(`${API_BASE_URL}/exam/section-submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ type, answers })
  });
  if (!res.ok) throw new Error("Lỗi khi nộp bài test");
  return res.json();
}
