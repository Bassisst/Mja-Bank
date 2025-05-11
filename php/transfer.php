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

// Sprawdzenie, czy formularz został wysłany
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Pobranie danych z formularza
    $recipientName = $_POST['recipient-name'];
    $recipientAccount = $_POST['recipient-account'];
    $amount = floatval($_POST['transfer-amount']);
    $title = $_POST['transfer-title'];
    $userId = $_SESSION['user_id'];
    
    try {
        // Rozpoczęcie transakcji
        $conn->beginTransaction();
        
        // Pobranie salda użytkownika
        $stmt = $conn->prepare("SELECT balance FROM users WHERE id = :user_id");
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Sprawdzenie, czy użytkownik ma wystarczające środki
        if ($user['balance'] < $amount) {
            echo json_encode(['success' => false, 'message' => 'Nie masz wystarczających środków na koncie.']);
            exit;
        }
        
        // Aktualizacja salda użytkownika
        $stmt = $conn->prepare("UPDATE users SET balance = balance - :amount WHERE id = :user_id");
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        // Dodanie transakcji
        $description = "Przelew do: " . $recipientName . " - " . $title;
        $stmt = $conn->prepare("INSERT INTO transactions (user_id, type, amount, description) 
                               VALUES (:user_id, 'expense', :amount, :description)");
        
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':description', $description);
        $stmt->execute();
        
        // Zatwierdzenie transakcji
        $conn->commit();
        
        // Zwrócenie sukcesu
        echo json_encode(['success' => true]);
    } catch(PDOException $e) {
        // Wycofanie transakcji w przypadku błędu
        $conn->rollBack();
        echo json_encode(['success' => false, 'message' => 'Błąd: ' . $e->getMessage()]);
    }
} else {
    // Jeśli nie jest to żądanie POST, przekieruj na stronę przelewu
    header('Location: przelew.html');
    exit;
}
?>