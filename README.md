# Football Jersey Community & Marketplace

A mobile-first community and marketplace app for football jersey collectors, featuring comprehensive error handling throughout the entire application.

## 🎯 Project Overview

This application combines a strong community platform with a trust-based resale marketplace, prioritizing authenticity, reputation, and fan culture. Built with React Native (mobile) and FastAPI (backend), it features **enterprise-grade error handling** at every level.

## 🔐 Error Handling Features

### Backend Error Handling

#### 1. **Custom Exception System** (`backend/app/core/exceptions.py`)

We've implemented a comprehensive exception hierarchy with clear, user-friendly error messages:

```python
class AppException(Exception):
    """Base exception with status code and details"""

- ValidationException: Data validation errors
- AuthenticationException: Login/token errors
- AuthorizationException: Permission errors
- NotFoundException: Resource not found errors
- ConflictException: Duplicate resource errors
- DatabaseException: Database operation errors
- FileUploadException: File upload errors
- RateLimitException: Rate limiting errors
- ExternalServiceException: Third-party service errors
```

**Example Usage:**
```python
if not user:
    raise NotFoundException("User", user_id)
    # Returns: "User with identifier '123' not found"
```

#### 2. **Global Error Handler Middleware** (`backend/app/middleware/error_handler.py`)

All exceptions are caught and transformed into consistent JSON responses:

```python
{
    "success": false,
    "error": {
        "message": "User-friendly error message",
        "type": "ValidationError",
        "details": {"field": "email", "reason": "already exists"}
    }
}
```

**Features:**
- Catches all exceptions (custom, validation, database, unexpected)
- Transforms technical errors into user-friendly messages
- Logs detailed error information for debugging
- Never exposes internal implementation details to users

#### 3. **Security Module** (`backend/app/core/security.py`)

Every security function includes comprehensive error handling:

- **Password Hashing**: Validates password strength, handles hashing failures
- **Token Creation**: Handles JWT encoding errors with clear messages
- **Token Validation**: Detects expired tokens, invalid tokens, missing claims
- **Password Verification**: Handles empty passwords, verification failures

**Example:**
```python
def create_access_token(subject: Union[str, int]) -> str:
    try:
        # Token creation logic
    except Exception as e:
        logger.error(f"Token creation error: {str(e)}")
        raise AuthenticationException(
            "Failed to create authentication token"
        )
```

#### 4. **Database Layer** (`backend/app/core/database.py`)

Database operations are wrapped with error handling:

- **Connection Management**: Tests connections before use
- **Session Management**: Automatic rollback on errors
- **Connection Pooling**: Pre-ping to verify connections
- **Transaction Safety**: Commit on success, rollback on failure

**Example:**
```python
async def get_db():
    try:
        session = db_manager.async_session_maker()
        yield session
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise DatabaseException(f"Database operation failed: {str(e)}")
    finally:
        await session.close()
```

#### 5. **API Endpoints** (all files in `backend/app/api/v1/endpoints/`)

Every endpoint implements error handling:

##### Authentication (`auth.py`)
- Email/username conflict detection
- Password strength validation
- Token expiration handling
- Account inactive detection

**Example from `/register` endpoint:**
```python
# Check if email already exists
try:
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise ConflictException(
            "An account with this email already exists. "
            "Please use a different email or try logging in."
        )
except ConflictException:
    raise
except Exception as e:
    logger.error(f"Database error: {str(e)}")
    raise DatabaseException("Failed to verify email availability")
```

##### User Profile (`users.py`)
- Profile validation
- Password change security
- Permission checks
- Pagination validation

**Example validation:**
```python
if skip < 0:
    raise ValidationException(
        "Skip parameter must be non-negative",
        field="skip"
    )
```

#### 6. **Input Validation** (`backend/app/schemas/user.py`)

Pydantic schemas with custom validators:

```python
@field_validator("username")
@classmethod
def validate_username(cls, v: str) -> str:
    if not re.match(r"^[a-zA-Z0-9_]+$", v):
        raise ValidationException(
            "Username can only contain letters, numbers, and underscores",
            field="username"
        )
    if v.startswith("_"):
        raise ValidationException(
            "Username cannot start with an underscore",
            field="username"
        )
    return v.lower()
```

#### 7. **Configuration & Settings** (`backend/app/core/config.py`)

Configuration loading with error handling:

```python
def get_database_url(self) -> str:
    try:
        if not all([self.POSTGRES_SERVER, self.POSTGRES_USER, ...]):
            raise ValueError("Missing required database configuration")
        return f"postgresql+asyncpg://..."
    except Exception as e:
        raise ValueError(f"Failed to construct database URL: {str(e)}")
```

