# Analysis

This analysis explains what the Data Flow Diagram and Sequence Diagram (located at `docs/diagrams/`) show about Messenger as scoped in the current Statement of Work (SoW). Requirement IDs below use the stable identifiers in `docs/requirements.md`.

---

## 1. Data Flow Diagram

### Engineering question

Where does information enter Messenger, which processes transform or authorize it, where does it go, and what information must persist?

### Requirements represented

- Registration, authentication, sessions, and unauthorized-request rejection: **FR-01–FR-04**
- Private messaging, real-time delivery, and history retrieval: **FR-05–FR-07**
- Contact blocklists and blocked-message rejection: **FR-12–FR-13**
- Message numbering, timestamps, and receipt telemetry: **FR-16–FR-18**
- Persist-before-acknowledgement and delivery performance: **NFR-01**, **NFR-04**, **NFR-06**

### What the model reveals

The diagram separates user/client activity from four responsibilities: establishing accounts and sessions, processing direct messages, checking the recipient's blocklist, and persisting, dispatching, and updating message telemetry. Its data stores make the required persistent state visible: account/session data, block relationships, and message history with sequence, timestamp, and delivery/read state.

The authentication decision in the finalized requirements is a **local simulation**, not a live University of Dayton SSO integration. The registration/authentication process validates the campus email domain and checks locally stored password hashes. It issues a session token, which the messaging process validates on each request. The diagram therefore does not send credentials to a production UD identity provider.

For a direct message, the recipient's blocklist is checked before message persistence or delivery. A blocked message follows the generic failure/silent-drop behavior in FR-13 and the unresolved-question decision: it does not update the recipient's inbox or reveal the recipient's block state to the sender. If allowed, Messenger persists the message before delivery acknowledgement, assigns its sequence and UTC timestamp, and then dispatches it to an active recipient client.

The telemetry flow now distinguishes three states: **Sent** after acceptance/persistence, **Delivered** after the target receives the message, and **Read** after the target opens/renders it. Receipt updates are broadcast to the author, as required by FR-18 and AC-02. Offline messages remain persisted for later retrieval under the decision recorded for FR-07.

### Ambiguities and decisions exposed

1. **Authentication simulation:** the document resolves the earlier ambiguity: use local secure user records with campus-email validation; production UD LDAP/OAuth/2FA access is outside the baseline. Passwords must be salted hashes and must not be logged or persisted in plaintext (NFR-05).
2. **Block privacy:** the server must determine whether the recipient blocked the sender, but the response must not reveal that state. The exact generic error versus silent-drop presentation can remain an implementation choice so long as AC-04 is met.
3. **Receipt event definitions:** AC-02 establishes that Delivered follows receipt by the target and Read follows opening the message view. The sequence uses a receive acknowledgement for Delivered and a render/open event for Read.
4. **Persistence order:** message data must be durable before delivery acknowledgement (NFR-04). Sequence allocation and persistence should be atomic enough to preserve the gapless, monotonic sequence requirement (FR-16), especially during concurrent sends.
5. **Offline delivery:** the requirements decision says messages persist indefinitely until retrieved after client login. The diagram distinguishes persisted-but-not-yet-delivered messages from messages whose recipient has acknowledged receipt.

---

## 2. Sequence Diagram

### Engineering question

Who communicates with whom, in what order, and what happens when authentication or contact-blocking prevents a direct message from being delivered?

### Requirements represented

- Authenticated request and session validation: **FR-02–FR-04**, **NFR-06**
- Direct message transmission, real-time delivery, and history behavior: **FR-05–FR-07**
- Block rejection without disclosing block state: **FR-12–FR-13**
- Sequence, timestamps, and Sent/Delivered/Read telemetry: **FR-16–FR-18**
- Persistence and latency expectations: **NFR-01**, **NFR-04**
- Observable flow: **AC-02** and **AC-04**

### Scenario and behavior shown

The sequence models User B sending a private message to User A with a valid session. The API validates that session, checks whether User A has blocked User B, and follows one of two paths. If blocked, the API returns only a generic failure indicator or silently drops the message; it neither persists nor delivers the message and does not disclose the block state. If allowed, it stores the message with its sequence, ISO-8601 UTC timestamp, and Sent state before dispatching it.

When User A has an active session, the API pushes the message. User A's receive acknowledgement advances the status to Delivered. When User A opens/renders the message, the client emits a read event and Messenger advances the status to Read. Each state update is sent to User B. If User A is offline, the message remains persisted for later history retrieval and is not marked Delivered or Read.

### What the model makes visible

- Session authorization occurs before blocklist lookup or message handling.
- Blocklist evaluation must precede both message persistence and recipient notification.
- Persistence occurs before dispatch and acknowledgement, supporting NFR-04.
- Delivered and Read are separate events: receipt acknowledgement does not itself imply that the recipient has read the message.
- Offline persistence, active-session delivery, and receipt state are distinct behaviors.
- The latency target applies to real-time propagation under the stated test load; the diagram does not itself prove the NFR-01 measurement.

---

## 3. System boundary diagram question

The IA-03 instructions require the requirements document to identify the system boundary and major actors or external systems. They do not require that this context be drawn as a separate diagram. The finalized requirements document already includes a system-boundary diagram on page 1, so it provides useful context. The IA-04 Data Flow Diagram and Sequence Diagram remain separate required models under `docs/diagrams/`.

---

## 4. Consistency notes

The diagrams now follow the finalized requirements' local authentication simulation, privacy-preserving block rejection, offline message persistence, monotonic sequencing, UTC timestamps, and Sent/Delivered/Read receipt behavior. The sequence is intentionally a private-message scenario; it does not model group-channel administration or group fan-out, which are separate requirements and can be represented by another sequence if needed.
