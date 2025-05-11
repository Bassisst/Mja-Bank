<?php
// Dołączenie pliku konfiguracyjnego
global $conn;
require_once 'config.php';

// Sprawdzenie, czy formularz został wysłany
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Pobranie danych z formularza
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    try {
        // Pobranie użytkownika z bazy danych
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Weryfikacja hasła
            if (password_verify($password, $user['password'])) {
                // Rozpoczęcie sesji
                session_start();
                
                // Zapisanie danych użytkownika w sesji
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
                $_SESSION['user_email'] = $user['email'];
                
                // Zwrócenie sukcesu
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Nieprawidłowe hasło.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Użytkownik o podanym adresie email nie istnieje.']);
        }
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Błąd: ' . $e->getMessage()]);
    }
} else {
    // Jeśli nie jest to żądanie POST, przekieruj na stronę logowania
    header('Location: logowanie.html');
    exit;
}
?>