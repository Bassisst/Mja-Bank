document.addEventListener("DOMContentLoaded", () => {
  // Убираем дублирующую проверку авторизации - она уже есть в auth-check.js
  // checkLoginStatus() - удаляем эту функцию

  // Получаем данные пользователя и обновляем интерфейс
  const user = localStorage.getItem("fufelBankUser")
  if (user) {
    const userData = JSON.parse(user)
    updateUserInfo(userData)
  }

  // Обработка формы пrzelewu
  const transferForm = document.getElementById("transfer-form")
  if (transferForm) {
    transferForm.addEventListener("submit", handleTransferSubmit)
  }

  // Obsługa modali
  setupModals()

  // Ustawienie dzisiejszej daty jako domyślnej
  setDefaultDate()

  // Ładowanie ostatnich przelewów
  loadRecentTransfers()
})

// Функция aktualizująca informacje o użytkowniku
function updateUserInfo(userData) {
  // Aktualizacja numeru konta
  const userAccountNumber = document.getElementById("user-account-number")
  if (userAccountNumber && userData.accountNumber) {
    const maskedNumber =
        userData.accountNumber.substring(0, 2) +
        "** **** **** " +
        userData.accountNumber.substring(userData.accountNumber.length - 4)
    userAccountNumber.textContent = maskedNumber
  }

  // Aktualizacja salda
  const userBalance = document.getElementById("user-balance")
  if (userBalance) {
    userBalance.textContent = formatAmount(userData.balance)
  }
}

// Функция ustawiająca dzisiejszą datę jako domyślną
function setDefaultDate() {
  const transferDate = document.getElementById("transfer-date")
  if (transferDate) {
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]
    transferDate.value = formattedDate
    transferDate.min = formattedDate
  }
}

// Функция obsługująca wysłanie formularza przelewu
function handleTransferSubmit(e) {
  e.preventDefault()

  const recipientName = document.getElementById("recipient-name").value
  const recipientAccount = document.getElementById("recipient-account").value
  const transferAmount = Number.parseFloat(document.getElementById("transfer-amount").value)
  const transferTitle = document.getElementById("transfer-title").value
  const transferDate = document.getElementById("transfer-date").value

  // Walidacja
  if (!validateTransfer(recipientName, recipientAccount, transferAmount, transferTitle, transferDate)) {
    return
  }

  // Pokazanie modalu potwierdzenia
  showConfirmationModal(recipientName, recipientAccount, transferAmount, transferTitle, transferDate)
}

// Функция walidująca dane przelewu
function validateTransfer(recipientName, recipientAccount, transferAmount, transferTitle, transferDate) {
  const errorElement = document.getElementById("transfer-error")

  // Sprawdzenie czy wszystkie pola są wypełnione
  if (!recipientName || !recipientAccount || !transferAmount || !transferTitle || !transferDate) {
    showError("Wypełnij wszystkie pola formularza.")
    return false
  }

  // Sprawdzenie kwoty
  if (transferAmount <= 0) {
    showError("Kwota przelewu musi być większa od 0.")
    return false
  }

  // Sprawdzenie salda
  const userData = JSON.parse(localStorage.getItem("fufelBankUser"))
  if (transferAmount > userData.balance) {
    showError("Niewystarczające środki na koncie.")
    return false
  }

  // Sprawdzenie numeru konta (podstawowa walidacja)
  if (recipientAccount.length < 26) {
    showError("Nieprawidłowy numer konta odbiorcy.")
    return false
  }

  // Sprawdzenie daty
  const today = new Date()
  const selectedDate = new Date(transferDate)
  if (selectedDate < today.setHours(0, 0, 0, 0)) {
    showError("Data realizacji nie może być wcześniejsza niż dzisiaj.")
    return false
  }

  return true
}

// Функция pokazująca błąd
function showError(message) {
  const errorElement = document.getElementById("transfer-error")
  if (errorElement) {
    errorElement.textContent = message
    errorElement.style.display = "block"
  }
}

// Функция ukrywająca błąd
function hideError() {
  const errorElement = document.getElementById("transfer-error")
  if (errorElement) {
    errorElement.style.display = "none"
  }
}

// Функция pokazująca modal potwierdzenia
function showConfirmationModal(recipientName, recipientAccount, transferAmount, transferTitle, transferDate) {
  const modal = document.getElementById("transfer-confirm-modal")
  const confirmRecipient = document.getElementById("confirm-recipient")
  const confirmAccount = document.getElementById("confirm-account")
  const confirmAmount = document.getElementById("confirm-amount")
  const confirmTitle = document.getElementById("confirm-title")
  const confirmDate = document.getElementById("confirm-date")

  if (modal && confirmRecipient && confirmAccount && confirmAmount && confirmTitle && confirmDate) {
    confirmRecipient.textContent = recipientName
    confirmAccount.textContent = recipientAccount
    confirmAmount.textContent = formatAmount(transferAmount)
    confirmTitle.textContent = transferTitle
    confirmDate.textContent = formatDate(transferDate)

    modal.style.display = "flex"
  }
}

