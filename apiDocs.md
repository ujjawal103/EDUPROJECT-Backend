# API Documentation

## Base URL
```
http://localhost:5000/api
```

---

# Authentication APIs

## 1. Send Signup OTP
**Endpoint:** `POST /auth/send-signup-otp`  
**Authentication:** None (Public)  
**Description:** Initiates the signup process by sending an OTP to the provided email address.

### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "customer",
  "angelOneClientId": "optional123"
}
```

### Request Validation Rules
- **firstName**: Required, string, min 2 chars, max 50 chars, trimmed
- **lastName**: Optional, string, max 50 chars, trimmed
- **email**: Required, valid email format, converted to lowercase
- **password**: Required, min 6 chars, max 100 chars
- **role**: Required, enum: `["customer", "educator"]`
- **angelOneClientId**: Optional, string, max 10 chars

### Success Response (200)
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### Error Responses

**409 Conflict - User Already Exists**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "User already exists"
}
```

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error details from Zod"
}
```

### Testing Examples

#### Customer Role
```bash
curl -X POST http://localhost:5000/api/auth/send-signup-otp \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Smith",
    "email": "alice.customer@example.com",
    "password": "customerPass123",
    "role": "customer"
  }'
```

#### Educator Role
```bash
curl -X POST http://localhost:5000/api/auth/send-signup-otp \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Robert",
    "lastName": "Teacher",
    "email": "robert.educator@example.com",
    "password": "teacherPass123",
    "role": "educator",
    "angelOneClientId": "ANGELID1"
  }'
```

---

## 2. Verify Signup OTP
**Endpoint:** `POST /auth/verify-signup-otp`  
**Authentication:** None (Public)  
**Description:** Verifies the OTP sent to email and creates the user account.

### Request Body
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Request Validation Rules
- **email**: Required, valid email format, converted to lowercase
- **otp**: Required, exactly 6 digits

### Success Response (201)
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "_id": "user_id_123",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john@example.com",
    "role": "customer",
    "emailVerified": true,
    "onboardingCompleted": true,
    "authProvider": "local",
    "angelOneClientId": "optional123"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Error Responses

**409 Conflict - User Already Registered**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "User is Already Registered"
}
```

**400 Bad Request - OTP Expired**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "OTP expired"
}
```

**400 Bad Request - Invalid OTP**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid OTP. 4 attempts remaining."
}
```

**400 Bad Request - Max OTP Attempts Exceeded**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Maximum OTP attempts exceeded. Please request a new OTP."
}
```

**400 Bad Request - Registration Expired**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Registration expired. Please register again."
}
```

### Testing Examples

#### Customer Registration
```bash
curl -X POST http://localhost:5000/api/auth/verify-signup-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.customer@example.com",
    "otp": "123456"
  }'
```

#### Educator Registration
```bash
curl -X POST http://localhost:5000/api/auth/verify-signup-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "robert.educator@example.com",
    "otp": "123456"
  }'
```

---

## 3. Resend OTP
**Endpoint:** `POST /auth/resend-otp`  
**Authentication:** None (Public)  
**Description:** Resends OTP for email verification or password reset. Cannot be used for email change (logged-in users only).

### Request Body
```json
{
  "email": "john@example.com",
  "purpose": "email_verification"
}
```

### Request Validation Rules
- **email**: Required, valid email format, trimmed, lowercase
- **purpose**: Required, enum: `["email_verification", "forgot_password"]`

### Success Response (200)
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

### Error Responses

**400 Bad Request - Registration Expired**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Registration expired. Please signup again."
}
```

**400 Bad Request - User Already Registered**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "User Already Registered - please login"
}
```

**404 Not Found - User Not Found**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found"
}
```

**400 Bad Request - Invalid OTP Purpose**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid OTP purpose"
}
```

### Testing Examples

#### Resend Signup OTP
```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.customer@example.com",
    "purpose": "email_verification"
  }'
```

#### Resend Forgot Password OTP
```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.customer@example.com",
    "purpose": "forgot_password"
  }'
```

---

## 4. Login
**Endpoint:** `POST /auth/login`  
**Authentication:** None (Public)  
**Description:** Authenticates user with email and password. Response varies based on client type (web/mobile).

### Request Body
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Request Headers
- **x-client-type**: Optional, enum: `["web", "mobile"]` (default: mobile)

