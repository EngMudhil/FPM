# Security Policy

## Supported versions

This project is in foundation phase. Security reporting applies to all branches under active development.

## Reporting a vulnerability

Do **not** open a public issue for security vulnerabilities.

Report privately to the project maintainers with:

* Description of the issue
* Steps to reproduce (if available)
* Potential impact
* Any suggested remediation

## Secrets

Never commit:

* Passwords
* API keys
* Tokens
* Database credentials
* Private certificates
* Production secrets
* `.env` files containing secrets

Development placeholders belong in `.env.example` only.

## Scope note

Detailed application threat modeling will live in `docs/security/` and will be authored during discovery — not invented during foundation setup.
