<?php
/**
 * Users API Endpoints  
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

try {
    switch ($method) {
        case 'GET':
            handleGetUsers();
            break;
        case 'POST':
            handleCreateUser($request);
            break;
        case 'PUT':
            $userId = $_GET['id'] ?? null;
            handleUpdateUser($userId, $request);
            break;
        case 'DELETE':
            $userId = $_GET['id'] ?? null;
            handleDeleteUser($userId);
            break;
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    error_log("Users API Error: " . $e->getMessage());
    jsonResponse(['error' => 'Internal server error'], 500);
}

function handleGetUsers() {
    requireAuth();
    
    $db = getDb();
    $currentUserId = $_SESSION['user_id'];
    $userRole = $_SESSION['user_role'];
    
    $sql = "
        SELECT 
            id, username, name, email, role, company_name, department, 
            contact_number, designation, created_at,
            (SELECT COUNT(*) FROM tickets WHERE created_by_id = u.id) as tickets_created,
            (SELECT COUNT(*) FROM tickets WHERE assigned_to_id = u.id) as tickets_assigned
        FROM users u
        WHERE 1=1
    ";
    
    $params = [];
    
    // Regular users can only see their own profile and agents/admins
    if ($userRole === 'user') {
        $sql .= " AND (id = :current_user_id OR role IN ('admin', 'agent'))";
        $params['current_user_id'] = $currentUserId;
    }
    
    $sql .= " ORDER BY role DESC, name";
    
    $users = $db->fetchAll($sql, $params);
    
    // Convert snake_case field names to camelCase for frontend compatibility
    $convertedUsers = array_map(function($user) {
        return [
            'id' => $user['id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'companyName' => $user['company_name'],
            'department' => $user['department'],
            'contactNumber' => $user['contact_number'],
            'designation' => $user['designation'],
            'createdAt' => $user['created_at'],
            'ticketsCreated' => $user['tickets_created'],
            'ticketsAssigned' => $user['tickets_assigned']
        ];
    }, $users);
    
    jsonResponse($convertedUsers);
}

function handleCreateUser($request) {
    requireRole(['admin']);
    
    $username = sanitizeInput($request['username'] ?? '');
    $password = $request['password'] ?? '';
    $name = sanitizeInput($request['name'] ?? '');
    $email = sanitizeInput($request['email'] ?? '');
    $role = sanitizeInput($request['role'] ?? 'user');
    $companyName = sanitizeInput($request['companyName'] ?? '');
    $department = sanitizeInput($request['department'] ?? '');
    $contactNumber = sanitizeInput($request['contactNumber'] ?? '');
    $designation = sanitizeInput($request['designation'] ?? '');
    
    if (empty($username) || empty($password) || empty($name) || empty($email)) {
        jsonResponse(['error' => 'Username, password, name, and email are required'], 400);
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email format'], 400);
    }
    
    if (!in_array($role, ['admin', 'agent', 'user'])) {
        jsonResponse(['error' => 'Invalid role'], 400);
    }
    
    $db = getDb();
    
    // Check if username or email already exists
    $existing = $db->fetchOne(
        "SELECT id FROM users WHERE username = :username OR email = :email",
        ['username' => $username, 'email' => $email]
    );
    
    if ($existing) {
        jsonResponse(['error' => 'Username or email already exists'], 400);
    }
    
    $hashedPassword = hashPassword($password);
    $userId = $db->insert('users', [
        'username' => $username,
        'password' => $hashedPassword,
        'name' => $name,
        'email' => $email,
        'role' => $role,
        'company_name' => $companyName,
        'department' => $department,
        'contact_number' => $contactNumber,
        'designation' => $designation
    ]);
    
    $user = $db->fetchOne(
        "SELECT id, username, name, email, role, company_name, department, contact_number, designation, created_at FROM users WHERE id = :id",
        ['id' => $userId]
    );
    
    // Convert snake_case field names to camelCase for frontend compatibility
    $convertedUser = [
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
    
    jsonResponse($convertedUser, 201);
}

function handleUpdateUser($userId, $request) {
    requireAuth();
    
    error_log("Update user request for ID $userId: " . json_encode($request));
    
    if (!$userId) {
        jsonResponse(['error' => 'User ID is required'], 400);
    }
    
    $currentUserId = $_SESSION['user_id'];
    $currentUserRole = $_SESSION['user_role'];
    
    $db = getDb();
    
    // Check if user exists
    $user = $db->fetchOne("SELECT * FROM users WHERE id = :id", ['id' => $userId]);
    if (!$user) {
        jsonResponse(['error' => 'User not found'], 404);
    }
    
    // Permission check: users can only update their own profile, admins can update anyone
    if ($currentUserRole !== 'admin' && $currentUserId != $userId) {
        jsonResponse(['error' => 'Permission denied'], 403);
    }
    
    $updateData = [];
    
    // Fields that users can update about themselves
    if (isset($request['name']) && trim($request['name']) !== '') {
        $updateData['name'] = sanitizeInput($request['name']);
    }
    if (isset($request['email']) && trim($request['email']) !== '') {
        $email = sanitizeInput($request['email']);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['error' => 'Invalid email format'], 400);
        }
        $updateData['email'] = $email;
    }
    if (isset($request['companyName']) && trim($request['companyName']) !== '') {
        $updateData['company_name'] = sanitizeInput($request['companyName']);
    }
    if (isset($request['department']) && trim($request['department']) !== '') {
        $updateData['department'] = sanitizeInput($request['department']);
    }
    if (isset($request['contactNumber']) && trim($request['contactNumber']) !== '') {
        $updateData['contact_number'] = sanitizeInput($request['contactNumber']);
    }
    if (isset($request['designation']) && trim($request['designation']) !== '') {
        $updateData['designation'] = sanitizeInput($request['designation']);
    }
    
    // Fields only admins can update
    if ($currentUserRole === 'admin') {
        if (isset($request['username']) && trim($request['username']) !== '') {
            $updateData['username'] = sanitizeInput($request['username']);
        }
        if (isset($request['role']) && trim($request['role']) !== '') {
            $role = sanitizeInput($request['role']);
            if (!in_array($role, ['admin', 'agent', 'user'])) {
                jsonResponse(['error' => 'Invalid role'], 400);
            }
            $updateData['role'] = $role;
        }
    }
    
    // Password update (user can update their own, admin can update anyone's)
    if (isset($request['password']) && !empty($request['password'])) {
        if ($currentUserRole === 'admin' || $currentUserId == $userId) {
            $updateData['password'] = hashPassword($request['password']);
        } else {
            jsonResponse(['error' => 'Permission denied to update password'], 403);
        }
    }
    
    if (empty($updateData)) {
        error_log("Update user error: No valid fields to update. Request: " . json_encode($request));
        jsonResponse(['error' => 'No valid fields to update'], 400);
    }
    
    // Check for duplicate username/email if being updated
    if (isset($updateData['username']) || isset($updateData['email'])) {
        $checkSql = "SELECT id FROM users WHERE id != :user_id AND (";
        $checkParams = ['user_id' => $userId];
        $conditions = [];
        
        if (isset($updateData['username'])) {
            $conditions[] = "username = :username";
            $checkParams['username'] = $updateData['username'];
        }
        if (isset($updateData['email'])) {
            $conditions[] = "email = :email";
            $checkParams['email'] = $updateData['email'];
        }
        
        $checkSql .= implode(' OR ', $conditions) . ")";
        
        $duplicate = $db->fetchOne($checkSql, $checkParams);
        if ($duplicate) {
            jsonResponse(['error' => 'Username or email already exists'], 400);
        }
    }
    
    $db->update('users', $updateData, 'id = :id', ['id' => $userId]);
    
    $updatedUser = $db->fetchOne(
        "SELECT id, username, name, email, role, company_name, department, contact_number, designation, created_at FROM users WHERE id = :id",
        ['id' => $userId]
    );
    
    // Convert snake_case field names to camelCase for frontend compatibility
    $convertedUser = [
        'id' => $updatedUser['id'],
        'username' => $updatedUser['username'],
        'name' => $updatedUser['name'],
        'email' => $updatedUser['email'],
        'role' => $updatedUser['role'],
        'companyName' => $updatedUser['company_name'],
        'department' => $updatedUser['department'],
        'contactNumber' => $updatedUser['contact_number'],
        'designation' => $updatedUser['designation'],
        'createdAt' => $updatedUser['created_at']
    ];
    
    jsonResponse($convertedUser);
}

function handleDeleteUser($userId) {
    requireRole(['admin']);
    
    if (!$userId) {
        jsonResponse(['error' => 'User ID is required'], 400);
    }
    
    $currentUserId = $_SESSION['user_id'];
    
    if ($currentUserId == $userId) {
        jsonResponse(['error' => 'Cannot delete your own account'], 400);
    }
    
    $db = getDb();
    
    // Check if user exists
    $user = $db->fetchOne("SELECT id FROM users WHERE id = :id", ['id' => $userId]);
    if (!$user) {
        jsonResponse(['error' => 'User not found'], 404);
    }
    
    // Check if user has tickets and provide detailed information
    $ticketCounts = $db->fetchOne(
        "SELECT 
            SUM(CASE WHEN created_by_id = :user_id1 THEN 1 ELSE 0 END) as created_count,
            SUM(CASE WHEN assigned_to_id = :user_id2 THEN 1 ELSE 0 END) as assigned_count
        FROM tickets 
        WHERE created_by_id = :user_id3 OR assigned_to_id = :user_id4",
        [
            'user_id1' => $userId, 
            'user_id2' => $userId,
            'user_id3' => $userId, 
            'user_id4' => $userId
        ]
    );
    
    $totalTickets = ($ticketCounts['created_count'] ?? 0) + ($ticketCounts['assigned_count'] ?? 0);
    
    if ($totalTickets > 0) {
        $message = "Cannot delete user with existing tickets. ";
        if ($ticketCounts['created_count'] > 0) {
            $message .= "User has created " . $ticketCounts['created_count'] . " ticket(s). ";
        }
        if ($ticketCounts['assigned_count'] > 0) {
            $message .= "User is assigned to " . $ticketCounts['assigned_count'] . " ticket(s). ";
        }
        $message .= "Please reassign or close these tickets first.";
        
        jsonResponse(['error' => $message], 400);
    }
    
    $db->delete('users', 'id = :id', ['id' => $userId]);
    
    jsonResponse(['message' => 'User deleted successfully']);
}
?>