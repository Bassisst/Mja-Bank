document.addEventListener("DOMContentLoaded", () => {
    // Sprawdzenie, czy użytkownik jest zalogowany
    checkLoginStatus()

    // Obsługa przycisków
    const blockCardBtn = document.getElementById("block-card-btn")
    const unblockCardBtn = document.getElementById("unblock-card-btn")
    const changePinBtn = document.getElementById("change-pin-btn")
    const limitsBtn = document.getElementById("limits-btn")

    if (blockCardBtn) {
        blockCardBtn.addEventListener("click", showBlockCardModal)
    }

    if (unblockCardBtn) {
        unblockCardBtn.addEventListener("click", showUnblockCardModal)
    }

    if (changePinBtn) {
        changePinBtn.addEventListener("click", showChangePinModal)
    }

    if (limitsBtn) {
        limitsBtn.addEventListener("click", showLimitsModal)
    }

    // Obsługa modali
    setupModals()
})

// Funkcja sprawdzająca status logowania
function checkLoginStatus() {
    const user = localStorage.getItem("fufelBankUser")

    if (!user) {
        window.location.href = "logowanie.html"
        return
    }

    const userData = JSON.parse(user)

    // Aktualizacja danych użytkownika
    updateUserData(userData)

    // Aktualizacja transakcji
    loadTransactions(userData)
}

// Funkcja aktualizująca dane użytkownika
function updateUserData(userData) {
    // Aktualizacja imienia i nazwiska
    const userName = document.getElementById("user-name")
    if (userName) {
        userName.textContent = `${userData.firstName} ${userData.lastName}`
    }

    // Aktualizacja danych karty
    const cardHolderName = document.getElementById("card-holder-name")
    if (cardHolderName) {
        cardHolderName.textContent = `${userData.firstName} ${userData.lastName}`.toUpperCase()
    }

    const cardNumber = document.getElementById("card-number")
    if (cardNumber) {
        // Wyświetl tylko ostatnie 4 cyfry numeru karty
        const maskedNumber = userData.accountNumber
            ? userData.accountNumber.substring(0, 2) +
            "** **** **** " +
            userData.accountNumber.substring(userData.accountNumber.length - 4)
            : "**** **** **** 1234"
        cardNumber.textContent = maskedNumber
    }

    // Aktualizacja salda
    const accountBalance = document.getElementById("account-balance")
    if (accountBalance) {
        accountBalance.textContent = formatAmount(userData.balance)
    }

    // Aktualizacja statusu karty i przycisków
    updateCardStatus(userData)
}

// Funkcja aktualizująca status karty i widoczność przycisków
function updateCardStatus(userData) {
    const cardStatus = document.getElementById("card-status")
    const cardDisplay = document.getElementById("card-display")
    const blockCardBtn = document.getElementById("block-card-btn")
    const unblockCardBtn = document.getElementById("unblock-card-btn")
    const cardBlockedNotice = document.getElementById("card-blocked-notice")

    const isBlocked = userData.cardBlocked == 1 || userData.cardBlocked === true

    if (cardStatus && cardDisplay) {
        if (isBlocked) {
            cardStatus.textContent = "KARTA ZABLOKOWANA"
            cardStatus.classList.add("blocked")
            cardDisplay.classList.add("card-blocked")

            // Pokaż powiadomienie o zablokowanej karcie
            if (cardBlockedNotice) {
                cardBlockedNotice.style.display = "block"
            }

            // Ukryj przycisk blokowania, pokaż przycisk odblokowywania
            if (blockCardBtn) blockCardBtn.style.display = "none"
            if (unblockCardBtn) unblockCardBtn.style.display = "inline-flex"
        } else {
            cardStatus.textContent = ""
            cardStatus.classList.remove("blocked")
            cardDisplay.classList.remove("card-blocked")

            // Ukryj powiadomienie o zablokowanej karcie
            if (cardBlockedNotice) {
                cardBlockedNotice.style.display = "none"
            }

            // Pokaż przycisk blokowania, ukryj przycisk odblokowywania
            if (blockCardBtn) blockCardBtn.style.display = "inline-flex"
            if (unblockCardBtn) unblockCardBtn.style.display = "none"
        }
    }
}

