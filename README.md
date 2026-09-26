# Market — Angular E-Commerce Front End

[![CI](https://github.com/SamirNexus/Market/actions/workflows/ci.yml/badge.svg)](https://github.com/SamirNexus/Market/actions/workflows/ci.yml)
[![Angular](https://img.shields.io/badge/Angular-16-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Market is a responsive Angular e-commerce interface that demonstrates modern front-end architecture. It fetches real product data from the Fake Store API, integrating API requests, client-side filtering, cart persistence, and responsive design.

## Core features

- Product listing from API with client-side search and filtering
- Product category browsing and discovery
- Product details page with routing
- Shopping cart with add, remove, and quantity controls
- Cart persistence using localStorage
- Sorted product view (by rating, price, featured)
- Loading, error, and empty states
- Responsive design for desktop and mobile
- Demo checkout flow (no payment processing)

## What this is not

This is a portfolio demonstration project, not a production e-commerce application:

- The Fake Store API provides all product data; there is no custom backend.
- Checkout is a mock flow that does not process real payments.
- There is no user authentication, order history, or account management.
- Product options, currency selection, and advanced filtering are not implemented.
- The application is a client-side Angular single-page application.

## Architecture

The application is organized into feature-focused folders with clear separation of concerns:

```text
src/app/
├── products/   # Catalog and product detail components, API service, and models
├── carts/      # Cart component and state management service
├── shared/     # Reusable UI components (header, spinner, select) and utilities
└── app-routing.module.ts
```

Routes:
- `/products` — Product catalog with search, filtering, and sorting
- `/details/:id` — Product detail page
- `/cart` — Shopping cart review and checkout
- `**` — Fallback redirect to catalog

## Tech stack

- Angular 16
- TypeScript 5
- RxJS for reactive state
- Angular Router for navigation
- Angular HttpClient for API requests
- Bootstrap 5 for responsive layout
- SCSS for component styling
- Fake Store API for product data

## Run locally

Requirements: Node.js 18+ and npm 9+.

```bash
git clone https://github.com/SamirNexus/Market.git
cd Market
npm install
npm start
```

Open `http://localhost:4200/`.

## Quality checks

```bash
npm run build
npm test
```

The production build is validated automatically on every push and pull request through GitHub Actions.

## Portfolio highlights

- Converted a design into a component-based Angular single-page application
- Integrated a public REST API through a dedicated typed service
- Implemented client-side product filtering and sorting
- Managed application state using RxJS `BehaviorSubject` for reactive cart updates
- Designed responsive layouts using Bootstrap and custom SCSS
- Demonstrated error handling, loading states, and empty states
- Configured CI/CD with GitHub Actions for automated testing and deployment

## Author

**Mohamed Samir** — Front-End Developer  
[GitHub](https://github.com/SamirNexus) · [LinkedIn](https://www.linkedin.com/in/samirnexus98/)
