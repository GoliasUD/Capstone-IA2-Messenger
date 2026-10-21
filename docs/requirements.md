# Messenger Requirements Engineering Specifications

# System Context

### Overview & System Boundary

The **Messenger** application is a campus-tailored real-time messaging system designed to replace fragmented communication channels for University of Dayton (UD) students and campus organizations. The system boundary encompasses account authentication, session management, one-on-one private direct messaging, multi-user channel broadcasting, contact blocking, channel-owner blocking permissions, and delivery telemetry.

```
+-----------------------------------------------------------------------------------+
|                                  SYSTEM BOUNDARY                                  |
|                                                                                   |
|   +-------------------+    +----------------------+    +-----------------------+  |
|   |  User Auth &      |    | Private Direct       |    | Group Channel         |  |
|   |  Session Service  |    | Messaging Service    |    | Messaging Service     |  |
|   +-------------------+    +----------------------+    +-----------------------+  |
|             |                         |                            |              |
|   +-------------------+    +----------------------+    +-----------------------+  |
|   | Contact Blocking  |    | Message Ordering &   |    | Delivery Telemetry    |  |
|   | & Moderation      |    | Persistence Engine   |    | (Sent/Delivered/Read) |  |
|   +-------------------+    +----------------------+    +-----------------------+  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
         ^                                    ^                          ^
         |                                    |                          |
    +---------+                          +----------+            +---------------+
    | Student |                          |  Group   |            | UD Auth       |
    |  User   |                          | Admin    |            | Service (Sim) |
    +---------+                          +----------+            +---------------+
```

### Actors & External Systems

+ **Student User (Actor):** An authenticated end user who registers a profile, searches for verified campus peers via unique handles, transmits private direct messages, joins group channels, and manages a personal contact blocklist
* **Group Administrator / Creator (Actor):** A Student User with elevated permissions over a specific group channel, capable of inviting users, and removing members
* **Faculty Mentor / Evaluator (Actor):** System reviewer (Nick Stiffler) who provisions and verifies the system on a clean Debian Linux environment and executes automated test suites
* **UD Identity & Authentication Service (External System Interface / Simulation):** External or simulated campus identity provider supplying student identity verification and two-factor authentication tokens

---

# Functional Requirements

### User Authentication & Identity Management

+ **FR-01 (Account Registration & Profile Handling):** The system shall allow a user to register an account by providing a valid campus email, password, display name, and unique handle identifier
+ **FR-02 (Authentication & Session Tokens):** The system shall authenticate user credentials against stored secure password hashes and issue an active session token upon successful login
+ **FR-03 (Unauthorized Request Rejection):** The system shall reject all unauthenticated API or socket requests to messaging endpoints with an HTTP 401/403 or equivalent protocol disconnect error
+ **FR-04 (Session Termination):** The system shall invalidate active session tokens upon user logout or session expiration, preventing subsequent operations using the expired token

### Private Direct Messaging

+ **FR-05 (Private Direct Message Transmission):** The system shall allow an authenticated user to transmit a text message directly to another registered user given their unique handle identifier
+ **FR-06 (Real-Time DM Delivery):** The system shall push incoming direct messages in real time, subject to the latency specified by NFR-01, to the target recipient if an active client session exists
+ **FR-07 (DM History Persistence & Retrieval):** The system shall persist direct messages in non-volatile storage and allow authenticated participants to retrieve chronological conversation history upon client reconnection

### Group Channel Messaging

+ **FR-08 (Group Channel Creation):** The system shall allow any authenticated user to create a named group channel, automatically assigning that user as the channel Creator/Admin
+ **FR-09 (Member Invitation & Joining):** The system shall allow channel Admins to invite other authenticated users to a group channel by handle, updating the target user's active channel list
+ **FR-10 (Group Broadcast & Synchronous Fan-out):** The system shall broadcast any message submitted to a group channel to all connected, authorized members of that channel in real time
+ **FR-11 (Group Isolation Enforcment):** The system shall reject message read and write attempts from users who are not active members of the target group channel

### Contact Isolation & Moderation

+ **FR-12 (User Contact Blocking):** The system shall allow a user to add another user's handle to a personal blocklist
+ **FR-13 (Blocked Message Rejection):** The system shall automatically reject direct messages sent from a blocked user to the blocking user, without altering the blocking user's inbox or notifying the sender of the block state
+ **FR-14 (Administrative Member Removal):** The system shall allow a channel admin - the creator of the channel - to remove a member from a group channel, immediately revoking that member's access to subsequent channel broadcasts and history