### Request Validation Rules
- **email**: Required, valid email format, converted to lowercase
- **password**: Required, min 6 chars

### Success Response (200) - Mobile Client

**Headers:** None (Standard response)

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "user_id_123",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john@example.com",
    "role": "customer",
    "emailVerified": true,
    "onboardingCompleted": true,
    "authProvider": "local"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Success Response (200) - Web Client

**Headers:** `Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict`

**Note:** Web clients do NOT receive refreshToken in response body (it's set in cookies)

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "user_id_123",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john@example.com",
    "role": "customer",
    "emailVerified": true,
    "onboardingCompleted": true,
    "authProvider": "local"
  },
  "accessToken": "eyJhbGc..."
}
```

### Error Responses

**401 Unauthorized - Invalid Credentials**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error details from Zod"
}
```

### Testing Examples

#### Customer Login - Mobile
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-client-type: mobile" \
  -d '{
    "email": "alice.customer@example.com",
    "password": "customerPass123"
  }'
```

#### Educator Login - Mobile
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-client-type: mobile" \
  -d '{
    "email": "robert.educator@example.com",
    "password": "teacherPass123"
  }'
```

#### Customer Login - Web
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-client-type: web" \
  -d '{
    "email": "alice.customer@example.com",
    "password": "customerPass123"
  }'
```

#### Educator Login - Web
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-client-type: web" \
  -d '{
    "email": "robert.educator@example.com",
    "password": "teacherPass123"
  }'
```

---

## 5. Refresh Token
**Endpoint:** `POST /auth/refresh-token`  
**Authentication:** None (Public - uses refresh token)  
**Description:** Generates a new access token using the refresh token. Implements refresh token rotation. Token location depends on client type.

### Request Headers
- **x-client-type**: Optional, enum: `["web", "mobile"]` (default: mobile)

### Request Body - Mobile Client
```json
{
  "refreshToken": "eyJhbGc..."
}
```

### Request Body - Web Client
```json
{}
```
**Note:** Web clients send refreshToken via cookies (HttpOnly)

### Success Response (200) - Mobile Client
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "user": {
    "_id": "user_id_123",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john@example.com",
    "role": "customer",
    "emailVerified": true,
    "onboardingCompleted": true,
    "authProvider": "local"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Success Response (200) - Web Client

**Headers:** `Set-Cookie: refreshToken=<new_token>; HttpOnly; Secure; SameSite=Strict`

**Note:** Web clients receive new refreshToken in cookies, not in body

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "user": {
    "_id": "user_id_123",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john@example.com",
    "role": "customer",
    "emailVerified": true,
    "onboardingCompleted": true,
    "authProvider": "local"
  },
  "accessToken": "eyJhbGc..."
}
```

### Error Responses

**401 Unauthorized - Missing Refresh Token**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Session Expired , Please login"
}
```

**404 Not Found - User Not Found**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found"
}
```

**401 Unauthorized - Invalid Refresh Token**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Session Expired , Please Login Again"
}
```

### Testing Examples

#### Refresh Token - Mobile
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'
```

#### Refresh Token - Web
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -b "refreshToken=eyJhbGc..." \
  -d '{}'
```

---

## 6. Forgot Password
**Endpoint:** `POST /auth/forgot-password`  
**Authentication:** None (Public)  
**Description:** Initiates password reset flow by sending OTP to registered email.

### Request Body
```json
{
  "email": "john@example.com"
}
```

### Request Validation Rules
- **email**: Required, valid email format, trimmed, lowercase

### Success Response (200)
```json
{
  "success": true,
  "message": "Password reset OTP sent successfully"
}
```

### Error Responses

**404 Not Found - User Not Found**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found"
}
```

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error details from Zod"
}
```

### Testing Examples

#### Customer Forgot Password
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.customer@example.com"
  }'
```

#### Educator Forgot Password
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "robert.educator@example.com"
  }'
```

---

## 7. Verify Forgot Password OTP
**Endpoint:** `POST /auth/verify-forgot-password-otp`  
**Authentication:** None (Public)  
**Description:** Verifies the OTP sent for password reset and generates a reset token.

### Request Body
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Request Validation Rules
- **email**: Required, valid email format
- **otp**: Required, exactly 6 digits

