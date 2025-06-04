// Wspólny plik do sprawdzania statusu autoryzacji na wszystkich stronach
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus()
})

function checkAuthStatus() {
  const user = localStorage.getItem("fufelBankUser")
  const authButtons = document.querySelector(".auth-buttons")

  if (user && authButtons) {
    const userData = JSON.parse(user)

    // Zastąpienie przycisków logowania/rejestracji informacjami o użytkowniku i przyciskiem wylogowania
    authButtons.innerHTML = `
            <div class="user-info">
                <span class="user-name">
                    <i class="fas fa-user"></i>
                    ${userData.firstName} ${userData.lastName}
                </span>
                <button class="btn btn-outline" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    Wyloguj
                </button>
            </div>
        `
  }
}

function logout() {
  // Usunięcie danych użytkownika z localStorage
  localStorage.removeItem("fufelBankUser")

  // Przekierowanie na stronę główną
  window.location.href = "index.html"
}

// Sprawdzenie czy użytkownik jest zalogowany (dla stron wymagających logowania)
function requireAuth() {
  const user = localStorage.getItem("fufelBankUser")

  if (!user) {
    // Сохранение текущей страницы для перенаправления после логина
    localStorage.setItem("fufelBankReturnUrl", window.location.pathname)

    // Jeśli użytkownik nie jest zalogowany, przekieruj na stronę logowania
    window.location.href = "logowanie.html"
    return false
  }

  return true
}

// Sprawdzenie czy użytkownik jest już zalogowany (dla stron logowania/rejestracji)
function redirectIfLoggedIn() {
  const user = localStorage.getItem("fufelBankUser")

  if (user) {
    // Jeśli użytkownik jest już zalogowany, przekieruj na stronę karty
    window.location.href = "moja-karta.html"
    return true
  }

  return false
}
