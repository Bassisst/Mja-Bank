<?php
global $conn;
header('Content-Type: application/json');
require_once 'db_connect.php';

// Pobieranie listy użytkowników
$sql = "SELECT id, first_name, last_name, email, phone, balance, account_number, pin, card_blocked FROM users";
$result = $conn->query($sql);

$users = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
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
        $limitsQuery = "SELECT daily, online, contactless FROM limits WHERE user_id = " . $row['id'];
        $limitsResult = $conn->query($limitsQuery);
        
        if ($limitsResult && $limitsResult->num_rows > 0) {
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
        $transactionsQuery = "SELECT id, type, amount, description, DATE_FORMAT(created_at, '%d.%m.%Y') as date FROM transactions WHERE user_id = " . $row['id'] . " ORDER BY created_at DESC LIMIT 5";
        $transactionsResult = $conn->query($transactionsQuery);
        
        $transactions = array();
        if ($transactionsResult && $transactionsResult->num_rows > 0) {
            while($transactionRow = $transactionsResult->fetch_assoc()) {
                $transactions[] = $transactionRow;
            }
        }
        
        $user['transactions'] = $transactions;
        
        $users[] = $user;
    }
}

echo json_encode($users);
$conn->close();
?>