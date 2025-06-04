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

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

// Валидация данных
if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email i hasło są wymagane']);
    exit;
}

try {
    // Поиск пользователя по email
    $getUserQuery = "SELECT id, first_name, last_name, email, password, phone, account_number, balance, pin, card_blocked FROM users WHERE email = ?";
    $getUserStmt = $conn->prepare($getUserQuery);

    if (!$getUserStmt) {
        throw new Exception('Błąd przygotowania zapytania: ' . $conn->error);
    }

    $getUserStmt->bind_param("s", $email);
    $getUserStmt->execute();
    $result = $getUserStmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // Проверка пароля
        if (password_verify($password, $user['password'])) {
            // Получение лимитов пользователя
            $limitsQuery = "SELECT daily, online, contactless FROM limits WHERE user_id = ?";
            $limitsStmt = $conn->prepare($limitsQuery);
            $limitsStmt->bind_param("i", $user['id']);
            $limitsStmt->execute();
            $limitsResult = $limitsStmt->get_result();

            $limits = ['daily' => 2000.00, 'online' => 1000.00, 'contactless' => 100.00];
            if ($limitsResult->num_rows > 0) {
                $limits = $limitsResult->fetch_assoc();
            }

            // Получение последних транзакций
            $transactionsQuery = "SELECT id, type, amount, description, DATE_FORMAT(created_at, '%d.%m.%Y') as date FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5";
            $transactionsStmt = $conn->prepare($transactionsQuery);
            $transactionsStmt->bind_param("i", $user['id']);
            $transactionsStmt->execute();
            $transactionsResult = $transactionsStmt->get_result();

            $transactions = [];
            while ($transaction = $transactionsResult->fetch_assoc()) {
                $transactions[] = $transaction;
            }

            // Подготовка данных пользователя для ответа
            $userData = [
                'id' => $user['id'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'accountNumber' => $user['account_number'],
                'balance' => floatval($user['balance']),
                'pin' => $user['pin'],
                'cardBlocked' => (bool)$user['card_blocked'],
                'limits' => $limits,
                'transactions' => $transactions
            ];

            // Логирование входа
            $logQuery = "INSERT INTO audit_logs (user_id, action, description, ip_address) VALUES (?, 'LOGIN', 'Użytkownik zalogował się do systemu', ?)";
            $logStmt = $conn->prepare($logQuery);
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $logStmt->bind_param("is", $user['id'], $ipAddress);
            $logStmt->execute();

            echo json_encode([
                'success' => true,
                'message' => 'Logowanie pomyślne',
                'user' => $userData
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Nieprawidłowy email lub hasło']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Nieprawidłowy email lub hasło']);
    }

    $getUserStmt->close();

} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Wystąpił błąd podczas logowania']);
}

$conn->close();
?>
