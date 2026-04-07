# CRM Webpack + TypeScript Starter

Minimal starter for Dynamics 365 / Dataverse form scripting using Webpack and TypeScript.

## Overview

This project provides a clean setup for building JavaScript web resources with:

- Webpack (multi-entry, per file)
- TypeScript
- @types/xrm
- Structured helpers for common CRM scenarios
- Separate bundles per form script

## Features

- One entry file = one web resource
- Automatic bundle naming based on folder structure
- Shared helpers without creating additional bundles
- Lightweight abstraction over Xrm API
- Ready-to-use examples for Contact and Account forms

## Project Structure
```bash
src/
├── common/
│   ├── Helper.ts
│   ├── NotificationHelper.ts
│   ├── SubgridHelper.ts
│   ├── BpfHelper.ts
│   └── QueryHelper.ts
│
└── forms/
    ├── contact/
    │   └── contact.form.ts
    └── account/
        └── account.form.ts
```
## Installation

npm install

## Build

npm run build

## Output 
```bash
dist/
├── crm_forms_contact_contact.form.js
├── crm_forms_contact_contact.form.js.map
├── crm_forms_account_account.form.js
└── crm_forms_account_account.form.js.map
```
Each output file represents a separate CRM web resource.

## CRM Registration

### Contact

Web resource:
crm_forms_contact_contact.form.js

Functions:

- crm.contact.form.onLoad
- crm.contact.form.onFirstNameChange
- crm.contact.form.onLastNameChange
- crm.contact.form.onParentCustomerChange

### Account

Web resource:
crm_forms_account_account.form.js

Functions:

- crm.account.form.onLoad
- crm.account.form.onNameChange
- crm.account.form.onPrimaryContactChange

## Helpers

The project includes 5 core helpers:

- Helper
  Core form utilities (attributes, controls, lookups, optionsets, tabs, form state)

- NotificationHelper
  Form and control notifications

- SubgridHelper
  Subgrid access, refresh, and events

- BpfHelper
  Business Process Flow handling

- QueryHelper
  Lightweight wrapper for Xrm.WebApi queries

## Notes

- common folder is not bundled separately — it is included in each entry bundle
- No global monolithic bundle — each script is isolated
- Designed for maintainability and safe deployment in CRM
- Compatible with TypeScript 6 and modern Webpack setup

## Recommendation

Keep:

- One responsibility per entry file
- Shared logic inside common
- CRM bindings thin and predictable

Avoid:

- Single large bundles
- Over-abstracting Xrm
- Mixing multiple forms in one script
