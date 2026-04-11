# API Endpoints Reference

<cite>
**Referenced Files in This Document**
- [main.py](file://backend/main.py)
- [auth.py](file://backend/app/api/v1/auth.py)
- [diaries.py](file://backend/app/api/v1/diaries.py)
- [ai.py](file://backend/app/api/v1/ai.py)
- [community.py](file://backend/app/api/v1/community.py)
- [users.py](file://backend/app/api/v1/users.py)
- [auth_schemas.py](file://backend/app/schemas/auth.py)
- [diary_schemas.py](file://backend/app/schemas/diary.py)
- [community_schemas.py](file://backend/app/schemas/community.py)
- [ai_schemas.py](file://backend/app/schemas/ai.py)
- [auth_service.py](file://backend/app/services/auth_service.py)
- [diary_service.py](file://backend/app/services/diary_service.py)
- [config.py](file://backend/app/core/config.py)
- [security.py](file://backend/app/core/security.py)
- [deps.py](file://backend/app/core/deps.py)
</cite>

## Update Summary
**Changes Made**
- Enhanced with comprehensive API documentation system overhaul
- Added standardized OpenAPI schema generation with integrated security schemes
- Implemented dual authentication methods: Bearer Token and Cookie authentication
- Added new meta endpoints for authentication flow documentation, error code references, and practical examples
- Updated error handling section with comprehensive error response format
- Enhanced troubleshooting guide with new error response structure
- Added request_id field documentation for debugging and audit trails

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [API Documentation System](#api-documentation-system)
6. [Enhanced Error Handling](#enhanced-error-handling)
7. [Detailed Component Analysis](#detailed-component-analysis)
8. [Dependency Analysis](#dependency-analysis)
9. [Performance Considerations](#performance-considerations)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Conclusion](#conclusion)
12. [Appendices](#appendices)

## Introduction
This document provides comprehensive API endpoints reference for the 映记 application's REST API. It covers authentication, diary management, AI analysis, community, and user management endpoints. For each endpoint, you will find HTTP methods, URL patterns, request/response schemas, authentication requirements, validation rules, error handling patterns, and practical usage guidance. Where applicable, curl examples and SDK usage patterns are included.

**Updated** Enhanced with comprehensive API documentation system overhaul including standardized OpenAPI schema generation with integrated security schemes supporting both Bearer Token and Cookie authentication methods. Added new meta endpoints for authentication flow documentation, error code references, and practical examples.

## Project Structure
The backend is a FastAPI application that mounts multiple routers under /api/v1. Authentication is enforced via bearer tokens or cookies. Static file serving is configured for uploads. The application now includes standardized API documentation endpoints and enhanced error handling with comprehensive meta endpoints.

```mermaid
graph TB
Client["Client"] --> Main["FastAPI App (main.py)"]
Main --> AuthRouter["/api/v1/auth (auth.py)"]
Main --> DiariesRouter["/api/v1/diaries (diaries.py)"]
Main --> AIRouter["/api/v1/ai (ai.py)"]
Main --> UsersRouter["/api/v1/users (users.py)"]
Main --> CommunityRouter["/api/v1/community (community.py)"]
Main --> AssistantRouter["/api/v1/assistant (assistant.py)"]
Main --> IntegrationsRouter["/api/v1/integrations (integrations.py)"]
Main --> EmotionRouter["/api/v1/emotion (emotion.py)"]
Main --> StaticUploads["/uploads (StaticFiles)"]
Main --> APIDocs["/api/doc, /api/docs, /api/redoc (Documentation)"]
Main --> OpenAPI["/api/openapi.json (Schema)"]
Main --> MetaAuth["/api/meta/auth-guide (Meta)"]
Main --> MetaErrors["/api/meta/error-codes (Meta)"]
Main --> MetaExamples["/api/meta/examples (Meta)"]
```

**Diagram sources**
- [main.py:60-87](file://backend/main.py#L60-L87)
- [main.py:222-264](file://backend/main.py#L222-L264)
- [main.py:373-421](file://backend/main.py#L373-L421)

**Section sources**
- [main.py:42-87](file://backend/main.py#L42-L87)
- [main.py:216-264](file://backend/main.py#L216-L264)
- [main.py:373-421](file://backend/main.py#L373-L421)

## Core Components
- Authentication: JWT bearer tokens with cookie support, verification codes, registration/login/reset flows.
- Diary Management: CRUD, timeline queries, image upload, growth insights.
- AI Analysis: Title suggestions, daily guidance, comprehensive RAG-based analysis, social samples, and analysis persistence.
- Community: Posts, comments, likes/collections, image upload, browsing history.
- User Management: Profile retrieval/update, avatar upload.
- **API Documentation**: Standardized Swagger UI and Redoc documentation endpoints with integrated security schemes.
- **Enhanced Error Handling**: Unified error response format with request_id for debugging.
- **Meta Endpoints**: Authentication guides, error code references, and practical examples for improved developer experience.

**Section sources**
- [auth.py:22-579](file://backend/app/api/v1/auth.py#L22-L579)
- [diaries.py:29-501](file://backend/app/api/v1/diaries.py#L29-L501)
- [ai.py:31-902](file://backend/app/api/v1/ai.py#L31-L902)
- [community.py:20-324](file://backend/app/api/v1/community.py#L20-L324)
- [users.py:14-103](file://backend/app/api/v1/users.py#L14-L103)
- [main.py:222-264](file://backend/main.py#L222-L264)
- [main.py:90-152](file://backend/main.py#L90-L152)
- [main.py:373-421](file://backend/main.py#L373-L421)

## Architecture Overview
High-level API architecture and authentication flow with enhanced error handling, documentation endpoints, and dual authentication methods.

```mermaid
sequenceDiagram
participant C as "Client"
participant A as "Auth Router (/api/v1/auth)"
participant S as "AuthService"
participant DB as "Database"
participant T as "JWT Token"
C->>A : POST /api/v1/auth/register/send-code
A->>S : send_verification_code(email, type="register")
S->>DB : write VerificationCode (pending)
S->>S : send email
S->>DB : commit or rollback
S-->>A : success/failure
A-->>C : {success,message}
C->>A : POST /api/v1/auth/register
A->>S : register(email, password, code)
S->>DB : verify code, create User
S-->>A : user
A->>T : create_access_token(user)
A->>A : set httpOnly cookies (access_token, refresh_token)
A-->>C : {access_token, token_type, user}
Note over C,A : Error responses now include request_id for debugging
```

**Diagram sources**
- [auth.py:25-125](file://backend/app/api/v1/auth.py#L25-L125)
- [auth_service.py:19-98](file://backend/app/services/auth_service.py#L19-L98)
- [main.py:108-152](file://backend/main.py#L108-L152)

**Section sources**
- [auth.py:22-579](file://backend/app/api/v1/auth.py#L22-L579)
- [auth_service.py:16-358](file://backend/app/services/auth_service.py#L16-L358)
- [deps.py:18-66](file://backend/app/core/deps.py#L18-L66)
- [security.py:43-71](file://backend/app/core/security.py#L43-L71)
- [main.py:90-152](file://backend/main.py#L90-L152)

## API Documentation System
**New** The application now provides a comprehensive API documentation system with standardized OpenAPI schema generation and integrated security schemes.

### Standardized Documentation Endpoints
The application offers multiple standardized endpoints for API documentation:

- **Swagger UI Documentation**
  - `/api/doc` - Primary documentation endpoint
  - `/api/doc/` - Tail-slash compatible version
  - `/api/docs` - Alternative alias for team familiarity
  - `/api/docs/` - Tail-slash compatible version

- **ReDoc Documentation**
  - `/api/redoc` - Alternative documentation format

- **OpenAPI Schema**
  - `/api/openapi.json` - Direct access to OpenAPI specification

### Integrated Security Schemes
The OpenAPI schema now includes integrated security schemes supporting both authentication methods:

- **Bearer Token Authentication**
  - Type: HTTP Bearer
  - Scheme: bearer
  - Format: JWT
  - Header: Authorization: Bearer <access_token>

- **Cookie Authentication**
  - Type: API Key
  - In: cookie
  - Name: access_token
  - HttpOnly: true
  - Secure: false (should be true in production)

### Documentation Features
- **Consistent Interface**: All endpoints serve the same OpenAPI schema
- **Team Compatibility**: Multiple naming conventions to match different development teams
- **Tail-Slash Support**: Both versions work regardless of trailing slash
- **Standardized Titles**: Uses application configuration for consistent naming
- **Integrated Security**: Dual authentication methods documented in schema

### Usage Examples
```bash
# Primary documentation
curl -X GET "{{baseUrl}}/api/doc"

# Alternative alias
curl -X GET "{{baseUrl}}/api/docs"

# Redoc alternative
curl -X GET "{{baseUrl}}/api/redoc"

# Direct schema access
curl -X GET "{{baseUrl}}/api/openapi.json"
```

**Section sources**
- [main.py:216-264](file://backend/main.py#L216-L264)
- [main.py:299-325](file://backend/main.py#L299-L325)
- [main.py:308-320](file://backend/main.py#L308-L320)

## Enhanced Error Handling
**New** The application now provides unified error response format with request_id for improved debugging and audit trails.

### Unified Error Response Structure
All error responses follow a standardized format:

```json
{
  "code": 422,
  "message": "Validation failed",
  "data": { "errors": [] },
  "request_id": "uuid",
  "detail": "Validation failed"
}
```

### Error Response Fields
- **code**: HTTP status code as integer
- **message**: Human-readable error message
- **data**: Additional error details (validation errors, etc.)
- **request_id**: Unique identifier for request tracing
- **detail**: Backward compatibility field for older clients

### Request ID Middleware
The application automatically handles request_id through middleware:

- **Generation**: Automatically generates UUID if not provided
- **Propagation**: Reads X-Request-ID header if present
- - **Response**: Returns X-Request-ID in response headers
- **Logging**: Used for consistent error identification

### Exception Handlers
The application includes three global exception handlers:

1. **HTTP Exceptions** (`StarletteHTTPException`)
   - Handles HTTP 4xx errors
   - Returns standardized error format

2. **Validation Exceptions** (`RequestValidationError`)
   - Parses validation errors into structured format
   - Extracts field names and error messages

3. **Unhandled Exceptions** (`Exception`)
   - Catches unexpected server errors
   - Logs exceptions for debugging

### Error Response Examples

#### Validation Error Response
```json
{
  "code": 422,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "email",
        "message": "Invalid email address",
        "type": "value_error"
      }
    ]
  },
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "detail": "Validation failed"
}
```

#### HTTP Error Response
```json
{
  "code": 404,
  "message": "Not found",
  "data": null,
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "detail": "Not found"
}
```

#### Internal Server Error Response
```json
{
  "code": 500,
  "message": "Internal server error",
  "data": null,
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "detail": "Internal server error"
}
```

### Request ID Usage
Include request_id in client-side error reporting:

```bash
# Include custom request ID header
curl -H "X-Request-ID: custom-request-id-123" "{{baseUrl}}/api/v1/auth/register"

# Response will include X-Request-ID header
curl "{{baseUrl}}/api/v1/auth/register" | jq .request_id
```

**Section sources**
- [main.py:90-152](file://backend/main.py#L90-L152)

## Detailed Component Analysis

### Authentication Endpoints
All endpoints under /api/v1/auth require no authentication for registration/login code sending and verification; subsequent actions (register, login, reset, logout, profile) require a valid bearer token or cookie. The system now supports dual authentication methods.

- Base URL: /api/v1/auth
- Authentication: Bearer token or Cookie for protected endpoints; none for code send/verify
- Rate limiting: Verification code send is limited to a fixed number per 5 minutes per email/type.
- **Error Handling**: All endpoints now return standardized error responses with request_id.
- **Dual Authentication**: Supports both Authorization header and httpOnly cookie methods.

Endpoints:
- POST /register/send-code
  - Request: SendCodeRequest (email, optional type="register", captcha_token, captcha_x, captcha_duration)
  - Response: {success, message}
  - Validation: type must be "register" if provided; captcha verification required
  - Errors: 400 Bad Request (invalid type), 429 Too Many Requests (rate limit), 400 Bad Request (other failures)
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/auth/register/send-code" \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","type":"register","captcha_token":"token","captcha_x":100,"captcha_duration":1000}'
    ```

- POST /register/verify
  - Request: VerifyCodeRequest (email, code, optional type="register")
  - Response: {success, message}
  - Validation: type must be "register" if provided
  - Errors: 400 Bad Request (invalid type or invalid/used/expired code)
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/auth/register/verify" \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","code":"123456","type":"register"}'
    ```

- POST /register
  - Request: RegisterRequest (email, code, password, optional username)
  - Response: TokenResponse (access_token, token_type, user)
  - Validation: code verified, email not taken
  - Side Effects: Sets httpOnly cookies (access_token, refresh_token)
  - Errors: 400 Bad Request (validation/code errors), 429 Too Many Requests (rate limit)
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/auth/register" \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","code":"123456","password":"SecurePass!123","username":"alice"}'
    ```

- POST /login/send-code
  - Request: SendCodeRequest (email, optional type="login")
  - Response: {success, message}
  - Validation: type must be "login" if provided
  - Errors: 400 Bad Request (invalid type)
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/auth/login/send-code" \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","type":"login"}'
    ```

- POST /login
  - Request: LoginRequest (email, code)
  - Response: TokenResponse
  - Validation: code verified, user exists and active
  - Side Effects: Sets httpOnly cookies (access_token, refresh_token)
  - Errors: 400 Bad Request (invalid code or user issues)
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","code":"123456"}'
    ```

- POST /login/password
  - Request: PasswordLoginRequest (email, password)
  - Response: TokenResponse
  - Validation: user exists, password matches
  - Side Effects: Sets httpOnly cookies (access_token, refresh_token)
  - Errors: 400 Bad Request (invalid credentials)
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/auth/login/password" \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","password":"MyPassword123"}'
    ```

- POST /reset-password/send-code
  - Request: SendCodeRequest (email, optional type="reset")
  - Response: {success, message}
  - Validation: type must be "reset" if provided
  - Errors: 400 Bad Request (invalid type), 400 Bad Request (email not registered for reset)
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/auth/reset-password/send-code" \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","type":"reset"}'
    ```

- POST /reset-password
  - Request: ResetPasswordRequest (email, code, new_password)
  - Response: {success, message}
  - Validation: code verified, user exists
  - Errors: 400 Bad Request (invalid code or user issues)
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/auth/reset-password" \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","code":"123456","new_password":"NewPass!456"}'
    ```

- POST /logout
  - Request: none (requires bearer token or cookie)
  - Response: {success, message}
  - Side Effects: Clears httpOnly cookies
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/auth/logout" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- POST /refresh
  - Request: none (requires refresh_token cookie)
  - Response: TokenResponse (access_token, token_type, user)
  - Validation: refresh_token cookie valid and not expired
  - Side Effects: Updates access_token cookie, keeps refresh_token cookie
  - Errors: 401 Unauthorized (missing/invalid refresh token)
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/auth/refresh" \
      -H "Cookie: refresh_token={{refresh_token}}"
    ```

- GET /me
  - Request: none (requires bearer token or cookie)
  - Response: UserResponse
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/auth/me" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- GET /test-email
  - Request: email (query)
  - Response: {success, message}
  - Errors: 500 Internal Server Error (email failure)
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/auth/test-email?email=user@example.com"
    ```

Schemas:
- SendCodeRequest, VerifyCodeRequest, RegisterRequest, LoginRequest, PasswordLoginRequest, ResetPasswordRequest, TokenResponse, UserResponse

Validation rules:
- Email format validated; passwords minimum length; 6-character codes; optional type constrained to specific values; rate limiting on code sends; captcha verification required for code sending.

Rate limiting:
- Verification code send limited to a fixed number per 5 minutes per email/type.

Security:
- Access tokens created with HS256; expiration configurable; bearer token required for protected endpoints.
- HttpOnly cookies for browser-based authentication; refresh token for long-term sessions.

**Section sources**
- [auth.py:25-579](file://backend/app/api/v1/auth.py#L25-L579)
- [auth_schemas.py:10-96](file://backend/app/schemas/auth.py#L10-L96)
- [auth_service.py:19-340](file://backend/app/services/auth_service.py#L19-L340)
- [config.py:52-60](file://backend/app/core/config.py#L52-L60)
- [security.py:43-71](file://backend/app/core/security.py#L43-L71)
- [deps.py:18-66](file://backend/app/core/deps.py#L18-L66)

### Diary Management Endpoints
- Base URL: /api/v1/diaries
- Authentication: Bearer token or Cookie required
- Image uploads served from /uploads
- **Error Handling**: All endpoints now return standardized error responses with request_id.

Endpoints:
- POST /
  - Description: Create a new diary
  - Request: DiaryCreate
  - Response: DiaryResponse
  - Validation: content required; defaults for date; emotion_tags, importance_score range
  - Side effects: Upserts timeline event; schedules AI refinement
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/diaries/" \
      -H "Authorization: Bearer {{access_token}}" \
      -H "Content-Type: application/json" \
      -d '{"title":"Meeting","content":"Had a productive meeting.","diary_date":"2025-06-01","emotion_tags":["happy"],"importance_score":7,"images":[]}'
    ```

- GET /
  - Description: List diaries with pagination and filters
  - Query: page (>=1), page_size (1-100), start_date, end_date, emotion_tag
  - Response: DiaryListResponse
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/diaries/?page=1&page_size=20&start_date=2025-06-01&end_date=2025-06-30&emotion_tag=happy" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- GET /{diary_id}
  - Description: Get diary by ID
  - Path: diary_id
  - Response: DiaryResponse
  - Errors: 404 Not Found if not exists
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/diaries/123" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- PUT /{diary_id}
  - Description: Update diary
  - Path: diary_id
  - Request: DiaryUpdate
  - Response: DiaryResponse
  - Errors: 404 Not Found if not exists
  - Example curl:
    ```bash
    curl -X PUT "{{baseUrl}}/api/v1/diaries/123" \
      -H "Authorization: Bearer {{access_token}}" \
      -H "Content-Type: application/json" \
      -d '{"content":"Updated content","importance_score":8}'
    ```

- DELETE /{diary_id}
  - Description: Delete diary
  - Path: diary_id
  - Response: {success, message}
  - Errors: 404 Not Found if not exists
  - Example curl:
    ```bash
    curl -X DELETE "{{baseUrl}}/api/v1/diaries/123" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- GET /date/{target_date}
  - Description: Get all diaries for a specific date
  - Path: target_date (YYYY-MM-DD)
  - Response: List[DiaryResponse]
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/diaries/date/2025-06-01" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- POST /upload-image
  - Description: Upload a diary image
  - Form: file (multipart)
  - Validation: image/jpeg, png, gif, webp; max 10MB
  - Response: {url}
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/diaries/upload-image" \
      -H "Authorization: Bearer {{access_token}}" \
      -F "file=@/path/to/image.jpg"
    ```

- GET /timeline/recent
  - Description: Recent timeline events (last N days)
  - Query: days (1-30)
  - Response: List[TimelineEventResponse]
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/diaries/timeline/recent?days=7" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- GET /timeline/range
  - Description: Timeline events in a date range
  - Query: start_date (required), end_date (optional), limit (1-500)
  - Response: List[TimelineEventResponse]
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/diaries/timeline/range?start_date=2025-06-01&end_date=2025-06-30&limit=100" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- GET /timeline/date/{target_date}
  - Description: Timeline events for a specific date
  - Path: target_date
  - Response: List[TimelineEventResponse]
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/diaries/timeline/date/2025-06-01" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- POST /timeline/rebuild
  - Description: Rebuild timeline events for a period (idempotent)
  - Query: days (7-3650)
  - Response: {success, message, stats}
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/diaries/timeline/rebuild?days=180" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- GET /timeline/terrain
  - Description: Emotion terrain data (aggregated energy, valence, density)
  - Query: days (7-365)
  - Response: Aggregated terrain metrics
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/diaries/timeline/terrain?days=30" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- GET /growth/daily-insight
  - Description: Daily growth insight (first generates, then caches)
  - Query: target_date
  - Response: Insight object (date, primary_emotion, summary, has_content, cached, source)
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/diaries/growth/daily-insight?target_date=2025-06-01" \
      -H "Authorization: Bearer {{access_token}}"
    ```

Schemas:
- DiaryCreate, DiaryUpdate, DiaryResponse, DiaryListResponse, TimelineEventCreate, TimelineEventResponse

Validation rules:
- Content required and trimmed; date defaults to today if omitted; importance_score 1-10; emotion_tags list; pagination bounds; image upload constraints.

**Section sources**
- [diaries.py:55-501](file://backend/app/api/v1/diaries.py#L55-L501)
- [diary_schemas.py:9-101](file://backend/app/schemas/diary.py#L9-L101)
- [diary_service.py:69-637](file://backend/app/services/diary_service.py#L69-L637)

### AI Analysis Endpoints
- Base URL: /api/v1/ai
- Authentication: Bearer token or Cookie required
- Background tasks supported for async execution
- **Error Handling**: All endpoints now return standardized error responses with request_id.

Endpoints:
- POST /generate-title
  - Description: Generate a concise Chinese title for diary content
  - Request: TitleSuggestionRequest (content, optional current_title)
  - Response: TitleSuggestionResponse (title)
  - Validation: content minimum length
  - Errors: 400 Bad Request (too short), 500 Internal Server Error (generation failure)
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/ai/generate-title" \
      -H "Authorization: Bearer {{access_token}}" \
      -H "Content-Type: application/json" \
      -d '{"content":"Today was a good day...","current_title":"Old Title"}'
    ```

- GET /daily-guidance
  - Description: Get a personalized daily writing prompt based on recent entries
  - Response: DailyGuidanceResponse (question, source, metadata)
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/ai/daily-guidance" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- GET /social-style-samples
  - Description: Retrieve user's social media style samples
  - Response: SocialStyleSamplesResponse (total, samples, metadata)
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/ai/social-style-samples" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- PUT /social-style-samples
  - Description: Upsert social style samples (merge or replace)
  - Request: SocialStyleSamplesRequest (samples, replace)
  - Response: SocialStyleSamplesResponse
  - Validation: samples normalized, min/max limits
  - Example curl:
    ```bash
    curl -X PUT "{{baseUrl}}/api/v1/ai/social-style-samples" \
      -H "Authorization: Bearer {{access_token}}" \
      -H "Content-Type: application/json" \
      -d '{"samples":["Sample 1","Sample 2"],"replace":true}'
    ```

- POST /comprehensive-analysis
  - Description: User-level comprehensive analysis using RAG
  - Request: ComprehensiveAnalysisRequest (window_days, max_diaries, optional focus)
  - Response: ComprehensiveAnalysisResponse (summary, key_themes, emotion_trends, continuity_signals, turning_points, growth_suggestions, evidence, metadata)
  - Validation: window_days and max_diaries bounds
  - Errors: 400 Bad Request (no content), 500 Internal Server Error (analysis failure)
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/ai/comprehensive-analysis" \
      -H "Authorization: Bearer {{access_token}}" \
      -H "Content-Type: application/json" \
      -d '{"window_days":90,"max_diaries":120,"focus":"relationships"}'
    ```

- POST /analyze
  - Description: Integrated user-level analysis (async-friendly)
  - Request: AnalysisRequest (diary_id optional, window_days, max_diaries)
  - Response: AnalysisResponse (diary_id, user_id, timeline_event, satir_analysis, therapeutic_response, social_posts, metadata)
  - Validation: window bounds; fallback to recent entries if empty
  - Errors: 404 Not Found (missing anchor), 400 Bad Request (no content), 500 Internal Server Error (failure)
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/ai/analyze" \
      -H "Authorization: Bearer {{access_token}}" \
      -H "Content-Type: application/json" \
      -d '{"diary_id":123,"window_days":30,"max_diaries":40}'
    ```

- POST /analyze-async
  - Description: Async wrapper (currently synchronous)
  - Request: AnalysisRequest
  - Response: Same as /analyze
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/ai/analyze-async" \
      -H "Authorization: Bearer {{access_token}}" \
      -H "Content-Type: application/json" \
      -d '{"window_days":30,"max_diaries":40}'
    ```

- GET /analyses
  - Description: List recent saved analysis records
  - Response: {analyses: [...], total}
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/ai/analyses" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- GET /result/{diary_id}
  - Description: Retrieve last saved analysis for a specific diary
  - Path: diary_id
  - Response: AnalysisResponse
  - Errors: 404 Not Found (no saved result)
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/ai/result/123" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- POST /satir-analysis
  - Description: Simplified Saatir Iceberg analysis (placeholder)
  - Request: AnalysisRequest
  - Response: Partial analysis object
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/ai/satir-analysis" \
      -H "Authorization: Bearer {{access_token}}" \
      -H "Content-Type: application/json" \
      -d '{"diary_id":123}'
    ```

- POST /social-posts
  - Description: Generate social media posts based on analysis context
  - Request: AnalysisRequest
  - Response: Generated posts (placeholder)
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/ai/social-posts" \
      -H "Authorization: Bearer {{access_token}}" \
      -H "Content-Type: application/json" \
      -d '{"diary_id":123}'
    ```

Schemas:
- AnalysisRequest, ComprehensiveAnalysisRequest, ComprehensiveAnalysisResponse, DailyGuidanceResponse, SocialStyleSamplesRequest, SocialStyleSamplesResponse, TitleSuggestionRequest, TitleSuggestionResponse, AnalysisResponse

Validation rules:
- Window and count bounds; content length checks; JSON parsing helpers for LLM outputs.

**Section sources**
- [ai.py:83-902](file://backend/app/api/v1/ai.py#L83-L902)
- [ai_schemas.py:9-108](file://backend/app/schemas/ai.py#L9-L108)

### Community Endpoints
- Base URL: /api/v1/community
- Authentication: Bearer token or Cookie required
- Image uploads served from /uploads
- **Error Handling**: All endpoints now return standardized error responses with request_id.

Endpoints:
- GET /circles
  - Description: List all emotion circles with post counts
  - Response: List[CircleInfo]
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/community/circles" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- POST /posts
  - Description: Create a post (supports anonymous)
  - Request: PostCreate (circle_id, content, images, is_anonymous)
  - Response: PostResponse
  - Validation: content length; images array
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/community/posts" \
      -H "Authorization: Bearer {{access_token}}" \
      -H "Content-Type: application/json" \
      -d '{"circle_id":"anxiety","content":"Hello world","images":[],"is_anonymous":false}'
    ```

- GET /posts
  - Description: List posts (paginated, filterable by circle)
  - Query: circle_id (optional), page (>=1), page_size (1-50)
  - Response: PostListResponse
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/community/posts?page=1&page_size=20&circle_id=anxiety" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- GET /posts/mine
  - Description: List current user's posts
  - Query: page, page_size
  - Response: PostListResponse
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/community/posts/mine?page=1&page_size=20" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- GET /posts/{post_id}
  - Description: Get post detail and record view
  - Path: post_id
  - Response: PostResponse
  - Errors: 404 Not Found
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/community/posts/123" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- PUT /posts/{post_id}
  - Description: Update post (anonymous posts cannot be edited)
  - Path: post_id
  - Request: PostUpdate
  - Response: PostResponse
  - Errors: 404 Not Found or permission denied
  - Example curl:
    ```bash
    curl -X PUT "{{baseUrl}}/api/v1/community/posts/123" \
      -H "Authorization: Bearer {{access_token}}" \
      -H "Content-Type: application/json" \
      -d '{"content":"Updated content","images":[]}'
    ```

- DELETE /posts/{post_id}
  - Description: Delete post
  - Path: post_id
  - Response: {success, message}
  - Errors: 404 Not Found or permission denied
  - Example curl:
    ```bash
    curl -X DELETE "{{baseUrl}}/api/v1/community/posts/123" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- POST /upload-image
  - Description: Upload community image
  - Form: file (multipart)
  - Validation: image/jpeg, png, gif, webp; max 10MB
  - Response: {url}
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/community/upload-image" \
      -H "Authorization: Bearer {{access_token}}" \
      -F "file=@/path/to/image.png"
    ```

- POST /posts/{post_id}/comments
  - Description: Add a comment (supports anonymous)
  - Path: post_id
  - Request: CommentCreate
  - Response: CommentResponse
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/community/posts/123/comments" \
      -H "Authorization: Bearer {{access_token}}" \
      -H "Content-Type: application/json" \
      -d '{"content":"Great post!","parent_id":null,"is_anonymous":false}'
    ```

- GET /posts/{post_id}/comments
  - Description: List comments for a post
  - Path: post_id
  - Response: CommentListResponse
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/community/posts/123/comments" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- DELETE /comments/{comment_id}
  - Description: Delete own comment
  - Path: comment_id
  - Response: {success, message}
  - Errors: 404 Not Found or permission denied
  - Example curl:
    ```bash
    curl -X DELETE "{{baseUrl}}/api/v1/community/comments/456" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- POST /posts/{post_id}/like
  - Description: Toggle like
  - Path: post_id
  - Response: {liked: bool}
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/community/posts/123/like" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- POST /posts/{post_id}/collect
  - Description: Toggle collection
  - Path: post_id
  - Response: {collected: bool}
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/community/posts/123/collect" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- GET /collections
  - Description: List collected posts
  - Query: page, page_size
  - Response: PostListResponse
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/community/collections?page=1&page_size=20" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- GET /history
  - Description: List view history (deduplicated)
  - Query: page, page_size
  - Response: ViewHistoryResponse
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/community/history?page=1&page_size=20" \
      -H "Authorization: Bearer {{access_token}}"
    ```

Schemas:
- PostCreate, PostUpdate, PostResponse, PostListResponse, CommentCreate, CommentResponse, CommentListResponse, CircleInfo, ViewHistoryItem, ViewHistoryResponse

Validation rules:
- Content lengths; anonymous restrictions; pagination bounds; image constraints.

**Section sources**
- [community.py:39-324](file://backend/app/api/v1/community.py#L39-L324)
- [community_schemas.py:12-124](file://backend/app/schemas/community.py#L12-L124)

### User Management Endpoints
- Base URL: /api/v1/users
- Authentication: Bearer token or Cookie required
- **Error Handling**: All endpoints now return standardized error responses with request_id.

Endpoints:
- GET /profile
  - Description: Get current user profile
  - Response: UserResponse
  - Example curl:
    ```bash
    curl -X GET "{{baseUrl}}/api/v1/users/profile" \
      -H "Authorization: Bearer {{access_token}}"
    ```

- PUT /profile
  - Description: Update profile (username, MBTI, social_style, current_state, catchphrases)
  - Request: ProfileUpdateRequest
  - Response: UserResponse
  - Example curl:
    ```bash
    curl -X PUT "{{baseUrl}}/api/v1/users/profile" \
      -H "Authorization: Bearer {{access_token}}" \
      -H "Content-Type: application/json" \
      -d '{"username":"alice","social_style":"direct","current_state":"focused"}'
    ```

- POST /avatar
  - Description: Upload avatar
  - Form: file (multipart)
  - Validation: image/jpeg, png, gif, webp; max 2MB; deletes old avatar
  - Response: UserResponse
  - Example curl:
    ```bash
    curl -X POST "{{baseUrl}}/api/v1/users/avatar" \
      -H "Authorization: Bearer {{access_token}}" \
      -F "file=@/path/to/avatar.png"
    ```

Schemas:
- UserResponse, ProfileUpdateRequest

**Section sources**
- [users.py:20-103](file://backend/app/api/v1/users.py#L20-L103)
- [auth_schemas.py:58-84](file://backend/app/schemas/auth.py#L58-L84)

## Dependency Analysis
Key runtime dependencies and relationships among components with enhanced error handling and dual authentication support.

```mermaid
graph TB
AuthAPI["auth.py"] --> AuthService["auth_service.py"]
AuthAPI --> Security["security.py"]
AuthAPI --> Deps["deps.py (HTTPBearer, get_current_active_user)"]
DiariesAPI["diaries.py"] --> DiaryService["diary_service.py"]
DiariesAPI --> TimelineService["diary_service.py (TimelineService)"]
AIAPI["ai.py"] --> AgentOrchestrator["agents/orchestrator.py"]
AIAPI --> RagService["services/rag_service.py"]
CommunityAPI["community.py"] --> CommunityService["services/community_service.py"]
UsersAPI["users.py"] --> User["models/database.py (User)"]
AllAPIs["All APIs"] --> Config["config.py (Settings)"]
MainApp["main.py"] --> ErrorHandlers["Global Error Handlers"]
MainApp --> RequestIdMW["RequestIdMiddleware"]
MainApp --> SecurityHeaders["SecurityHeadersMiddleware"]
MainApp --> SuccessEnvelope["SuccessEnvelopeMiddleware"]
MainApp --> OpenAPISchema["Custom OpenAPI Schema"]
MainApp --> MetaEndpoints["Meta Endpoints (Auth Guide, Error Codes, Examples)"]
```

**Diagram sources**
- [auth.py:18-20](file://backend/app/api/v1/auth.py#L18-L20)
- [diaries.py:23-27](file://backend/app/api/v1/diaries.py#L23-L27)
- [ai.py:22-29](file://backend/app/api/v1/ai.py#L22-L29)
- [community.py:16](file://backend/app/api/v1/community.py#L16)
- [users.py:11](file://backend/app/api/v1/users.py#L11)
- [deps.py:18-66](file://backend/app/core/deps.py#L18-L66)
- [config.py:10-105](file://backend/app/core/config.py#L10-L105)
- [main.py:90-156](file://backend/main.py#L90-L156)
- [main.py:299-325](file://backend/main.py#L299-L325)
- [main.py:373-421](file://backend/main.py#L373-L421)

**Section sources**
- [auth.py:18-20](file://backend/app/api/v1/auth.py#L18-L20)
- [diaries.py:23-27](file://backend/app/api/v1/diaries.py#L23-L27)
- [ai.py:22-29](file://backend/app/api/v1/ai.py#L22-L29)
- [community.py:16](file://backend/app/api/v1/community.py#L16)
- [users.py:11](file://backend/app/api/v1/users.py#L11)
- [deps.py:18-66](file://backend/app/core/deps.py#L18-L66)
- [config.py:10-105](file://backend/app/core/config.py#L10-L105)
- [main.py:90-156](file://backend/main.py#L90-L156)
- [main.py:299-325](file://backend/main.py#L299-L325)
- [main.py:373-421](file://backend/main.py#L373-L421)

## Performance Considerations
- Pagination: Use page/page_size consistently across list endpoints to avoid large payloads.
- Limits: Respect endpoint-specific limits (e.g., timeline range limit, image sizes).
- Asynchronous AI refinement: Time-axis AI refinement runs in background; do not block on it.
- Caching: Growth daily insight is cached after first generation; reuse cached results.
- RAG retrieval: Comprehensive analysis deduplicates evidence and caps chunk counts; tune window_days and max_diaries accordingly.
- **Error Handling**: Standardized error responses reduce client-side error processing overhead.
- **Request ID**: Enables efficient correlation of logs across distributed systems.
- **Cookie Authentication**: HttpOnly cookies improve security and reduce client-side complexity.

## Troubleshooting Guide
**Updated** Enhanced troubleshooting guide with new error response format, dual authentication methods, and meta endpoints.

### Common Errors and Resolutions
- **400 Bad Request**
  - Invalid parameters or validation failures (e.g., short content, wrong type, missing fields).
  - Example: Registration code type mismatch, invalid social samples, insufficient content length.
  - **New**: Check `data.errors` array for field-specific validation details.

- **401 Unauthorized**
  - Missing or invalid bearer token; token decoding fails; missing refresh token for refresh endpoint.
  - Resolution: Re-authenticate and obtain a new token; ensure cookie is accessible to browser.

- **403 Forbidden**
  - User disabled or inactive.

- **404 Not Found**
  - Resource does not exist (e.g., diary, post, analysis result).
  - **New**: Use `request_id` to trace the specific request in server logs.

- **429 Too Many Requests**
  - Exceeded verification code send rate limit.

- **500 Internal Server Error**
  - LLM generation failures, email sending failures, or internal processing errors.
  - **New**: Include `request_id` when reporting issues to support team.

### Error Response Analysis
When encountering errors, analyze the standardized response format:

```json
{
  "code": 422,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "email",
        "message": "Invalid email address",
        "type": "value_error"
      }
    ]
  },
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "detail": "Validation failed"
}
```

### Request ID Debugging
Use request_id for efficient debugging:

```bash
# Capture request_id from response
curl -i "{{baseUrl}}/api/v1/auth/register" -d '{}' | grep "X-Request-ID"

# Include custom request ID header for correlation
curl -H "X-Request-ID: user-session-123" "{{baseUrl}}/api/v1/auth/register"

# Report issues with request_id
echo "Error occurred during request: 550e8400-e29b-41d4-a716-446655440000"
```

### Authentication Troubleshooting
**New** Dual authentication method support:

- **Bearer Token Method**
  ```bash
  curl -H "Authorization: Bearer {{access_token}}" "{{baseUrl}}/api/v1/auth/me"
  ```

- **Cookie Method**
  ```bash
  curl -H "Cookie: access_token={{access_token}}" "{{baseUrl}}/api/v1/auth/me"
  ```

- **Refresh Token Flow**
  ```bash
  # When receiving 401 Unauthorized
  curl -H "Cookie: refresh_token={{refresh_token}}" "{{baseUrl}}/api/v1/auth/refresh"
  # Then retry original request
  ```

### Documentation Access
Access API documentation for debugging:

```bash
# Swagger UI
curl "{{baseUrl}}/api/doc"

# Redoc alternative
curl "{{baseUrl}}/api/redoc"

# Direct schema
curl "{{baseUrl}}/api/openapi.json"

# Meta endpoints
curl "{{baseUrl}}/api/meta/auth-guide"
curl "{{baseUrl}}/api/meta/error-codes"
curl "{{baseUrl}}/api/meta/examples"
```

Rate limiting:
- Verification code send: capped per 5 minutes per email/type.

**Section sources**
- [auth.py:36-51](file://backend/app/api/v1/auth.py#L36-L51)
- [auth_service.py:36-51](file://backend/app/services/auth_service.py#L36-L51)
- [deps.py:35-64](file://backend/app/core/deps.py#L35-L64)
- [main.py:90-152](file://backend/main.py#L90-L152)

## Conclusion
The 映记 API provides a cohesive set of endpoints for authentication, diary management, AI-powered insights, community interaction, and user profile management. All protected endpoints require a valid bearer token or cookie. The application now includes standardized API documentation endpoints, comprehensive error handling with request_id support, dual authentication methods, and meta endpoints for enhanced developer experience.

Use the provided schemas and validation rules to construct robust requests, and leverage pagination and limits for efficient client-server interactions. The new standardized error response format ensures consistent error handling across all endpoints. The dual authentication methods (Bearer Token and Cookie) provide flexibility for different client types and deployment scenarios.

## Appendices

### Authentication Flow (Sequence)
```mermaid
sequenceDiagram
participant C as "Client"
participant Auth as "/api/v1/auth"
participant Svc as "AuthService"
participant DB as "Database"
participant JWT as "JWT"
C->>Auth : POST /api/v1/auth/register/send-code
Auth->>Svc : send_verification_code
Svc->>DB : insert pending code
Svc->>Svc : send email
Svc->>DB : commit or rollback
Auth-->>C : {success,message}
C->>Auth : POST /api/v1/auth/register
Auth->>Svc : register
Svc->>DB : verify code, create user
Svc-->>Auth : user
Auth->>JWT : create_access_token + refresh_token
Auth->>Auth : set httpOnly cookies
Auth-->>C : {access_token,user,...}
Note over C,Auth : Error responses now include request_id
```

**Diagram sources**
- [auth.py:25-125](file://backend/app/api/v1/auth.py#L25-L125)
- [auth_service.py:19-98](file://backend/app/services/auth_service.py#L19-L98)
- [main.py:108-152](file://backend/main.py#L108-L152)

### SDK Usage Patterns
- Set Authorization header to "Bearer {{access_token}}" for Bearer Token method.
- For Cookie method, ensure cookies are accessible to browser and include Cookie header.
- For multipart uploads (images), use form-data with key "file".
- For JSON bodies, set Content-Type to application/json.
- Handle pagination by reading total, total_pages, and page_size from list responses.
- **New**: Include X-Request-ID header for request correlation.
- **New**: Parse standardized error responses with request_id for debugging.
- **New**: Use refresh_token cookie for automatic token refresh flow.

### API Documentation Access
- **Primary**: `{{baseUrl}}/api/doc` - Swagger UI documentation with integrated security schemes
- **Alternative**: `{{baseUrl}}/api/docs` - Alternative documentation interface
- **Redoc**: `{{baseUrl}}/api/redoc` - Alternative documentation format
- **Schema**: `{{baseUrl}}/api/openapi.json` - Direct OpenAPI specification with dual authentication support
- **Meta Endpoints**: 
  - `{{baseUrl}}/api/meta/auth-guide` - Authentication guide with dual methods
  - `{{baseUrl}}/api/meta/error-codes` - Error code reference
  - `{{baseUrl}}/api/meta/examples` - Practical examples

### Error Response Format Reference
```json
{
  "code": 422,
  "message": "Validation failed",
  "data": { "errors": [] },
  "request_id": "uuid",
  "detail": "Validation failed"
}
```

### Dual Authentication Methods
**New** Both authentication methods are supported:

- **Bearer Token**: `Authorization: Bearer <access_token>`
- **Cookie**: `access_token` httpOnly cookie (recommended for browsers)

**Section sources**
- [main.py:373-421](file://backend/main.py#L373-L421)
- [main.py:299-325](file://backend/main.py#L299-L325)
- [auth.py:36-579](file://backend/app/api/v1/auth.py#L36-L579)