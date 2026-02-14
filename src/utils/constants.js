export const STORAGE_KEY = 'foundations-data';
export const STORAGE_CONTACTS_KEY = 'foundations-contacts';
export const STORAGE_COMMUTE_KEY = 'foundations-commute-destinations';
export const STORAGE_DARK_MODE_KEY = 'foundations-dark-mode';
export const STORAGE_FORM_SECTIONS_KEY = 'foundations-form-sections';
export const STORAGE_LAST_EXPORT_KEY = 'foundations-last-export';
export const STORAGE_SYNC_QUEUE_KEY = 'foundations-sync-queue';
export const STORAGE_MIGRATION_KEY = 'foundations-migration-complete';

export const emptyProperty = {
  id: null,
  address: '',
  postcode: '',
  price: '',
  bedrooms: 3,
  bathrooms: 1,
  parking: '',
  garden: true,
  broadband: '',
  propertyType: 'semi-detached',
  tenure: 'freehold',
  sqft: '',
  epcRating: '',
  councilTaxBand: '',
  commuteToEastleigh: '',
  commuteToTotton: '',
  commuteTimes: {},
  agent: '',
  agentPhone: '',
  listingUrl: '',
  viewingDate: '',
  viewingNotes: '',
  pros: '',
  cons: '',
  status: 'interested',
  favorite: false,
  archived: false,
  dateAdded: null,
  rating: 0,
  firstTimeBuyer: false,
  floodRisk: '',
  subsidenceRisk: '',
  japaneseKnotweed: '',
  nearbyPlanning: '',
  mobileSignal: '',
  buildYear: '',
  constructionType: '',
  priceHistory: [],
  chainLength: '',
  sellerSituation: '',
  surveyLevel: '',
  surveyDate: '',
  surveyFindings: '',
  documents: {
    epcDownloaded: false,
    floorPlanSaved: false,
    listingScreenshot: false,
    titleRegisterChecked: false,
    floodReportRun: false,
    planningChecked: false,
    soldPricesChecked: false,
    surveyBooked: false,
    surveyReceived: false,
    searchesOrdered: false,
    searchesReceived: false
  },
  photos: [],
  latitude: '',
  longitude: '',
  offers: [],
  conveyancing: {
    offerAcceptedDate: '',
    solicitorInstructedDate: '',
    mortgageSubmittedDate: '',
    mortgageOfferDate: '',
    mortgageOfferExpiry: '',
    searchesOrderedDate: '',
    searchesReceivedDate: '',
    surveyBookedDate: '',
    surveyReceivedDate: '',
    enquiriesRaisedDate: '',
    enquiriesResolvedDate: '',
    exchangeDate: '',
    completionDate: ''
  }
};

export const emptyContacts = {
  solicitor: { name: '', firm: '', email: '', phone: '', reference: '' },
  broker: { name: '', firm: '', email: '', phone: '' },
  mortgage: { lender: '', product: '', rate: '', term: '' }
};

export const defaultDestinations = [
  { id: 'eastleigh', name: 'Eastleigh' },
  { id: 'totton', name: 'Totton' }
];

export const formSectionDefaults = {
  basicDetails: true, specifications: false, location: false,
  riskAssessment: false, chainSurvey: false, agentListing: false,
  photoGallery: false, viewingNotes: false, priceHistory: false,
  offerHistory: false, conveyancing: false
};

export const statusColors = {
  interested: 'bg-blue-100 text-blue-800',
  viewing_booked: 'bg-purple-100 text-purple-800',
  viewed: 'bg-amber-100 text-amber-800',
  offer_made: 'bg-orange-100 text-orange-800',
  offer_accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800'
};

export const statusLabels = {
  interested: 'Interested',
  viewing_booked: 'Viewing Booked',
  viewed: 'Viewed',
  offer_made: 'Offer Made',
  offer_accepted: 'Offer Accepted',
  rejected: 'Not Proceeding',
  withdrawn: 'Withdrawn'
};

export const preOfferDocs = [
  { key: 'epcDownloaded', label: 'EPC Downloaded' },
  { key: 'floorPlanSaved', label: 'Floor Plan Saved' },
  { key: 'listingScreenshot', label: 'Listing Screenshot' },
  { key: 'titleRegisterChecked', label: 'Title Register Checked' },
  { key: 'floodReportRun', label: 'Flood Report Run' },
  { key: 'planningChecked', label: 'Planning Checked' },
  { key: 'soldPricesChecked', label: 'Sold Prices Checked' }
];

export const postOfferDocs = [
  { key: 'surveyBooked', label: 'Survey Booked' },
  { key: 'surveyReceived', label: 'Survey Received' },
  { key: 'searchesOrdered', label: 'Searches Ordered' },
  { key: 'searchesReceived', label: 'Searches Received' }
];
