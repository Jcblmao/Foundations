// camelCase ↔ snake_case conversion for PocketBase

const camelToSnakeMap = {
  propertyType: 'property_type',
  councilTaxBand: 'council_tax',
  epcRating: 'epc_rating',
  agent: 'agent_name',
  agentPhone: 'agent_phone',
  agentEmail: 'agent_email',
  agentName: 'agent_name',
  listingUrl: 'listing_url',
  viewingDate: 'viewing_date',
  viewingTime: 'viewing_time',
  viewingNotes: 'viewing_notes',
  floodRisk: 'flood_risk',
  dateAdded: 'date_added',
  firstTimeBuyer: 'first_time_buyer',
  subsidenceRisk: 'subsidence_risk',
  japaneseKnotweed: 'japanese_knotweed',
  nearbyPlanning: 'nearby_planning',
  mobileSignal: 'mobile_signal',
  buildYear: 'build_year',
  constructionType: 'construction_type',
  priceHistory: 'price_history',
  chainLength: 'chain_length',
  sellerSituation: 'seller_situation',
  surveyLevel: 'survey_level',
  surveyDate: 'survey_date',
  surveyFindings: 'survey_findings',
  commuteTimes: 'commute_times',
  legacyId: 'legacy_id',
};

// Build reverse map
const snakeToCamelMap = Object.fromEntries(
  Object.entries(camelToSnakeMap).map(([k, v]) => [v, k])
);

// Fields that are stored as JSON in PocketBase (pass through as-is)
const jsonFields = new Set([
  'documents', 'conveyancing', 'offers', 'photos',
  'price_history', 'commute_times'
]);

// Fields that pass through without transformation (same name in both)
const passthroughFields = new Set([
  'address', 'postcode', 'price', 'status', 'bedrooms', 'bathrooms',
  'parking', 'garden', 'broadband', 'sqft', 'tenure', 'agent', 'notes',
  'pros', 'cons', 'favorite', 'archived', 'rating', 'latitude', 'longitude',
  'documents', 'conveyancing', 'offers', 'photos'
]);

/**
 * Convert a camelCase property object to a snake_case PocketBase record
 */
export function toDbRecord(property, userId) {
  const record = {};

  if (userId) {
    record.owner = userId;
  }

  for (const [key, value] of Object.entries(property)) {
    // Skip internal fields
    if (key === 'id') continue;

    const dbKey = camelToSnakeMap[key] || key;
    record[dbKey] = value;
  }

  return record;
}

/**
 * Convert a snake_case PocketBase record to a camelCase property object
 */
export function fromDbRecord(record) {
  const property = {};

  for (const [key, value] of Object.entries(record)) {
    // Skip PocketBase internal fields
    if (key === 'collectionId' || key === 'collectionName') continue;

    // Map 'owner' back but keep it for reference
    if (key === 'owner') continue;

    // PocketBase 'id' maps to property 'id'
    if (key === 'id') {
      property.id = value;
      continue;
    }

    // PocketBase timestamps
    if (key === 'created' || key === 'updated') continue;

    const jsKey = snakeToCamelMap[key] || key;
    property[jsKey] = value;
  }

  return property;
}
