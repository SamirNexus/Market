# Market — Angular E-Commerce Front End

[![CI](https://github.com/SamirNexus/Market/actions/workflows/ci.yml/badge.svg)](https://github.com/SamirNexus/Market/actions/workflows/ci.yml)
[![Angular](https://img.shields.io/badge/Angular-16-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Live demo:** https://market-two-rosy.vercel.app

Market is a responsive Angular e-commerce interface that demonstrates modern front-end architecture. It fetches real product data from the Fake Store API, integrating API requests, client-side search and sorting, API-driven category filtering, cart persistence, and responsive design.

## Core features

- Product listing from API with client-side search and sorting, plus API-based category filtering
- Product details page with routing
- Shopping cart with add, remove, and quantity controls
- Cart persistence using localStorage with malformed-data fallback
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

The application is organized into feature-focused Angular modules with clear separation of concerns:

```text
src/app/
├── products/   # Catalog, product details, product cards, API service, and models
├── carts/      # Cart component and reactive cart state service
├── shared/     # Reusable UI components and shared Angular dependencies
└── app-routing.module.ts
```

Routes:

- `/products` — Product catalog with search, filtering, and sorting
- `/details/:id` — Product detail page
- `/cart` — Shopping cart review and demo checkout
- `**` — Fallback redirect to catalog

## Tech stack

- Angular 16
- TypeScript 5
- RxJS for reactive state
- Angular Router for navigation
- Angular HttpClient for API requests
- Bootstrap 5 for responsive layout
- SCSS for component styling
- Jasmine + Karma for unit tests
- Fake Store API for product data
- Vercel for the portfolio deployment

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
npm run test:ci
```

GitHub Actions validates the production build and runs the unit test suite on pushes and pull requests.

## Portfolio highlights

- Converted a design into a component-based Angular single-page application
- Integrated a public REST API through a dedicated typed service
- Implemented client-side search and sorting with API-driven category filtering
- Managed application state using RxJS `BehaviorSubject` for reactive cart updates
- Added defensive localStorage restoration for malformed cart data
- Added route-aware product detail loading
- Added focused behavioral tests for cart logic, API contracts, catalog behavior, and route changes
- Configured GitHub Actions for automated production builds and headless unit tests
- Deployed the portfolio demo with Vercel

## Author

**Mohamed Samir** — Front-End Developer  
[GitHub](https://github.com/SamirNexus) · [LinkedIn](https://www.linkedin.com/in/samirnexus98/)