### Mobile App Error Handling

#### 1. **API Service** (`mobile/src/services/api.ts`)

Comprehensive API client with error handling:

**Features:**
- Custom `APIError` class with status codes and details
- Axios interceptors for request/response
- Automatic token refresh on 401 errors
- Network error detection
- Timeout handling
- Request retry logic

**Example:**
```typescript
private handleError(error: any): APIError {
    if (error.code === 'ECONNABORTED') {
        return new APIError(
            'Network connection failed. Please check your internet.',
            0,
            'NetworkError'
        );
    }
    if (error.response?.status === 401) {
        return new APIError(
            'Session expired. Please log in again.',
            401,
            'AuthenticationError'
        );
    }
    // ... more error handling
}
```

**Token Refresh Mechanism:**
```typescript
// Automatically refresh expired tokens
if (error.response?.status === 401) {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    const response = await axios.post('/auth/refresh', { refresh_token: refreshToken });
    // Retry original request with new token
}
```

#### 2. **Authentication Service** (`mobile/src/services/authService.ts`)

Auth operations with validation:

**Features:**
- Client-side validation before API calls
- Email format validation
- Password strength validation
- Username format validation
- Specific error messages for conflicts

**Example:**
```typescript
private validateRegistrationData(data: RegisterData): void {
    const errors: string[] = [];

    if (!this.isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    if (data.password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[a-zA-Z]/.test(data.password)) {
        errors.push('Password must contain at least one letter');
    }

    if (errors.length > 0) {
        throw new APIError(errors.join('. '), 400, 'ValidationError');
    }
}
```

#### 3. **Error Handler Utilities** (`mobile/src/utils/errorHandler.ts`)

User-friendly error message generation:

**Functions:**
- `getErrorMessage()`: Extract user-friendly messages
- `getValidationErrors()`: Parse field-specific errors
- `handleError()`: Log and return error message
- `isAuthError()`: Detect authentication errors
- `isNetworkError()`: Detect network errors
- `isValidationError()`: Detect validation errors

**Example:**
```typescript
export function getErrorMessage(error: any): string {
    if (error instanceof APIError) {
        return error.message;
    }

    // Network errors
    if (error.code === 'ECONNABORTED') {
        return 'Network connection failed. Please check your internet.';
    }

    // Status-based messages
    switch (error.response?.status) {
        case 400: return 'Invalid request. Please check your input.';
        case 401: return 'Authentication required. Please log in.';
        case 404: return 'The requested resource was not found.';
        // ... more cases
    }
}
```

## 📋 Error Handling Best Practices Demonstrated

### 1. **Layered Error Handling**

Errors are caught and handled at multiple levels:
- Input validation (Pydantic schemas)
- Business logic (API endpoints)
- Data access (Database layer)
- Framework level (Middleware)
- Client-side (Mobile app)

### 2. **Clear Error Messages**

All error messages are:
- User-friendly and actionable
- Specific to the error type
- Never expose internal details
- Suggest next steps when possible

**Bad:** `"Database operation failed"`
**Good:** `"Failed to create user account. Please try again."`

### 3. **Structured Error Responses**

All API errors return consistent JSON:
```json
{
    "success": false,
    "error": {
        "message": "Validation failed. Please check your input.",
        "type": "ValidationError",
        "details": {
            "errors": [
                {"field": "email", "message": "Email is required"}
            ]
        }
    }
}
```

### 4. **Comprehensive Logging**

All errors are logged with context:
```python
logger.error(
    f"Database error: {str(e)} | "
    f"Path: {request.url.path} | "
    f"User: {user_id}"
)
```

### 5. **Graceful Degradation**

The app continues to function even when errors occur:
- Token refresh on expiration
- Automatic retry for network errors
- Fallback messages for unknown errors
- Session recovery after network issues

### 6. **Security-First Error Handling**

- Never expose stack traces to users
- Don't reveal if email/username exists (on login)
- Hash passwords even if user doesn't exist
- Clear sensitive data on auth errors

## 🏗️ Architecture

```
/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── core/              # Core functionality
│   │   │   ├── config.py      # ✅ Config validation & error handling
│   │   │   ├── exceptions.py  # ✅ Custom exception classes
│   │   │   ├── security.py    # ✅ Auth error handling
│   │   │   └── database.py    # ✅ Database error handling
│   │   ├── middleware/
│   │   │   └── error_handler.py  # ✅ Global error middleware
│   │   ├── api/
│   │   │   ├── dependencies.py   # ✅ Auth dependency errors
│   │   │   └── v1/endpoints/
│   │   │       ├── auth.py       # ✅ Auth endpoint errors
│   │   │       └── users.py      # ✅ User endpoint errors
│   │   ├── models/            # Database models
│   │   ├── schemas/           # ✅ Pydantic validation
│   │   └── main.py            # ✅ App initialization errors
│   └── requirements.txt
│
└── mobile/                    # React Native App
    ├── src/
    │   ├── services/
    │   │   ├── api.ts         # ✅ API error handling
    │   │   └── authService.ts # ✅ Auth service errors
    │   └── utils/
    │       └── errorHandler.ts # ✅ Error utilities
    ├── App.tsx
    └── package.json
```

