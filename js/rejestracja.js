document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form")
    const registerError = document.getElementById("register-error")
    const registerSuccess = document.getElementById("register-success")

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault()

            // Скрытие предыдущих сообщений
            hideMessages()

            const firstName = document.getElementById("first-name").value.trim()
            const lastName = document.getElementById("last-name").value.trim()
            const email = document.getElementById("email").value.trim()
            const phone = document.getElementById("phone").value.trim()
            const password = document.getElementById("password").value
            const confirmPassword = document.getElementById("confirm-password").value

            // Валидация на стороне клиента
            if (!validateForm(firstName, lastName, email, phone, password, confirmPassword)) {
                return
            }

            // Отправка данных на сервер
            registerUser(firstName, lastName, email, phone, password, confirmPassword)
        })
    }

    function validateForm(firstName, lastName, email, phone, password, confirmPassword) {
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            showError("Wszystkie pola są wymagane.")
            return false
        }

        if (!isValidEmail(email)) {
            showError("Wprowadź prawidłowy adres email.")
            return false
        }

        if (password.length < 6) {
            showError("Hasło musi mieć co najmniej 6 znaków.")
            return false
        }

        if (password !== confirmPassword) {
            showError("Hasła nie są identyczne.")
            return false
        }

        return true
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    function registerUser(firstName, lastName, email, phone, password, confirmPassword) {
        console.log("Wysyłanie danych rejestracji...") // Debug

        const registerData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            password: password,
            confirmPassword: confirmPassword,
        }

        console.log("Dane do wysłania:", registerData) // Debug

        fetch("register.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(registerData),
        })
            .then((response) => {
                console.log("Status odpowiedzi:", response.status) // Debug
                return response.text()
            })
            .then((text) => {
                console.log("Surowa odpowiedź:", text) // Debug
                try {
                    const data = JSON.parse(text)
                    console.log("Parsowana odpowiedź:", data) // Debug

                    if (data.success) {
                        showSuccess("Konto zostało pomyślnie utworzone! Możesz się teraz zalogować.")

                        // Очистка формы
                        document.getElementById("register-form").reset()

                        // Перенаправление на страницу входа через 2 секунды
                        setTimeout(() => {
                            window.location.href = "logowanie.html"
                        }, 2000)
                    } else {
                        showError(data.message || "Wystąpił błąd podczas rejestracji.")
                    }
                } catch (e) {
                    console.error("Błąd parsowania JSON:", e)
                    console.error("Otrzymany tekst:", text)
                    showError("Wystąpił błąd serwera. Spróbuj ponownie później.")
                }
            })
            .catch((error) => {
                console.error("Błąd sieci:", error)
                showError("Wystąpił błąd połączenia. Sprawdź połączenie internetowe.")
            })
    }

    function showError(message) {
        if (registerError) {
            registerError.textContent = message
            registerError.style.display = "block"
        } else {
            alert("Błąd: " + message)
        }
    }

    function showSuccess(message) {
        if (registerSuccess) {
            registerSuccess.textContent = message
            registerSuccess.style.display = "block"
        } else {
            alert("Sukces: " + message)
        }
    }

    function hideMessages() {
        if (registerError) {
            registerError.style.display = "none"
        }
        if (registerSuccess) {
            registerSuccess.style.display = "none"
        }
    }
})
