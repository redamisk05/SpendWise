# SpendWise 💸

A responsive personal finance dashboard built by **Reda Misk**, a computer science student interested in software and web development.

SpendWise is a **frontend-only portfolio project** that helps you track income and expenses. No accounts, backend, or database are required.

## Features

- Add income and expense transactions with descriptions, categories, amounts, and dates
- View balance, income, and expenses in real time
- See a category breakdown in a CSS donut chart
- Search and filter transactions
- Delete transactions with confirmation
- Save transactions in the browser using `localStorage`
- Choose a display currency (CAD, USD, or EUR)
- Responsive dark-themed interface

> **Note:** Changing the currency changes the display symbol and formatting only; it does **not** convert amounts using exchange rates. Data is stored only in your current browser/device. Do not use this as a secure financial record system.

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Click **Add transaction** to start tracking.

No dependencies, build tools, API keys, or installation required.

## Project structure

```text
spendwise/
├── index.html     # Page structure and transaction form
├── styles.css     # Responsive dark dashboard styles
├── app.js         # State, calculations, chart, storage and events
└── README.md      # Documentation
```

## What I practiced

- Working with arrays and objects in JavaScript
- DOM manipulation and event handling
- Form validation
- Browser storage and JSON
- Responsive CSS layouts
- Rendering data and calculated summaries

## Future improvements

- Edit transactions
- Monthly filters and budget goals
- CSV export/import
- Automated tests

## Author

**Reda Misk** · [GitHub @redamisk05](https://github.com/redamisk05)

This project is intended for learning and portfolio demonstration.
