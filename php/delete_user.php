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

// Rozpoczęcie transakcji
$conn->begin_transaction();

try {
    // Usuwanie limitów użytkownika
    $deleteLimitsQuery = "DELETE FROM limits WHERE user_id = ?";
    $deleteLimitsStmt = $conn->prepare($deleteLimitsQuery);
    $deleteLimitsStmt->bind_param("i", $userId);
    $deleteLimitsStmt->execute();
    
    // Usuwanie transakcji użytkownika
    $deleteTransactionsQuery = "DELETE FROM transactions WHERE user_id = ?";
    $deleteTransactionsStmt = $conn->prepare($deleteTransactionsQuery);
    $deleteTransactionsStmt->bind_param("i", $userId);
    $deleteTransactionsStmt->execute();
    
    // Usuwanie użytkownika
    $deleteUserQuery = "DELETE FROM users WHERE id = ?";
    $deleteUserStmt = $conn->prepare($deleteUserQuery);
    $deleteUserStmt->bind_param("i", $userId);
    $deleteUserStmt->execute();
    
    // Zatwierdzenie transakcji
    $conn->commit();
    
    echo json_encode(['success' => true, 'message' => 'Użytkownik został pomyślnie usunięty']);
} catch (Exception $e) {
    // Wycofanie transakcji w przypadku błędu
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Błąd: ' . $e->getMessage()]);
}

$conn->close();
?>