### Message Metadata, Ordering, & Telemetry

+ **FR-15 (Monotonic Sequence Numbering):** The system shall assign a strictly increasing, gapless monotonic sequence number to every message generated within a conversation thread (DM or group channel)
+ **FR-16 (Timestamping):** The system shall attach an ISO-8601 UTC server timestamp to every message object upon receipt at the core application boundary
+ **FR-17 (Delivery & Read Receipts):** The system shall track and broadcast message telemetry states (`Sent`, `Delivered`, `Read`) to the message author as target clients receive and render the message. Group channel broadcasts shall return the read count per member of the channel.

---

# Non-Functional Requirements

### Performance & Scalability
+ **NFR-01 (Real-Time Propagation Latency):** For a test cluster of up to 5 concurrent active client sessions, 95% of transmitted messages shall be delivered to target clients in under 200 milliseconds over local network transport
+ **NFR-02 (Concurrent Connection Capacity):** The core application engine shall support at least 5 simultaneous active socket/HTTP client connections without message dropping or connection resets

### Reliability & Data Consistency
+ **NFR-03 (Monotonic Message Ordering Convergence):** All active client sessions participating in the same conversation thread shall converge on an identical, strictly monotonic message ordering matching the server sequence numbers
+ **NFR-04 (Persistence Integrity):** All sent messages, channel memberships, and blocklists shall be written to non-volatile storage prior to issuing delivery acknowledgments, ensuring data survives server restarts

### Security & Session Protection
+ **NFR-05 (Password Hashing):** The system shall store user credentials using a salted cryptographic hashing algorithm and shall never log or persist plaintext passwords
+ **NFR-06 (Session Authorization Isolation):** Session tokens shall be cryptographically random and verified on every message request to prevent session hijacking or user impersonation

### Portability & Deployment Constraints
+ **NFR-07 (Clean-Machine Debian Deployment):** The complete application, including dependencies and automated tests, shall build and run from a clean Debian Linux environment using standard documented terminal commands without manual code editing
+ **NFR-08 (Zero Paid Cloud Infrastructure):** The system shall run entirely on local host infrastructure (`localhost`) or open-source free-tier services, incurring zero commercial cloud hosting costs

### Testability & Software Quality
+ **NFR-09 (Automated Test Coverage):** The automated test suite (`tests/`) shall achieve a 100% pass rate and contain at least one automated test script validating every defined acceptance criterion

---

# Acceptance Criteria

### AC-01: User Registration, Auth, & Session Rejection (FR-01, FR-02, FR-03, FR-04)
+ **Given** a clean application database,
+ **When** a user submits registration details for handle `@ud_student1` and subsequently logs in with valid credentials,
+ **Then** the system issues an active session token, and any subsequent messaging request omitting this token is rejected with HTTP 401 Unauthorized

### AC-02: Private Direct Messaging & Telemetry (FR-05, FR-06, FR-07, FR-18)
+ **Given** two active, authenticated users (`User A` and `User B`) with connected clients,
+ **When** `User A` sends direct message `"Hello B!"` to `User B`,
+ **Then** `User B` receives `"Hello B!"` in real time, `User A`'s UI updates the message state from `Sent` to `Delivered`, and upon `User B` opening the view, `User A` observes state `Read`

### AC-03: Group Broadcasting & Monotonic Sequence Convergence (FR-08, FR-09, FR-10, FR-17, NFR-03)
+ **Given** a group channel containing three connected members (`User A`, `User B`, `User C`),
+ **When** `User A` and `User B` transmit messages nearly simultaneously,
+ **Then** the core application assigns strictly increasing sequence numbers `N` and `N+1`, and all three clients (`A`, `B`, `C`) render the messages in the exact same chronological sequence

### AC-04: User Contact Blocking Rejection (FR-12, FR-13)
+ **Given** `User A` has added `User B` (`@blocked_user`) to their contact blocklist,
+ **When** `User B` attempts to send a direct message to `User A`,
+ **Then** the system rejects the delivery at the server boundary, `User A`'s inbox receives zero notifications or updates, and no error leaks `User A`'s private block state to `User B`

### AC-05: Group Admin Removal & Access Revocation (FR-14, FR-15)
+ **Given** a group channel managed by Admin `User A` with member `User B`,
+ **When** `User A` executes `removeMember(User B)`,
+ **Then** `User B` is removed from channel state, subsequent broadcast messages are no longer pushed to `User B`, and `User B`'s attempts to post to the channel are rejected

