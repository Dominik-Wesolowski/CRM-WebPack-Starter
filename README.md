# CRM Webpack + TypeScript Starter

Minimal starter for Microsoft Dynamics 365 / Dataverse form scripting using Webpack and TypeScript.

---

## Overview

This project provides a clean and scalable setup for building CRM form scripts:

- Webpack (multi-entry, per file)
- TypeScript
- @types/xrm
- Structured helpers for common CRM scenarios
- Separate bundles per form script

---

## Features

- One entry file = one web resource
- Automatic bundle naming based on folder structure
- Shared helpers included in each bundle (no extra artifacts)
- Lightweight abstraction over Xrm API
- Ready-to-use examples for Contact and Account forms

---

## Project Structure

```bash
src/
├── common/
│   ├── Helper.ts
│   ├── NotificationHelper.ts
│   ├── SubgridHelper.ts
│   ├── BpfHelper.ts
│   ├── QueryHelper.ts
│   ├── ValidationHelper.ts
│   ├── NavigationHelper.ts
│   └── EnvironmentVariableHelper.ts
│
└── forms/
    ├── contact/
    │   └── contact.form.ts
    └── account/
        └── account.form.ts
```

---

## Installation

```bash
npm install
```

---

## Build

```bash
npm run build
```

---

## Output

```bash
dist/
├── crm_forms_contact_contact.form.js
├── crm_forms_contact_contact.form.js.map
├── crm_forms_account_account.form.js
└── crm_forms_account_account.form.js.map
```

Each output file represents a separate CRM web resource.

---

## CRM Registration

### Contact

**Web resource:**

```
crm_forms_contact_contact.form.js
```

**Functions:**

- crm.contact.form.onLoad
- crm.contact.form.onFirstNameChange
- crm.contact.form.onLastNameChange
- crm.contact.form.onParentCustomerChange

---

### Account

**Web resource:**

```
crm_forms_account_account.form.js
```

**Functions:**

- crm.account.form.onLoad
- crm.account.form.onNameChange
- crm.account.form.onPrimaryContactChange

---

## Helpers

### Core

- **Helper**
  Core form utilities (attributes, controls, lookups, option sets, tabs, form state)

- **NotificationHelper**
  Form and control notifications

---

### UI & Form Behavior

- **SubgridHelper**
  Subgrid access, refresh, and events

- **BpfHelper**
  Business Process Flow handling

---

### Data & Queries

- **QueryHelper**
  Lightweight wrapper for Xrm.WebApi

- **EnvironmentVariableHelper**
  Access Dataverse environment variables (with caching)

---

### Validation & Navigation

- **ValidationHelper**
  Reusable validation patterns for form logic

- **NavigationHelper**
  Wrapper for Xrm.Navigation (open forms, dialogs, web resources)

---

## Notes

- `common` folder is not bundled separately — it is included in each entry bundle
- No global monolithic bundle — each script is isolated
- Designed for maintainability and safe deployment in CRM
- Compatible with modern TypeScript and Webpack setup
- Uses controlled global exposure (`window.*`) for CRM event binding

---

## Recommendations

### Keep

- One responsibility per entry file
- Shared logic inside `common`
- Form logic explicit and readable

---

### Avoid

- Single large bundles
- Over-abstracting Xrm API
- Mixing multiple forms in one script
- Building generic frameworks too early

---

## Philosophy

This starter favors:

- clarity over abstraction
- explicit form logic over generic wrappers
- small, focused helpers instead of large frameworks

It is designed to scale with real projects without becoming over-engineered.
