<span style="font-family: sans-serif; font-size: 14px;">

# Statement of Work

> **Document status:** Draft
> **Student:** Andrew Golias
> **Faculty mentor:** Nick Stiffler
> **Project period:** 9/30 - 11/2
> **Version:** 1.0
> **Last Updated:** ------

---

## 1. Project Purpose & Objectives

This Statement of Work (SoW) defines the engineering objectives, technical scope, architectural constraints, deliverables, and acceptance criteria outline of the messenger application - Messee.

The project will allow for private messaging and group communications, it will use a currently undecided tech stack to secure messaging, and allow for users to create a profile with a unique identifier for adding friends. The goal of this project is to apply software engineering principles, such as architectual  evaluation, documentation workflows, and automated verification.

**Primary Product Objective:**

+ Construct a fully operational Messenger application that enables authenticated users to engage in synchronous private direct messaging and organize multi-user group conversions through a channel.

**Secondary System Objectives:**

+ Establish robust user access control and group administration, including channel creation, member invitation, user removal/blocking, and message moderation (time-based and/or sensitivity-based)
+ Ensure real-time message ordering and state consistency across concurrent client sessions
+ Support structured message telemetry (message timestamps, delivery status, and read receipts)
+ Produce a fully reproducible software package featuring automated test pipelines, clean deployment, and architectural documentation

## 2. Stakeholders

Stakeholders include those who are involved in the creation, distribution, or handling of the product:

+ Me, as the student designing the Messee product
+ Nick Stiffler, product "customer" providing product specifications and requirements
+ Messee Users, anyone involved in the testing or distributed services of the product

## 3. Scope

**In Scope:**

+ User Authentication & Identity Management: user registration, login authentication, and active session handling
+ Private Direct Messaging: direct text-based conversations between two authenticated users with real-time message delivery and message history retrieval
+ Group-Based Channel Messaging: creation of multi-user groups/servers, creation of distinct text channels within groups, and message broadcasting to all active channel members.
* User Isolation & Moderation: user contact blocking (preventing blocked users from sending direct messages), group member invitations, and administrative moderation controls (removing members or deleting policy-violating messages)
* Message Metadata & State Tracking: message sequence numbering, timestamps, delivery indicators (sent, delivered, read), and persistence
* Technology Stack Evaluation: formal comparison and selection spike among candidate runtime environments, database engines, and networking protocols
* Automated Verification & Telemetry: test scripts validating functional specs, message schemas, latency metrics, and clean-machine setup runbooks

**Out of Scope Unless Added Through Change Control:**

* Voice and Video Calling: real-time audio or video streaming channels
* Screen Sharing & Media Streaming: live video broadcasting or desktop screen sharing capabilities
* End-to-End Encryption Key Infrastructure: client-side key exchange (standard transport-layer security and hashing are in scope)
* Third-Party Bot/Plugin Ecosystem: extensible API hooks for automated external bots or custom integrations
* Paid Commercial Cloud Infrastructure: deployment to expensive enterprise cloud clusters, such as AWS or Azure; local or free-tier hosting is enforced
* Native Mobile Apps: dedicated iOS or Android apps

## 4. Deliverables



## 5. Assumptions, Constraints, & Dependencies

## 6. Milestones & Schedule

## 7. Acceptance


</span>
