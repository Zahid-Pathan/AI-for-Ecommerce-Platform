## AI for E-Commerce Platform

This is a React-based e-commerce web application enhanced with **Smart NLP Search** to make finding products more natural and intuitive.  
Originally based on the [DredSoftLabs E-commerce Project](https://bitbucket.org/dredsoftlabs/ecommerce/src/main), this version adds AI-powered smart NLP search parsing to allow natural language queries like:
show me women clothing under $50
mens shoes above 100
electronics between 200 and 400
cheap jewelery with good reviews

## Features

### 🛒 E-Commerce Core
- Product listing with filtering by category.
- Product details page with similar product recommendations.
- Shopping cart with add/remove functionality.
- Checkout flow.
- Responsive design.

### 🧠 Smart NLP Search (New AI Feature)
- **Natural language query parsing**: Understands product category, price ranges, rating preferences, and keywords.
- Supports:
  - Category detection (`women clothing`, `mens shoes`, `electronics`, `jewelery`)
  - Price detection:
    - `under 50` / `under $50` / `under $ 50`
    - `above 100` / `over $100`
    - `between 50 and 100`
  - Rating detection: `good reviews`, `4 stars and above`
  - Keyword matching in product titles/descriptions.
- Handles synonyms and common typos (e.g., `womens` → `women's clothing`).
- Integrated search bar and **Search** button to trigger results.


## Run Locally

Clone the project

```bash
  git clone https://dredsoft-labs-admin@bitbucket.org/dredsoft-labs/ecommerce.git
```

Go to the project directory

```bash
  cd ecommerce
```

Install dependencies

```bash
  npm install

  or 

  npm install react-material-ui-carousel --save --legacy-peer-deps
```

Start the server

```bash
  npm start
```

The server should now be running. You can access the application by opening a web browser and entering the following URL:

```bash
  http://localhost:3000
```

## Bonus – Blockchain Integration Idea
This AI search could be paired with blockchain features such as:

- Token-gated pricing: Discounts for holders of specific tokens.

- On-chain user preferences: Store product interest categories in a wallet for personalized recommendations.

- Loyalty smart contracts: Reward users with tokens for purchases made via AI-driven search results.