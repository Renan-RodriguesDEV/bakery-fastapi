# Manual Testing Guide

## Test Environment
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## Test Credentials
- **Admin**: admin@bakery.com / admin123
- **Client**: cliente@bakery.com / cliente123

## Test Scenarios

### Scenario 1: Stock Alert Notification

**Setup:**
1. Login as admin at http://localhost:3000/login
2. Open browser console (F12) to see WebSocket connection

**Test Steps:**
1. Navigate to Products page
2. Create a new product with stock = 1:
   ```json
   {
     "name": "Pão de Queijo",
     "price": 4.50,
     "stock": 1,
     "category": "Pães",
     "validity": "2026-01-15T00:00:00"
   }
   ```
3. **Expected Result**: 
   - Notification bell shows badge with "1"
   - Click bell to see notification: "⚠️ Estoque Baixo"
   - Message: "O produto 'Pão de Queijo' está com estoque baixo (1 unidade)."

**Alternative Test (Update Stock):**
1. Find a product with stock > 1
2. Update stock to 1 or 0
3. **Expected Result**: Same as above

### Scenario 2: Payment Request Notification

**Setup:**
1. Open TWO browser windows/tabs
2. Window 1: Login as admin
3. Window 2: Login as client

**Test Steps:**
1. In client window, navigate to Products
2. Select a product and create a sale (purchase)
3. In admin window, observe notification bell
4. **Expected Result**:
   - Badge counter increases
   - Click bell to see notification: "💰 Nova Solicitação de Pagamento"
   - Message shows client name, product, and value

### Scenario 3: WebSocket Real-Time Updates

**Setup:**
1. Admin window with notifications panel OPEN
2. Client window ready to create sales

**Test Steps:**
1. In admin window, open notifications panel (keep it open)
2. In client window, create multiple sales
3. **Expected Result**:
   - New notifications appear in real-time WITHOUT refreshing
   - No need to close and reopen the panel
   - Badge counter updates automatically

### Scenario 4: Mark as Read Functionality

**Test Steps:**
1. With unread notifications visible:
2. Click "Marcar como lida" on one notification
3. **Expected Result**:
   - Notification background changes (no longer blue)
   - Badge counter decreases by 1
   - "Marcar como lida" button disappears for that notification

**Alternative Test (Mark All):**
1. Click "Marcar todas como lidas" at top of panel
2. **Expected Result**:
   - All notifications lose blue background
   - Badge counter goes to 0
   - All "Marcar como lida" buttons disappear

### Scenario 5: Delete Notification

**Test Steps:**
1. Click "X" button on a notification
2. **Expected Result**:
   - Notification immediately disappears from list
   - Badge counter decreases if notification was unread
   - Total count at bottom updates

### Scenario 6: WebSocket Reconnection

**Test Steps:**
1. Open browser console
2. Stop backend server (Ctrl+C)
3. **Expected Result**:
   - Console shows "WebSocket disconnected"
4. Restart backend server
5. Wait 3 seconds
6. **Expected Result**:
   - Console shows "WebSocket connected"
   - Connection is restored automatically

## UI Verification Checklist

- [ ] Notification bell visible only for admin users
- [ ] Badge shows correct unread count
- [ ] Badge is red and prominent
- [ ] Dropdown panel opens on click
- [ ] Panel has proper styling (similar to Mercado Livre)
- [ ] Notifications show correct icons (⚠️ for stock, 💰 for payment)
- [ ] Timestamps are in Portuguese format (e.g., "5m atrás")
- [ ] Blue background for unread notifications
- [ ] Dark mode support works correctly
- [ ] Panel scrolls if many notifications
- [ ] "X" delete button works
- [ ] "Marcar como lida" button works
- [ ] "Marcar todas como lidas" button works
- [ ] Footer shows total count

## API Endpoint Tests

### Get All Notifications
```bash
TOKEN="your_admin_token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/notifications/all
```

### Get Unread Count
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/notifications/unread/count
```

### Mark as Read
```bash
NOTIFICATION_ID=1
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/notifications/$NOTIFICATION_ID/read
```

### Mark All as Read
```bash
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/notifications/mark-all-read
```

### Delete Notification
```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/notifications/$NOTIFICATION_ID
```

## Known Issues / Limitations

1. **Notifications are currently only for admins**
   - Clients cannot see notifications yet
   - Future: Add client-facing notifications (order confirmations, etc.)

2. **No pagination**
   - All notifications load at once
   - May need pagination for users with many notifications

3. **No sound alerts**
   - Notifications appear silently
   - Future: Add optional sound notification

4. **No browser push notifications**
   - Only in-app notifications currently
   - Future: Add browser notification API support

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ WebSocket connects successfully
✅ Real-time updates work
✅ UI is responsive and styled correctly
✅ Dark mode works
✅ Code review passed
✅ Security scan passed (0 vulnerabilities)
