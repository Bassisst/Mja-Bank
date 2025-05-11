<?php
// Dołączenie pliku konfiguracyjnego
global $conn;
require_once 'config.php';

// Rozpoczęcie sesji
session_start();

// Sprawdzenie, czy użytkownik jest zalogowany
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Użytkownik nie jest zalogowany.']);
    exit;
}

try {
    // Pobranie danych użytkownika
    $userId = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT * FROM users WHERE id = :user_id");
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Pobranie transakcji użytkownika
    $stmt = $conn->prepare("SELECT * FROM transactions WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 10");
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Przygotowanie danych do zwrócenia
    $userData = [
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'account_number' => $user['account_number'],
        'balance' => $user['balance'],
        'transactions' => $transactions
    ];
    
    // Zwrócenie danych
    echo json_encode(['success' => true, 'data' => $userData]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Błąd: ' . $e->getMessage()]);
}
?>