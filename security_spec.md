# Security Specification for FinFlow Ethiopia Firestore

## 1. Data Invariants
- Each user's data (accounts, transactions, receipts, cards, savings goals) is strictly isolated under `/users/{userId}`.
- Only the authenticated owner (`request.auth.uid == userId`) may read or write documents under their `/users/{userId}` subcollections.
- Transactions, receipts, and accounts must strictly belong to the authenticated owner.
- Balances and amounts must be non-negative numbers.
- Document IDs must conform to `^[a-zA-Z0-9_\\-]+$` and not exceed 128 characters.

## 2. The Dirty Dozen Payloads (Targeting Vulnerabilities)
1. **Unauthenticated Read**: Attempting to read `/users/user_abc/accounts/acc_1` without authentication -> DENIED.
2. **Cross-User Read**: User B reading User A's `/users/user_a/transactions/tx_1` -> DENIED.
3. **Cross-User Write**: User B creating an account under `/users/user_a/accounts/acc_2` -> DENIED.
4. **Junk-ID Injection**: Creating a document with ID containing `../` or 500 characters -> DENIED by `isValidId()`.
5. **Ghost Field Injection**: Adding an unauthorized field `isAdmin: true` into `UserProfile` or `UserAccount` -> DENIED.
6. **Negative Balance Creation**: Setting `balance: -5000` on an account -> DENIED.
7. **Cross-User List Query**: Attempting collection group query or blanket list without user scoping -> DENIED.
8. **Tampering with Owner ID**: Modifying `userId` or immutable created dates -> DENIED.
9. **Blanket Query Scraping**: Listing accounts of another user -> DENIED.
10. **Arbitrary Status Outcome Bypass**: Overwriting transaction state illegally -> DENIED.
11. **Denial of Wallet Payload**: Sending a 500KB string in `accountNo` or `bank` -> DENIED by size bounds.
12. **PII Blanket Leak**: Non-owner trying to query user phone or email in `/users/{userId}` -> DENIED.
