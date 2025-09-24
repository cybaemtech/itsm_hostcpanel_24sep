# ITSM cPanel Deployment Troubleshooting Guide

Based on your test results, I've identified and fixed several issues. Follow these steps to complete the setup on your cPanel server:

## 1. Fix Uploads Directory Permissions

According to your test output, the uploads directory isn't writable, which will cause file upload issues. Run the setup.php script I created:

1. Visit: `https://cybaemtech.net/itsm_php/api/setup.php`
2. This will create the uploads directory if it doesn't exist and set the correct permissions
3. Alternatively, use cPanel File Manager:
   - Navigate to `/home/cybaemtechnet/public_html/itsm_php/`
   - Create a directory named `uploads` if it doesn't exist
   - Right-click on the directory → Change Permissions → Set to 755

## 2. Update Frontend Files

Upload the updated files from your local workspace to the server:

1. Upload the updated `client/src/lib/queryClient.ts` file to your build directory
2. Run `npm run build` to generate new frontend files
3. Upload the contents of the `dist/` folder to `/public_html/itsm_app/` on your server

## 3. Update .htaccess Files

1. Upload the updated `.htaccess` file to your `public_html/` directory
2. Upload the PHP API `.htaccess` file to `public_html/itsm_php/` directory

## 4. Test API Endpoints

1. Visit `https://cybaemtech.net/itsm_php/api/api_test.php` to verify all API endpoints are accessible
2. Visit `https://cybaemtech.net/itsm_php/api/test.php` again to ensure uploads directory is now writable

## 5. Common Issues & Solutions

### 404 Not Found Errors
- The `.htaccess` file now includes rules to redirect `/api/*` requests to `/itsm_php/api/*`
- Make sure all PHP files are in the correct locations:
  - `/public_html/itsm_php/api/auth.php`
  - `/public_html/itsm_php/api/tickets.php`
  - etc.

### Uploads Directory Not Writable
- If the uploads directory is still not writable after running setup.php, try:
  ```bash
  chmod -R 755 /home/cybaemtechnet/public_html/itsm_php/uploads
  ```

### PHP API Path Issues
- The API path in `queryClient.ts` has been fixed to properly construct URLs
- The path should now be `https://cybaemtech.net/itsm_php/api/auth.php` (not auth.phps)

### Session/Cookie Issues
- If login doesn't work, check if cookies are being set properly
- Try clearing browser cookies and cache
- Verify that sessions are enabled in PHP

## 6. Verify Everything Works

After completing all steps, check these key functions:

1. **Login**: Should connect to `auth.php` without errors
2. **Ticket List**: Should load tickets from `tickets.php` without 404 errors
3. **File Upload**: Test file uploads to verify the uploads directory is writable

If you encounter any other issues, check the browser console and PHP error logs in cPanel for more detailed information.
