<?php
global $conn;
header('Content-Type: application/json');
require_once 'db_connect.php';

// Получение данных
$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? 0;
$amount = $data['amount'] ?? 0;
$description = $data['description'] ?? 'Doładowanie konta';

// Проверка
if ($userId <= 0 || $amount <= 0) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe dane']);
    exit;
}

$conn->begin_transaction(); // Транзакция

try {
    // Обновление баланса
    $updateBalanceQuery = "UPDATE users SET balance = balance + ? WHERE id = ?";
    $updateBalanceStmt = $conn->prepare($updateBalanceQuery);
    $updateBalanceStmt->bind_param("di", $amount, $userId);
    $updateBalanceStmt->execute();

    // Запись транзакции
    $addTransactionQuery = "INSERT INTO transactions (user_id, type, amount, description) VALUES (?, 'income', ?, ?)";
    $addTransactionStmt = $conn->prepare($addTransactionQuery);
    $addTransactionStmt->bind_param("ids", $userId, $amount, $description);
    $addTransactionStmt->execute();

    $conn->commit(); // Подтверждение

    // Получение пользователя
    $getUserQuery = "SELECT id, first_name, last_name, email, phone, balance, account_number, pin, card_blocked FROM users WHERE id = ?";
    $getUserStmt = $conn->prepare($getUserQuery);
    $getUserStmt->bind_param("i", $userId);
    $getUserStmt->execute();
    $userResult = $getUserStmt->get_result();
    $row = $userResult->fetch_assoc();

    // Ответ
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
    $conn->rollback(); // Откат
    echo json_encode(['success' => false, 'message' => 'Błąd: ' . $e->getMessage()]);
}

$conn->close();
?>
