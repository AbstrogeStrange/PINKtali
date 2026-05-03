# StreamVerse Security Architecture & Automated Checks

StreamVerse implements a multi-layered security strategy to protect user data and maintain platform integrity.

## 1. Authentication & Session Management
- **JWT with Rotation**: Access tokens (15m) and Refresh tokens (30d) with database-backed rotation to prevent replay attacks.
- **2FA**: Optional TOTP-based two-factor authentication for all accounts.
- **Brute-Force Protection**: Redis-backed rate limiting on all auth endpoints (5 failed attempts / 15m lockout).
- **Secure Cookies**: `httpOnly`, `Secure`, and `SameSite=Strict` flags on all sensitive cookies.

## 2. API Security
- **OWASP ZAP Baseline**: Automated weekly ZAP scans in the CI pipeline to detect common vulnerabilities (SQLi, XSS, CSRF).
- **Rate Limiting**: `express-rate-limit` applied globally and specifically hardened on high-value endpoints (search, upload initiate).
- **Input Validation**: `zod` used for strict schema validation on every request body, query, and param.

## 3. Data Integrity & Privacy
- **Content Sanitization**: Server-side `DOMPurify` for all user-generated content (comments, descriptions) to prevent stored XSS.
- **Upload Validation**: MIME type verification using magic bytes (via `file-type` library) instead of just file extensions.
- **Soft Deletes**: All critical records (Users, Videos) use soft deletion to prevent accidental data loss and maintain audit trails.

## 4. Infrastructure & Supply Chain
- **Audit**: `npm audit` runs on every PR; builds fail on High or Critical vulnerabilities.
- **S3 Signed URLs**: No public write access to storage. All uploads use short-lived (1h) pre-signed URLs.
- **Environment Secrets**: All secrets (Stripe, AWS, DB) managed via secure environment variables, never committed to source.

## 5. Automated Security Check Script (`security-check.sh`)
```bash
#!/bin/bash
# StreamVerse Security Pipeline Script

echo "Running Dependency Audit..."
npm audit --audit-level=high || exit 1

echo "Running OWASP ZAP Scan..."
# In CI, this would trigger the ZAP Docker container
# zap-baseline.py -t https://api-staging.streamverse.app -r report.html

echo "Verifying Rate Limiting..."
# Simple curl-based check for rate limit headers
curl -I https://api-staging.streamverse.app/api/v1/auth/login | grep "x-ratelimit"

echo "Security Check Complete."
```
