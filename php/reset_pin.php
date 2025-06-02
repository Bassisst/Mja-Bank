<?php
global $conn;
header('Content-Type: application/json');
require_once 'db_connect.php';

// Pobieranie danych z żądania POST
$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? 0;

// Sprawdzanie obecności danych
if ($userId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe dane']);
    exit;
}

// Resetowanie kodu PIN
$resetPinQuery = "UPDATE users SET pin = '1234' WHERE id = ?";
$resetPinStmt = $conn->prepare($resetPinQuery);
$resetPinStmt->bind_param("i", $userId);

if ($resetPinStmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Kod PIN został zresetowany do wartości domyślnej']);
} else {
    echo json_encode(['success' => false, 'message' => 'Błąd podczas resetowania kodu PIN']);
}

$resetPinStmt->close();
$conn->close();
?>