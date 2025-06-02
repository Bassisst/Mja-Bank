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

// Sprawdzenie czy karta jest rzeczywiście zablokowana
$checkCardQuery = "SELECT card_blocked FROM users WHERE id = ?";
$checkCardStmt = $conn->prepare($checkCardQuery);
$checkCardStmt->bind_param("i", $userId);
$checkCardStmt->execute();
$result = $checkCardStmt->get_result();

if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();
    
    if ($row['card_blocked'] == 0) {
        echo json_encode(['success' => false, 'message' => 'Karta nie jest zablokowana']);
        exit;
    }
    
    // Odblokowanie karty
    $unblockCardQuery = "UPDATE users SET card_blocked = 0 WHERE id = ?";
    $unblockCardStmt = $conn->prepare($unblockCardQuery);
    $unblockCardStmt->bind_param("i", $userId);
    
    if ($unblockCardStmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Karta została odblokowana']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Błąd podczas odblokowywania karty']);
    }
    
    $unblockCardStmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Użytkownik nie znaleziony']);
}

$checkCardStmt->close();
$conn->close();
?>
