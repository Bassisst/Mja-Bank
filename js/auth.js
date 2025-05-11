document.addEventListener('DOMContentLoaded', function() {
    // Obsługa formularza logowania
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Obsługa formularza rejestracji
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
});

// Funkcja obsługująca logowanie
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Tworzenie obiektu FormData
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    
    // Wysłanie żądania do serwera
    fetch('login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Przekierowanie na stronę główną
            window.location.href = 'moja-karta.html';
        } else {
            alert(data.message || 'Wystąpił błąd podczas logowania.');
        }
    })
    .catch(error => {
        console.error('Błąd:', error);
        alert('Wystąpił błąd podczas logowania.');
    });
}

// Funkcja obsługująca rejestrację
function handleRegistration(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Walidacja
    if (password !== confirmPassword) {
        alert('Hasła nie są identyczne. Spróbuj ponownie.');
        return;
    }
    
    // Tworzenie obiektu FormData
    const formData = new FormData();
    formData.append('first-name', firstName);
    formData.append('last-name', lastName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    
    // Wysłanie żądania do serwera
    fetch('register.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Przekierowanie na stronę logowania
            alert('Rejestracja zakończona sukcesem. Możesz się teraz zalogować.');
            window.location.href = 'logowanie.html';
        } else {
            alert(data.message || 'Wystąpił błąd podczas rejestracji.');
        }
    })
    .catch(error => {
        console.error('Błąd:', error);
        alert('Wystąpił błąd podczas rejestracji.');
    });
}