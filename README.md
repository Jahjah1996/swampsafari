# SwampSafari

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.13.

## Netlify deployment

This app is ready for a standard Netlify static deploy.

Build settings:

- Build command: `npm run build`
- Publish directory: `dist/swamp-safari`
- Node version: `20`

Notes:

- Client-side routes are handled by `src/_redirects`, which Angular copies into the final build output.
- API calls use `/api` in production, and Netlify rewrites `/api/*` to the Railway backend using the rule in `src/_redirects`.

Deploy steps:

1. In Netlify, choose `Add new project` and import this GitHub repository.
2. Select the production branch you want to deploy, usually `main`.
3. Netlify should pick up `netlify.toml` automatically. If you enter settings manually, use the build command and publish directory above.
4. Trigger the first deploy.

If the backend URL ever changes, update `src/_redirects` and redeploy the site.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
