document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form")
    const loginError = document.getElementById("login-error")

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault()

            const email = document.getElementById("email").value
            const password = document.getElementById("password").value

            // Walidacja
            if (!email || !password) {
                showError("Wprowadź email i hasło.")
                return
            }

            // Logowanie
            loginUser(email, password)
        })
    }

    function showError(message) {
        if (loginError) {
            loginError.textContent = message
            loginError.style.display = "block"
        } else {
            // Jeśli nie ma elementu do wyświetlenia błędu, użyj alertu
            alert(message)
        }
    }

    function loginUser(email, password) {
        console.log("Próba logowania:", email) // Dodaj do debugowania

        fetch("login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        })
            .then((response) => {
                console.log("Odpowiedź otrzymana") // Dodaj do debugowania
                return response.json()
            })
            .then((data) => {
                console.log("Dane odpowiedzi:", data) // Dodaj do debugowania

                if (data.success) {
                    // Zapisanie danych użytkownika
                    localStorage.setItem("fufelBankUser", JSON.stringify(data.user))

                    // Sprawdzenie czy jest zapisana strona do powrotu
                    const returnUrl = localStorage.getItem("fufelBankReturnUrl")

                    if (returnUrl) {
                        // Usunięcie zapisanej strony
                        localStorage.removeItem("fufelBankReturnUrl")
                        // Przekierowanie na zapisaną stronę
                        window.location.href = returnUrl
                    } else {
                        // Domyślne przekierowanie na stronę karty
                        window.location.href = "moja-karta.html"
                    }
                } else {
                    showError(data.message || "Błąd logowania. Spróbuj ponownie.")
                }
            })
            .catch((error) => {
                console.error("Błąd:", error)
                showError("Wystąpił błąd podczas logowania. Spróbuj ponownie później.")
            })
    }
})
