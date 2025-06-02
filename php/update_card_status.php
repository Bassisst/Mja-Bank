<?php
global $conn;
header('Content-Type: application/json');
require_once 'db_connect.php';

// Pobieranie danych z żądania POST
$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? 0;
$blocked = $data['blocked'] ?? false;

// Sprawdzanie obecności danych
if ($userId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe dane']);
    exit;
}

// Aktualizacja statusu karty
$updateCardQuery = "UPDATE users SET card_blocked = ? WHERE id = ?";
$updateCardStmt = $conn->prepare($updateCardQuery);
$blockedInt = $blocked ? 1 : 0;
$updateCardStmt->bind_param("ii", $blockedInt, $userId);

if ($updateCardStmt->execute()) {
    echo json_encode(['success' => true, 'message' => $blocked ? 'Karta została zablokowana' : 'Karta została odblokowana']);
} else {
    echo json_encode(['success' => false, 'message' => 'Błąd podczas aktualizacji statusu karty']);
}

$updateCardStmt->close();
$conn->close();
?>