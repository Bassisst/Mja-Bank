<?php
// Parametry połączenia z bazą danych
$servername = "localhost";
$username = "root"; // Standardowa nazwa użytkownika w XAMPP
$password = ""; // Standardowe hasło w XAMPP (puste)
$dbname = "fufel_bank";

// Utworzenie połączenia
$conn = new mysqli($servername, $username, $password, $dbname);

// Sprawdzenie połączenia
if ($conn->connect_error) {
    die("Błąd połączenia: " . $conn->connect_error);
}

// Ustawienie kodowania
$conn->set_charset("utf8");

?>