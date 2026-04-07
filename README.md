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

## QueryHelper Usage

`QueryHelper` provides a lightweight way to build and execute Web API queries without manually concatenating strings.

---

### Retrieve single record

```ts
const account = await QueryHelper.retrieve('account', accountId, {
  select: ['accountid', 'name', 'telephone1'],
});

console.log(account.name);
```

---

### Retrieve multiple records

```ts
const result = await QueryHelper.retrieveMultiple('contact', {
  select: ['contactid', 'fullname'],
  filter: QueryHelper.filterEquals('statecode', 0),
  top: 5,
});

for (const contact of result.entities) {
  console.log(contact.fullname);
}
```

---

### Select only (simple)

```ts
const query = QueryHelper.select('name', 'accountnumber');
// returns "?$select=name,accountnumber"
```

---

### Filter examples

```ts
const filter = QueryHelper.filterEquals('name', 'Contoso');
// name eq 'Contoso'
```

```ts
const filter = QueryHelper.and(
  QueryHelper.filterEquals('statecode', 0),
  QueryHelper.filterEquals('customertypecode', 1),
);
```

```ts
const filter = QueryHelper.or(
  QueryHelper.filterEquals('name', 'Contoso'),
  QueryHelper.filterEquals('name', 'Fabrikam'),
);
```

---

### Full example

```ts
const contacts = await QueryHelper.retrieveMultiple('contact', {
  select: ['contactid', 'fullname', 'emailaddress1'],
  filter: QueryHelper.and(
    QueryHelper.filterEquals('statecode', 0),
    QueryHelper.filterEquals('firstname', 'John'),
  ),
  orderBy: ['fullname asc'],
  top: 10,
});
```

---

### Notes

- No manual string building needed
- Automatically handles `$select`, `$filter`, `$expand`, `$orderby`, `$top`
- Returns raw WebApi response (`retrieve` / `retrieveMultipleRecords`)
- Keep filters simple to avoid OData mistakes

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
