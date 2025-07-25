# Edge Cases Comprehensive Documentation
## Sistem Manajemen Umroh - All Edge Cases & Solutions

### Overview
This document consolidates all edge cases identified across modules, providing comprehensive handling strategies to ensure system robustness and reliability.

---

## 1. Authentication & User Management Edge Cases

### 1.1 Multiple Concurrent Logins
**Scenario:** User logs in from multiple devices simultaneously
**Solution:** 
- Allow multiple sessions per user
- Track each session separately
- Log device information and IP
- No automatic logout of other sessions

### 1.2 Role Change During Active Session
**Scenario:** Admin changes user roles while user is logged in
**Solution:**
- Roles cached in JWT remain valid until expiry
- User must re-login to get new permissions
- Critical actions re-validate permissions from database

### 1.3 Forgotten Username (Not Just Password)
**Scenario:** User forgets username, only remembers email/phone
**Solution:**
- Admin lookup by email/phone
- Manual verification process
- Admin provides username

### 1.4 Token Expiry During Long Operation
**Scenario:** Token expires while user uploading large file
**Solution:**
- Pre-flight token check for long operations
- Extend token for file uploads
- Save draft state before expiry

---

## 2. Jamaah Management Edge Cases

### 2.1 Duplicate NIK from Different Sources
**Scenario:** Same NIK registered via form and Excel import simultaneously
**Solution:**
- Database unique constraint
- Import process checks real-time
- Return clear error: "NIK already registered by [user] at [time]"

### 2.2 Non-WNI Without Valid ID
**Scenario:** Foreign national without standard ID documents
**Solution:**
- Allow passport as primary ID
- Flag in system as "non-standard"
- Manual verification required
- Additional document notes field

### 2.3 Age Category Changes During Process
**Scenario:** Child becomes adult between registration and departure
**Solution:**
- Calculate age at departure date
- Auto-update categories
- Alert if affects pricing
- Manual review required

### 2.4 Multiple Packages Same Person
**Scenario:** Jamaah registers for overlapping date packages
**Solution:**
- System warns but allows
- Check date overlap
- Require manual confirmation
- Note in both registrations

### 2.5 Name Mismatch Issues
**Scenario:** Name variations between documents (Ahmad vs Achmad)
**Solution:**
- Store passport name separately
- Allow aliases
- Flag for airline manifest
- Manual verification note

---

## 3. Package Management Edge Cases

### 3.1 PNR Capacity Reduction by Airline
**Scenario:** Airline reduces seats after package created
**Solution:**
- Allow capacity override
- Flag affected jamaah
- Priority reassignment workflow
- Notification system trigger

### 3.2 Package Created Too Close to Departure
**Scenario:** Package created with departure < 30 days
**Solution:**
- All thresholds triggered immediately
- Special "urgent" flag
- Dashboard priority display
- Shortened workflow options

### 3.3 Sub-Package Price Lower Than Base
**Scenario:** Admin sets sub-package price below base package
**Solution:**
- System allows with warning
- Requires reason/note
- Finance approval workflow
- Audit trail emphasis

### 3.4 Package Status Regression
**Scenario:** Need to reopen "closed" package
**Solution:**
- Manual override available
- Requires admin authorization
- Full audit logging
- Alert affected jamaah

---

## 4. Payment & Finance Edge Cases

### 4.1 Overpayment Handling
**Scenario:** Jamaah pays more than required amount
**Solution:**
- Auto-calculate overpayment
- Options: refund or credit
- Generate credit note
- Apply to next payment

### 4.2 Split Payment Sources
**Scenario:** Payment from multiple people for one jamaah
**Solution:**
- Link multiple payments to one jamaah
- Track each payer
- Combined invoice option
- Separate receipts available

### 4.3 Currency Rate Fluctuations
**Scenario:** USD package price changes affect IDR amount
**Solution:**
- Lock rate at booking
- Store rate used
- Manual adjustment option
- Clear documentation

### 4.4 Refund Exceeds Original Payment
**Scenario:** Refund calculation error or policy exception
**Solution:**
- System warning but allow
- Require double approval
- Document reason
- Finance audit flag

### 4.5 Payment Without Jamaah Assignment
**Scenario:** Payment received before jamaah selects package
**Solution:**
- Hold in "unassigned" pool
- Match by phone/name
- Manual assignment
- Aging report for unmatched

---

## 5. Document Management Edge Cases

