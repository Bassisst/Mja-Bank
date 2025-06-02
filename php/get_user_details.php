<?php
global $conn;
header('Content-Type: application/json');
require_once 'db_connect.php';

// Pobieranie ID użytkownika z żądania GET
$userId = $_GET['id'] ?? 0;

// Sprawdzanie obecności danych
if ($userId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe dane']);
    exit;
}

// Pobieranie danych użytkownika
$getUserQuery = "SELECT id, first_name, last_name, email, phone, balance, account_number, pin, card_blocked FROM users WHERE id = ?";
$getUserStmt = $conn->prepare($getUserQuery);
$getUserStmt->bind_param("i", $userId);
$getUserStmt->execute();
$userResult = $getUserStmt->get_result();

if ($userResult->num_rows === 1) {
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

    // Pobieranie limitów dla użytkownika
    $limitsQuery = "SELECT daily, online, contactless FROM limits WHERE user_id = ?";
    $limitsStmt = $conn->prepare($limitsQuery);
    $limitsStmt->bind_param("i", $userId);
    $limitsStmt->execute();
    $limitsResult = $limitsStmt->get_result();

    if ($limitsResult->num_rows > 0) {
        $limits = $limitsResult->fetch_assoc();
        $user['limits'] = $limits;
    } else {
        $user['limits'] = array(
            'daily' => 2000.00,
            'online' => 1000.00,
            'contactless' => 100.00
        );
    }

    // Pobieranie transakcji dla użytkownika
    $transactionsQuery = "SELECT id, type, amount, description, DATE_FORMAT(created_at, '%d.%m.%Y') as date FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5";
    $transactionsStmt = $conn->prepare($transactionsQuery);
    $transactionsStmt->bind_param("i", $userId);
    $transactionsStmt->execute();
    $transactionsResult = $transactionsStmt->get_result();

    $transactions = array();
    if ($transactionsResult->num_rows > 0) {
        while($transactionRow = $transactionsResult->fetch_assoc()) {
            $transactions[] = $transactionRow;
        }
    }

    $user['transactions'] = $transactions;

    echo json_encode(['success' => true, 'user' => $user]);
} else {
    echo json_encode(['success' => false, 'message' => 'Użytkownik nie znaleziony']);
}

$getUserStmt->close();
$conn->close();
?>
