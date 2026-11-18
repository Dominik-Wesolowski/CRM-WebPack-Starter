# Dynamics 365 TypeScript Starter

Build standalone JavaScript web resources for Dataverse model-driven apps. Each table can have one forms bundle and one optional ribbon bundle.

## Initialize a project

With Node.js 24 or later, choose **Use this template** on GitHub, create a repository such as `XYZ.Webresources`, and clone the new repository. The starter repository must have [Template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository) enabled.

To add the starter to an existing repository, copy `src/`, `scripts/`, `.gitignore`, `README.md`, `package.json`, `package-lock.json`, `tsconfig.json` and `webpack.config.js` into its `XYZ.Webresources/` directory. Configure CI in the parent repository to run the npm commands from that directory.

Run these commands from the new project directory.

```sh
npm ci
npm run init -- xyz-webresources xyz Xyz
npm run build
```

Run `npm run init` without arguments to enter the package name, solution publisher prefix and JavaScript namespace interactively. The package name uses lowercase letters, digits and hyphens. The directory can still be named `XYZ.Webresources`. Use your solution's publisher prefix without the underscore. Initialization writes `crm.config.json` and updates the package and lockfile names. Commit those files in the initialized project. Builds and generators use the project config automatically.

```sh
npm run typecheck
npm run test:init
npm run test:artifact
npm run build:dev
npm run watch
```

Development builds use inline source maps. Use the production build for deployment and [browser Local Overrides](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/debug-javascript-webresources) to debug changes locally.

## Generate entities, forms and ribbon commands

```sh
npm run generate -- entity salesOrder main --field name
npm run generate -- form salesOrder orderApproval
npm run generate -- ribbon salesOrder
```

Entity and form names use camelCase. They identify modules in this project. Use the Dataverse logical name when a query needs it. The optional `--field` takes a column logical name and wires up a typed `OnChange` stub. Add the column to the form before testing it.

```text
src/entities/salesOrder/
  forms/
    index.ts
    main/
      on-load.ts
      on-change.ts
    orderApproval/
      on-load.ts
      on-change.ts
  ribbon/
    index.ts
  services/
    salesOrderService.ts
```

The forms index exports named form modules. Adding a form creates `on-load.ts` and `on-change.ts` and appends one export. The form's `onLoad` calls `registerOnChange` during initial load. Add column and handler pairs in `on-change.ts`, alongside the handler implementations. With `--field`, the scaffold adds one pair and a typed handler ready for your logic. The Account main form demonstrates an implemented handler. The ribbon generator creates a sample `refreshForm` command that receives `PrimaryControl`.

Creating a table module also creates one service shared by its forms. The generated service includes a typed record read that uses a Dataverse record reference and selected columns. Both Account form events delegate the description check and notification update to the same service function.

Edit the Handlebars templates in `scripts/templates/` to customize the generated TypeScript.

With the example configuration, Webpack discovers the entry points and creates:

| Source entry | JavaScript file in `dist` and Dataverse web resource name | Example handler |
| --- | --- | --- |
| `src/entities/salesOrder/forms/index.ts` | `xyz_/salesOrder/forms.js` | `Xyz.SalesOrder.Forms.OrderApproval.onLoad` |
| `src/entities/salesOrder/ribbon/index.ts` | `xyz_/salesOrder/ribbon.js` | `Xyz.SalesOrder.Ribbon.refreshForm` |

## Try the Account example

1. In an unmanaged solution in DEV, create the JavaScript web resource `xyz_/account/forms.js` using the file at that path under `dist`. Substitute your configured prefix.
2. Add it to an Account main form with the Description column.
3. Register `Xyz.Account.Forms.Main.onLoad` as the form **On Load** handler using your configured namespace and enable **Pass execution context as first parameter**.
4. Publish. Enter more than 250 characters in Description and leave the field to see the warning. Shorten the description to clear it.

Projects upgrading from per-form bundles need to change the web resource and handler names in their form registrations. Remove any previous designer registration for `onDescriptionChange`, which is registered during initial load.

## Query Dataverse

Import `QueryHelper` from `src/common/QueryHelper.ts` using the relative path from your module.

```ts
const result = await QueryHelper.retrieveMultiple<{ fullname: string }>('contact', {
  select: ['fullname'],
  filter: QueryHelper.filterEquals('statecode', 0),
  top: 5,
});
```

The helper builds OData options and returns the original Web API result, including `nextLink` when another page is available. To integrate with an existing release pipeline, map `dist` files to solution sources and package the solution with the [Power Platform CLI](https://learn.microsoft.com/power-platform/developer/cli/reference/solution).

Use `QueryHelper.retrieveNextPage(table, result.nextLink, maxPageSize)` when a next link is present. Pass the same page size as in the first request and omit `top` when fetching pages. The paging query is forwarded as received from Dataverse.

`EnvironmentVariableHelper` reads settings through `Xrm.WebApi.online`. Check access in DEV with the roles that will use the app. Call `clearCache` to reload a setting in the current client session. A generic JSON result type describes the expected shape at compile time.

Run `npm run test:helpers` to check the shared helpers with mocked Client APIs.
