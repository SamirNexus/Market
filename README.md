# Market — Angular E-Commerce Front End

[![CI](https://github.com/SamirNexus/Market/actions/workflows/ci.yml/badge.svg)](https://github.com/SamirNexus/Market/actions/workflows/ci.yml)
[![Angular](https://img.shields.io/badge/Angular-16-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Market is a responsive Angular e-commerce experience built from a Figma design. It demonstrates product discovery, product details, configurable options, currency selection, and cart interactions using a modular feature-based structure.

## Core features

- Product listing and category filtering
- Product details with API-driven content
- Configurable product attributes
- Cart page and quick-access cart overlay
- Add, remove, and update product quantities
- Currency selection across the shopping flow
- Loading states and reusable shared components
- Responsive desktop and mobile layouts
- Fallback routing to the product catalog

## Architecture

The application separates products, cart behavior, and shared UI into Angular feature modules. API communication is isolated in injectable services, while reusable controls such as the header, select input, and loading spinner live in the shared module.

```text
src/app/
├── products/   # Catalog, product cards, details, and product API service
├── carts/      # Cart UI and cart service
├── shared/     # Header, select, spinner, and shared state
└── app-routing.module.ts
```

## Tech stack

- Angular 16
- TypeScript 5
- RxJS
- Angular Router and HttpClient
- Bootstrap 5
- SCSS
- Fake Store API

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

- Converted a Figma shopping flow into a component-based Angular application
- Integrated product and category endpoints through dedicated services
- Kept cart, product, and shared concerns separated into feature modules
- Implemented responsive catalog, details, and cart experiences

## Author

**Mohamed Samir** — Front-End Developer  
[GitHub](https://github.com/SamirNexus) · [LinkedIn](https://www.linkedin.com/in/samirnexus98/)
