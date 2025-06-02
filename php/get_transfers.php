<?php
global $conn;
header('Content-Type: application/json');
require_once 'db_connect.php';

// Pobieranie ID użytkownika z żądania GET
$userId = $_GET['userId'] ?? 0;

// Sprawdzanie obecności danych
if ($userId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe dane']);
    exit;
}

// Pobieranie przelewów użytkownika
$getTransfersQuery = "SELECT recipient_name, recipient_account, amount, title, transfer_date, reference_number, status, created_at 
                      FROM transfers 
                      WHERE user_id = ? 
                      ORDER BY created_at DESC 
                      LIMIT 10";
$getTransfersStmt = $conn->prepare($getTransfersQuery);
$getTransfersStmt->bind_param("i", $userId);
$getTransfersStmt->execute();
$result = $getTransfersStmt->get_result();

$transfers = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $transfers[] = array(
            'recipientName' => $row['recipient_name'],
            'recipientAccount' => $row['recipient_account'],
            'amount' => $row['amount'],
            'title' => $row['title'],
            'date' => $row['transfer_date'],
            'referenceNumber' => $row['reference_number'],
            'status' => $row['status'],
            'createdAt' => $row['created_at']
        );
    }
}

echo json_encode(['success' => true, 'transfers' => $transfers]);

$getTransfersStmt->close();
$conn->close();
?>
