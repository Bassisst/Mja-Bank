<?php
// Dołączenie pliku konfiguracyjnego
global $conn;
require_once 'config.php';

// Sprawdzenie, czy formularz został wysłany
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Pobranie danych z formularza
    $firstName = $_POST['first-name'];
    $lastName = $_POST['last-name'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT); // Hashowanie hasła
    
    // Generowanie numeru konta
    $accountNumber = 'PL';
    for ($i = 0; $i < 26; $i++) {
        $accountNumber .= rand(0, 9);
    }
    
    try {
        // Sprawdzenie, czy użytkownik już istnieje
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Użytkownik z tym adresem email już istnieje.']);
            exit;
        }
        
        // Dodanie użytkownika do bazy danych
        $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, phone, password, account_number) 
                               VALUES (:first_name, :last_name, :email, :phone, :password, :account_number)");
        
        $stmt->bindParam(':first_name', $firstName);
        $stmt->bindParam(':last_name', $lastName);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':account_number', $accountNumber);
        
        $stmt->execute();
        
        // Pobranie ID nowego użytkownika
        $userId = $conn->lastInsertId();
        
        // Dodanie początkowej transakcji
        $stmt = $conn->prepare("INSERT INTO transactions (user_id, type, amount, description) 
                               VALUES (:user_id, 'income', 5000.00, 'Saldo początkowe')");
        
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        // Zwrócenie sukcesu
        echo json_encode(['success' => true]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Błąd: ' . $e->getMessage()]);
    }
} else {
    // Jeśli nie jest to żądanie POST, przekieruj na stronę rejestracji
    header('Location: rejestracja.html');
    exit;
}
?>