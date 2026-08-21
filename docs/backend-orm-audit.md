# Backend ORM Audit

Date: 2026-04-12

## Scope

This audit focuses on the backend ORM layer and startup integrity:

- `backend/src/models/*`
- `backend/src/database/index.ts`
- `backend/src/database/migrations/*`
- comparison against `whaticket-community/backend`

The goal is to determine whether the project should be partially realigned with `whaticket-community` or whether the current backend should be completed as its own coherent architecture.

## Executive Summary

The current backend is not a small variation of `whaticket-community`. It is a significantly extended product that includes:

- multi-company support
- plans/subscriptions/invoices
- campaigns and contact lists
- internal chat
- announcements
- schedules
- tags and notes
- sender/outbox infrastructure

The database migration history reflects that expansion, but the ORM layer does not. Several models still resemble the base project, while other newer models exist but are not registered in Sequelize.

The main conclusion is:

- Do not copy files back from `whaticket-community` selectively.
- Do not continue patching production reactively.
- Complete the current ORM layer coherently, then deploy once.

## Comparison With Base Project

### `whaticket-community`

- 37 migrations
- 12 registered models in `whaticket-community/backend/src/database/index.ts`

Registered there:

- `User`
- `Contact`
- `Ticket`
- `Message`
- `Whatsapp`
- `ContactCustomField`
- `Setting`
- `Queue`
- `WhatsappQueue`
- `UserQueue`
- `QuickAnswer`
- `WppKey`

### Current Project

- 122 migrations
- 39 model files
- 21 models currently registered in `backend/src/database/index.ts`

This is the core mismatch. The project evolved far beyond the base repo, but `sequelize.addModels(...)` still registers only a subset of the actual domain.

## Current Registered Models

From `backend/src/database/index.ts`:

- `User`
- `Company`
- `Plan`
- `Setting`
- `Contact`
- `Ticket`
- `Whatsapp`
- `ContactCustomField`
- `Message`
- `Queue`
- `WhatsappQueue`
- `UserQueue`
- `QuickAnswer`
- `Campaign`
- `CampaignRecipient`
- `OutboxMessage`
- `Sender`
- `CampaignClient`
- `TicketTraking`
- `UserRating`
- `WppKey`

## Existing Models Not Registered

These model files exist but are not registered in Sequelize:

- `Announcement`
- `Baileys`
- `BaileysChats`
- `CampaignSetting`
- `CampaignShipping`
- `Chat`
- `ChatMessage`
- `ChatUser`
- `ContactList`
- `ContactListItem`
- `Help`
- `Invoices`
- `QueueOption`
- `QuickMessage`
- `Schedule`
- `Subscriptions`
- `Tag`
- `TicketNote`
- `TicketTag`

This is high risk because many services, routes, and queues import and use these models directly.

## High-Criticality Inconsistencies

### 1. Multi-company migrations exist, but several core models do not reflect them

Migrations add `companyId` to:

- `Settings`
- `Users`
- `Contacts`
- `Messages`
- `Queues`
- `Whatsapps`
- `Tickets`

But model coverage is incomplete:

- `User`: has `companyId`
- `Queue`: has `companyId`
- `Whatsapp`: has `companyId`
- `Contact`: missing `companyId`
- `Message`: missing `companyId`
- `Setting`: missing `companyId`
- `Ticket`: missing `companyId`

This creates a structural contradiction with `Company.ts`, which declares:

- `HasMany(() => User)`
- `HasMany(() => Queue)`
- `HasMany(() => Whatsapp)`
- `HasMany(() => Message)`
- `HasMany(() => Contact)`
- `HasMany(() => Setting)`
- `HasMany(() => Ticket)`
- `HasMany(() => TicketTraking)`

If the child model lacks the foreign key association expected by Sequelize, backend startup fails.

### 2. `database/index.ts` does not register the real runtime domain

Controllers, services, routes, and queues actively use non-registered models such as:

- `Announcement`
- `CampaignSetting`
- `Chat`
- `ContactList`
- `ContactListItem`
- `Invoices`
- `QueueOption`
- `QuickMessage`
- `Schedule`
- `Tag`
- `TicketNote`
- `TicketTag`

This means the application can fail either:

- during startup while resolving associations
- during runtime when attempting ORM queries on unregistered models

### 3. `Setting` migration history diverged from the base model, but the model stayed mostly unchanged

Relevant migration:

- `20220315110005-remove-constraint-to-Settings.ts`

The `Settings` table was altered away from the original base-project design, but `Setting.ts` still behaves like the original simplified model:

