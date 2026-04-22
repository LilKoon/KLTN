
/**
 * Toggles between the login and register forms with smooth animation.
 * @param {'login'|'register'} formType - Which form to display.
 */
function toggleForm(formType) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (formType === 'register') {
    loginForm.classList.remove('scale-100', 'opacity-100');
    loginForm.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
      loginForm.classList.add('hidden');
      loginForm.classList.remove('flex');
      loginForm.classList.add('absolute');

      registerForm.classList.remove('hidden');
      registerForm.classList.remove('absolute');
      registerForm.classList.add('flex');

      setTimeout(() => {
        registerForm.classList.remove('scale-95', 'opacity-0');
        registerForm.classList.add('scale-100', 'opacity-100');
      }, 50);
    }, 300);

  } else {
    registerForm.classList.remove('scale-100', 'opacity-100');
    registerForm.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
      registerForm.classList.add('hidden');
      registerForm.classList.remove('flex');
      registerForm.classList.add('absolute');

      loginForm.classList.remove('hidden');
      loginForm.classList.remove('absolute');
      loginForm.classList.add('flex');

      setTimeout(() => {
        loginForm.classList.remove('scale-95', 'opacity-0');
        loginForm.classList.add('scale-100', 'opacity-100');
      }, 50);
    }, 300);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginFormEl = document.getElementById('login');
  if (loginFormEl) {
    loginFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const user = localStorage.getItem('user_' + email);
      if (user) {
        localStorage.setItem('currentUser', email);
        window.location.href = 'main.html';
      } else {
        alert('Tài khoản không tồn tại. Vui lòng đăng ký!');
      }
    });
  }

  const registerFormEl = document.getElementById('register');
  if (registerFormEl) {
    registerFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirm').value;

      if (password !== confirm) {
        alert('Mật khẩu không khớp!');
        return;
      }

      const user = { name, email, password };
      localStorage.setItem('user_' + email, JSON.stringify(user));
      alert('Đăng ký thành công! Vui lòng đăng nhập lại.');
      toggleForm('login');
      document.getElementById('loginEmail').value = email;
    });
  }
});