### 5.1 Corrupted File Upload
**Scenario:** File corrupted during upload process
**Solution:**
- Client-side validation
- Server-side verification
- Retry mechanism
- Clear error message

### 5.2 Same Document Multiple Types
**Scenario:** User uploads passport as both ID and passport
**Solution:**
- Allow same file multiple roles
- Single storage, multiple references
- Clear labeling
- Space optimization

### 5.3 Document in Wrong Format
**Scenario:** HEIC photos, RAR archives uploaded
**Solution:**
- Auto-convert common formats
- Extract from archives
- Reject with clear message
- Suggest alternatives

### 5.4 Passport Expires During Trip
**Scenario:** Passport valid at booking but expires during travel
**Solution:**
- Check against return date
- Escalating warnings
- Block at critical threshold
- Override with documentation

---

## 6. Group Management Edge Cases

### 6.1 Last-Minute Group Mergers
**Scenario:** Two small groups need to merge day before departure
**Solution:**
- Bulk reassignment tool
- Preserve sub-group identity
- Update all manifests
- Notification to affected

### 6.2 VIP Requires Entire Bus
**Scenario:** Special request for exclusive transportation
**Solution:**
- Manual bus allocation
- Block other assignments
- Cost calculation override
- Clear marking in system

### 6.3 Family Split Across Multiple Buses
**Scenario:** Large family exceeds single bus capacity
**Solution:**
- System warns but allows
- Note in manifest
- Suggest adjacent buses
- Communication facilitated

### 6.4 No-Show Dominoes Effect
**Scenario:** Key person no-show affects family decision
**Solution:**
- Quick status update
- Cascade notification
- Hold departure briefly
- Document decisions

---

## 7. Import/Export Edge Cases

### 7.1 Excel File Too Large
**Scenario:** Import file with 10,000+ rows
**Solution:**
- Chunk processing
- Progress indicator
- Partial success allowed
- Background processing

### 7.2 Circular Reference in Data
**Scenario:** Mahram references create circular dependency
**Solution:**
- Two-pass processing
- Defer relationship creation
- Post-process validation
- Clear error reporting

### 7.3 Special Characters in Names
**Scenario:** Arabic names, special characters
**Solution:**
- UTF-8 enforcement
- Transliteration option
- Preserve original
- Export compatibility check

### 7.4 Version Mismatch Excel
**Scenario:** Old Excel format, macro-enabled files
**Solution:**
- Multiple parser support
- Convert to standard format
- Security scan for macros
- Alternative format suggestion

---

## 8. Hotel Management Edge Cases

### 8.1 Hotel Closes Unexpectedly
**Scenario:** Confirmed hotel goes out of business
**Solution:**
- Quick substitute workflow
- Bulk reassignment
- Equivalent category search
- Communication template

### 8.2 Room Type Not Available
**Scenario:** Promised room types unavailable on arrival
**Solution:**
- Downgrade compensation process
- Upgrade lucky draw system
- Document for insurance
- Guest relations protocol

### 8.3 Split Stay Requirements
**Scenario:** Medical needs require specific room features
**Solution:**
- Special request flags
- Multiple confirmation needed
- Direct hotel coordination
- Backup arrangements

---

## 9. Flight Management Edge Cases

### 9.1 Flight Cancellation Cascade
**Scenario:** First flight cancelled affects entire itinerary
**Solution:**
- Full rebooking workflow
- Alternative flight search
- Package modification allowed
- Force majeure documentation

### 9.2 Name Correction After Ticketing
**Scenario:** Spelling error discovered after ticket issued
**Solution:**
- Airline policy database
- Cost calculation
- Documentation requirements
- Timeline tracking

### 9.3 Medical Emergency Seat Changes
**Scenario:** Last-minute medical needs require specific seats
**Solution:**
- Priority override system
- Coordinate with airline
- Document medical needs
- Cost absorption rules

---

## 10. AI Marketing Edge Cases

### 10.1 AI Hallucination on Package Info
**Scenario:** AI provides incorrect package details
**Solution:**
- Strict data access only
- No creative responses
- Fallback to exact data
- Human takeover threshold

### 10.2 Spam/Abuse Detection
**Scenario:** Competitor or bot spamming system
**Solution:**
- Rate limiting per number
- Pattern detection
- Blacklist capability
- Manual review queue

### 10.3 Multiple Codes in One Message
**Scenario:** Customer sends multiple package codes
**Solution:**
- Process first valid only
- Inform about limitation
- Suggest separate queries
- Log for analysis

