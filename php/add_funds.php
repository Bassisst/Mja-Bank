<?php
global $conn;
header('Content-Type: application/json');
require_once 'db_connect.php';

// Pobieranie danych z żądania POST
$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? 0;
$amount = $data['amount'] ?? 0;
$description = $data['description'] ?? 'Doładowanie konta';

// Sprawdzanie obecności danych
if ($userId <= 0 || $amount <= 0) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe dane']);
    exit;
}

// Rozpoczęcie transakcji
$conn->begin_transaction();

try {
    // Aktualizacja salda użytkownika
    $updateBalanceQuery = "UPDATE users SET balance = balance + ? WHERE id = ?";
    $updateBalanceStmt = $conn->prepare($updateBalanceQuery);
    $updateBalanceStmt->bind_param("di", $amount, $userId);
    $updateBalanceStmt->execute();
    
    // Dodanie wpisu o transakcji
    $addTransactionQuery = "INSERT INTO transactions (user_id, type, amount, description) VALUES (?, 'income', ?, ?)";
    $addTransactionStmt = $conn->prepare($addTransactionQuery);
    $addTransactionStmt->bind_param("ids", $userId, $amount, $description);
    $addTransactionStmt->execute();
    
    // Zatwierdzenie transakcji
    $conn->commit();
    
    // Pobieranie zaktualizowanych danych użytkownika
    $getUserQuery = "SELECT id, first_name, last_name, email, phone, balance, account_number, pin, card_blocked FROM users WHERE id = ?";
    $getUserStmt = $conn->prepare($getUserQuery);
    $getUserStmt->bind_param("i", $userId);
    $getUserStmt->execute();
    $userResult = $getUserStmt->get_result();
    $row = $userResult->fetch_assoc();
    
    // Konwersja nazw pól dla kompatybilności z JavaScript
    $user = array(
        'id' => $row['id'],
        'firstName' => $row['first_name'],
        'lastName' => $row['last_name'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'balance' => $row['balance'],
        'accountNumber' => $row['account_number'],
        'pin' => $row['pin'] ?? '1234',
        'cardBlocked' => $row['card_blocked'] ?? false
    );
    
    echo json_encode(['success' => true, 'user' => $user, 'message' => 'Środki zostały pomyślnie dodane']);
} catch (Exception $e) {
    // Wycofanie transakcji w przypadku błędu
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Błąd: ' . $e->getMessage()]);
}

$conn->close();
?>