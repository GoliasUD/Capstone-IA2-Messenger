# CPS 490 - Messenger App Documentation

### Full-Stack Architecure & MERN Stack

Message: A -> B
+ B is online: B sees message without refreshing browser
+ B is offline: B sees message as soon as entering application

<br>

M - MongoDB & Mongoose: retains records for users, session records, blocklists, channel memberships, and ordered message histories

E - Express : dispatches HTTP routes, validates JSON payloads, and enforces JWT authentication middleware

R - React & Vite: manages client side UI, renders active conversation feeds, and handles live updates without page refreshing

N - Node.js (v24): executes server-side logic alongside Express

| Tech | Uses case for Messenger |
| :--- | :--- |
| Vite | Runs the frontend development server and builds production browser files |
| Mongoose | Defines application data models and communicates with MongoDB |
| bcrypt/JWT | bcrypt hashes passwords a JSON Web Token (JWT) carries a signed identity claim for server verification |
| Socket.IO | Supports live, bidirectional events between browsers and the server |
| Docker Compose | Starts the local MongoDB service from repeatable configuration |
| Git/GitHub | Records implementation history and provides the assignment submission |

### Message Submission Order

1. Alice types message in React
2. Client submits request carrying her access token
3. Server verifies Alice's identity
4. Service checks conversion membership & input validity
5. Mongoose saves the message to MongoDB
6. Server acknowledges the saved message and emits an event
7. Bob's browser renders the event if he is connected
    - Bob sends initial request when reconnected to render all messages sent while he was offline


### Failure and Expected Behavior
| Failure | What changes? | Required behavior |
| :--- | :--- | :--- |
| Socket disconnects | No immediate event delivery | Recover history through HTTP |
| Express is unavailable | No API or real-time backend | Report unavailability; do not claim send success |
| MongoDB is unavailable | Cannot durably store messages | Reject the write rather than broadcast an unsaved message |
| Unauthorized Access Attempt | Service layer checks membership upon each HTTP request | Rejecting non-members with `403 Forbidden` |
| Invalid Payload | Intercept malformed JSON or oversized text (>280 characters) | Return HTTP `400 Bad Request` |
| Blocked DM Rejection | API checks blocklist prior to message handling | Silently drop message; does not get stored |
