document.addEventListener('DOMContentLoaded', function() {
    // Hasło administratora
    const ADMIN_PASSWORD = '123';
    
    // Elementy UI
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminPanel = document.getElementById('admin-panel');
    const adminLogin = document.getElementById('admin-login');
    const loginError = document.getElementById('login-error');
    const addFundsForm = document.getElementById('add-funds-form');
    const cardManagementForm = document.getElementById('card-management-form');
    const blockUserCardBtn = document.getElementById('block-user-card');
    const unblockUserCardBtn = document.getElementById('unblock-user-card');
    const resetUserPinBtn = document.getElementById('reset-user-pin');
    const adminSuccessOkBtn = document.getElementById('admin-success-ok');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Obsługa formularza logowania administratora
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('admin-password').value;
            
            if (password === ADMIN_PASSWORD) {
                // Ukryj formularz logowania
                adminLogin.style.display = 'none';
                
                // Pokaż panel administratora
                adminPanel.style.display = 'block';
                
                // Załaduj dane użytkowników
                loadUsers();
            } else {
                loginError.textContent = 'Nieprawidłowe hasło administratora.';
                loginError.style.display = 'block';
            }
        });
    }
    
    // Obsługa formularza dodawania środków
    if (addFundsForm) {
        addFundsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userId = document.getElementById('user-id').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const description = document.getElementById('description').value;
            
            if (!userId || !amount || !description) {
                alert('Wypełnij wszystkie pola formularza.');
                return;
            }
            
            addFundsToUser(userId, amount, description);
        });
    }
    
    // Obsługa przycisków zarządzania kartą
    if (blockUserCardBtn) {
        blockUserCardBtn.addEventListener('click', function() {
            const userId = document.getElementById('card-user-id').value;
            
            if (!userId) {
                alert('Wybierz użytkownika.');
                return;
            }
            
            blockUserCard(userId);
        });
    }
    
    if (unblockUserCardBtn) {
        unblockUserCardBtn.addEventListener('click', function() {
            const userId = document.getElementById('card-user-id').value;
            
            if (!userId) {
                alert('Wybierz użytkownika.');
                return;
            }
            
            unblockUserCard(userId);
        });
    }
    
    if (resetUserPinBtn) {
        resetUserPinBtn.addEventListener('click', function() {
            const userId = document.getElementById('card-user-id').value;
            
            if (!userId) {
                alert('Wybierz użytkownika.');
                return;
            }
            
            resetUserPin(userId);
        });
    }
    
    // Obsługa przycisku OK w modalu sukcesu
    if (adminSuccessOkBtn) {
        adminSuccessOkBtn.addEventListener('click', closeAllModals);
    }
    
    // Obsługa przycisków zamykania modali
    if (closeModalButtons) {
        closeModalButtons.forEach(button => {
            button.addEventListener('click', closeAllModals);
        });
    }
    
    // Obsługa wylogowania
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
});

// Funkcja ładująca użytkowników
function loadUsers() {
    fetch('get_users.php')
        .then(response => response.json())
        .then(users => {
            // Aktualizacja tabeli użytkowników
            updateUserTable(users);
            
            // Aktualizacja list rozwijanych
            updateUserSelects(users);
        })
        .catch(error => {
            console.error('Błąd podczas ładowania użytkowników:', error);
            alert('Błąd podczas ładowania użytkowników. Sprawdź konsolę, aby uzyskać szczegóły.');
        });
}

// Funkcja aktualizująca tabelę użytkowników
function updateUserTable(users) {
    const userListBody = document.querySelector('#user-list tbody');
    
    if (!userListBody) return;
    
    // Czyszczenie tabeli
    userListBody.innerHTML = '';
    
    // Jeśli nie ma użytkowników
    if (users.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">Brak użytkowników</td>';
        userListBody.appendChild(row);
        return;
    }
    
    // Dodawanie użytkowników do tabeli
    users.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${formatAmount(user.balance)}</td>
            <td>${user.cardBlocked == 1 ? '<span class="text-danger">Zablokowana</span>' : '<span class="text-success">Aktywna</span>'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline" onclick="viewUserDetails('${user.id}')">Szczegóły</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Usuń</button>
                </div>
            </td>
        `;
        
        userListBody.appendChild(row);
    });
}

// Funkcja aktualizująca listy rozwijane użytkowników
function updateUserSelects(users) {
    const userIdSelect = document.getElementById('user-id');
    const cardUserIdSelect = document.getElementById('card-user-id');
    
    if (!userIdSelect || !cardUserIdSelect) return;
    
    // Czyszczenie list
    userIdSelect.innerHTML = '<option value="">Wybierz użytkownika</option>';
    cardUserIdSelect.innerHTML = '<option value="">Wybierz użytkownika</option>';
    
    // Dodawanie użytkowników do list
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.firstName} ${user.lastName} (${user.email})`;
        
        userIdSelect.appendChild(option.cloneNode(true));
        cardUserIdSelect.appendChild(option);
    });
}