// Функция wykonująca przelew
function executeTransfer() {
  const recipientName = document.getElementById("recipient-name").value
  const recipientAccount = document.getElementById("recipient-account").value
  const transferAmount = Number.parseFloat(document.getElementById("transfer-amount").value)
  const transferTitle = document.getElementById("transfer-title").value
  const transferDate = document.getElementById("transfer-date").value

  const userData = JSON.parse(localStorage.getItem("fufelBankUser"))

  // Przygotowanie danych przelewu
  const transferData = {
    userId: userData.id,
    recipientName: recipientName,
    recipientAccount: recipientAccount,
    amount: transferAmount,
    title: transferTitle,
    date: transferDate,
  }

  // Wysłanie żądania do serwera
  fetch("execute_transfer.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transferData),
  })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Aktualizacja salda użytkownika
          userData.balance = data.newBalance
          localStorage.setItem("fufelBankUser", JSON.stringify(userData))

          // Zamknięcie modalu potwierdzenia
          closeAllModals()

          // Pokazanie modalu sukcesu
          showSuccessModal(data.referenceNumber)

          // Resetowanie formularza
          document.getElementById("transfer-form").reset()
          setDefaultDate()
          hideError()

          // Aktualizacja informacji o użytkowniku
          updateUserInfo(userData)

          // Odświeżenie listy przelewów
          loadRecentTransfers()
        } else {
          closeAllModals()
          showError(data.message || "Błąd podczas wykonywania przelewu.")
        }
      })
      .catch((error) => {
        console.error("Błąd podczas wykonywania przelewu:", error)
        closeAllModals()
        showError("Wystąpił błąd podczas wykonywania przelewu. Spróbuj ponownie później.")
      })
}

// Функция pokazująca modal sukcesu
function showSuccessModal(referenceNumber) {
  const modal = document.getElementById("transfer-success-modal")
  const transferReference = document.getElementById("transfer-reference")

  if (modal && transferReference) {
    transferReference.textContent = referenceNumber
    modal.style.display = "flex"
  }
}

// Функция ładująca ostatnie przelewy
function loadRecentTransfers() {
  const userData = JSON.parse(localStorage.getItem("fufelBankUser"))

  fetch(`get_transfers.php?userId=${userData.id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          displayRecentTransfers(data.transfers)
        }
      })
      .catch((error) => {
        console.error("Błąd podczas ładowania przelewów:", error)
      })
}

// Функция wyświetlająca ostatnie przelewy
function displayRecentTransfers(transfers) {
  const transfersList = document.getElementById("transfers-list")
  if (!transfersList) return

  transfersList.innerHTML = ""

  if (!transfers || transfers.length === 0) {
    transfersList.innerHTML = '<div class="no-transfers">Brak ostatnich przelewów</div>'
    return
  }

  transfers.slice(0, 5).forEach((transfer) => {
    const transferElement = document.createElement("div")
    transferElement.className = "transfer-item"

    transferElement.innerHTML = `
            <div class="transfer-info">
                <div class="transfer-recipient">${transfer.recipientName}</div>
                <div class="transfer-title">${transfer.title}</div>
                <div class="transfer-date">${formatDate(transfer.date)}</div>
            </div>
            <div class="transfer-amount">
                -${formatAmount(transfer.amount)}
            </div>
        `

    transfersList.appendChild(transferElement)
  })
}

// Функция konfigurująca obsługę modali
function setupModals() {
  // Zamykanie modali
  const closeButtons = document.querySelectorAll(".close-modal")
  closeButtons.forEach((button) => {
    button.addEventListener("click", closeAllModals)
  })

  // Obsługa przycisku Anuluj w modalu potwierdzenia
  const transferCancelButton = document.getElementById("transfer-cancel")
  if (transferCancelButton) {
    transferCancelButton.addEventListener("click", closeAllModals)
  }

  // Obsługa przycisku Potwierdź przelew
  const transferExecuteButton = document.getElementById("transfer-execute")
  if (transferExecuteButton) {
    transferExecuteButton.addEventListener("click", executeTransfer)
  }

  // Obsługa przycisku OK w modalu sukcesu
  const transferSuccessOkButton = document.getElementById("transfer-success-ok")
  if (transferSuccessOkButton) {
    transferSuccessOkButton.addEventListener("click", closeAllModals)
  }
}

// Функция zamykająca wszystkie modale
function closeAllModals() {
  const modals = document.querySelectorAll(".modal")
  modals.forEach((modal) => {
    modal.style.display = "none"
  })
}

// Функция formatująca kwotę
function formatAmount(amount) {
  return (
      Number.parseFloat(amount)
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, "$&,") + " PLN"
  )
}

// Функция formatująca datę
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("pl-PL")
}
