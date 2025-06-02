<?php
global $conn;
header('Content-Type: application/json');
require_once 'db_connect.php';

// Pobieranie danych z żądania POST
$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? 0;
$currentPin = $data['currentPin'] ?? '';
$newPin = $data['newPin'] ?? '';

// Sprawdzanie obecności danych
if ($userId <= 0 || empty($currentPin) || empty($newPin)) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe dane']);
    exit;
}

// Sprawdzanie długości PIN-u
if (strlen($newPin) !== 4 || !ctype_digit($newPin)) {
    echo json_encode(['success' => false, 'message' => 'PIN musi składać się z 4 cyfr']);
    exit;
}

// Sprawdzanie obecnego PIN-u
$checkPinQuery = "SELECT pin FROM users WHERE id = ?";
$checkPinStmt = $conn->prepare($checkPinQuery);
$checkPinStmt->bind_param("i", $userId);
$checkPinStmt->execute();
$result = $checkPinStmt->get_result();

if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();
    $dbPin = $row['pin'] ?? '1234';

    if ($currentPin !== $dbPin) {
        echo json_encode(['success' => false, 'message' => 'Nieprawidłowy obecny PIN']);
        exit;
    }

    // Aktualizacja PIN-u
    $updatePinQuery = "UPDATE users SET pin = ? WHERE id = ?";
    $updatePinStmt = $conn->prepare($updatePinQuery);
    $updatePinStmt->bind_param("si", $newPin, $userId);

    if ($updatePinStmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'PIN został pomyślnie zmieniony']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Błąd podczas zmiany PIN-u']);
    }

    $updatePinStmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Użytkownik nie znaleziony']);
}

$checkPinStmt->close();
$conn->close();
?>