### AC-06: Clean Debian Machine Build Audit (NFR-07, NFR-08)
+ **Given** a fresh Debian Linux host meeting documented software runtime prerequisites,
+ **When** an evaluator executes `bash ./scripts/setup.sh` and `npm start` (or Python equivalent) following `README.md`,
+ **Then** the application initializes without errors, connects to local storage, and successfully passes all automated unit/integration tests

---

# Assumptions & Unresolved Questions

### Assumptions
1. **Host Environment:** Evaluators possess a standard Debian Linux virtual machine or bare-metal environment with terminal command-line access and internet connectivity for initial package fetching.
2. **Concurrent Load Ceiling:** The maximum concurrent active load during review testing will not exceed 5 simultaneous connected client sessions
3. **UD SSO Integration Scope:** Identity authentication will be simulated using local secure user account records with username and password

### Unresolved Questions & Decisions
+ **Question 1 (Offline Message Retention Window):** How long should undelivered messages persist for offline users?
    + *Resolution / Decision:* Messages shall persist with no Time To Live in local database storage (`D3 Message Store`) and persist for the life of the database
+ **Question 2 (Block Status Visibility):** Should a sender be explicitly informed that they have been blocked by the target user?
    + *Resolution / Decision:* To protect user privacy and prevent harassment escalation, the system shall return a generic delivery failure or silent drop indicator without disclosing the block status to the sender

### Conlficts & Ambiguities
| Risk / Ambiguity | Likelihood | Impact | Mitigation Strategy | Owner |
| :--- | :--- | :--- | :--- | :--- |
| **Race Conditions in Concurrent Fan-out:** Simultaneous group posts arrive out of order. | Medium | Medium | Enforce atomic server-side sequence numbering using a single thread or database transaction lock. | Developer |
| **Debian Dependency Mismatch:** Libraries fail to compile on clean Debian VM. | Low | High | Containerize dependencies or pin runtime versions in `package.json` / `requirements.txt`. | Developer |
| **UD 2FA Infrastructure Access:** Lack of production SSO credentials. | High | Medium | Implement simulated authentication module with domain validation. | Mentor / Dev |

---

# Traceability

| Requirement ID | SoW Scope | Analysis Model Element | Target Deliverable | Acceptance Criterion |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | SoW 3.1.1 | DFD Process 1.0 (Auth) | `D1 Documentation`, `D3 App` | AC-01 |
| **FR-02** | SoW 3.1.1 | DFD Process 1.0 (Auth) | `D3 Reviewable App` | AC-01 |
| **FR-03** | SoW 3.1.1 | DFD Process 1.0 (Auth) | `D3 Reviewable App`, `D4 Tests` | AC-01 |
| **FR-05** | SoW 3.1.2 | Use Case: `Send Private DM` | `D3 App`, `D4 Tests` | AC-02 |
| **FR-06** | SoW 3.1.2 | Sequence Diagram | `D3 App`, `D5 Verification` | AC-02 |
| **FR-07** | SoW 3.1.5 | DFD Store `D3 Message Store` | `D3 App`, `D4 Tests` | AC-02 |
| **FR-08** | SoW 3.1.3 | Use Case: `Create Group` | `D3 App` | AC-03 |
| **FR-10** | SoW 3.1.3 | Use Case: `Broadcast Msg` | `D3 App`, `D4 Tests` | AC-03 |
| **FR-12** | SoW 3.1.4 | Use Case: `Block Contact` | `D3 App`, `D4 Tests` | AC-04 |
| **FR-13** | SoW 3.1.4 | Sequence Diagram / DFD 3.0 | `D3 App`, `D5 Verification` | AC-04 |
| **FR-14** | SoW 3.1.4 | Use Case: `Kick Member` | `D3 App`, `D4 Tests` | AC-05 |
| **FR-16** | SoW 3.1.5 | Sequence Diagram (seq=104) | `D3 App`, `D4 Tests` | AC-03 |
| **FR-18** | SoW 3.1.5 | Sequence Diagram (ACK) | `D3 App`, `D5 Verification` | AC-02 |
| **NFR-01** | SoW 3.1.5 | Sequence Diagram (Latency) | `D4 Tests`, `D5 Verification` | AC-02 |
| **NFR-03** | SoW 3.1.5 | Sequence Diagram | `D3 App`, `D4 Tests` | AC-03 |
| **NFR-07** | SoW 3.1.7 | Use Case: `Build Audit` | `D6 Reviewable Build` | AC-06 |
| **NFR-09** | SoW 3.1.7 | Test Suite Execution | `D4 Automated Test Suite` | AC-01 to AC-06 |