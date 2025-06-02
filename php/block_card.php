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

// Blokowanie karty
$blockCardQuery = "UPDATE users SET card_blocked = 1 WHERE id = ?";
$blockCardStmt = $conn->prepare($blockCardQuery);
$blockCardStmt->bind_param("i", $userId);

if ($blockCardStmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Karta została zablokowana']);
} else {
    echo json_encode(['success' => false, 'message' => 'Błąd podczas blokowania karty']);
}

$blockCardStmt->close();
$conn->close();
?>