### Success Response (200)
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "eyJhbGc..."
}
```

### Error Responses

**400 Bad Request - OTP Expired**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "OTP expired"
}
```

**400 Bad Request - Invalid OTP**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid OTP. 4 attempts remaining."
}
```

**400 Bad Request - Max OTP Attempts Exceeded**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Maximum OTP attempts exceeded"
}
```

### Testing Examples

#### Verify Forgot Password OTP - Customer
```bash
curl -X POST http://localhost:5000/api/auth/verify-forgot-password-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.customer@example.com",
    "otp": "123456"
  }'
```

#### Verify Forgot Password OTP - Educator
```bash
curl -X POST http://localhost:5000/api/auth/verify-forgot-password-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "robert.educator@example.com",
    "otp": "123456"
  }'
```

---

## 8. Reset Password
**Endpoint:** `POST /auth/reset-password`  
**Authentication:** None (Public - uses reset token)  
**Description:** Resets the password using the reset token from verification. Auto-logins user after password reset.

### Request Body
```json
{
  "resetToken": "eyJhbGc...",
  "newPassword": "newSecurePassword123"
}
```

### Request Validation Rules
- **resetToken**: Required, valid JWT token
- **newPassword**: Required, min 6 chars, max 100 chars

### Success Response (200) - Mobile
```json
{
  "success": true,
  "message": "Password reset successfully",
  "user": {
    "_id": "user_id_123",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john@example.com",
    "role": "customer",
    "emailVerified": true,
    "onboardingCompleted": true,
    "authProvider": "local"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Success Response (200) - Web

**Headers:** `Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict`

### Error Responses

**401 Unauthorized - Invalid Reset Token**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid reset , please generate new otp"
}
```

**404 Not Found - User Not Found**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found"
}
```

**401 Unauthorized - Token Already Used**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid reset , please generate new otp"
}
```

### Testing Examples

#### Reset Password - Customer
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "eyJhbGc...",
    "newPassword": "newCustomerPass123"
  }'
```

#### Reset Password - Educator
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "eyJhbGc...",
    "newPassword": "newTeacherPass123"
  }'
```

---

## 9. Google Authentication
**Endpoint:** `POST /auth/google`  
**Authentication:** None (Public)  
**Description:** Authenticates or registers user using Google OAuth idToken. New users have `onboardingCompleted: false` and must select a role.

### Request Body
```json
{
  "idToken": "eyJhbGc..."
}
```

### Request Validation Rules
- **idToken**: Required, valid Google OAuth token

### Success Response (200) - Existing User

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "user_id_123",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john@google.com",
    "role": "customer",
    "emailVerified": true,
    "onboardingCompleted": true,
    "authProvider": "google",
    "googleId": "110...",
    "angelOneClientId": null
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Success Response (200) - New User

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "user_id_456",
    "fullName": {
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "email": "jane@google.com",
    "role": null,
    "emailVerified": true,
    "onboardingCompleted": false,
    "authProvider": "google",
    "googleId": "115...",
    "angelOneClientId": null
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Error Responses

**400 Bad Request - Google Email Not Verified**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Google email not verified"
}
```

**409 Conflict - Email Exists with Local Auth**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Account already exists with email and password. Please login normally."
}
```

**401 Unauthorized - Google ID Mismatch**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Google account mismatch"
}
```

### Testing Examples

#### Google Auth - New User
```bash
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "eyJhbGc..."
  }'
```

#### Google Auth - Existing User
```bash
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "eyJhbGc..."
  }'
```

---

## 10. Select Role
**Endpoint:** `PATCH /auth/select-role`  
**Authentication:** Required (Bearer Token)  
**Description:** Allows Google-authenticated users to select their role during onboarding. Only available for new Google users.

### Request Headers
```
Authorization: Bearer <accessToken>
```

### Request Body
```json
{
  "role": "customer"
}
```

### Request Validation Rules
- **role**: Required, enum: `["customer", "educator"]`

### Success Response (200)
```json
{
  "success": true,
  "message": "Role selected successfully",
  "user": {
    "_id": "user_id_456",
    "fullName": {
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "email": "jane@google.com",
    "role": "customer",
    "emailVerified": true,
    "onboardingCompleted": true,
    "authProvider": "google",
    "googleId": "115..."
  }
}
```

### Error Responses

**400 Bad Request - Not Google Account**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Role selection is not available"
}
```

**400 Bad Request - Role Already Selected**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Role already selected"
}
```

**401 Unauthorized - Missing Token**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication required"
}
```

