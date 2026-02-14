# Property Tracker

A local React app for tracking properties during your house search. Data is stored in your browser's localStorage and can be exported/imported as JSON files for backup.

## Features

- **Property Details**: Address, postcode, price, beds/baths, parking, garden, property type, tenure, size, EPC, council tax, broadband speed
- **Commute Times**: Track travel times to Eastleigh and Totton
- **Viewing Management**: Schedule viewings, track status, add notes
- **Pros & Cons**: Record what you liked and any concerns
- **Offer Tracking**: Log offers and their status
- **Organisation**: Favorites, 1-5 star ratings, search, sort
- **Data Backup**: Export to JSON / Import from JSON

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Open a terminal in VS Code (Ctrl+`)
2. Navigate to the project folder:
   ```bash
   cd D:\DEV\property-tracker
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:5173`

## Data Storage

- **Primary**: Data is stored in your browser's localStorage
- **Backup**: Use the Export button to download a JSON backup file
- **Restore**: Use the Import button to load data from a JSON file

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
