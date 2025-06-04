// Общий файл для проверки статуса авторизации на всех страницах
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus()
})

function checkAuthStatus() {
  const user = localStorage.getItem("fufelBankUser")
  const authButtons = document.querySelector(".auth-buttons")

  if (user && authButtons) {
    const userData = JSON.parse(user)

    // Замена кнопок входа/регистрации на информацию о пользователе и кнопку выхода
    authButtons.innerHTML = `
            <div class="user-info">
                <span class="user-name">
                    <i class="fas fa-user"></i>
                    ${userData.firstName} ${userData.lastName}
                </span>
                <button class="btn btn-outline" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    Выйти
                </button>
            </div>
        `
  }
}

function logout() {
  // Удаление данных пользователя из localStorage
  localStorage.removeItem("fufelBankUser")

  // Перенаправление на главную страницу
  window.location.href = "index.html"
}

// Проверка, залогинен ли пользователь (для страниц, требующих авторизации)
function requireAuth() {
  const user = localStorage.getItem("fufelBankUser")

  if (!user) {
    // Если пользователь не авторизован, перенаправить на страницу входа
    window.location.href = "logowanie.html"
    return false
  }

  return true
}

// Проверка, если пользователь уже авторизован (для страниц входа/регистрации)
function redirectIfLoggedIn() {
  const user = localStorage.getItem("fufelBankUser")

  if (user) {
    // Если пользователь уже авторизован, перенаправить на страницу карты
    window.location.href = "moja-karta.html"
    return true
  }

  return false
}
