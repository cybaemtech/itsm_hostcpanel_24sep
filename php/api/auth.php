<?php
/**
 * Authentication API Endpoints
 * IT Helpdesk Portal - PHP Backend
 */

// Get the correct path to database config regardless of working directory
$configPath = dirname(__DIR__) . '/config/database.php';
if (!file_exists($configPath)) {
    // Fallback for different directory structures
    $configPath = __DIR__ . '/../config/database.php';
}
require_once $configPath;

// Enable CORS for frontend - Production Configuration for cPanel
header('Access-Control-Allow-Origin: https://cybaemtech.net');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle both JSON and FormData requests
$request = [];
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (strpos($contentType, 'application/json') !== false) {
    // JSON request
    $request = json_decode(file_get_contents('php://input'), true) ?? [];
} else {
    // FormData or regular POST
    $request = $_POST ?? [];
}

// Support for testing with $_REQUEST_DATA
if (empty($request) && isset($_REQUEST_DATA)) {
    $request = $_REQUEST_DATA;
}

try {
    switch ($method) {
        case 'POST':
            $action = $_GET['action'] ?? '';
            
            switch ($action) {
                case 'login':
                    handleLogin($request);
                    break;
                case 'register':
                    handleRegister($request);
                    break;
                case 'logout':
                    handleLogout();
                    break;
                default:
                    jsonResponse(['error' => 'Invalid action'], 400);
            }
            break;
            
        case 'GET':
            handleGetUser();
            break;
            
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    error_log("Auth API Error: " . $e->getMessage());
    jsonResponse(['error' => 'Internal server error'], 500);
}

function handleLogin($request) {
    $username = sanitizeInput($request['username'] ?? '');
    $password = $request['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        jsonResponse(['error' => 'Username and password are required'], 400);
    }
    
    $db = getDb();
    $user = $db->fetchOne(
        "SELECT * FROM users WHERE username = :username",
        ['username' => $username]
    );
    
    if (!$user || !verifyPassword($password, $user['password'])) {
        jsonResponse(['error' => 'Invalid credentials'], 401);
    }
    
    // Set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_username'] = $user['username'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user_name'] = $user['name'];
    
    // Remove password from response
    unset($user['password']);
    
    jsonResponse($user);
}

function handleRegister($request) {
    $username = sanitizeInput($request['username'] ?? '');
    $password = $request['password'] ?? '';
    $name = sanitizeInput($request['name'] ?? '');
    $email = sanitizeInput($request['email'] ?? '');
    $companyName = sanitizeInput($request['companyName'] ?? '');
    $department = sanitizeInput($request['department'] ?? '');
    $contactNumber = sanitizeInput($request['contactNumber'] ?? '');
    $location = sanitizeInput($request['location'] ?? ''); // Frontend sends location but DB has designation
    
    if (empty($username) || empty($password) || empty($name) || empty($email)) {
        jsonResponse(['error' => 'Username, password, name, and email are required'], 400);
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email format'], 400);
    }
    
    $db = getDb();
    
    // Check if username already exists
    $existingUser = $db->fetchOne(
        "SELECT id FROM users WHERE username = :username OR email = :email",
        ['username' => $username, 'email' => $email]
    );
    
    if ($existingUser) {
        jsonResponse(['error' => 'Username or email already exists'], 400);
    }
    
    try {
        // Create new user
        $hashedPassword = hashPassword($password);
        $userId = $db->insert('users', [
            'username' => $username,
            'password' => $hashedPassword,
            'name' => $name,
            'email' => $email,
            'role' => 'user',
            'company_name' => !empty($companyName) ? $companyName : null,
            'department' => !empty($department) ? $department : null,
            'contact_number' => !empty($contactNumber) ? $contactNumber : null,
            'designation' => !empty($location) ? $location : null // Map location to designation for now
        ]);
        
        // Get created user
        $user = $db->fetchOne("SELECT id, username, name, email, role, company_name, department, contact_number, designation, created_at FROM users WHERE id = :id", ['id' => $userId]);
        
        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_username'] = $user['username'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_name'] = $user['name'];
        
        jsonResponse($user, 201);
        
    } catch (Exception $e) {
        error_log("Registration error: " . $e->getMessage());
        jsonResponse(['error' => 'Registration failed: ' . $e->getMessage()], 500);
    }
}

function handleLogout() {
    session_destroy();
    jsonResponse(['message' => 'Logged out successfully']);
}

function handleGetUser() {
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(['error' => 'Not authenticated'], 401);
    }
    
    $db = getDb();
    $user = $db->fetchOne(
        "SELECT id, username, name, email, role, company_name, department, contact_number, designation, created_at FROM users WHERE id = :id",
        ['id' => $_SESSION['user_id']]
    );
    
    if (!$user) {
        session_destroy();
        jsonResponse(['error' => 'User not found'], 404);
    }
    
    // Convert database field names to frontend-expected camelCase
    $frontendUser = [
        'id' => $user['id'],
        'username' => $user['username'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'companyName' => $user['company_name'],
        'department' => $user['department'],
        'contactNumber' => $user['contact_number'],
        'designation' => $user['designation'],
        'createdAt' => $user['created_at']
    ];
    
    jsonResponse($frontendUser);
}
?>