### Testing Examples

#### Select Role - Customer via Google
```bash
curl -X PATCH http://localhost:5000/api/auth/select-role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "role": "customer"
  }'
```

#### Select Role - Educator via Google
```bash
curl -X PATCH http://localhost:5000/api/auth/select-role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "role": "educator"
  }'
```

---

## 11. Logout
**Endpoint:** `POST /auth/logout`  
**Authentication:** None (Public - uses refresh token)  
**Description:** Logs out user from current device. Removes refresh token from database. Gracefully handles expired tokens.

### Request Headers
- **x-client-type**: Optional, enum: `["web", "mobile"]` (default: mobile)

### Request Body - Mobile Client
```json
{
  "refreshToken": "eyJhbGc..."
}
```

### Request Body - Web Client
```json
{}
```
**Note:** Web clients send refreshToken via cookies (HttpOnly)

### Success Response (200)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Note:** For web clients, response also includes `Set-Cookie: refreshToken=; Max-Age=0` to clear the cookie

### Error Responses

**Note:** Logout always returns 200 success, even if refresh token is invalid or expired

### Testing Examples

#### Logout - Mobile
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "x-client-type: mobile" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'
```

#### Logout - Web
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "x-client-type: web" \
  -b "refreshToken=eyJhbGc..." \
  -d '{}'
```

---

## 12. Logout All Devices
**Endpoint:** `POST /auth/logout-all-devices`  
**Authentication:** Required (Bearer Token)  
**Description:** Logs out user from all devices by clearing all refresh tokens.

### Request Headers
```
Authorization: Bearer <accessToken>
x-client-type: web (optional, triggers cookie clearing)
```

### Request Body
```json
{}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

### Error Responses

**401 Unauthorized - Missing Token**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication required"
}
```

### Testing Examples

#### Logout All Devices - Customer
```bash
curl -X POST http://localhost:5000/api/auth/logout-all-devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{}'
```

#### Logout All Devices - Educator
```bash
curl -X POST http://localhost:5000/api/auth/logout-all-devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{}'
```

---

# User APIs

## 13. Get Me (Get Current User)
**Endpoint:** `GET /user/me`  
**Authentication:** Required (Bearer Token)  
**Description:** Retrieves the current authenticated user's information.

### Request Headers
```
Authorization: Bearer <accessToken>
```

### Success Response (200)
```json
{
  "success": true,
  "user": {
    "_id": "user_id_123",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john@example.com",
    "role": "customer",
    "emailVerified": true,
    "onboardingCompleted": true,
    "authProvider": "local",
    "angelOneClientId": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Error Responses

**401 Unauthorized - Missing Token**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication required"
}
```

**401 Unauthorized - Invalid Token**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid token"
}
```

### Testing Examples

#### Get Current User - Customer
```bash
curl -X GET http://localhost:5000/api/user/me \
  -H "Authorization: Bearer eyJhbGc..."
```

#### Get Current User - Educator
```bash
curl -X GET http://localhost:5000/api/user/me \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 14. Change Password
**Endpoint:** `PATCH /user/change-password`  
**Authentication:** Required (Bearer Token)  
**Description:** Changes user password. Only available for local authentication. Auto-logs out all devices and auto-logs in current device.

### Request Headers
```
Authorization: Bearer <accessToken>
x-client-type: mobile (or web, optional)
```

### Request Body
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

### Request Validation Rules
- **currentPassword**: Required, min 1 char, max 100 chars
- **newPassword**: Required, min 6 chars, max 100 chars

### Success Response (200) - Mobile
```json
{
  "success": true,
  "message": "Password changed successfully",
  "user": {
    "_id": "user_id_123",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john@example.com",
    "role": "customer",
    "emailVerified": true,
    "onboardingCompleted": true,
    "authProvider": "local"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Success Response (200) - Web

**Headers:** `Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict`

### Error Responses

**400 Bad Request - Google Account Cannot Change Password**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Google accounts cannot change password"
}
```

**400 Bad Request - Incorrect Current Password**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Current password is incorrect"
}
```

**400 Bad Request - New Password Same as Old**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "New password must be different from current password"
}
```

