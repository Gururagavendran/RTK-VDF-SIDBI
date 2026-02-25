

# Venture Debt - Registration Page

## Overview
Build a professional registration/signup page for the Venture Debt application with company-specific fields and Indian business validations.

## Registration Form Fields

1. **Email** — Text input with email format validation
2. **Password** — Password input with strength validation (min 8 chars, uppercase, lowercase, number, special character)
3. **Name of Applicant** — Text input, max 250 characters
4. **Registered Office** — Text input, max 250 characters
5. **Location of Existing Facilities** — Text input, max 250 characters
6. **Date of Incorporation** — Date picker (only past dates allowed)
7. **Date of Commencement of Business** — Date picker (only past dates allowed)
8. **PAN No.** — Text input with Indian PAN format validation (e.g., ABCDE1234F)
9. **GST No.** — Text input with Indian GST format validation (e.g., 22ABCDE1234F1Z5)
10. **MSME Status / Registration Details** — Dropdown with options: Micro, Small, Medium

## Design & Layout
- Clean, professional fintech-style form layout
- Centered card on the page with a clear "Register" heading
- Labels on the left, inputs on the right (responsive — stacks on mobile)
- Inline validation error messages below each field
- A prominent "Register" button at the bottom
- Link to login page ("Already have an account? Sign in")

## Validation
- All fields required
- Real-time client-side validation using Zod + React Hook Form
- PAN regex: `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/`
- GST regex: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`
- Date pickers restricted to past dates only

## Pages & Routing
- New `/register` route added to the app
- Registration page component at `src/pages/Register.tsx`

