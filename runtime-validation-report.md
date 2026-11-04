# Runtime Validation Report

**Generated**: 2026-11-04
**Target**: `C:\Users\hp\OneDrive\Desktop\whimsea`

## Summary

| Step                    | Status  | Exit Code | Details                                                                         |
| ----------------------- | ------- | --------- | ------------------------------------------------------------------------------- |
| Startup/build           | PASS    | 0         | Production Vite build completed successfully                                    |
| Unit and contract tests | PASS    | 0         | 6 test files, 19 tests, all green                                               |
| Typecheck               | PASS    | 0         | `tsc -b`                                                                        |
| Lint                    | PASS    | 0         | Oxlint                                                                          |
| Formatting              | PASS    | 0         | Prettier check                                                                  |
| Dependency audit        | PASS    | 0         | `npm audit --audit-level=high`: 0 vulnerabilities                               |
| Browser smoke           | PARTIAL | n/a       | Existing desktop/mobile browser checks passed for storefront and content routes |

**Overall**: PASS locally; live Supabase behavior needs environment verification.

## Environment

- Docker: available; `docker info` responded using the `desktop-linux` context.
- Node.js: available; v24.10.0.
- Supabase: not configured locally, so no live database or Auth integration run was possible.

## Security Evidence

- SQL contract tests verify private order/customer data, admin-only status changes and image writes, authoritative server-side totals, duplicate-product rejection, approved image extensions, and absence of service-role secrets.
- Upload validation rejects unsupported MIME types, empty files, and files over 5 MiB.
- `npm audit --audit-level=high` reports zero vulnerabilities.

## Known Gaps

- Live RLS, Auth, storage policies, checkout RPC concurrency, stock locking, and cancellation restoration require a configured Supabase project and owner-approved test data.
- Local checks cannot inspect image bytes beyond the browser-provided MIME type and size; server-side content sniffing remains a residual risk.
