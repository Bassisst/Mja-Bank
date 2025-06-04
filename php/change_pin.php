<?php
global $conn;
header('Content-Type: application/json');
require_once 'db_connect.php';

// Получение данных из POST-запроса
$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? 0;
$currentPin = $data['currentPin'] ?? '';
$newPin = $data['newPin'] ?? '';

// Проверка наличия данных
if ($userId <= 0 || empty($currentPin) || empty($newPin)) {
    echo json_encode(['success' => false, 'message' => 'Неверные данные']);
    exit;
}

// Проверка длины PIN-кода
if (strlen($newPin) !== 4 || !ctype_digit($newPin)) {
    echo json_encode(['success' => false, 'message' => 'PIN должен состоять из 4 цифр']);
    exit;
}

// Проверка текущего PIN-кода
$checkPinQuery = "SELECT pin FROM users WHERE id = ?";
$checkPinStmt = $conn->prepare($checkPinQuery);
$checkPinStmt->bind_param("i", $userId);
$checkPinStmt->execute();
$result = $checkPinStmt->get_result();

if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();
    $dbPin = $row['pin'] ?? '1234';

    if ($currentPin !== $dbPin) {
        echo json_encode(['success' => false, 'message' => 'Неверный текущий PIN']);
        exit;
    }

    // Обновление PIN-кода
    $updatePinQuery = "UPDATE users SET pin = ? WHERE id = ?";
    $updatePinStmt = $conn->prepare($updatePinQuery);
    $updatePinStmt->bind_param("si", $newPin, $userId);

    if ($updatePinStmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'PIN успешно изменен']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ошибка при изменении PIN']);
    }

    $updatePinStmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Пользователь не найден']);
}

$checkPinStmt->close();
$conn->close();
?>