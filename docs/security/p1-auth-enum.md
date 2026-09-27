# P1 — Auth Enumeration Report

**Date:** 2026-02-27
**Severity:** P1 (High)
**Status:** ✅ FIXED
**Endpoint:** `POST /api/auth/check-user`

## Vulnerability

Unauthenticated user enumeration with explicit boolean response.

### Before Fix

```json
// Existing email
{ "exists": true, "confirmed": true, "canResetPassword": true }

// New email
{ "exists": false, "confirmed": false, "canResetPassword": false }