export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
    const err = new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    err.errorId = data?.error?.id;
    err.detail = data?.error?.detail || data?.detail;
    throw err;
  }
  return data;
}

/**
 * Đăng nhập bằng Google — chuyển hướng sang backend /auth/google.
 * Backend sẽ chuyển hướng tiếp tới Google, sau khi xác thực xong sẽ redirect về
 * `${FRONTEND_URL}/oauth-callback?token=...&role=...`.
 */
export function startGoogleLogin() {
  window.location.href = `${API_BASE_URL}/auth/google`;
}

async function _postJson(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const errMsg = data?.error?.message || data?.detail || "Đã xảy ra lỗi";
    const err = new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    err.errorId = data?.error?.id;
    throw err;
  }
  return data;
}

async function _authedFetch(token, path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error?.message || data?.detail || "Đã xảy ra lỗi";
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

export const apiSaveAIQuiz = (token, payload) =>
  _authedFetch(token, "/ai/quiz/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const apiListAIQuizzes = (token) =>
  _authedFetch(token, "/ai/quiz/list");

export const apiGetAIQuiz = (token, id) =>
  _authedFetch(token, `/ai/quiz/${id}`);

export const apiDeleteAIQuiz = (token, id) =>
  _authedFetch(token, `/ai/quiz/${id}`, { method: "DELETE" });

export const apiVerifyEmail = (email, otp) => _postJson("/auth/verify-email", { email, otp });
export const apiResendOtp = (email) => _postJson("/auth/resend-otp", { email });
export const apiForgotPassword = (email) => _postJson("/auth/forgot-password", { email });
export const apiVerifyResetOtp = (email, otp) => _postJson("/auth/verify-reset-otp", { email, otp });
export const apiResetPassword = (email, otp, newPassword) =>
  _postJson("/auth/reset-password", { email, otp, new_password: newPassword });

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

// ─── Admin API ─────────────────────────────────────────────────────────

export const apiAdminGetStats = (token) =>
  _authedFetch(token, "/admin/dashboard/stats");

export const apiAdminListUsers = (token, params = {}) => {
  const qs = new URLSearchParams();
  if (params.search) qs.append("search", params.search);
  if (params.role) qs.append("role", params.role);
  if (params.status) qs.append("status_filter", params.status);
  if (params.skip != null) qs.append("skip", params.skip);
  if (params.limit != null) qs.append("limit", params.limit);
  const q = qs.toString();
  return _authedFetch(token, `/admin/users${q ? `?${q}` : ""}`);
};

export const apiAdminUpdateUser = (token, userId, payload) =>
  _authedFetch(token, `/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const apiAdminDeleteUser = (token, userId) =>
  _authedFetch(token, `/admin/users/${userId}`, { method: "DELETE" });

export const apiAdminListReviews = (token, statusFilter) => {
  const q = statusFilter ? `?status_filter=${statusFilter}` : "";
  return _authedFetch(token, `/admin/reviews${q}`);
};

export const apiAdminModerateReview = (token, reviewId, status) =>
  _authedFetch(token, `/admin/reviews/${reviewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ TrangThai: status }),
  });

export const apiAdminDeleteReview = (token, reviewId) =>
  _authedFetch(token, `/admin/reviews/${reviewId}`, { method: "DELETE" });

export const apiAdminListNotifications = (token) =>
  _authedFetch(token, "/admin/notifications");

export const apiAdminCreateNotification = (token, payload) =>
  _authedFetch(token, "/admin/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const apiAdminDeleteNotification = (token, notifId) =>
  _authedFetch(token, `/admin/notifications/${notifId}`, { method: "DELETE" });

export const apiAdminListActivity = (token, params = {}) => {
  const qs = new URLSearchParams();
  if (params.user_id) qs.append("user_id", params.user_id);
  if (params.skip != null) qs.append("skip", params.skip);
  if (params.limit != null) qs.append("limit", params.limit);
  const q = qs.toString();
  return _authedFetch(token, `/admin/activity${q ? `?${q}` : ""}`);
};

export const apiAdminListSettings = (token) =>
  _authedFetch(token, "/admin/settings");

export const apiAdminUpdateSetting = (token, khoa, payload) =>
  _authedFetch(token, `/admin/settings/${encodeURIComponent(khoa)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const apiAdminListSystemDecks = (token) =>
  _authedFetch(token, "/admin/system-flashcards");

export const apiAdminCreateSystemDeck = (token, payload) =>
  _authedFetch(token, "/admin/system-flashcards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const apiAdminUpdateSystemDeck = (token, deckId, payload) =>
  _authedFetch(token, `/admin/system-flashcards/${deckId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const apiAdminDeleteSystemDeck = (token, deckId) =>
  _authedFetch(token, `/admin/system-flashcards/${deckId}`, { method: "DELETE" });

// ─── Kho tài liệu (Learning Materials) ─────────────────────────────────

export const apiGetAdminMaterials = (token, params = {}) => {
  const qs = new URLSearchParams();
  if (params.loai) qs.append("loai", params.loai);
  if (params.search) qs.append("search", params.search);
  const q = qs.toString();
  return _authedFetch(token, `/admin/materials${q ? `?${q}` : ""}`);
};

export async function apiUploadMaterial(token, payload) {
  const fd = new FormData();
  fd.append("TenTaiLieu", payload.ten || payload.TenTaiLieu || "");
  fd.append("MoTa", payload.moTa || payload.MoTa || "");
  fd.append("LoaiTaiLieu", (payload.loai || payload.LoaiTaiLieu || "OTHER").toUpperCase());
  fd.append("file", payload.file);
  const res = await fetch(`${API_BASE_URL}/admin/materials`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.detail || data?.error?.message || "Upload thất bại");
  return data;
}

export const apiDeleteMaterial = (token, id) =>
  _authedFetch(token, `/admin/materials/${id}`, { method: "DELETE" });

// User-facing (không cần token nhưng vẫn cho gửi nếu có)
export async function apiGetUserMaterials(params = {}) {
  const qs = new URLSearchParams();
  if (params.loai) qs.append("loai", params.loai);
  if (params.search) qs.append("search", params.search);
  const q = qs.toString();
  const res = await fetch(`${API_BASE_URL}/materials${q ? `?${q}` : ""}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.detail || "Không tải được tài liệu");
  return data || [];
}

export const apiUploadLessonFile = async (token, lessonId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/cms/lessons/${lessonId}/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Tải lên file bài học thất bại");
  }
  return data;
};

// ─── CMS API (Content management - khoá học/bài học/câu hỏi) ───────────

export const apiCmsListCourses = (token) =>
  _authedFetch(token, "/cms/courses?limit=200");

export const apiCmsCreateCourse = (token, payload) =>
  _authedFetch(token, "/cms/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const apiCmsListLessons = (token, courseId) =>
  _authedFetch(token, `/cms/courses/${courseId}/lessons`);

export const apiCmsCreateLesson = (token, payload) =>
  _authedFetch(token, "/cms/lessons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const apiCmsListQuestions = (token) =>
  _authedFetch(token, "/cms/questions?limit=200");

export const apiCmsCreateQuestion = (token, payload) =>
  _authedFetch(token, "/cms/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