### 10.4 Language Mix Confusion
**Scenario:** Customer mixes languages (Indo/English/Arabic)
**Solution:**
- Primary language detection
- Consistent response language
- Fallback to Bahasa
- Human handover option

---

## 11. System-Wide Edge Cases

### 11.1 Database Connection Pool Exhaustion
**Scenario:** Too many concurrent users exhaust connections
**Solution:**
- Connection pooling limits
- Queue management
- Graceful degradation
- User-friendly errors

### 11.2 Storage Space Critical
**Scenario:** Document storage nearly full
**Solution:**
- Automated old file archival
- Compression triggers
- Admin alerts escalating
- Emergency space reserve

### 11.3 Timezone Confusion
**Scenario:** Users in different timezones see different dates
**Solution:**
- All times in WIB
- Clear timezone display
- No auto-conversion
- Manual note option

### 11.4 Network Partition During Transaction
**Scenario:** Network fails mid-transaction
**Solution:**
- Transaction staging
- Automatic retry
- Duplicate prevention
- Clear status messaging

### 11.5 Cascade Delete Prevention
**Scenario:** Deleting parent record would orphan children
**Solution:**
- Soft delete only
- Referential integrity checks
- Warning before action
- Undo capability

---

## 12. Performance Edge Cases

### 12.1 Report Generation Timeout
**Scenario:** Large report exceeds timeout limit
**Solution:**
- Background generation
- Email when ready
- Chunked delivery
- Cache results

### 12.2 Search Result Explosion
**Scenario:** Broad search returns thousands of results
**Solution:**
- Result limit (1000)
- Force refinement
- Pagination required
- Search suggestions

### 12.3 Concurrent Bulk Operations
**Scenario:** Multiple users doing bulk imports simultaneously
**Solution:**
- Queue system
- Priority based on size
- Progress visibility
- Resource allocation

---

## 13. Business Logic Edge Cases

### 13.1 Retroactive Price Changes
**Scenario:** Package price reduced after bookings made
**Solution:**
- Grandfather pricing
- Optional credit
- Clear communication
- Audit trail

### 13.2 Emergency Evacuation Procedures
**Scenario:** Political/health emergency requires return
**Solution:**
- Emergency workflow
- Bulk status update
- Insurance coordination
- Government liaison

### 13.3 Seasonal Regulation Changes
**Scenario:** Sudden visa/health requirement changes
**Solution:**
- Requirement versioning
- Affect analysis tools
- Bulk notification
- Compliance tracking

---

## 14. Integration Edge Cases

### 14.1 WhatsApp Service Disruption
**Scenario:** WhatsApp API down for extended period
**Solution:**
- Fallback to SMS
- Queue messages
- Alternative contact
- Status page

### 14.2 External API Rate Limits
**Scenario:** Hit rate limits on third-party services
**Solution:**
- Internal queuing
- Spread requests
- Cache responses
- Manual override

### 14.3 Webhook Replay Attacks
**Scenario:** Malicious webhook replay attempts
**Solution:**
- Timestamp validation
- Nonce tracking
- Signature verification
- Event deduplication

---

## General Edge Case Handling Principles

### 1. Graceful Degradation
- System remains usable even with failures
- Core functions prioritized
- Clear communication of limitations

### 2. Manual Override Capability
- Admin can override most restrictions
- Full audit trail required
- Reason documentation mandatory

### 3. Data Integrity First
- Never lose user data
- Validation before destruction
- Recovery mechanisms in place

### 4. User Communication
- Clear error messages
- Suggested next steps
- Contact information visible

### 5. Learning from Edge Cases
- Log all edge cases
- Regular review meetings
- System improvements based on frequency
- Documentation updates

---

## Testing Edge Cases

### Recommended Test Scenarios
1. Boundary conditions (0, 1, max, max+1)
2. Concurrent operations
3. Network failures mid-operation
4. Data type mismatches
5. Permission changes mid-session
6. Clock skew between systems
7. Character encoding issues
8. File size limits
9. Malformed data inputs
10. Service dependency failures

### Monitoring for Edge Cases
- Alert on unusual patterns
- Track error frequencies
- User feedback correlation
- Performance anomalies
- Data quality metrics

---

## Conclusion
These edge cases represent real-world scenarios encountered in umroh travel management. The solutions prioritize data integrity, user experience, and business continuity while maintaining system flexibility for unique situations that will inevitably arise.