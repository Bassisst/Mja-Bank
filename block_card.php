<?php
global $conn;
header('Content-Type: application/json');
require_once 'db_connect.php';

// Получение данных из POST-запроса
$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? 0;

// Проверка наличия данных
if ($userId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Неверные данные']);
    exit;
}

// Блокировка карты
$blockCardQuery = "UPDATE users SET card_blocked = 1 WHERE id = ?";
$blockCardStmt = $conn->prepare($blockCardQuery);
$blockCardStmt->bind_param("i", $userId);

if ($blockCardStmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Карта была заблокирована']);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка при блокировке карты']);
}

$blockCardStmt->close();
$conn->close();
?>