// Funkcja dodająca środki do konta użytkownika
function addFundsToUser(userId, amount, description) {
    fetch('add_funds.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: userId,
            amount: amount,
            description: description
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Aktualizacja UI
            loadUsers();
            
            // Resetowanie formularza
            document.getElementById('add-funds-form').reset();
            
            // Pokazanie modalu sukcesu
            showSuccessModal('Środki dodane', `Dodano ${formatAmount(amount)} do konta użytkownika.`);
        } else {
            alert('Błąd: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Błąd podczas dodawania środków:', error);
        alert('Błąd podczas dodawania środków. Sprawdź konsolę, aby uzyskać szczegóły.');
    });
}

// Funkcja blokująca kartę użytkownika
function blockUserCard(userId) {
    fetch('update_card_status.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: userId,
            blocked: true
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Aktualizacja UI
            loadUsers();
            
            // Pokazanie modalu sukcesu
            showSuccessModal('Karta zablokowana', 'Karta użytkownika została zablokowana.');
        } else {
            alert('Błąd: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Błąd podczas blokowania karty:', error);
        alert('Błąd podczas blokowania karty. Sprawdź konsolę, aby uzyskać szczegóły.');
    });
}

// Funkcja odblokowująca kartę użytkownika
function unblockUserCard(userId) {
    fetch('update_card_status.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: userId,
            blocked: false
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Aktualizacja UI
            loadUsers();
            
            // Pokazanie modalu sukcesu
            showSuccessModal('Karta odblokowana', 'Karta użytkownika została odblokowana.');
        } else {
            alert('Błąd: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Błąd podczas odblokowywania karty:', error);
        alert('Błąd podczas odblokowywania karty. Sprawdź konsolę, aby uzyskać szczegóły.');
    });
}

// Funkcja resetująca PIN użytkownika
function resetUserPin(userId) {
    fetch('reset_pin.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: userId
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Aktualizacja UI
            loadUsers();
            
            // Pokazanie modalu sukcesu
            showSuccessModal('PIN zresetowany', 'PIN użytkownika został zresetowany do wartości domyślnej (1234).');
        } else {
            alert('Błąd: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Błąd podczas resetowania PIN-u:', error);
        alert('Błąd podczas resetowania PIN-u. Sprawdź konsolę, aby uzyskać szczegóły.');
    });
}

// Funkcja usuwająca użytkownika
function deleteUser(userId) {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
        return;
    }
    
    fetch('delete_user.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: userId
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Aktualizacja UI
            loadUsers();
            
            alert('Użytkownik został usunięty.');
        } else {
            alert('Błąd: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Błąd podczas usuwania użytkownika:', error);
        alert('Błąd podczas usuwania użytkownika. Sprawdź konsolę, aby uzyskać szczegóły.');
    });
}

// Funkcja wyświetlająca szczegóły użytkownika
function viewUserDetails(userId) {
    fetch(`get_user_details.php?id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const user = data.user;
                
                // Wyświetlenie szczegółów użytkownika
                alert(`
                    ID: ${user.id}
                    Imię: ${user.firstName}
                    Nazwisko: ${user.lastName}
                    Email: ${user.email}
                    Telefon: ${user.phone || 'Brak'}
                    Saldo: ${formatAmount(user.balance)}
                    Status karty: ${user.cardBlocked == 1 ? 'Zablokowana' : 'Aktywna'}
                    Numer konta: ${user.accountNumber || 'Brak'}
                    PIN: ${user.pin || '1234'} (domyślny)
                    Limity:
                    - Dzienny: ${user.limits?.daily || 2000} PLN
                    - Online: ${user.limits?.online || 1000} PLN
                    - Zbliżeniowy: ${user.limits?.contactless || 100} PLN
                `);
            } else {
                alert('Błąd: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Błąd podczas pobierania szczegółów użytkownika:', error);
            alert('Błąd podczas pobierania szczegółów użytkownika. Sprawdź konsolę, aby uzyskać szczegóły.');
        });
}

// Funkcja pokazująca modal sukcesu
function showSuccessModal(title, message) {
    const successModal = document.getElementById('admin-success-modal');
    const successTitle = document.getElementById('admin-success-title');
    const successMessage = document.getElementById('admin-success-message');
    
    if (successModal && successTitle && successMessage) {
        successTitle.textContent = title;
        successMessage.textContent = message;
        successModal.style.display = 'flex';
    }
}

// Funkcja zamykająca wszystkie modale
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Funkcja formatująca kwotę
function formatAmount(amount) {
    return parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + ' PLN';
}