// Funkcja ładująca transakcje
function loadTransactions(userData) {
    const transactionList = document.getElementById("transaction-list")
    if (!transactionList) return

    // Czyszczenie listy
    transactionList.innerHTML = ""

    // Jeśli nie ma transakcji
    if (!userData.transactions || userData.transactions.length === 0) {
        transactionList.innerHTML = '<div class="no-transactions">Brak historii transakcji</div>'
        return
    }

    // Sortowanie transakcji od najnowszych
    const sortedTransactions = [...userData.transactions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
    })

    // Dodawanie transakcji do listy (maksymalnie 5)
    const transactionsToShow = sortedTransactions.slice(0, 5)

    transactionsToShow.forEach((transaction) => {
        const transactionElement = document.createElement("div")
        transactionElement.className = "transaction"

        const isExpense = transaction.type === "expense"

        transactionElement.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-name">${transaction.description}</div>
                <div class="transaction-date">${transaction.date}</div>
            </div>
            <div class="transaction-amount ${isExpense ? "expense" : "income"}">
                ${isExpense ? "-" : "+"}${formatAmount(transaction.amount)}
            </div>
        `

        transactionList.appendChild(transactionElement)
    })
}

// Funkcja pokazująca modal blokowania karty
function showBlockCardModal() {
    const blockModal = document.getElementById("block-modal")
    if (blockModal) {
        blockModal.style.display = "flex"
    }
}

// Funkcja pokazująca modal odblokowywania karty
function showUnblockCardModal() {
    const unblockModal = document.getElementById("unblock-modal")
    if (unblockModal) {
        unblockModal.style.display = "flex"
    }
}

// Funkcja pokazująca modal zmiany PIN-u
function showChangePinModal() {
    const pinModal = document.getElementById("pin-modal")
    if (pinModal) {
        // Resetowanie formularza
        const pinForm = document.getElementById("pin-form")
        if (pinForm) {
            pinForm.reset()
        }

        pinModal.style.display = "flex"
    }
}

// Funkcja pokazująca modal limitów transakcji
function showLimitsModal() {
    const limitsModal = document.getElementById("limits-modal")
    if (limitsModal) {
        // Pobieranie zapisanych limitów
        const userData = JSON.parse(localStorage.getItem("fufelBankUser"))

        if (userData && userData.limits) {
            document.getElementById("daily-limit").value = userData.limits.daily || 2000
            document.getElementById("online-limit").value = userData.limits.online || 1000
            document.getElementById("contactless-limit").value = userData.limits.contactless || 100
        }

        limitsModal.style.display = "flex"
    }
}

// Funkcja konfigurująca obsługę modali
function setupModals() {
    // Zamykanie modali
    const closeButtons = document.querySelectorAll(".close-modal")
    closeButtons.forEach((button) => {
        button.addEventListener("click", closeAllModals)
    })

    // Obsługa przycisku OK w modalu sukcesu
    const successOkButton = document.getElementById("success-ok")
    if (successOkButton) {
        successOkButton.addEventListener("click", closeAllModals)
    }

    // Obsługa przycisku Anuluj w modalu blokowania karty
    const blockCancelButton = document.getElementById("block-cancel")
    if (blockCancelButton) {
        blockCancelButton.addEventListener("click", closeAllModals)
    }

    // Obsługa przycisku Zablokuj kartę w modalu blokowania karty
    const blockConfirmButton = document.getElementById("block-confirm")
    if (blockConfirmButton) {
        blockConfirmButton.addEventListener("click", blockCard)
    }

    // Obsługa przycisku Anuluj w modalu odblokowywania karty
    const unblockCancelButton = document.getElementById("unblock-cancel")
    if (unblockCancelButton) {
        unblockCancelButton.addEventListener("click", closeAllModals)
    }

    // Obsługa przycisku Odblokuj kartę w modalu odblokowywania karty
    const unblockConfirmButton = document.getElementById("unblock-confirm")
    if (unblockConfirmButton) {
        unblockConfirmButton.addEventListener("click", unblockCard)
    }

    // Obsługa przycisku Anuluj w modalu zmiany PIN-u
    const pinCancelButton = document.getElementById("pin-cancel")
    if (pinCancelButton) {
        pinCancelButton.addEventListener("click", closeAllModals)
    }

    // Obsługa przycisku Zmień PIN w modalu zmiany PIN-u
    const pinConfirmButton = document.getElementById("pin-confirm")
    if (pinConfirmButton) {
        pinConfirmButton.addEventListener("click", changePin)
    }

    // Obsługa przycisku Anuluj w modalu limitów transakcji
    const limitsCancelButton = document.getElementById("limits-cancel")
    if (limitsCancelButton) {
        limitsCancelButton.addEventListener("click", closeAllModals)
    }

    // Obsługa przycisku Zapisz limity w modalu limitów transakcji
    const limitsConfirmButton = document.getElementById("limits-confirm")
    if (limitsConfirmButton) {
        limitsConfirmButton.addEventListener("click", saveLimits)
    }
}

// Funkcja blokująca kartę
function blockCard() {
    // Pobieranie danych użytkownika
    const userData = JSON.parse(localStorage.getItem("fufelBankUser"))

    fetch("block_card.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: userData.id,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Aktualizacja statusu karty w localStorage
                userData.cardBlocked = true
                localStorage.setItem("fufelBankUser", JSON.stringify(userData))

                // Zamknięcie modalu blokowania karty
                closeAllModals()

                // Pokazanie modalu sukcesu
                showSuccessModal(
                    "Karta zablokowana",
                    'Twoja karta została zablokowana. Możesz ją odblokować używając przycisku "Odblokuj kartę".',
                )

                // Aktualizacja UI
                updateUserData(userData)
            } else {
                alert("Błąd: " + data.message)
            }
        })
        .catch((error) => {
            console.error("Błąd podczas blokowania karty:", error)
            alert("Błąd podczas blokowania karty. Sprawdź konsolę, aby uzyskać szczegóły.")
        })
}

// Funkcja odblokowująca kartę
function unblockCard() {
    // Pobieranie danych użytkownika
    const userData = JSON.parse(localStorage.getItem("fufelBankUser"))

    fetch("unblock_card.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: userData.id,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Aktualizacja statusu karty w localStorage
                userData.cardBlocked = false
                localStorage.setItem("fufelBankUser", JSON.stringify(userData))

                // Zamknięcie modalu odblokowywania karty
                closeAllModals()

                // Pokazanie modalu sukcesu
                showSuccessModal("Karta odblokowana", "Twoja karta została odblokowana. Możesz teraz używać jej do płatności.")

                // Aktualizacja UI
                updateUserData(userData)
            } else {
                alert("Błąd: " + data.message)
            }
        })
        .catch((error) => {
            console.error("Błąd podczas odblokowywania karty:", error)
            alert("Błąd podczas odblokowywania karty. Sprawdź konsolę, aby uzyskać szczegóły.")
        })
}

// Funkcja zmieniająca PIN
function changePin() {
    const currentPin = document.getElementById("current-pin").value
    const newPin = document.getElementById("new-pin").value
    const confirmPin = document.getElementById("confirm-pin").value

    // Walidacja
    if (!currentPin || !newPin || !confirmPin) {
        alert("Wypełnij wszystkie pola.")
        return
    }

    if (newPin !== confirmPin) {
        alert("Nowy PIN i potwierdzenie PIN-u nie są identyczne.")
        return
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
        alert("PIN musi składać się z 4 cyfr.")
        return
    }

    // Pobieranie danych użytkownika
    const userData = JSON.parse(localStorage.getItem("fufelBankUser"))

    fetch("change_pin.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: userData.id,
            currentPin: currentPin,
            newPin: newPin,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Aktualizacja PIN-u w localStorage
                userData.pin = newPin
                localStorage.setItem("fufelBankUser", JSON.stringify(userData))

                // Zamknięcie modalu zmiany PIN-u
                closeAllModals()

                // Pokazanie modalu sukcesu
                showSuccessModal("PIN zmieniony", "Twój PIN został pomyślnie zmieniony.")
            } else {
                alert("Błąd: " + data.message)
            }
        })
        .catch((error) => {
            console.error("Błąd podczas zmiany PIN-u:", error)
            alert("Błąd podczas zmiany PIN-u. Sprawdź konsolę, aby uzyskać szczegóły.")
        })
}

// Funkcja zapisująca limity transakcji
function saveLimits() {
    const dailyLimit = document.getElementById("daily-limit").value
    const onlineLimit = document.getElementById("online-limit").value
    const contactlessLimit = document.getElementById("contactless-limit").value

    // Walidacja
    if (!dailyLimit || !onlineLimit || !contactlessLimit) {
        alert("Wypełnij wszystkie pola.")
        return
    }

    // Pobieranie danych użytkownika
    const userData = JSON.parse(localStorage.getItem("fufelBankUser"))

    fetch("update_limits.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: userData.id,
            daily: Number.parseFloat(dailyLimit),
            online: Number.parseFloat(onlineLimit),
            contactless: Number.parseFloat(contactlessLimit),
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Aktualizacja limitów w localStorage
                userData.limits = {
                    daily: Number.parseFloat(dailyLimit),
                    online: Number.parseFloat(onlineLimit),
                    contactless: Number.parseFloat(contactlessLimit),
                }
                localStorage.setItem("fufelBankUser", JSON.stringify(userData))

                // Zamknięcie modalu limitów transakcji
                closeAllModals()

                // Pokazanie modalu sukcesu
                showSuccessModal("Limity zaktualizowane", "Limity transakcji zostały pomyślnie zaktualizowane.")
            } else {
                alert("Błąd: " + data.message)
            }
        })
        .catch((error) => {
            console.error("Błąd podczas aktualizacji limitów:", error)
            alert("Błąd podczas aktualizacji limitów. Sprawdź konsolę, aby uzyskać szczegóły.")
        })
}

// Funkcja pokazująca modal sukcesu
function showSuccessModal(title, message) {
    const successModal = document.getElementById("success-modal")
    const successTitle = document.getElementById("success-title")
    const successMessage = document.getElementById("success-message")

    if (successModal && successTitle && successMessage) {
        successTitle.textContent = title
        successMessage.textContent = message
        successModal.style.display = "flex"
    }
}

// Funkcja zamykająca wszystkie modale
function closeAllModals() {
    const modals = document.querySelectorAll(".modal")
    modals.forEach((modal) => {
        modal.style.display = "none"
    })
}

// Funkcja formatująca kwotę
function formatAmount(amount) {
    return (
        Number.parseFloat(amount)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, "$&,") + " PLN"
    )
}
