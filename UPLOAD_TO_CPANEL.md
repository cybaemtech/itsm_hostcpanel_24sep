# Upload Updated Files to cPanel - URGENT FIX

## Issue Fixed
✅ Fixed the double `.php.php` URL bug in the frontend code
✅ Updated all API endpoints to use proper REST format
✅ Built new production files

## Files Ready for Upload
The following files in the `dist/` folder need to be uploaded to replace the old ones:

```
dist/
├── assets/
│   ├── index-DlCj-hb5.js   ← NEW JavaScript file (contains the fix)
│   └── index-cdToKGS9.css  ← Updated CSS file
└── index.html              ← Updated HTML file
```

## Upload Steps

### Method 1: cPanel File Manager
1. Login to your cPanel at cybaemtech.net
2. Open "File Manager"
3. Navigate to `public_html/itsm_app/`
4. **IMPORTANT**: Delete the old `assets/` folder completely
5. Upload the new `dist/assets/` folder
6. Replace `index.html` with the new version from `dist/index.html`

### Method 2: ZIP Upload (Recommended)
1. Create a ZIP file of the `dist` folder contents
2. Upload the ZIP to `public_html/itsm_app/`
3. Extract the ZIP, replacing all existing files
4. Delete the ZIP file after extraction

## Verification
After upload, visit: https://cybaemtech.net/itsm_app/
- The browser should now load `index-DlCj-hb5.js` instead of `index-7jRJuUmC.js`
- Ticket data should load without 404 errors
- No more `tickets.php.php` URLs in the browser console

## What Was Fixed
- Fixed URL transformation logic in `queryClient.ts`
- Updated `ticket-list.tsx` to use proper REST API format
- All components now use `/api/tickets/my` instead of direct PHP URLs
- Backend properly maps REST endpoints to PHP files

The backend is working perfectly - this is purely a frontend deployment issue.