- only `key` as primary key
- no `companyId`
- no relation to `Company`

This is a strong signal that the multi-company adaptation was only partially completed.

### 4. Production boot errors are symptoms, not isolated defects

Observed errors in VPS startup already confirm the broader pattern:

- MariaDB-incompatible migration SQL for `Settings`
- `Company is not defined`
- `Plan has not been defined`
- `Foreign key for "Company" is missing on "Queue"`

These are not unrelated bugs. They all come from the same root issue:

- schema evolution outpaced model alignment

## Medium-Criticality Inconsistencies

### 1. ORM layer mixes base-project assumptions with extended-domain assumptions

Examples:

- `Contact.ts` still looks like the base project
- `Message.ts` still looks like the base project
- `Ticket.ts` still looks like the base project
- `Company.ts` assumes a much richer, multi-company topology

This makes the codebase misleading for future maintenance.

### 2. Some newer modules are internally coherent but disconnected from bootstrap registration

Examples:

- `ContactList` / `ContactListItem`
- `Chat` / `ChatUser` / `ChatMessage`
- `Announcement`
- `QueueOption`
- `Schedule`
- `Tag` / `TicketTag`

These modules likely worked at some point in development, but the global Sequelize registration was not kept in sync.

## Low-Criticality Issues

### 1. Model naming and consistency issues

- `TicketTraking` typo persists across codebase
- some files retain legacy naming conventions from upstream
- line endings are mixed in a few edited files

These are not startup blockers, but they reduce maintainability.

## What Should Not Be Done

### Do not selectively copy files from `whaticket-community`

That would reintroduce base assumptions into a database and service layer that already depend on:

- `Company`
- `Plan`
- `Subscriptions`
- `Invoices`
- `Schedule`
- `ContactList`
- `CampaignSetting`
- `Tag`
- `Announcement`

Partial copying would likely:

- break runtime behavior
- reintroduce model/schema drift
- hide problems instead of resolving them

### Do not continue hot-patching directly in production

Reactive edits on the VPS are too expensive now because startup is failing on foundational ORM topology.

## Recommended Strategy

### Preferred path: complete the current architecture

This project should be treated as its own product, not as a thin fork of `whaticket-community`.

Recommended sequence:

1. Freeze production edits.
2. Audit every model against its migration-backed table.
3. Register all active models in `backend/src/database/index.ts`.
4. Complete only the foreign keys and associations that already exist in migrations.
5. Boot backend locally or in staging until startup is clean.
6. Deploy once to VPS.

### Why this is safer than reverting to base

- the current database already contains extended schema
- services/controllers already depend on extended models
- frontend and campaigns already evolved beyond the base project
- a partial rollback would likely create more hidden defects than it removes

## Minimum Technical Work Package

### Phase 1: boot integrity

Goal: make backend start reliably.

Tasks:

- register all active models used by routes/services/queues
- complete missing `companyId` fields and `BelongsTo(() => Company)` where migrations already added the column
- review all parent `HasMany` declarations in `Company.ts`
- confirm `Setting.ts` matches the actual table shape after the `Settings` migration sequence

### Phase 2: runtime integrity

Goal: make critical features query safely.

Tasks:

- verify `ContactList`, `ContactListItem`, `CampaignSetting`, `Schedule`, `Tag`, `TicketNote`, `Announcement`, `Invoices`, `Subscriptions`, `Chat`, `QueueOption`
- ensure all such models are registered and their associations are valid
- run smoke tests for auth, tickets, campaigns, and settings

### Phase 3: cleanup

Goal: reduce future drift.

Tasks:

- document current domain model
- decide which legacy base-project features are still active
- remove dead models or dead routes if they are no longer used

## Immediate Recommendation

Proceed with a controlled backend ORM correction, not a rollback to `whaticket-community`.

The next engineering step should be:

- build a model-to-migration matrix
- classify each model as `base`, `extended-coherent`, or `extended-incomplete`
- produce a single minimal patch that restores backend boot and preserves your custom domain

## Existing Provisional Fixes

During production debugging, a few provisional fixes were identified as valid:

- MariaDB-compatible handling in `20220315110005-remove-constraint-to-Settings.ts`
- missing `Company` import in `User.ts`
- missing Sequelize registration for `Company`, `Plan`, `TicketTraking`, `UserRating`
- missing `companyId` association wiring in `Queue.ts`
- missing `companyId` association wiring in `Whatsapp.ts`

These are consistent with the findings in this audit, but they should be folded into a single reviewed backend patch rather than continued piecemeal on the VPS.