**401 Unauthorized - Missing Token**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication required"
}
```

### Testing Examples

#### Change Password - Customer (Mobile)
```bash
curl -X PATCH http://localhost:5000/api/user/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "x-client-type: mobile" \
  -d '{
    "currentPassword": "customerPass123",
    "newPassword": "newCustomerPass456"
  }'
```

#### Change Password - Educator (Web)
```bash
curl -X PATCH http://localhost:5000/api/user/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "x-client-type: web" \
  -d '{
    "currentPassword": "teacherPass123",
    "newPassword": "newTeacherPass456"
  }'
```

---

## 15. Change Email
**Endpoint:** `PATCH /user/change-email`  
**Authentication:** Required (Bearer Token)  
**Description:** Initiates email change process by sending OTP to new email. Only available for local authentication.

### Request Headers
```
Authorization: Bearer <accessToken>
```

### Request Body
```json
{
  "currentPassword": "securePassword123",
  "newEmail": "newemail@example.com"
}
```

### Request Validation Rules
- **currentPassword**: Required, min 1 char
- **newEmail**: Required, valid email format, trimmed, lowercase

### Success Response (200)
```json
{
  "success": true,
  "message": "OTP sent to new email successfully"
}
```

### Error Responses

**400 Bad Request - Google Account Cannot Change Email**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Google accounts cannot change email"
}
```

**400 Bad Request - Incorrect Current Password**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Current password is incorrect"
}
```

**400 Bad Request - Same Email**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "New email must be different from current email"
}
```

**409 Conflict - Email Already in Use**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Email already in use"
}
```

**401 Unauthorized - Missing Token**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication required"
}
```

### Testing Examples

#### Change Email - Customer
```bash
curl -X PATCH http://localhost:5000/api/user/change-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "currentPassword": "customerPass123",
    "newEmail": "alice.new@example.com"
  }'
```

#### Change Email - Educator
```bash
curl -X PATCH http://localhost:5000/api/user/change-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "currentPassword": "teacherPass123",
    "newEmail": "robert.new@example.com"
  }'
```

---

## 16. Verify Change Email OTP
**Endpoint:** `POST /user/verify-change-email-otp`  
**Authentication:** Required (Bearer Token)  
**Description:** Verifies OTP sent to new email and completes email change. Auto-logs out all devices and auto-logs in current device.

### Request Headers
```
Authorization: Bearer <accessToken>
x-client-type: mobile (or web, optional)
```

### Request Body
```json
{
  "newEmail": "newemail@example.com",
  "otp": "123456"
}
```

### Request Validation Rules
- **newEmail**: Required, valid email format, trimmed
- **otp**: Required, exactly 6 digits

### Success Response (200) - Mobile
```json
{
  "success": true,
  "message": "Email changed successfully",
  "user": {
    "_id": "user_id_123",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "newemail@example.com",
    "role": "customer",
    "emailVerified": true,
    "onboardingCompleted": true,
    "authProvider": "local"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Success Response (200) - Web

**Headers:** `Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict`

### Error Responses

**400 Bad Request - OTP Expired**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "OTP expired"
}
```

**400 Bad Request - Invalid OTP**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid OTP. 4 attempts remaining."
}
```

**400 Bad Request - Max OTP Attempts Exceeded**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Maximum OTP attempts exceeded. Please request a new OTP."
}
```

**409 Conflict - Email Already in Use**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Email already in use"
}
```

**401 Unauthorized - Missing Token**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication required"
}
```

### Testing Examples

#### Verify Change Email OTP - Customer (Mobile)
```bash
curl -X POST http://localhost:5000/api/user/verify-change-email-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "x-client-type: mobile" \
  -d '{
    "newEmail": "alice.new@example.com",
    "otp": "123456"
  }'
```

#### Verify Change Email OTP - Educator (Web)
```bash
curl -X POST http://localhost:5000/api/user/verify-change-email-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "x-client-type: web" \
  -d '{
    "newEmail": "robert.new@example.com",
    "otp": "123456"
  }'
```

---

# Complete API Flow Examples

## User Registration and Login Flow - Customer (Mobile)

### Step 1: Send Signup OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-signup-otp \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Smith",
    "email": "alice@example.com",
    "password": "securePass123",
    "role": "customer"
  }'
