document.addEventListener('DOMContentLoaded', function() {
    // Sprawdzenie, czy użytkownik jest zalogowany
    checkLoginStatus();
    
    // Obsługa wylogowania
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.location.href = 'logout.php';
        });
    }
});

// Funkcja sprawdzająca status logowania
function checkLoginStatus() {
    fetch('check_session.php')
    .then(response => response.json())
    .then(data => {
        // Elementy UI zależne od statusu logowania
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        
        if (data.logged_in) {
            // Użytkownik jest zalogowany
            // Aktualizacja UI dla zalogowanego użytkownika
            if (userMenu) {
                const userName = document.getElementById('user-name');
                if (userName) {
                    userName.textContent = data.user_name;
                }
                
                if (authButtons) {
                    authButtons.style.display = 'none';
                }
                userMenu.style.display = 'flex';
            }
        } else {
            // Użytkownik nie jest zalogowany
            if (userMenu) {
                userMenu.style.display = 'none';
            }
            
            if (authButtons) {
                authButtons.style.display = 'flex';
            }
            
            // Przekierowanie z stron wymagających logowania
            const currentPage = window.location.pathname;
            if (currentPage.includes('moja-karta.html') || currentPage.includes('przelew.html')) {
                window.location.href = 'logowanie.html';
            }
        }
    })
    .catch(error => {
        console.error('Błąd:', error);
    });
}

// Funkcja formatująca kwotę
function formatAmount(amount) {
    return parseFloat(amount).toFixed(2) + ' PLN';
}