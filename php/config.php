<?php
// Dane do połączenia z bazą danych
$host = 'localhost'; // lub adres serwera bazy danych
$db_name = 'fufel_bank';
$username = 'root'; // zmień na swoją nazwę użytkownika
$password = ''; // zmień na swoje hasło

// Nawiązanie połączenia
try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("SET NAMES utf8");
} catch(PDOException $e) {
    echo "Błąd połączenia: " . $e->getMessage();
    die();
}
?>