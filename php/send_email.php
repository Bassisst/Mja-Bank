<?php
// Dołączenie biblioteki PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer-master/src/Exception.php';
require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';

// Sprawdzenie, czy formularz został wysłany
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Pobranie danych z formularza
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $subject = $_POST['subject'] ?? '';
    $message = $_POST['message'] ?? '';
    
    // Podstawowa walidacja
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        echo json_encode(['success' => false, 'message' => 'Wypełnij wszystkie pola formularza.']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Podaj prawidłowy adres email.']);
        exit;
    }
    
    // Konfiguracja PHPMailer
    $mail = new PHPMailer(true);
    
    try {
        // Ustawienia serwera
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'vova30511@gmail.com'; // Twój adres Gmail
        $mail->Password = 'O67id5t1!'; // Hasło do aplikacji (nie zwykłe hasło do konta)
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;
        
        // Nadawca i odbiorca
        $mail->setFrom($email, $name);
        $mail->addAddress('vova30511@gmail.com'); // Twój adres Gmail
        $mail->addReplyTo($email, $name);
        
        // Treść wiadomości
        $mail->isHTML(true);
        $mail->Subject = 'Wiadomość z formularza kontaktowego: ' . $subject;
        $mail->Body = "
            <h3>Nowa wiadomość z formularza kontaktowego Fufel Bank</h3>
            <p><strong>Imię i nazwisko:</strong> {$name}</p>
            <p><strong>Email:</strong> {$email}</p>
            <p><strong>Temat:</strong> {$subject}</p>
            <p><strong>Wiadomość:</strong></p>
            <p>{$message}</p>
        ";
        $mail->AltBody = "Nowa wiadomość od: {$name}\nEmail: {$email}\nTemat: {$subject}\nWiadomość: {$message}";
        
        // Wysłanie wiadomości
        $mail->send();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Błąd podczas wysyłania wiadomości: ' . $mail->ErrorInfo]);
    }
} else {
    // Jeśli nie jest to żądanie POST, przekieruj na stronę kontaktu
    header('Location: kontakt.html');
    exit;
}
?>