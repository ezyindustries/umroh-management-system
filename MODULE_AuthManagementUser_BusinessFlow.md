# MODULE: Autentikasi & Manajemen Pengguna - Business Flow Documentation

## Overview
Modul ini mengelola autentikasi user dan sistem role-based access control untuk seluruh aplikasi Umroh Management System. Mendukung multiple roles per user dengan kontrol akses granular per modul.

## Actors & Roles
### System Roles:
- **Super Admin**: Full system access, manage all users and roles
- **Admin**: Manage users, reset passwords, assign roles
- **Other Roles**: Marketing, Hotel, Penerbangan, Finance, Visa, Ground Handling, etc.

### Key Actors:
- **User**: End user yang login ke sistem
- **Admin**: Administrator yang mengelola user dan roles
- **System**: Automated processes (audit logging, session management)

## Data Flow Diagram

### 1. Login Flow
```
User → Input Username/Password → System Validation → Generate Token → Active Session
                                       ↓ (if invalid)
                                   Return Error
```

### 2. Role Assignment Flow
```
Admin → Select User → Add/Remove Roles → Save Changes → Update Permissions
                            ↓
                      Audit Log Entry
```

### 3. Password Reset Flow
```
User → Request Reset → Contact Admin → Admin Reset Password → User Gets New Password
                                              ↓
                                        Audit Log Entry
```

## Validation & Error Handling

### Login Validation:
- Username exists in database
- Password matches (bcrypt hashed)
- User account is active
- No validation for concurrent sessions (multi-device allowed)

### Role Management Validation:
- Only Admin/Super Admin can modify roles
- Cannot remove last admin from system
- Role changes take effect immediately

### Error Scenarios:
1. **Invalid Credentials**: Return generic "Invalid username or password"
2. **Inactive Account**: Return "Account is inactive, contact admin"
3. **System Error**: Log error, return "System error, please try again"

## Business Rules

### Session Management:
- Sessions never expire (permanent until logout)
- Multiple concurrent sessions allowed per user
- No device/IP restrictions

### Password Policy:
- No complexity requirements defined
- No password expiry
- Reset only through admin intervention

### Access Control Matrix:
| Role | Can View | Cannot View | Can Edit | Cannot Edit |
|------|----------|-------------|----------|-------------|
| Hotel | Jamaah Data, Hotel Module | Financial Data | Hotel Module | Jamaah, Financial |
| Finance | All Financial Data | - | Payment Records | Other Modules |
| Marketing | Jamaah, Marketing Data | Financial Details | Marketing Module | Other Modules |

### Audit Requirements:
Every action must log:
- User ID & Username
- Action Type (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW)
- Timestamp (server time)
- IP Address
- User Agent/Device Info
- Module/Entity Affected
- Data Changes (before/after values for updates)

## API Contracts

### POST /api/auth/login
**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response Success (200):**
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "string",
    "name": "string",
    "roles": ["admin", "hotel", "marketing"]
  }
}
```

### GET /api/auth/me
**Headers:** `Authorization: Bearer {token}`
**Response Success (200):**
```json
{
  "id": 1,
  "username": "string",
  "name": "string",
  "email": "string",
  "roles": ["admin", "hotel"],
  "permissions": {
    "jamaah": ["view"],
    "hotel": ["view", "create", "edit", "delete"],
    "finance": []
  }
}
```

### POST /api/users/{id}/roles
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "roles": ["admin", "hotel", "marketing"]
}
```
**Response Success (200):**
```json
{
  "message": "Roles updated successfully",
  "user": {
    "id": 1,
    "roles": ["admin", "hotel", "marketing"]
  }
}
```

### POST /api/users/{id}/reset-password
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "new_password": "string"
}
```
**Response Success (200):**
```json
{
  "message": "Password reset successfully"
}
```

## Security Considerations
1. Passwords stored using bcrypt hashing
2. JWT tokens for session management
3. All API endpoints require valid token (except login)
4. Audit logs are immutable (cannot be deleted/modified)
5. Generic error messages to prevent user enumeration

## Edge Cases Handled
1. Concurrent login attempts - all allowed
2. Role changes while user is active - takes effect on next API call
3. Admin deleting own account - prevented by system
4. Last admin removal - prevented by validation
5. Circular role dependencies - not applicable (flat role structure)