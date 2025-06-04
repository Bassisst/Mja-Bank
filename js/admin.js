document.addEventListener('DOMContentLoaded', function() {
    // Пароль администратора
    const ADMIN_PASSWORD = '123';

    // Элементы UI
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

    // Обработка формы входа администратора
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const password = document.getElementById('admin-password').value;

            if (password === ADMIN_PASSWORD) {
                // Скрыть форму входа
                adminLogin.style.display = 'none';

                // Показать панель администратора
                adminPanel.style.display = 'block';

                // Загрузить данные пользователей
                loadUsers();
            } else {
                loginError.textContent = 'Nieprawidłowe hasło administratora.';
                loginError.style.display = 'block';
            }
        });
    }

    // Обработка формы добавления средств
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

    // Обработка кнопок управления картой
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

    // Обработка кнопки OK в модальном окне успеха
    if (adminSuccessOkBtn) {
        adminSuccessOkBtn.addEventListener('click', closeAllModals);
    }

    // Обработка кнопок закрытия модальных окон
    if (closeModalButtons) {
        closeModalButtons.forEach(button => {
            button.addEventListener('click', closeAllModals);
        });
    }

    // Обработка выхода из системы
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
});

// Функция загрузки пользователей
function loadUsers() {
    fetch('get_users.php')
        .then(response => response.json())
        .then(users => {
            // Обновление таблицы пользователей
            updateUserTable(users);

            // Обновление выпадающих списков
            updateUserSelects(users);
        })
        .catch(error => {
            console.error('Błąd podczas ładowania użytkowników:', error);
            alert('Błąd podczas ładowania użytkowników. Sprawdź konsolę, aby uzyskać szczegóły.');
        });
}

// Функция обновления таблицы пользователей
function updateUserTable(users) {
    const userListBody = document.querySelector('#user-list tbody');

    if (!userListBody) return;

    // Очистка таблицы
    userListBody.innerHTML = '';

    // Если пользователей нет
    if (users.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">Brak użytkowników</td>';
        userListBody.appendChild(row);
        return;
    }

    // Добавление пользователей в таблицу
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

// Функция обновления выпадающих списков пользователей
function updateUserSelects(users) {
    const userIdSelect = document.getElementById('user-id');
    const cardUserIdSelect = document.getElementById('card-user-id');

    if (!userIdSelect || !cardUserIdSelect) return;

    // Очистка списков
    userIdSelect.innerHTML = '<option value="">Wybierz użytkownika</option>';
    cardUserIdSelect.innerHTML = '<option value="">Wybierz użytkownika</option>';

    // Добавление пользователей в списки
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.firstName} ${user.lastName} (${user.email})`;

        userIdSelect.appendChild(option.cloneNode(true));
        cardUserIdSelect.appendChild(option);
    });
}

// Функция добавления средств пользователю
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
                // Обновление UI
                loadUsers();

                // Сброс формы
                document.getElementById('add-funds-form').reset();

                // Показ модального окна успеха
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

// Функция блокировки карты пользователя
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
                // Обновление UI
                loadUsers();

                // Показ модального окна успеха
                showSuccessModal('Karta zablokowana', 'Karta użytkownika została zablokowana.');
            } else {
                alert('Błąd: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Błąd podczas blokowania karty:', error);
            alert('Błąd podczas blokowania karty. Sprawdź консolę, aby uzyskać szczegóły.');
        });
}

// Функция разблокировки карты пользователя
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
                // Обновление UI
                loadUsers();

                // Показ модального окна успеха
                showSuccessModal('Karta odblokowana', 'Karta użytkownika została odblokowana.');
            } else {
                alert('Błąd: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Błąd podczas odblokowywania karty:', error);
            alert('Błąд podczas odblokowywania karty. Sprawdź консolę, aby uzyskać szczegóły.');
        });
}

// Функция сброса PIN-кода пользователя
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
                // Обновление UI
                loadUsers();

                // Показ модального окна успеха
                showSuccessModal('PIN zresetowany', 'PIN użytkownika został zresetowany do wartości domyślnej (1234).');
            } else {
                alert('Błąd: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Błąd podczas resetowania PIN-u:', error);
            alert('Błąд podczas resetowania PIN-u. Sprawdź консolę, aby uzyskać szczegóły.');
        });
}

// Функция удаления пользователя
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
                // Обновление UI
                loadUsers();

                alert('Użytkownik został usunięty.');
            } else {
                alert('Błąd: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Błąд podczas usuwania użytkownika:', error);
            alert('Błąд podczas usuwania użytkownika. Sprawdź консolę, aby uzyskać szczegóły.');
        });
}

// Функция отображения деталей пользователя
function viewUserDetails(userId) {
    fetch(`get_user_details.php?id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const user = data.user;

                // Показать детали пользователя
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
                alert('Błąд: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Błąд podczas pobierania szczegółów użytkownika:', error);
            alert('Błąд podczas pobierania szczegółów użytkownika. Sprawdź консolę, aby uzyskać szczegóły.');
        });
}

// Функция показа модального окна успеха
function showSuccessModal(title, message) {
    const successModal = document.getElementById('admin-success-modal');
    const successTitle = document.getElementById('admin-success-title');
    const successMessage = document.getElementById('admin-success-message');

    if (!successModal || !successTitle || !successMessage) return;

    successTitle.textContent = title;
    successMessage.textContent = message;

    successModal.style.display = 'block';
}

// Функция закрытия всех модальных окон
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Форматирование суммы в PLN
function formatAmount(amount) {
    return amount.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
}
