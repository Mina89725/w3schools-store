# w3schools-store

A small web shop built with [Angular](https://angular.dev). It shows the products of the
[w3schools database](https://github.com/leandrolerena/w3schools-database) and gets them from
that repository's REST API.

The store is a complete, working starting point. Run it, read the code, then fork it and add
your own features by following the product example.

## Get it running

You need the Feusi VM (Ubuntu 22.04 with Docker and VS Code). Run every command in a terminal.

### 1. Install Node.js

Angular runs on Node.js. Install it with nvm, the Node Version Manager:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash
```

Close the terminal and open a new one, so that the `nvm` command is found. Then install
Node.js 24, the version this project uses (it is also written in `.nvmrc`):

```bash
nvm install 24
node -v
```

`node -v` prints a version starting with `v24`.

### 2. Start the database and the REST API

```bash
cd ~
git clone https://github.com/leandrolerena/w3schools-database.git
cd ~/w3schools-database
docker-compose up -d
```

The first start takes a few minutes. Open <http://localhost:3000/products> in the browser: you
should see the products as JSON.

### 3. Start the store

In a new terminal:

```bash
cd ~
git clone https://github.com/leandrolerena/w3schools-store.git
cd ~/w3schools-store
npm install
npm start
```

Leave `npm start` running and open <http://localhost:4200>. When you change a file, the page
reloads by itself.

To open the code, run `code ~/w3schools-store`.

## Commands

| Command         | What it does                                 |
| --------------- | -------------------------------------------- |
| `npm start`     | Runs the store on <http://localhost:4200>    |
| `npm test`      | Runs all tests once (`*.spec.ts`)            |
| `npm run build` | Builds the store for production into `dist/` |

## Why the store calls `/api`

The browser only lets a page read responses from its own origin (`http://localhost:4200`)
unless the other server allows it with CORS headers. The REST API on port 3000 sends no CORS
headers, so a direct call to `http://localhost:3000/products` is blocked.

The store therefore calls `/api/products` on its own origin. The Angular dev server forwards
every request that starts with `/api` to `http://localhost:3000` and removes the `/api` prefix.
This is configured in `src/proxy.conf.json` and only works while `npm start` is running.

## The files you work with

Read these ten files in this order. All paths are in `src/app/`.

1. `app.html` is the frame of every page: header with navigation, the page, footer.
2. `app.routes.ts` says which URL shows which page.
3. `products/product-list/product-list.ts` is the product page. It asks the service for the
   products.
4. `products/product-list/product-list.html` shows the products, or a loading, empty or error
   message.
5. `products/product-list/product-list.css` styles the text on a product card (number, name,
   unit, price).
6. `products/product-service.ts` loads the products from the REST API.
7. `api.ts` holds what every service needs to know about the REST API: `API_BASE_URL`, the path
   every call starts with (`/api`), the shapes of its answers to saving (`CreateResult`,
   `ChangeResult`), and `refusalReason`, which finds the database's message in a refused request.
8. `products/product.ts` describes a product with the field names the API returns. The database
   allows empty values in every field except the ID; this project treats them as always filled.
9. `products/product-service.spec.ts` tests the service.
10. `products/product-list/product-list.spec.ts` tests the product page.

A request travels like this: the URL `/products` shows the product page, which asks the
service, which sends `GET /api/products`, which the dev server forwards to the REST API.

### The write example

The page **New shipper** (`/shippers/new`) saves a new row. Its route and link are in
`app.routes.ts` and `app.html`. After the ten files above, read these six:

1. `shippers/shipper-form/shipper-form.ts` is the form page: the fields and their rules, what
   happens when you save, and how it tells a refused shipper from an API that does not answer.
2. `shippers/shipper-form/shipper-form.html` shows the form with labels and error texts, and
   after saving the success message or one of the two error messages.
3. `shippers/shipper-service.ts` sends the new shipper with `POST /api/shippers` and returns
   the ID the database gave it, read from a `CreateResult`.
4. `shippers/new-shipper.ts` describes what a new shipper needs. It has no ID, because the
   database picks it.
5. `shippers/shipper-service.spec.ts` tests the service.
6. `shippers/shipper-form/shipper-form.spec.ts` tests the form page.

All other files start the app or hold settings and shared styles, and you do not need to open
them to follow the pattern.

Every page can use the shared styles from `src/styles.css` without changing that file: the
classes `page-header`, `lead`, `card-grid`, `card`, `message`, `message-error` and
`message-success`, the form classes `form`, `form-field` and `field-error`, and colour variables
such as `var(--color-muted)` and `var(--color-accent)`. `product-list.html` and
`shipper-form.html` show how to use them; a page's own `.css` file only adds what is special
about that page.

### Adding a use case

To show another table, for example `categories`, copy the product example step by step:

1. **Model:** create `categories/category.ts` like `product.ts`, with the field names that
   <http://localhost:3000/categories> returns. Like `product.ts`, treat the fields as always
   filled, even though the database allows empty values.
2. **Service:** run `npm run ng -- generate service categories/category-service`. Write the test
   in `category-service.spec.ts` like `product-service.spec.ts` first, then the method in
   `category-service.ts` like `product-service.ts`.
3. **Page:** run `npm run ng -- generate component categories/category-list`. Write the tests in
   `category-list.spec.ts` like `product-list.spec.ts` first, then fill `category-list.ts`,
   `.html` and `.css` like the product page.
4. **Navigation:** import `CategoryList` and add a route for it in `app.routes.ts`, then add a
   link to `app.html`.

Run `npm test` after each step.

### Adding a write use case

To save new rows of another table, for example `categories`, copy the shipper example:

1. **Model:** create `categories/new-category.ts` like `new-shipper.ts`, with the fields the API
   needs for a new row, without the ID.
2. **Service:** add a method like `createShipper` to the table's service, typing the answer with
   `CreateResult` from `api.ts`. If the table has no service yet, generate one as in "Adding a
   use case". Write its test like `shipper-service.spec.ts` first.
3. **Page:** run `npm run ng -- generate component categories/category-form`. Write the tests in
   `category-form.spec.ts` like `shipper-form.spec.ts` first, then fill `category-form.ts` and
   `.html` like the shipper form. If the page needs no styles of its own, delete the empty
   `.css` file and the `styleUrl` line, as in `shipper-form.ts`.
4. **Navigation:** import the page, add a route such as `categories/new` in `app.routes.ts`, and
   add a link to `app.html`.

### Changing and deleting rows

This project has no example for these. Build them with the shipper form as the model. Every
HTTP call (`GET`, `PATCH`, `DELETE`) goes into the table's service, like `createShipper`, and
the page calls the service. The URL of one row is `` `${API_BASE_URL}/categories/${id}` ``.

- **Change:**
  - Add a route with the ID, such as `categories/:id/edit`.
  - In the page, read the ID with `Number(inject(ActivatedRoute).snapshot.paramMap.get('id'))`.
    `paramMap.get` returns the ID as text, or `null` if the route has none; `Number(...)` turns
    it into the number that the service methods take.
  - Load the row once when the page opens: call a private `async` method from the constructor
    that uses `firstValueFrom`, as `saveShipper` does.
  - `GET` answers with an array that holds this one row, so the service method takes its first
    element with `map((rows) => rows[0])`, as `createShipper` takes `insertId`. If there is no
    row, the result is `undefined`: show a message instead of the form. Otherwise put the row
    into the form model with `set`.
  - On save, send `http.patch` to the same URL with the fields from the form. The API changes
    only the fields you send.
- **Delete:** add a "Delete" button, for example to each card of a list page. It calls a
  service method that sends `http.delete` to the same URL, then reloads the list with
  `reload()`, as the "Try again" button does. The list's own error comes from `rxResource` and
  cannot be set, so give the page its own signal for a failed delete, such as
  `deleteFailed = signal(false)`.
- **Link from a card to its edit page:** add `RouterLink` from `@angular/router` to the `imports`
  of that page's component and write
  `<a [routerLink]="['/categories', category.CategoryID, 'edit']">Change</a>`.
- **Two links with the same start**, such as `/categories` and `/categories/new`: on
  `/categories/new` both are highlighted, unless the shorter one also gets
  `[routerLinkActiveOptions]="{ exact: true }"`.

`PATCH` and `DELETE` answer with the same kind of object as `POST`, but `insertId` is `0` there.
Use `affectedRows` instead: it is `1` when a row with that ID exists, even if a `PATCH` changed
nothing, and `0` when no row has that ID. Type the answer with `ChangeResult` from `api.ts`.

When the database refuses a request, the API still answers, with status 400 and
`{ "error": "<message from MySQL>" }`. A shipper or product that orders still use cannot be
deleted, for example, and a text longer than its column cannot be saved. The browser console
then shows a red `400 (Bad Request)` line; that is expected. Show the database's message
instead of the "cannot reach the REST API" text, which is meant for when no answer comes back at
all. `shipper-form.ts` shows how: `showSaveError` asks `refusalReason` from `api.ts` for the
message and shows it with `refusal`, otherwise it sets `saveFailed`, and `clearMessages` removes
both at the start of each save.

**Testing a page that reads the route:** once a page injects `ActivatedRoute`, its tests fail
with `NG0201: No provider found for ActivatedRoute`. The same error appears when a page only
uses `RouterLink`, for example for the edit link on a card; there, adding `provideRouter([])`
from `@angular/router` to the test's `providers` is enough. A page that reads the ID needs a fake
route with the ID instead, and change detection once more after the row has loaded, so that it
shows in the inputs:

```ts
TestBed.configureTestingModule({
  imports: [CategoryEdit],
  providers: [
    { provide: CategoryService, useValue: { getCategory: () => of(beverages) } },
    {
      provide: ActivatedRoute,
      useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
    },
  ],
});
const fixture = TestBed.createComponent(CategoryEdit);
fixture.detectChanges();
await fixture.whenStable();
fixture.detectChanges();
```

`ActivatedRoute` and `convertToParamMap` come from `@angular/router`, `of` from `rxjs`.

## Troubleshooting

**The page says "The products could not be loaded"** and the `npm start` terminal shows
`[vite] http proxy error: /products` with `ECONNREFUSED`: the REST API is not running. Run
`docker-compose up -d` in `~/w3schools-database`, wait a few seconds and press
**Try again**. `docker-compose ps` shows whether both containers are up.

**`Port 4200 is already in use.`** followed by `Would you like to use a different port?`:
another `npm start` is still running, often in a second terminal or in VS Code. Stop it with
`Ctrl+C` there, or answer `y` to use another port.

**`docker-compose up -d` ends with `Bind for 0.0.0.0:3000 failed: port is already allocated`**
(or the same for port 3309): an old container still uses the port. `docker ps` lists the
running containers; stop the old one with `docker stop <name>`. If the message ends with
`address already in use` instead, a program outside Docker uses the port.

**`nvm: command not found`:** close the terminal and open a new one after installing nvm.

**`docker-compose up -d` or `docker ps` fails with a message containing `permission denied` (any capitalisation):**
your user is not yet in the `docker` group. Log out of the VM and log in again.
