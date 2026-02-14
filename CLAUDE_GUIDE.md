# Property Tracker - Claude Agent Development Guide

This guide provides fundamental knowledge for a Claude agent to understand, maintain, and extend this React property tracking application.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Data Model](#data-model)
5. [Application Architecture](#application-architecture)
6. [Key Patterns & Conventions](#key-patterns--conventions)
7. [Styling System](#styling-system)
8. [State Management](#state-management)
9. [Data Persistence](#data-persistence)
10. [Common Modifications](#common-modifications)
11. [Testing Changes](#testing-changes)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Purpose**: A local web application for tracking properties during a UK house search. Users can log properties they're interested in, record viewing notes, track offers, and compare options.

**Target User**: Jacob Newman, searching for properties in Hampshire (Totton/Eastleigh area). The app includes commute time fields specifically for his two key locations.

**Key Features**:
- Add/edit/delete property listings
- Track viewing dates and notes
- Record pros, cons, and personal ratings
- Log offer history with full timeline
- Filter by favorites, search by address/postcode
- Sort by date added, price, or rating
- Export/import data as JSON for backup
- Upcoming viewings dashboard (next 7 days)
- Price history tracking with timeline
- Document checklist with progress bar (immediate save)
- Risk assessment with warning badges on cards
- Side-by-side property comparison (up to 4)
- Quick-add from listing URL
- Collapsible form sections (10 sections, state persisted)
- Stamp duty calculator (standard + first-time buyer rates)
- Conveyancing progress tracker (13-step visual timeline)
- Professional contacts management (solicitor, broker, mortgage)
- Dark mode toggle (class-based Tailwind dark mode, persisted)
- Archive vs hard delete (soft delete first, permanent delete for archived)
- Configurable commute destinations (up to 4, user-managed, persisted)
- Mobile swipe gestures (swipe left to reveal card actions)

---

## Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool and dev server |
| Tailwind CSS | 3.x | Utility-first CSS styling |
| Lucide React | 0.263.x | Icon library |

### Why These Choices?

- **Vite**: Fast hot module replacement (HMR), modern ES modules, minimal config
- **Tailwind**: Rapid prototyping, consistent design system, no CSS file management
- **Lucide**: Lightweight, tree-shakeable icons, React-native components
- **localStorage**: No backend needed, data stays on user's machine

### Build Commands

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Production build to /dist folder
npm run preview  # Preview production build locally
```

---

## Project Structure

```
D:\DEV\property-tracker\
│
├── index.html              # HTML entry point, mounts React app
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS plugins (required by Tailwind)
│
├── public/
│   └── house.svg           # Favicon
│
├── src/
│   ├── main.jsx            # React entry point, renders <App />
│   ├── index.css           # Global styles + Tailwind directives
│   └── App.jsx             # Main application component (ALL logic here)
│
├── sample-data.json        # Example property data for import
├── README.md               # User-facing documentation
└── CLAUDE_GUIDE.md         # This file - agent development guide
```

### File Responsibilities

| File | Responsibility |
|------|----------------|
| `main.jsx` | Bootstraps React, renders App into DOM |
| `index.css` | Tailwind base/components/utilities + global styles |
| `App.jsx` | **All application logic** - state, handlers, UI components |

**Note**: This is a single-component application. All logic lives in `App.jsx` for simplicity. For larger apps, you would split into multiple components.

---

## Data Model

### Property Object Schema

```javascript
{
  // Identification
  id: string,              // Unique ID (timestamp-based)
  dateAdded: string,       // ISO date string

  // Basic Details
  address: string,         // Full address (required)
  postcode: string,        // UK postcode (e.g., "SO40 3XX")
  price: string,           // Asking price in pounds (stored as string for flexibility)
  firstTimeBuyer: boolean, // First-time buyer? Affects stamp duty (default: false)

  // Property Specifications
  bedrooms: number,        // Number of bedrooms (default: 3)
  bathrooms: number,       // Number of bathrooms (default: 1)
  parking: string,         // Description (e.g., "Driveway + garage")
  garden: boolean,         // Has garden? (default: true)
  broadband: string,       // Speed info (e.g., "1Gbps available")
  propertyType: string,    // One of: 'detached', 'semi-detached', 'end-terrace', 'terraced', 'bungalow'
  tenure: string,          // One of: 'freehold', 'leasehold', 'share-of-freehold'
  sqft: string,            // Size in square feet
  epcRating: string,       // Energy rating: A-G or empty
  councilTaxBand: string,  // Council tax band: A-H or empty
  buildYear: string,       // Build year or decade (e.g., "1970" or "1960s")
  constructionType: string,// '', 'Standard Brick', 'Non-Standard'
  priceHistory: array,     // [{date, price, note}] - chronological price changes

  // Location (configurable commute destinations)
  commuteToEastleigh: string,  // Legacy field (migrated to commuteTimes)
  commuteToTotton: string,     // Legacy field (migrated to commuteTimes)
  commuteTimes: object,        // Dynamic commute times keyed by destination ID, e.g. {eastleigh: '15', totton: '5'}
  archived: boolean,           // Whether property is archived (soft delete, default: false)

  // Agent Information
  agent: string,           // Estate agent name
  agentPhone: string,      // Agent phone number
  listingUrl: string,      // URL to property listing

  // Viewing & Assessment
  viewingDate: string,     // ISO datetime for viewing appointment
  viewingNotes: string,    // Notes from the viewing
  pros: string,            // What the user liked (multiline)
  cons: string,            // Concerns or issues (multiline)
  status: string,          // Pipeline status (see Status Values below)

  // Risk Assessment
  floodRisk: string,       // '', 'Zone 1 - Low', 'Zone 2 - Medium', 'Zone 3 - High', 'Unchecked'
  subsidenceRisk: string,  // '', 'Low', 'Medium', 'High', 'Unchecked'
  japaneseKnotweed: string,// '', 'None Found', 'Present', 'Nearby', 'Unchecked'
  nearbyPlanning: string,  // '', 'None', 'Minor', 'Major Concern', 'Unchecked'
  mobileSignal: string,    // '', 'Good', 'Patchy', 'Poor', 'Unchecked'

  // Chain & Survey
  chainLength: string,     // '', 'No Chain', '1', '2', '3+', 'Unknown'
  sellerSituation: string, // '', 'Buying Onward', 'Renting', 'Probate', 'Investor Sale', 'Unknown'
  surveyLevel: string,     // '', 'None Yet', 'Valuation Only', 'Level 2 HomeBuyer', 'Level 3 Building'
  surveyDate: string,      // Date string
  surveyFindings: string,  // Multiline text

  // Document Checklist (nested object, all booleans default false)
  documents: {
    epcDownloaded, floorPlanSaved, listingScreenshot,
    titleRegisterChecked, floodReportRun, planningChecked,
    soldPricesChecked, surveyBooked, surveyReceived,
    searchesOrdered, searchesReceived
  },

  // Offer History (replaced old offerMade/offerStatus)
  offers: array,           // [{id, date, amount, status, response, notes}]
                           // status: 'Submitted', 'Accepted', 'Rejected', 'Countered', 'Withdrawn'

  // Conveyancing (nested object, all date strings default '')
  conveyancing: {
    offerAcceptedDate, solicitorInstructedDate, mortgageSubmittedDate,
    mortgageOfferDate, mortgageOfferExpiry, searchesOrderedDate,
    searchesReceivedDate, surveyBookedDate, surveyReceivedDate,
    enquiriesRaisedDate, enquiriesResolvedDate, exchangeDate, completionDate
  },

  // User Organisation
  favorite: boolean,       // Is this a favorite? (default: false)
  rating: number           // 1-5 star rating (default: 0)
}
```

### Professional Contacts (Global, separate from properties)

Stored in localStorage under `property-tracker-contacts`:

```javascript
{
  solicitor: { name, firm, email, phone, reference },
  broker: { name, firm, email, phone },
  mortgage: { lender, product, rate, term }
}
```

### Status Values

The `status` field tracks where a property is in the user's pipeline:

| Value | Label | Colour |
|-------|-------|--------|
| `interested` | Interested | Blue |
| `viewing_booked` | Viewing Booked | Purple |
| `viewed` | Viewed | Amber |
| `offer_made` | Offer Made | Orange |
| `offer_accepted` | Offer Accepted | Green |
| `rejected` | Not Proceeding | Red |
| `withdrawn` | Withdrawn | Gray |

### Empty Property Template

The `emptyProperty` constant defines defaults for new properties. It contains ~35 fields across 8 groups: basic details, specifications, location, risk assessment, chain & survey, documents (nested object), offers (array), and conveyancing (nested object). See the full schema above for all fields and their defaults.

---

## Application Architecture

### Component Hierarchy

```
App (main component)
├── Notification (conditional)
├── Header
│   ├── Logo & Title
│   └── Action Buttons (Export, Import, Contacts, Quick Add, Add Property)
├── Search/Filter Bar
│   ├── Search Input
│   ├── Favorites Toggle
│   └── Sort Dropdown
├── Upcoming Viewings Dashboard (conditional, collapsible)
├── Property Form Modal (conditional)
│   ├── Section 1: Basic Details (+ first-time buyer toggle, SDLT display)
│   ├── Section 2: Specifications
│   ├── Section 3: Location
│   ├── Section 4: Risk Assessment
│   ├── Section 5: Chain & Survey
│   ├── Section 6: Agent & Listing
│   ├── Section 7: Viewing & Notes
│   ├── Section 8: Offer History
│   ├── Section 9: Price History
│   ├── Section 10: Conveyancing Progress (only when status = offer_accepted)
│   └── Form Buttons
├── Quick Add Modal (conditional)
├── Professional Contacts Modal (conditional)
├── Comparison Modal (conditional)
├── Floating Compare Button (when 2+ selected)
└── Property List
    └── Property Card (repeated)
        ├── Card Header (status, address, compare/favorite/edit/delete)
        ├── Quick Stats (price, beds, baths, etc.)
        ├── Commute Badges
        ├── Risk Warning Badges (amber/red for elevated risks)
        ├── Latest Offer Badge + Mortgage Expiry Warning
        ├── Rating Stars
        └── Expanded Details (conditional)
            ├── Property Details + SDLT breakdown
            ├── Agent & Listing
            ├── Viewing Info
            ├── Offer History timeline
            ├── Pros & Cons
            ├── Notes
            ├── Risk Assessment
            ├── Chain & Survey
            ├── Price History timeline
            ├── Document Checklist (immediate-save checkboxes)
            └── Conveyancing Progress (only for offer_accepted)
```

### State Variables

```javascript
// Core state
const [properties, setProperties] = useState([]);       // All property data
const [loading, setLoading] = useState(true);           // Initial load state
const [showForm, setShowForm] = useState(false);        // Form modal visibility
const [editingId, setEditingId] = useState(null);       // ID being edited (null = new)
const [expandedId, setExpandedId] = useState(null);     // Expanded card (null = all collapsed)
const [searchTerm, setSearchTerm] = useState('');       // Search input
const [filterFavorites, setFilterFavorites] = useState(false);
const [sortBy, setSortBy] = useState('dateAdded');      // Sort field
const [notification, setNotification] = useState(null); // Toast notification
const [formData, setFormData] = useState(emptyProperty);// Current form state

// Feature state
const [compareIds, setCompareIds] = useState([]);       // IDs for comparison (max 4)
const [showCompareModal, setShowCompareModal] = useState(false);
const [viewingsDashboardCollapsed, setViewingsDashboardCollapsed] = useState(false);
const [showQuickAdd, setShowQuickAdd] = useState(false);
const [quickAddUrl, setQuickAddUrl] = useState('');
const [showContactsModal, setShowContactsModal] = useState(false);
const [showOfferForm, setShowOfferForm] = useState(false);
const [offerEntry, setOfferEntry] = useState({...});    // Current offer form entry
const [professionalContacts, setProfessionalContacts] = useState({...}); // Global contacts

// Form section collapse states (persisted to localStorage)
const [formSections, setFormSections] = useState({...}); // 10 section keys
const [showPriceHistoryModal, setShowPriceHistoryModal] = useState(false);
const [priceHistoryEntry, setPriceHistoryEntry] = useState({...});
```

### Computed Values

```javascript
const filteredProperties = properties.filter(...).sort(...); // Search + filter + sort
const upcomingViewings = properties.filter(in next 7 days).sort(by date); // Dashboard
```

### Data Flow

```
User Action
    ↓
Event Handler (e.g., handleSubmit, handleDelete)
    ↓
Update properties array
    ↓
saveProperties() - writes to localStorage + updates state
    ↓
React re-renders UI
    ↓
filteredProperties computed (search + filter + sort)
    ↓
Property cards rendered
```

---

## Key Patterns & Conventions

### 1. Controlled Form Inputs

All form inputs are controlled components - their value comes from React state:

```jsx
<input
  type="text"
  value={formData.address}
  onChange={(e) => setFormData({...formData, address: e.target.value})}
/>
```

### 2. Spread Operator for Immutable Updates

Never mutate state directly. Use spread to create new objects/arrays:

```javascript
// Updating a single property in the array
const updated = properties.map(p => 
  p.id === editingId ? { ...formData, id: editingId } : p
);

// Updating form state
setFormData({...formData, address: 'New Address'});
```

### 3. Conditional Rendering

Use `&&` for simple conditions, ternary for if/else:

```jsx
{/* Show only if property has parking */}
{property.parking && (
  <div>{property.parking}</div>
)}

{/* If/else rendering */}
{expandedId === property.id ? (
  <span>Show Less</span>
) : (
  <span>Show More</span>
)}
```

### 4. List Rendering with Keys

Always use unique `key` prop when mapping arrays:

```jsx
{filteredProperties.map(property => (
  <div key={property.id}>
    {/* card content */}
  </div>
))}
```

### 5. Event Handler Naming

- Handlers that respond to events: `handleXxx` (e.g., `handleSubmit`, `handleEdit`)
- Handlers that toggle state: `toggleXxx` (e.g., `toggleFavorite`, `toggleDocumentCheck`, `toggleCompare`)
- Handlers that update specific values: `updateXxx` (e.g., `updateRating`)
- Handlers that add/remove from arrays: `addXxx` / `removeXxx` (e.g., `addOffer`, `removeOffer`, `addPriceHistoryEntry`)
- Pure functions: `calculateXxx` (e.g., `calculateStampDuty`)

### 6. Collapsible Form Sections

The form uses a `renderFormSectionHeader(sectionKey, title, icon)` render function (not a component, to avoid re-mount issues) that creates clickable section headers. Section collapse state is tracked in `formSections` object and persisted to localStorage.

```jsx
{renderFormSectionHeader('sectionKey', 'Section Title', <Icon size={18} />)}
{formSections.sectionKey && (
  <div className="p-4 border border-t-0 border-slate-200 rounded-b-lg">
    {/* Section content */}
  </div>
)}
```

### 7. Immediate-Save Pattern

Some UI elements save directly to properties without opening the edit form. The `toggleDocumentCheck` handler follows the same pattern as `toggleFavorite`:

```javascript
const toggleDocumentCheck = (propertyId, docKey) => {
  const updated = properties.map(p => {
    if (p.id === propertyId) {
      return { ...p, documents: { ..., [docKey]: !p.documents[docKey] } };
    }
    return p;
  });
  saveProperties(updated);
};
```

---

## Styling System

### Tailwind CSS Classes

This app uses Tailwind CSS exclusively. No custom CSS classes are defined.

**Common Patterns Used**:

```jsx
// Flexbox layouts
className="flex items-center gap-2"
className="flex flex-col md:flex-row"

// Grid layouts
className="grid grid-cols-1 md:grid-cols-2 gap-4"

// Spacing
className="p-4 md:p-6"      // padding
className="mb-6"            // margin-bottom
className="gap-4"           // gap between flex/grid items

// Colours
className="bg-white"                           // background
className="text-slate-700"                     // text colour
className="border border-slate-200"            // border
className="bg-gradient-to-r from-emerald-500 to-teal-600"  // gradient

// Rounded corners
className="rounded-lg"      // medium rounding
className="rounded-xl"      // large rounding
className="rounded-2xl"     // extra large rounding
className="rounded-full"    // pill shape

// Shadows
className="shadow-sm"       // subtle shadow
className="shadow-lg"       // prominent shadow

// Responsive design (mobile-first)
className="text-sm md:text-base"  // smaller on mobile, normal on desktop

// Interactive states
className="hover:bg-slate-50"
className="focus:outline-none focus:ring-2 focus:ring-emerald-500"
className="transition-all"
```

### Colour Palette

| Use | Tailwind Classes |
|-----|------------------|
| Primary action | `from-emerald-500 to-teal-600` (gradient) |
| Primary text | `text-slate-800` |
| Secondary text | `text-slate-500`, `text-slate-600` |
| Borders | `border-slate-200` |
| Backgrounds | `bg-white`, `bg-slate-50`, `bg-slate-100` |
| Success | `bg-green-500`, `text-green-800` |
| Error | `bg-red-500`, `text-red-800` |
| Warning | `bg-amber-100`, `text-amber-800` |
| Info | `bg-blue-100`, `text-blue-800` |

### Status Badge Colours

Defined in `statusColors` object:

```javascript
const statusColors = {
  interested: 'bg-blue-100 text-blue-800',
  viewing_booked: 'bg-purple-100 text-purple-800',
  viewed: 'bg-amber-100 text-amber-800',
  offer_made: 'bg-orange-100 text-orange-800',
  offer_accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800'
};
```

---

## State Management

### Local State Only

This app uses React's built-in `useState` hook. No external state management library (Redux, Zustand, etc.) is needed for this scale.

### State Update Patterns

**Adding a new property**:
```javascript
const newProperty = {
  ...formData,
  id: Date.now().toString(),
  dateAdded: new Date().toISOString()
};
saveProperties([...properties, newProperty]);
```

**Updating an existing property**:
```javascript
const updated = properties.map(p => 
  p.id === editingId ? { ...formData, id: editingId } : p
);
saveProperties(updated);
```

**Deleting a property**:
```javascript
const filtered = properties.filter(p => p.id !== id);
saveProperties(filtered);
```

**Toggling a boolean field**:
```javascript
const updated = properties.map(p => 
  p.id === id ? { ...p, favorite: !p.favorite } : p
);
saveProperties(updated);
```

### Computed/Derived State

`filteredProperties` is computed on every render (not stored in state):

```javascript
const filteredProperties = properties
  .filter(p => {
    const matchesSearch = p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.postcode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorite = !filterFavorites || p.favorite;
    return matchesSearch && matchesFavorite;
  })
  .sort((a, b) => {
    switch (sortBy) {
      case 'price': return (parseInt(a.price) || 0) - (parseInt(b.price) || 0);
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'dateAdded': return new Date(b.dateAdded) - new Date(a.dateAdded);
      default: return 0;
    }
  });
```

---

## Data Persistence

### localStorage Keys

| Key | Data | Purpose |
|-----|------|---------|
| `property-tracker-data` | Property array | All property data |
| `property-tracker-form-sections` | Section collapse states | Form section expand/collapse preferences |
| `property-tracker-contacts` | Professional contacts | Solicitor, broker, mortgage details |
| `property-tracker-dark-mode` | `'true'`/`'false'` | Dark mode preference |
| `property-tracker-commute-destinations` | Destinations array | User-configured commute destinations (up to 4) |

### Backward Compatibility

When loading data from localStorage or importing, each property is merged with `emptyProperty` defaults to ensure new fields get default values:

```javascript
const merged = parsed.map(p => {
  // Migrate old offerMade/offerStatus to offers array
  let offers = p.offers && p.offers.length > 0 ? p.offers : [];
  if (offers.length === 0 && p.offerMade) {
    offers = [{ id, date, amount: p.offerMade, status: statusMap[p.offerStatus], ... }];
  }
  return {
    ...emptyProperty, ...p,
    offers,
    documents: { ...emptyProperty.documents, ...(p.documents || {}) },
    conveyancing: { ...emptyProperty.conveyancing, ...(p.conveyancing || {}) }
  };
});
```

This merge happens in 3 places: localStorage load, `importData`, and `handleEdit`.

### Export/Import

**Export** produces a JSON object with both properties and contacts:
```javascript
const exportObj = { properties, professionalContacts };
```

**Import** handles both formats:
- Old format: `Array` (plain properties array, no contacts)
- New format: `{ properties: [...], professionalContacts: {...} }`

---

## Common Modifications

### Adding a New Field to Properties

1. **Update `emptyProperty`** - add default value:
   ```javascript
   const emptyProperty = {
     // ... existing fields
     newField: '',  // or appropriate default
   };
   ```

2. **Add form input** in the form section:
   ```jsx
   <div>
     <label className="block text-sm font-medium text-slate-600 mb-1">New Field</label>
     <input
       type="text"
       value={formData.newField}
       onChange={(e) => setFormData({...formData, newField: e.target.value})}
       placeholder="Enter value"
       className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
     />
   </div>
   ```

3. **Display in card** (quick stats or expanded section):
   ```jsx
   {property.newField && (
     <div className="flex items-center gap-1.5 text-slate-600">
       <SomeIcon size={16} className="text-slate-400" />
       {property.newField}
     </div>
   )}
   ```

### Adding a New Status

1. **Update `statusColors`**:
   ```javascript
   const statusColors = {
     // ... existing
     new_status: 'bg-pink-100 text-pink-800',
   };
   ```

2. **Update `statusLabels`**:
   ```javascript
   const statusLabels = {
     // ... existing
     new_status: 'New Status Label',
   };
   ```

### Adding a New Sort Option

1. **Add option to dropdown**:
   ```jsx
   <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
     <option value="dateAdded">Newest First</option>
     <option value="price">Price (Low to High)</option>
     <option value="rating">Rating (High to Low)</option>
     <option value="newSort">New Sort Option</option>  {/* Add this */}
   </select>
   ```

2. **Add case to sort logic**:
   ```javascript
   .sort((a, b) => {
     switch (sortBy) {
       // ... existing cases
       case 'newSort': return /* your comparison logic */;
       default: return 0;
     }
   });
   ```

### Adding a New Filter

1. **Add state variable**:
   ```javascript
   const [filterNewThing, setFilterNewThing] = useState(false);
   ```

2. **Add filter UI** (button or checkbox):
   ```jsx
   <button
     onClick={() => setFilterNewThing(!filterNewThing)}
     className={`... ${filterNewThing ? 'active-styles' : 'inactive-styles'}`}
   >
     Filter Label
   </button>
   ```

3. **Update filter logic**:
   ```javascript
   const filteredProperties = properties.filter(p => {
     // ... existing filters
     const matchesNewFilter = !filterNewThing || p.someField === someValue;
     return matchesSearch && matchesFavorite && matchesNewFilter;
   });
   ```

### Adding a New Icon

Icons come from Lucide React. To add a new icon:

1. **Import it**:
   ```javascript
   import { Home, Plus, NewIcon } from 'lucide-react';
   ```

2. **Use it**:
   ```jsx
   <NewIcon size={16} className="text-slate-400" />
   ```

Browse available icons at: https://lucide.dev/icons/

---

## Testing Changes

### Development Workflow

1. Run `npm run dev` to start the dev server
2. Make changes to `src/App.jsx`
3. Vite will hot-reload - changes appear instantly in browser
4. Check browser console (F12) for errors
5. Test the feature manually

### Manual Test Checklist

When modifying the app, verify these core functions still work:

- [ ] Add new property (form opens, saves correctly)
- [ ] Edit existing property (loads data, saves changes)
- [ ] Delete property (confirms, removes from list)
- [ ] Toggle favorite (star icon updates, persists)
- [ ] Update rating (stars fill correctly, persists)
- [ ] Search by address (filters in real-time)
- [ ] Search by postcode (filters in real-time)
- [ ] Filter favorites only (hides non-favorites)
- [ ] Sort by each option (order changes correctly)
- [ ] Expand/collapse card (shows/hides details)
- [ ] Export data (downloads valid JSON file)
- [ ] Import data (loads properties correctly)
- [ ] Refresh page (data persists from localStorage)

### Common Issues

**Form not submitting**: Check that required field (`address`) has a value and the form has `onSubmit={handleSubmit}`.

**Data not persisting**: Check browser console for localStorage errors. Some browsers block localStorage in private/incognito mode.

**Styles not applying**: Ensure Tailwind classes are spelled correctly. Check `tailwind.config.js` includes the correct content paths.

**Icons not showing**: Verify the icon name is correct and imported from `lucide-react`.

---

## Troubleshooting

### "Module not found" Errors

Run `npm install` to ensure all dependencies are installed.

### Blank Page / React Errors

Open browser DevTools (F12) → Console tab to see error messages.

### Styles Look Wrong

1. Check `index.css` has Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

2. Ensure `postcss.config.js` and `tailwind.config.js` exist.

3. Restart dev server after config changes.

### localStorage Full

If localStorage is full (usually 5-10MB limit), the app will fail to save. Export data, clear localStorage in DevTools, then import again.

### Changes Not Appearing

1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Restart Vite dev server

---

## Future Enhancement Ideas

Potential improvements (see TODO comments at top of App.jsx):

1. **Multiple commute destinations** - Make commute fields dynamic instead of hardcoded
2. **Photo gallery** - Store/display property photos
3. **Map view** - Show properties on an interactive map
4. **Dark mode** - Toggle between light/dark themes
5. **Mobile swipe gestures** - Swipe to expand/collapse cards
6. **Broadband checker API** - Integrate with API for speed checks
7. **Archive vs hard delete** - Soft delete with archive
8. **Rightmove/Zoopla scraping** - Auto-extract listing details
9. **Print view** - Formatted printout of property details
10. **Cloud sync** - Optional backup to cloud storage

---

## Summary

This is a self-contained React application with:

- **Single source file** (`App.jsx`, ~1800 lines) containing all logic
- **localStorage** for persistence (3 keys: data, form-sections, contacts)
- **Tailwind CSS** for styling (no custom CSS)
- **Lucide React** for icons (~30 icons imported)

Key things to remember:
- Always use immutable updates (spread operator)
- Call `saveProperties()` to persist property changes
- Deep merge nested objects (`documents`, `conveyancing`) for backward compatibility
- Form state is controlled via `formData`; form sections collapse state via `formSections`
- Professional contacts are global (not per-property) with separate localStorage key
- Filtered/sorted list and upcoming viewings are computed, not stored
- Document checkboxes and favorites use immediate-save pattern (no form needed)
- Collapsible sections use render function pattern (not inline components)
- Export format is `{properties, professionalContacts}` (import handles both old array and new object)
- Test manually after changes

For questions about React, Vite, or Tailwind, refer to their official documentation:
- React: https://react.dev/
- Vite: https://vitejs.dev/
- Tailwind: https://tailwindcss.com/docs

---

*Last updated: February 2026*