```

### Step 2: Verify Signup OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-signup-otp \
  -H "Content-Type: application/json" \
  -H "x-client-type: mobile" \
  -d '{
    "email": "alice@example.com",
    "otp": "123456"
  }'
```

### Step 3: Use Refresh Token to Get New Access Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -H "x-client-type: mobile" \
  -d '{
    "refreshToken": "<refreshToken from step 2>"
  }'
```

### Step 4: Get User Information
```bash
curl -X GET http://localhost:5000/api/user/me \
  -H "Authorization: Bearer <accessToken from step 3>"
```

### Step 5: Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "x-client-type: mobile" \
  -d '{
    "refreshToken": "<refreshToken from step 2>"
  }'
```

---

## User Registration and Login Flow - Educator (Web)

### Step 1: Send Signup OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-signup-otp \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Robert",
    "lastName": "Teacher",
    "email": "robert@example.com",
    "password": "teacherPass123",
    "role": "educator",
    "angelOneClientId": "ANGELID123"
  }'
```

### Step 2: Verify Signup OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-signup-otp \
  -H "Content-Type: application/json" \
  -H "x-client-type: web" \
  -d '{
    "email": "robert@example.com",
    "otp": "123456"
  }'
```

**Note:** Response does NOT include refreshToken for web client

### Step 3: Refresh Token (Web - refreshToken in cookies)
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -H "x-client-type: web" \
  -b "refreshToken=<cookie>" \
  -d '{}'
```

### Step 4: Get User Information
```bash
curl -X GET http://localhost:5000/api/user/me \
  -H "Authorization: Bearer <accessToken>"
```

### Step 5: Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "x-client-type: web" \
  -b "refreshToken=<cookie>" \
  -d '{}'
```

---

## Password Reset Flow - Both Roles

### Step 1: Request Password Reset OTP
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Step 2: Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-forgot-password-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

**Response includes resetToken**

### Step 3: Reset Password
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "<resetToken from step 2>",
    "newPassword": "newPassword456"
  }'
```

---

## Google OAuth Flow - New User

### Step 1: Google Authentication (New User)
```bash
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "<Google idToken>"
  }'
```

**Response: onboardingCompleted: false, role: null**

### Step 2: Select Role
```bash
curl -X PATCH http://localhost:5000/api/auth/select-role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken from step 1>" \
  -d '{
    "role": "customer"
  }'
```

### Step 3: Get User (Now Complete)
```bash
curl -X GET http://localhost:5000/api/user/me \
  -H "Authorization: Bearer <accessToken>"
```

---

## Email Change Flow - Customer/Educator

### Step 1: Request Email Change OTP
```bash
curl -X PATCH http://localhost:5000/api/user/change-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "currentPassword": "currentPass123",
    "newEmail": "newemail@example.com"
  }'
```

### Step 2: Verify Email Change OTP
```bash
curl -X POST http://localhost:5000/api/user/verify-change-email-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "newEmail": "newemail@example.com",
    "otp": "123456"
  }'
```

**Note:** User is auto-logged out from all devices and logged back in

---

## Password Change Flow - Local Auth Users

```bash
curl -X PATCH http://localhost:5000/api/user/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }'
```

**Note:** User is auto-logged out from all devices and logged back in

---

# Common Error Responses

## 400 Bad Request - Validation Error
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error - details from Zod validation"
}
```

## 401 Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication required or invalid credentials"
}
```

## 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found"
}
```

## 409 Conflict
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Resource already exists or conflict occurred"
}
```

## 500 Internal Server Error
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error - check logs"
}
```

---

# Authentication Notes

- **Access Token Expiry:** Set in JWT configuration
- **Refresh Token Expiry:** Set in JWT configuration
- **Token Rotation:** Refresh tokens are rotated on each refresh (old token removed, new token issued)
- **OTP Expiry:** 15 minutes (configured in OTP utility)
- **OTP Max Attempts:** 5 attempts
- **Web vs Mobile:** Web uses HttpOnly cookies for refresh tokens, Mobile receives tokens in response body
- **Role-Based Access:** All user endpoints automatically check user's role via JWT
- **Google Auth:** New users must select role before accessing protected endpoints
- **Password Reset:** Includes password reset version for token invalidation

---
