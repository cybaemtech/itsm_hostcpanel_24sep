# ITSM Application cPanel Deployment Checklist

## 1. File Structure Setup
Make sure your cPanel file structure follows this pattern:
- `public_html/itsm_app/` - Frontend files (compiled React app from dist folder)
- `public_html/itsm_php/` - PHP backend files
  - `public_html/itsm_php/api/` - PHP API endpoints
  - `public_html/itsm_php/config/` - Configuration files
  - `public_html/itsm_php/uploads/` - File upload directory

## 2. Upload Files
- [ ] Upload the frontend files (everything from `dist/` folder) to `public_html/itsm_app/`
- [ ] Upload the PHP backend files to `public_html/itsm_php/`
- [ ] Upload the main `.htaccess` file to `public_html/`
- [ ] Upload the PHP API `.htaccess` file to `public_html/itsm_php/`

## 3. Set File Permissions
- [ ] Set directory permissions: `755` for all directories
  ```
  find /home/username/public_html/itsm_php -type d -exec chmod 755 {} \;
  ```
- [ ] Set file permissions: `644` for all PHP files
  ```
  find /home/username/public_html/itsm_php -type f -name "*.php" -exec chmod 644 {} \;
  ```
- [ ] Make uploads directory writable:
  ```
  chmod -R 755 /home/username/public_html/itsm_php/uploads
  ```

## 4. Database Setup
- [ ] Create MySQL database in cPanel
- [ ] Create database user with full privileges
- [ ] Import MySQL schema from `mysql_schema.sql`
- [ ] Update database configuration in `itsm_php/config/database.php`

## 5. Test API Endpoints
- [ ] Visit `https://cybaemtech.net/itsm_php/api/test.php` to run diagnostics
- [ ] Check each endpoint individually:
  - `https://cybaemtech.net/itsm_php/api/auth.php` 
  - `https://cybaemtech.net/itsm_php/api/categories.php`

## 6. Common Issues & Fixes

### 404 Not Found Errors
- Make sure all files are in the correct locations
- Check that API base URL in `queryClient.ts` is set to `https://cybaemtech.net/itsm_php/api`
- Ensure `.htaccess` files are properly uploaded and not blocked

### 401 Unauthorized Errors
- Check database connection in `database.php`
- Make sure session cookies are working properly
- Try clearing browser cookies and cache

### 500 Internal Server Errors
- Check PHP error logs in cPanel
- Verify PHP version (should be 7.4+)
- Make sure all required PHP extensions are installed

### CORS Errors
- Verify CORS headers are correctly set in `.htaccess` and PHP files
- Make sure `Access-Control-Allow-Origin` matches your domain

## 7. Troubleshooting Tips
- Enable PHP error display temporarily for debugging:
  ```php
  ini_set('display_errors', 1);
  error_reporting(E_ALL);
  ```
- Use browser developer tools Network tab to check API responses
- Add logging to PHP files:
  ```php
  error_log("Debug: " . json_encode($variable));
  ```
- Check cPanel error logs for PHP errors
