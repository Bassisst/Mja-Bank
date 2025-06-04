<?php
global $conn;
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db_connect.php';

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowa metoda żądania']);
    exit;
}

// Получение данных из POST запроса
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Проверка декодирования JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe dane JSON']);
    exit;
}

// Извлечение данных
$firstName = trim($data['firstName'] ?? '');
$lastName = trim($data['lastName'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$password = $data['password'] ?? '';
$confirmPassword = $data['confirmPassword'] ?? '';

// Валидация данных
if (empty($firstName) || empty($lastName) || empty($email) || empty($password) || empty($confirmPassword)) {
    echo json_encode(['success' => false, 'message' => 'Wszystkie pola są wymagane']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowy adres email']);
    exit;
}

if ($password !== $confirmPassword) {
    echo json_encode(['success' => false, 'message' => 'Hasła nie są identyczne']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Hasło musi mieć co najmniej 6 znaków']);
    exit;
}

try {
    // Проверка существования пользователя
    $checkUserQuery = "SELECT id FROM users WHERE email = ?";
    $checkUserStmt = $conn->prepare($checkUserQuery);

    if (!$checkUserStmt) {
        throw new Exception('Błąd przygotowania zapytania: ' . $conn->error);
    }

    $checkUserStmt->bind_param("s", $email);
    $checkUserStmt->execute();
    $result = $checkUserStmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Użytkownik z tym adresem email już istnieje']);
        $checkUserStmt->close();
        exit;
    }

    $checkUserStmt->close();

    // Генерация номера счета
    $accountNumber = generateAccountNumber();

    // Проверка уникальности номера счета
    $checkAccountQuery = "SELECT id FROM users WHERE account_number = ?";
    $checkAccountStmt = $conn->prepare($checkAccountQuery);
    $checkAccountStmt->bind_param("s", $accountNumber);
    $checkAccountStmt->execute();
    $accountResult = $checkAccountStmt->get_result();

    // Если номер уже существует, генерируем новый
    while ($accountResult->num_rows > 0) {
        $accountNumber = generateAccountNumber();
        $checkAccountStmt->execute();
        $accountResult = $checkAccountStmt->get_result();
    }

    $checkAccountStmt->close();

    // Хеширование пароля
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Начало транзакции
    $conn->begin_transaction();

    // Вставка нового пользователя
    $insertUserQuery = "INSERT INTO users (first_name, last_name, email, password, phone, account_number, balance, pin, card_blocked) VALUES (?, ?, ?, ?, ?, ?, 1000.00, '1234', 0)";
    $insertUserStmt = $conn->prepare($insertUserQuery);

    if (!$insertUserStmt) {
        throw new Exception('Błąd przygotowania zapytania wstawiania: ' . $conn->error);
    }

    $insertUserStmt->bind_param("ssssss", $firstName, $lastName, $email, $hashedPassword, $phone, $accountNumber);

    if (!$insertUserStmt->execute()) {
        throw new Exception('Błąd wykonania zapytania: ' . $insertUserStmt->error);
    }

    $userId = $conn->insert_id;
    $insertUserStmt->close();

    // Создание лимитов по умолчанию
    $insertLimitsQuery = "INSERT INTO limits (user_id, daily, online, contactless) VALUES (?, 2000.00, 1000.00, 100.00)";
    $insertLimitsStmt = $conn->prepare($insertLimitsQuery);
    $insertLimitsStmt->bind_param("i", $userId);
    $insertLimitsStmt->execute();
    $insertLimitsStmt->close();

    // Создание начальной транзакции
    $insertTransactionQuery = "INSERT INTO transactions (user_id, type, amount, description) VALUES (?, 'income', 1000.00, 'Saldo początkowe - bonus powitalny')";
    $insertTransactionStmt = $conn->prepare($insertTransactionQuery);
    $insertTransactionStmt->bind_param("i", $userId);
    $insertTransactionStmt->execute();
    $insertTransactionStmt->close();

    // Подтверждение транзакции
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Konto zostało pomyślnie utworzone',
        'user' => [
            'id' => $userId,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'accountNumber' => $accountNumber,
            'balance' => 1000.00
        ]
    ]);

} catch (Exception $e) {
    // Откат транзакции в случае ошибки
    $conn->rollback();

    error_log("Registration error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Wystąpił błąd podczas rejestracji: ' . $e->getMessage()]);
}

$conn->close();

// Функция генерации номера счета
function generateAccountNumber() {
    // Генерация польского номера счета (IBAN)
    $bankCode = '10201026'; // Код банка
    $accountPart = str_pad(rand(1, 9999999999999999), 16, '0', STR_PAD_LEFT);

    // Базовый номер без контрольных цифр
    $baseNumber = $bankCode . $accountPart;

    // Вычисление контрольной суммы для IBAN
    $checkDigits = 98 - bcmod(bcadd(bcmul($baseNumber, 100), 2521), 97);
    $checkDigits = str_pad($checkDigits, 2, '0', STR_PAD_LEFT);

    return 'PL' . $checkDigits . $baseNumber;
}
?>
