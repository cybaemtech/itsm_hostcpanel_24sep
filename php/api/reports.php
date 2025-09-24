<?php
/**
 * Reports API Endpoints
 * IT Helpdesk Portal - PHP Backend
 */

require_once '../config/database.php';

// Enable CORS for frontend - Secure configuration
$allowedOrigins = ['https://cybaemtech.net', 'https://www.cybaemtech.net', 'https://cybaemtech.net/itsm_app', 'http://localhost:5173', 'http://localhost:5000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($method) {
        case 'GET':
            if ($action === 'export') {
                handleExportTickets();
            } else {
                handleGetReportsData();
            }
            break;
        case 'POST':
            if ($action === 'import') {
                handleImportTickets();
            } else {
                jsonResponse(['error' => 'Invalid action'], 400);
            }
            break;
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    error_log("Reports API Error: " . $e->getMessage());
    jsonResponse(['error' => 'Internal server error'], 500);
}

function handleGetReportsData() {
    requireAuth();
    
    $db = getDb();
    
    // Get ticket statistics
    $totalTickets = $db->fetchOne("SELECT COUNT(*) as count FROM tickets")['count'];
    $openTickets = $db->fetchOne("SELECT COUNT(*) as count FROM tickets WHERE status IN ('open', 'in_progress')")['count'];
    $closedTickets = $db->fetchOne("SELECT COUNT(*) as count FROM tickets WHERE status = 'closed')")['count'];
    $pendingTickets = $db->fetchOne("SELECT COUNT(*) as count FROM tickets WHERE status = 'pending')")['count'];
    
    // Get tickets by priority
    $priorityStats = $db->fetchAll("
        SELECT priority, COUNT(*) as count 
        FROM tickets 
        GROUP BY priority 
        ORDER BY FIELD(priority, 'high', 'medium', 'low')
    ");
    
    // Get tickets by category
    $categoryStats = $db->fetchAll("
        SELECT c.name as category, COUNT(t.id) as count 
        FROM categories c 
        LEFT JOIN tickets t ON c.id = t.category_id 
        WHERE c.parent_id IS NULL
        GROUP BY c.id, c.name 
        ORDER BY count DESC
    ");
    
    // Get tickets by status over time (last 30 days)
    $statusOverTime = $db->fetchAll("
        SELECT 
            DATE(created_at) as date,
            status,
            COUNT(*) as count
        FROM tickets 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at), status
        ORDER BY date DESC
    ");
    
    // Get user performance (agents/admins)
    $userPerformance = $db->fetchAll("
        SELECT 
            u.name,
            u.email,
            COUNT(t.id) as assigned_tickets,
            COUNT(CASE WHEN t.status = 'closed' THEN 1 END) as resolved_tickets,
            AVG(CASE WHEN t.status = 'closed' THEN TIMESTAMPDIFF(HOUR, t.created_at, t.updated_at) END) as avg_resolution_time
        FROM users u
        LEFT JOIN tickets t ON u.id = t.assigned_to_id
        WHERE u.role IN ('admin', 'agent')
        GROUP BY u.id, u.name, u.email
        ORDER BY resolved_tickets DESC
    ");
    
    $data = [
        'summary' => [
            'total' => (int)$totalTickets,
            'open' => (int)$openTickets,
            'closed' => (int)$closedTickets,
            'pending' => (int)$pendingTickets
        ],
        'priorityStats' => array_map(function($item) {
            return [
                'priority' => $item['priority'],
                'count' => (int)$item['count']
            ];
        }, $priorityStats),
        'categoryStats' => array_map(function($item) {
            return [
                'category' => $item['category'],
                'count' => (int)$item['count']
            ];
        }, $categoryStats),
        'statusOverTime' => array_map(function($item) {
            return [
                'date' => $item['date'],
                'status' => $item['status'],
                'count' => (int)$item['count']
            ];
        }, $statusOverTime),
        'userPerformance' => array_map(function($item) {
            return [
                'name' => $item['name'],
                'email' => $item['email'],
                'assignedTickets' => (int)$item['assigned_tickets'],
                'resolvedTickets' => (int)$item['resolved_tickets'],
                'avgResolutionTime' => $item['avg_resolution_time'] ? round((float)$item['avg_resolution_time'], 2) : 0
            ];
        }, $userPerformance)
    ];
    
    jsonResponse($data);
}

function handleExportTickets() {
    requireRole(['admin', 'agent']);
    
    $db = getDb();
    $format = $_GET['format'] ?? 'csv';
    
    $sql = "
        SELECT 
            t.id,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.support_type,
            t.contact_email,
            t.contact_name,
            t.contact_phone,
            t.contact_department,
            c.name as category_name,
            sc.name as subcategory_name,
            cb.name as created_by_name,
            cb.email as created_by_email,
            at.name as assigned_to_name,
            at.email as assigned_to_email,
            t.due_date,
            t.created_at,
            t.updated_at
        FROM tickets t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN categories sc ON t.subcategory_id = sc.id
        LEFT JOIN users cb ON t.created_by_id = cb.id
        LEFT JOIN users at ON t.assigned_to_id = at.id
        ORDER BY t.created_at DESC
    ";
    
    $tickets = $db->fetchAll($sql);
    
    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="tickets_export_' . date('Y-m-d') . '.csv"');
        
        $output = fopen('php://output', 'w');
        
        // CSV Headers
        fputcsv($output, [
            'ID', 'Title', 'Description', 'Status', 'Priority', 'Support Type',
            'Contact Email', 'Contact Name', 'Contact Phone', 'Contact Department',
            'Category', 'Subcategory', 'Created By', 'Created By Email',
            'Assigned To', 'Assigned To Email', 'Due Date', 'Created At', 'Updated At'
        ]);
        
        // CSV Data
        foreach ($tickets as $ticket) {
            fputcsv($output, [
                $ticket['id'],
                $ticket['title'],
                $ticket['description'],
                $ticket['status'],
                $ticket['priority'],
                $ticket['support_type'],
                $ticket['contact_email'],
                $ticket['contact_name'],
                $ticket['contact_phone'],
                $ticket['contact_department'],
                $ticket['category_name'],
                $ticket['subcategory_name'],
                $ticket['created_by_name'],
                $ticket['created_by_email'],
                $ticket['assigned_to_name'],
                $ticket['assigned_to_email'],
                $ticket['due_date'],
                $ticket['created_at'],
                $ticket['updated_at']
            ]);
        }
        
        fclose($output);
        exit;
    } else {
        // JSON format
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="tickets_export_' . date('Y-m-d') . '.json"');
        echo json_encode($tickets, JSON_PRETTY_PRINT);
        exit;
    }
}

function handleImportTickets() {
    requireRole(['admin']);
    
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        jsonResponse(['error' => 'No file uploaded or upload error'], 400);
    }
    
    $file = $_FILES['file'];
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if ($fileExtension !== 'csv') {
        jsonResponse(['error' => 'Only CSV files are supported'], 400);
    }
    
    $handle = fopen($file['tmp_name'], 'r');
    if (!$handle) {
        jsonResponse(['error' => 'Cannot read uploaded file'], 400);
    }
    
    $db = getDb();
    $imported = 0;
    $errors = [];
    $row = 0;
    
    // Skip header row
    fgetcsv($handle);
    $row++;
    
    while (($data = fgetcsv($handle)) !== FALSE) {
        $row++;
        
        try {
            // Validate required fields
            if (empty($data[1]) || empty($data[2])) { // title and description
                $errors[] = "Row $row: Title and description are required";
                continue;
            }
            
            // Get or create category
            $categoryId = null;
            if (!empty($data[10])) { // category_name
                $category = $db->fetchOne("SELECT id FROM categories WHERE name = :name AND parent_id IS NULL", ['name' => $data[10]]);
                if ($category) {
                    $categoryId = $category['id'];
                } else {
                    // Create new category
                    $categoryId = $db->insert('categories', ['name' => $data[10], 'parent_id' => null]);
                }
            }
            
            // Get subcategory
            $subcategoryId = null;
            if (!empty($data[11]) && $categoryId) { // subcategory_name
                $subcategory = $db->fetchOne("SELECT id FROM categories WHERE name = :name AND parent_id = :parent_id", 
                    ['name' => $data[11], 'parent_id' => $categoryId]);
                if ($subcategory) {
                    $subcategoryId = $subcategory['id'];
                } else {
                    // Create new subcategory
                    $subcategoryId = $db->insert('categories', ['name' => $data[11], 'parent_id' => $categoryId]);
                }
            }
            
            // Get created by user
            $createdById = $_SESSION['user_id']; // Default to current user
            if (!empty($data[13])) { // created_by_email
                $user = $db->fetchOne("SELECT id FROM users WHERE email = :email", ['email' => $data[13]]);
                if ($user) {
                    $createdById = $user['id'];
                }
            }
            
            // Get assigned to user
            $assignedToId = null;
            if (!empty($data[15])) { // assigned_to_email
                $user = $db->fetchOne("SELECT id FROM users WHERE email = :email", ['email' => $data[15]]);
                if ($user) {
                    $assignedToId = $user['id'];
                }
            }
            
            // Insert ticket
            $ticketData = [
                'title' => $data[1],
                'description' => $data[2],
                'status' => !empty($data[3]) ? $data[3] : 'open',
                'priority' => !empty($data[4]) ? $data[4] : 'medium',
                'support_type' => !empty($data[5]) ? $data[5] : 'general',
                'contact_email' => $data[6] ?? '',
                'contact_name' => $data[7] ?? '',
                'contact_phone' => $data[8] ?? '',
                'contact_department' => $data[9] ?? '',
                'category_id' => $categoryId,
                'subcategory_id' => $subcategoryId,
                'created_by_id' => $createdById,
                'assigned_to_id' => $assignedToId,
                'due_date' => !empty($data[16]) ? $data[16] : null
            ];
            
            $db->insert('tickets', $ticketData);
            $imported++;
            
        } catch (Exception $e) {
            $errors[] = "Row $row: " . $e->getMessage();
        }
    }
    
    fclose($handle);
    
    jsonResponse([
        'message' => "Import completed. $imported tickets imported.",
        'imported' => $imported,
        'errors' => $errors
    ]);
}
?>