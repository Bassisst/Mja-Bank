document.addEventListener('DOMContentLoaded', function() {
    // Sprawdzenie, czy użytkownik jest zalogowany
    fetch('check_session.php')
        .then(response => response.json())
        .then(data => {
            if (!data.logged_in) {
                window.location.href = 'logowanie.html';
                return;
            }
            
            // Pobieranie danych karty i salda
            loadCardData();
        })
        .catch(error => {
            console.error('Błąd:', error);
            alert('Wystąpił błąd podczas sprawdzania sesji.');
        });
    
    // Obsługa formularza przelewu
    const transferForm = document.getElementById('transfer-form');
    if (transferForm) {
        transferForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showTransferConfirmation();
        });
    }
    
    // Obsługa przycisków w modalu potwierdzenia
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    const successOk = document.getElementById('success-ok');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    if (modalCancel) {
        modalCancel.addEventListener('click', closeModal);
    }
    
    if (modalConfirm) {
        modalConfirm.addEventListener('click', executeTransfer);
    }
    
    if (successOk) {
        successOk.addEventListener('click', closeModal);
    }
    
    if (closeModalButtons) {
        closeModalButtons.forEach(button => {
            button.addEventListener('click', closeModal);
        });
    }
});

// Funkcja ładująca dane karty i salda
function loadCardData() {
    fetch('get_card_data.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Aktualizacja salda
                updateBalance(data.data.balance);
                
                // Aktualizacja historii przelewów
                updateTransferHistory(data.data.transactions);
            } else {
                console.error('Błąd:', data.message);
            }
        })
        .catch(error => {
            console.error('Błąd:', error);
        });
}

// Funkcja aktualizująca saldo
function updateBalance(balance) {
    const balanceElement = document.getElementById('available-balance');
    if (balanceElement) {
        balanceElement.textContent = formatAmount(balance);
    }
}

// Funkcja aktualizująca historię przelewów
function updateTransferHistory(transactions) {
    const transferList = document.getElementById('transfer-list');
    if (!transferList) return;
    
    // Filtrowanie transakcji - tylko przelewy
    const transfers = transactions.filter(transaction => 
        transaction.description.includes('Przelew'));
    
    // Czyszczenie listy
    transferList.innerHTML = '';
    
    // Jeśli nie ma przelewów
    if (transfers.length === 0) {
        transferList.innerHTML = '<p class="no-transfers">Brak historii przelewów</p>';
        return;
    }
    
    // Dodawanie przelewów do listy
    transfers.forEach(transfer => {
        const transferElement = document.createElement('div');
        transferElement.className = 'transaction';
        
        const isExpense = transfer.type === 'expense';
        const date = new Date(transfer.created_at).toLocaleDateString();
        
        transferElement.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-name">${transfer.description}</div>
                <div class="transaction-date">${date}</div>
            </div>
            <div class="transaction-amount ${isExpense ? 'expense' : 'income'}">
                ${isExpense ? '-' : '+'}${formatAmount(transfer.amount)}
            </div>
        `;
        
        transferList.appendChild(transferElement);
    });
}

// Funkcja pokazująca modal potwierdzenia
function showTransferConfirmation() {
    const recipientName = document.getElementById('recipient-name').value;
    const recipientAccount = document.getElementById('recipient-account').value;
    const amount = document.getElementById('transfer-amount').value;
    const title = document.getElementById('transfer-title').value;
    
    // Walidacja
    if (!recipientName || !recipientAccount || !amount || !title) {
        alert('Wypełnij wszystkie pola formularza.');
        return;
    }
    
    if (amount <= 0) {
        alert('Kwota musi być większa od zera.');
        return;
    }
    
    // Sprawdzenie, czy użytkownik ma wystarczające środki
    fetch('get_card_data.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const balance = parseFloat(data.data.balance);
                const transferAmount = parseFloat(amount);
                
                if (transferAmount > balance) {
                    alert('Nie masz wystarczających środków na koncie.');
                    return;
                }
                
                // Aktualizacja danych w modalu
                document.getElementById('modal-recipient').textContent = recipientName;
                document.getElementById('modal-account').textContent = recipientAccount;
                document.getElementById('modal-amount').textContent = formatAmount(amount);
                document.getElementById('modal-title').textContent = title;
                
                // Pokazanie modalu
                const transferModal = document.getElementById('transfer-modal');
                transferModal.style.display = 'flex';
            } else {
                console.error('Błąd:', data.message);
                alert('Wystąpił błąd podczas sprawdzania salda.');
            }
        })
        .catch(error => {
            console.error('Błąd:', error);
            alert('Wystąpił błąd podczas sprawdzania salda.');
        });
}

// Funkcja wykonująca przelew
function executeTransfer() {
    // Pobieranie danych z formularza
    const recipientName = document.getElementById('recipient-name').value;
    const recipientAccount = document.getElementById('recipient-account').value;
    const amount = document.getElementById('transfer-amount').value;
    const title = document.getElementById('transfer-title').value;
    
    // Tworzenie obiektu FormData
    const formData = new FormData();
    formData.append('recipient-name', recipientName);
    formData.append('recipient-account', recipientAccount);
    formData.append('transfer-amount', amount);
    formData.append('transfer-title', title);
    
    // Wysłanie żądania do serwera
    fetch('transfer.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Zamknięcie modalu potwierdzenia
            closeModal();
            
            // Aktualizacja danych w modalu sukcesu
            document.getElementById('success-recipient').textContent = recipientName;
            document.getElementById('success-amount').textContent = formatAmount(amount);
            
            // Pokazanie modalu sukcesu
            const successModal = document.getElementById('success-modal');
            successModal.style.display = 'flex';
            
            // Odświeżenie danych karty i salda
            loadCardData();
            
            // Resetowanie formularza
            document.getElementById('transfer-form').reset();
        } else {
            alert(data.message || 'Wystąpił błąd podczas wykonywania przelewu.');
        }
    })
    .catch(error => {
        console.error('Błąd:', error);
        alert('Wystąpił błąd podczas wykonywania przelewu.');
    });
}

// Funkcja zamykająca modalne okna
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Funkcja formatująca kwotę
function formatAmount(amount) {
    return parseFloat(amount).toFixed(2) + ' PLN';
}