## 🚀 Getting Started

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations (when using Alembic)
alembic upgrade head

# Start the server
python -m app.main
```

The API will be available at `http://localhost:8000`
- API Docs: `http://localhost:8000/api/docs`
- Health Check: `http://localhost:8000/health`

### Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

## 🔍 Testing Error Handling

### Test Backend Errors

```bash
# Test validation error
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "username": "ab", "password": "123"}'

# Response:
{
    "success": false,
    "error": {
        "message": "Validation failed",
        "type": "ValidationError",
        "details": {
            "errors": [
                {"field": "email", "message": "Invalid email format"},
                {"field": "username", "message": "Username must be at least 3 characters"},
                {"field": "password", "message": "Password must be at least 8 characters"}
            ]
        }
    }
}
```

```bash
# Test authentication error
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "wrong@email.com", "password": "wrongpass"}'

# Response:
{
    "success": false,
    "error": {
        "message": "Invalid email or password. Please check your credentials and try again.",
        "type": "AuthenticationException"
    }
}
```

### Test Mobile Error Handling

```typescript
// Example: Login with validation
try {
    await authService.login({
        email: 'invalid-email',  // ❌ Invalid format
        password: ''              // ❌ Empty password
    });
} catch (error) {
    console.log(getErrorMessage(error));
    // Output: "Email is required. Password is required."
}

// Example: Network error handling
try {
    // Disconnect network, then try API call
    await apiService.get('/users/me');
} catch (error) {
    if (isNetworkError(error)) {
        console.log('Please check your internet connection');
    }
}
```

## 📝 Key Error Handling Files

### Backend
- **`backend/app/core/exceptions.py`**: Custom exception classes (250+ lines)
- **`backend/app/core/security.py`**: Security functions with error handling (220+ lines)
- **`backend/app/core/database.py`**: Database error handling (180+ lines)
- **`backend/app/middleware/error_handler.py`**: Global error middleware (150+ lines)
- **`backend/app/api/v1/endpoints/auth.py`**: Auth endpoints with errors (300+ lines)
- **`backend/app/api/v1/endpoints/users.py`**: User endpoints with errors (280+ lines)
- **`backend/app/api/dependencies.py`**: Dependency error handling (180+ lines)

### Mobile
- **`mobile/src/services/api.ts`**: API client with error handling (280+ lines)
- **`mobile/src/services/authService.ts`**: Auth service with validation (220+ lines)
- **`mobile/src/utils/errorHandler.ts`**: Error utilities (180+ lines)

## 🎯 Error Handling Coverage

✅ **Authentication Errors**
- Invalid credentials
- Token expiration
- Missing tokens
- Invalid token format
- Account inactive
- Session expired

✅ **Validation Errors**
- Email format
- Username format
- Password strength
- Required fields
- Field length limits
- Invalid characters

✅ **Database Errors**
- Connection failures
- Query errors
- Transaction rollbacks
- Constraint violations
- Duplicate entries

✅ **Network Errors**
- Connection timeout
- No internet connection
- Server unavailable
- DNS resolution failures

✅ **Authorization Errors**
- Insufficient permissions
- Resource ownership
- Role-based access

✅ **Resource Errors**
- Not found (404)
- Already exists (409)
- Gone (410)

## 📚 Technologies

### Backend
- **FastAPI**: Modern async Python web framework
- **SQLAlchemy**: ORM with async support
- **PostgreSQL**: Primary database
- **Pydantic**: Data validation
- **JWT**: Authentication tokens
- **Uvicorn**: ASGI server

### Mobile
- **React Native**: Cross-platform mobile framework
- **TypeScript**: Type-safe JavaScript
- **Axios**: HTTP client
- **AsyncStorage**: Local storage
- **Expo**: Development platform

## 🤝 Contributing

When adding new features, ensure error handling is implemented:

1. Define custom exceptions in `exceptions.py`
2. Add validation in Pydantic schemas
3. Handle errors in API endpoints
4. Log errors appropriately
5. Return user-friendly messages
6. Add error handling tests

## 📄 License

This project demonstrates comprehensive error handling patterns for production applications.

---

**Built with ❤️ and extensive error handling for football jersey collectors worldwide.**
