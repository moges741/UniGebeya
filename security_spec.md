# UNi GEBEYA Security Specification (Phase 0 TDD)

## Data Invariants
1. **Approval Gate Invariant**: A standard user can ONLY create a listing with `status == 'PENDING'`, `isFeatured == false`, `isDemo == false`, `approvedBy == ''`, and `rejectionReason == ''`.
2. **Public Visibility Invariant**: Unauthenticated visitors and non-owning users can ONLY read (`get` or `list`) listings where `status == 'APPROVED'`. Pending and rejected listings are strictly inaccessible to non-owners and non-admins.
3. **Anti-Self-Approval Invariant**: When an owner edits their own listing, `status` MUST remain or revert to `'PENDING'`. Only an administrator can transition `status` to `'APPROVED'` or `'REJECTED'`.
4. **Role Integrity Invariant**: Regular users creating a profile in `/users/{uid}` MUST set `role == 'USER'` and can never modify `role` on update.
5. **PII Isolation Invariant**: `/users/{uid}` contains `email` and `phone`. Only the profile owner (`uid == request.auth.uid`) or an administrator can read `/users/{uid}`. Non-admin `list` queries on `/users` are denied.
6. **Category Integrity Invariant**: Only administrators can create, update, or delete `/categories/{categoryId}`. Every newly created listing must reference an existing category document (`exists(/categories/{categoryId})`).
7. **Temporal & Immutability Invariant**: `createdAt` must equal `request.time` on creation and never change on update; `updatedAt` must equal `request.time` on every write; `userId` on listings is immutable.

## Dirty Dozen Attack Payloads (All MUST Return PERMISSION_DENIED)
1. **Self-Approved Listing Creation**: Regular user creates `/listings/l1` with `status: "APPROVED"`.
2. **Owner Self-Approval Update**: Regular user updates their `PENDING` listing `/listings/l1` to `status: "APPROVED"`.
3. **Unauthenticated Pending Read**: Visitor runs `get(/listings/pending_1)` or `list(/listings)` without `status == 'APPROVED'`.
4. **Cross-User Pending Snooping**: User B attempts `get(/listings/userA_pending)` or `list(/listings)` filtered by `userId == userA`.
5. **Self-Assigned Admin Role**: New user creates `/users/uidB` with `role: "ADMIN"`.
6. **Role Escalation Update**: Existing user updates `/users/uidB` changing `role` from `"USER"` to `"ADMIN"`.
7. **PII Scraping**: Authenticated User B attempts `get(/users/uidA)` or `list(/users)`.
8. **Shadow Field Injection**: Regular user creates or updates `/listings/l1` including an undeclared field `verifiedBadge: true`.
9. **Identity Spoofing**: User B creates `/listings/l2` with `userId: "uidA"`.
10. **Category Tampering**: Regular user attempts `create` or `delete` on `/categories/electronics`.
11. **Unverified Admin Email Spoofing**: Unverified account (`email_verified == false`) with admin email attempts to approve a listing.
12. **Resource Exhaustion / ID Poisoning**: User creates `/listings/../../../bad!id` or submits a 200KB `title` string or 10 images exceeding the array cap of 3.
