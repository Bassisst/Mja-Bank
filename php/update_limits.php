<?php
global $conn;
header('Content-Type: application/json');
require_once 'db_connect.php';

// Pobieranie danych z żądania POST
$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? 0;
$daily = $data['daily'] ?? 2000;
$online = $data['online'] ?? 1000;
$contactless = $data['contactless'] ?? 100;

// Sprawdzanie obecności danych
if ($userId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe dane']);
    exit;
}

// Sprawdzanie, czy limity istnieją dla użytkownika
$checkLimitsQuery = "SELECT id FROM limits WHERE user_id = ?";
$checkLimitsStmt = $conn->prepare($checkLimitsQuery);
$checkLimitsStmt->bind_param("i", $userId);
$checkLimitsStmt->execute();
$result = $checkLimitsStmt->get_result();

if ($result->num_rows > 0) {
    // Aktualizacja istniejących limitów
    $updateLimitsQuery = "UPDATE limits SET daily = ?, online = ?, contactless = ? WHERE user_id = ?";
    $updateLimitsStmt = $conn->prepare($updateLimitsQuery);
    $updateLimitsStmt->bind_param("dddi", $daily, $online, $contactless, $userId);

    if ($updateLimitsStmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Limity zostały pomyślnie zaktualizowane']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Błąd podczas aktualizacji limitów']);
    }

    $updateLimitsStmt->close();
} else {
    // Tworzenie nowych limitów
    $insertLimitsQuery = "INSERT INTO limits (user_id, daily, online, contactless) VALUES (?, ?, ?, ?)";
    $insertLimitsStmt = $conn->prepare($insertLimitsQuery);
    $insertLimitsStmt->bind_param("iddd", $userId, $daily, $online, $contactless);

    if ($insertLimitsStmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Limity zostały pomyślnie ustawione']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Błąd podczas ustawiania limitów']);
    }

    $insertLimitsStmt->close();
}

$checkLimitsStmt->close();
$conn->close();
?>
