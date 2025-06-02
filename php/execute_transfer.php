<?php
global $conn;
header('Content-Type: application/json');
require_once 'db_connect.php';

// Pobieranie danych z żądania POST
$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? 0;
$recipientName = $data['recipientName'] ?? '';
$recipientAccount = $data['recipientAccount'] ?? '';
$amount = $data['amount'] ?? 0;
$title = $data['title'] ?? '';
$date = $data['date'] ?? '';

// Sprawdzanie obecności danych
if ($userId <= 0 || empty($recipientName) || empty($recipientAccount) || $amount <= 0 || empty($title) || empty($date)) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe dane przelewu']);
    exit;
}

// Rozpoczęcie transakcji
$conn->begin_transaction();

try {
    // Sprawdzenie salda użytkownika
    $checkBalanceQuery = "SELECT balance FROM users WHERE id = ?";
    $checkBalanceStmt = $conn->prepare($checkBalanceQuery);
    $checkBalanceStmt->bind_param("i", $userId);
    $checkBalanceStmt->execute();
    $balanceResult = $checkBalanceStmt->get_result();
    
    if ($balanceResult->num_rows !== 1) {
        throw new Exception('Użytkownik nie znaleziony');
    }
    
    $userBalance = $balanceResult->fetch_assoc()['balance'];
    
    if ($userBalance < $amount) {
        throw new Exception('Niewystarczające środki na koncie');
    }
    
    // Aktualizacja salda użytkownika
    $newBalance = $userBalance - $amount;
    $updateBalanceQuery = "UPDATE users SET balance = ? WHERE id = ?";
    $updateBalanceStmt = $conn->prepare($updateBalanceQuery);
    $updateBalanceStmt->bind_param("di", $newBalance, $userId);
    $updateBalanceStmt->execute();
    
    // Generowanie numeru referencyjnego
    $referenceNumber = 'TRF' . date('Ymd') . sprintf('%06d', rand(1, 999999));
    
    // Dodanie wpisu o przelewie do tabeli transfers
    $addTransferQuery = "INSERT INTO transfers (user_id, recipient_name, recipient_account, amount, title, transfer_date, reference_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')";
    $addTransferStmt = $conn->prepare($addTransferQuery);
    $addTransferStmt->bind_param("issdsss", $userId, $recipientName, $recipientAccount, $amount, $title, $date, $referenceNumber);
    $addTransferStmt->execute();
    
    // Dodanie wpisu o transakcji
    $addTransactionQuery = "INSERT INTO transactions (user_id, type, amount, description) VALUES (?, 'expense', ?, ?)";
    $addTransactionStmt = $conn->prepare($addTransactionQuery);
    $transactionDescription = "Przelew do: " . $recipientName . " - " . $title;
    $addTransactionStmt->bind_param("ids", $userId, $amount, $transactionDescription);
    $addTransactionStmt->execute();
    
    // Zatwierdzenie transakcji
    $conn->commit();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Przelew został pomyślnie wykonany',
        'referenceNumber' => $referenceNumber,
        'newBalance' => $newBalance
    ]);
    
} catch (Exception $e) {
    // Wycofanie transakcji w przypadku błędu
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
