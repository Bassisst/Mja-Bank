<?php
// Конфигурация базы данных
$servername = "localhost";
$username = "root";  // Ваше имя пользователя MySQL
$password = "";      // Ваш пароль MySQL (обычно пустой для localhost)
$dbname = "fufel_bank";

// Создание соединения
$conn = new mysqli($servername, $username, $password, $dbname);

// Проверка соединения
if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    die(json_encode(['success' => false, 'message' => 'Błąd połączenia z bazą danych']));
}

// Установка кодировки
$conn->set_charset("utf8mb4");

// Включение отчетов об ошибках для отладки (удалите в продакшене)
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
?>

