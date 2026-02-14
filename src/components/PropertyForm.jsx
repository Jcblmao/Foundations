import React, { useState } from 'react';
import { Home, Bed, Clock, Shield, FileText, Calendar, History, Briefcase, Image, Plus, Trash2, X, ChevronDown, ChevronRight, MapPin, Wifi, Settings } from 'lucide-react';
import { statusLabels } from '../utils/constants';
import { calculateStampDuty } from '../utils/stampDuty';

export default function PropertyForm({
  show,
  editingId,
  formData,
  setFormData,
  formSections,
  setFormSections,
  commuteDestinations,
  onSubmit,
  onClose,
  onShowCommuteSettings,
  onGeocodePostcode
}) {
  if (!show) return null;

  const [showPhotoUrlInput, setShowPhotoUrlInput] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerEntry, setOfferEntry] = useState({ date: '', amount: '', status: 'Submitted', response: '', notes: '' });
  const [showPriceHistoryModal, setShowPriceHistoryModal] = useState(false);
  const [priceHistoryEntry, setPriceHistoryEntry] = useState({ date: '', price: '', note: '' });

  const addPhoto = () => {
    if (!newPhotoUrl) return;
    if ((formData.photos || []).length >= 20) return;
    setFormData(prev => ({ ...prev, photos: [...(prev.photos || []), newPhotoUrl] }));
    setNewPhotoUrl('');
    setShowPhotoUrlInput(false);
  };

  const removePhoto = (index) => {
    setFormData(prev => ({ ...prev, photos: (prev.photos || []).filter((_, i) => i !== index) }));
  };

  const addOffer = () => {
    if (!offerEntry.date || !offerEntry.amount) return;
    setFormData(prev => ({ ...prev, offers: [...(prev.offers || []), { ...offerEntry, id: Date.now().toString() }] }));
    setOfferEntry({ date: '', amount: '', status: 'Submitted', response: '', notes: '' });
    setShowOfferForm(false);
  };

  const removeOffer = (index) => {
    setFormData(prev => ({ ...prev, offers: prev.offers.filter((_, i) => i !== index) }));
  };

  const addPriceHistoryEntry = () => {
    if (!priceHistoryEntry.date || !priceHistoryEntry.price) return;
    setFormData(prev => ({ ...prev, priceHistory: [...(prev.priceHistory || []), { ...priceHistoryEntry }] }));
    setPriceHistoryEntry({ date: '', price: '', note: '' });
    setShowPriceHistoryModal(false);
  };

  const removePriceHistoryEntry = (index) => {
    setFormData(prev => ({ ...prev, priceHistory: prev.priceHistory.filter((_, i) => i !== index) }));
  };

  const renderSectionHeader = (sectionKey, title, icon) => (
    <button
      type="button"
      onClick={() => setFormSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))}
      className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all rounded-lg border border-slate-200 dark:border-slate-600"
    >
      <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
        {icon} {title}
      </h3>
      {formSections[sectionKey] ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-40 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl my-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {editingId ? 'Edit Property' : 'Add New Property'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Section 1: Basic Details */}
          <div>
            {renderSectionHeader('basicDetails', 'Basic Details', <Home size={18} />)}
            {formSections.basicDetails && (
              <div className="p-4 space-y-4 border border-t-0 border-slate-200 dark:border-slate-600 rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Address *</label>
                    <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="e.g. 42 Southern Gardens, Totton" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Postcode</label>
                    <div className="flex gap-2">
                      <input type="text" value={formData.postcode} onChange={(e) => setFormData({...formData, postcode: e.target.value})} placeholder="SO40 3XX" className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      <button type="button" onClick={() => onGeocodePostcode(formData.postcode)} disabled={!formData.postcode} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1 transition-all" title="Find coordinates for map view">
                        <MapPin size={14} /> Locate
                      </button>
                    </div>
                    {formData.latitude && formData.longitude && (
                      <p className="text-xs text-slate-400 mt-1">{parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Asking Price (£)</label>
                    <input type="text" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="350000" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Property Type</label>
                    <select value={formData.propertyType} onChange={(e) => setFormData({...formData, propertyType: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="detached">Detached</option>
                      <option value="semi-detached">Semi-Detached</option>
                      <option value="end-terrace">End Terrace</option>
                      <option value="terraced">Terraced</option>
                      <option value="bungalow">Bungalow</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Tenure</label>
                    <select value={formData.tenure} onChange={(e) => setFormData({...formData, tenure: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="freehold">Freehold</option>
                      <option value="leasehold">Leasehold</option>
                      <option value="share-of-freehold">Share of Freehold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="firstTimeBuyer" checked={formData.firstTimeBuyer} onChange={(e) => setFormData({...formData, firstTimeBuyer: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                    <label htmlFor="firstTimeBuyer" className="text-sm font-medium text-slate-600">First-time buyer</label>
                  </div>
                  {formData.price && (
                    <div className="md:col-span-2 bg-slate-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        Stamp Duty (SDLT): £{calculateStampDuty(formData.price, formData.firstTimeBuyer).total.toLocaleString()}
                        <span className="text-slate-500 font-normal ml-2">({calculateStampDuty(formData.price, formData.firstTimeBuyer).effectiveRate}% effective rate)</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Specifications */}
          <div>
            {renderSectionHeader('specifications', 'Specifications', <Bed size={18} />)}
            {formSections.specifications && (
              <div className="p-4 space-y-4 border border-t-0 border-slate-200 dark:border-slate-600 rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Bedrooms</label>
                    <input type="number" min="1" max="10" value={formData.bedrooms} onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value) || 1})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Bathrooms</label>
                    <input type="number" min="1" max="10" value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value) || 1})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Parking</label>
                    <input type="text" value={formData.parking} onChange={(e) => setFormData({...formData, parking: e.target.value})} placeholder="e.g. Driveway + garage" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Broadband Speed</label>
                    <div className="flex gap-2">
                      <input type="text" value={formData.broadband} onChange={(e) => setFormData({...formData, broadband: e.target.value})} placeholder="e.g. 1Gbps available" className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      <button type="button" onClick={() => { const pc = encodeURIComponent(formData.postcode || ''); window.open(`https://www.broadbandchecker.co.uk/postcode/${pc}`, '_blank'); }} disabled={!formData.postcode} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1 transition-all" title="Check broadband availability for this postcode">
                        <Wifi size={14} /> Check
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Size (sq ft)</label>
                    <input type="text" value={formData.sqft} onChange={(e) => setFormData({...formData, sqft: e.target.value})} placeholder="e.g. 916" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">EPC Rating</label>
                    <select value={formData.epcRating} onChange={(e) => setFormData({...formData, epcRating: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">Unknown</option>
                      <option value="A">A</option><option value="B">B</option><option value="C">C</option>
                      <option value="D">D</option><option value="E">E</option><option value="F">F</option><option value="G">G</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Council Tax Band</label>
                    <select value={formData.councilTaxBand} onChange={(e) => setFormData({...formData, councilTaxBand: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">Unknown</option>
                      <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                      <option value="E">E</option><option value="F">F</option><option value="G">G</option><option value="H">H</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Build Year</label>
                    <input type="text" value={formData.buildYear} onChange={(e) => setFormData({...formData, buildYear: e.target.value})} placeholder="e.g. 1970 or 1960s" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Construction Type</label>
                    <select value={formData.constructionType} onChange={(e) => setFormData({...formData, constructionType: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">Unknown</option>
                      <option value="Standard Brick">Standard Brick</option>
                      <option value="Non-Standard">Non-Standard</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="garden" checked={formData.garden} onChange={(e) => setFormData({...formData, garden: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                    <label htmlFor="garden" className="text-sm font-medium text-slate-600">Has Garden</label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Location */}
          <div>
            {renderSectionHeader('location', 'Location', <Clock size={18} />)}
            {formSections.location && (
              <div className="p-4 border border-t-0 border-slate-200 dark:border-slate-600 rounded-b-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Commute times (minutes)</span>
                  <button type="button" onClick={onShowCommuteSettings} className="text-slate-400 hover:text-emerald-500 transition-colors" title="Manage destinations">
                    <Settings size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {commuteDestinations.map(dest => (
                    <div key={dest.id}>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">To {dest.name} (mins)</label>
                      <input type="text" value={formData.commuteTimes[dest.id] || ''} onChange={(e) => setFormData({...formData, commuteTimes: {...formData.commuteTimes, [dest.id]: e.target.value}})} placeholder="e.g. 15" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  ))}
                </div>
                {commuteDestinations.length === 0 && (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-2">No destinations configured. Click the gear icon to add some.</p>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Risk Assessment */}
          <div>
            {renderSectionHeader('riskAssessment', 'Risk Assessment', <Shield size={18} />)}
            {formSections.riskAssessment && (
              <div className="p-4 border border-t-0 border-slate-200 dark:border-slate-600 rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'floodRisk', label: 'Flood Risk', options: ['Zone 1 - Low', 'Zone 2 - Medium', 'Zone 3 - High', 'Unchecked'] },
                    { key: 'subsidenceRisk', label: 'Subsidence Risk', options: ['Low', 'Medium', 'High', 'Unchecked'] },
                    { key: 'japaneseKnotweed', label: 'Japanese Knotweed', options: ['None Found', 'Present', 'Nearby', 'Unchecked'] },
                    { key: 'nearbyPlanning', label: 'Nearby Planning', options: ['None', 'Minor', 'Major Concern', 'Unchecked'] },
                    { key: 'mobileSignal', label: 'Mobile Signal', options: ['Good', 'Patchy', 'Poor', 'Unchecked'] }
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{field.label}</label>
                      <select value={formData[field.key]} onChange={(e) => setFormData({...formData, [field.key]: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="">Not checked</option>
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Chain & Survey */}
          <div>
            {renderSectionHeader('chainSurvey', 'Chain & Survey', <FileText size={18} />)}
            {formSections.chainSurvey && (
              <div className="p-4 border border-t-0 border-slate-200 dark:border-slate-600 rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Chain Length</label>
                    <select value={formData.chainLength} onChange={(e) => setFormData({...formData, chainLength: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">Unknown</option>
                      <option value="No Chain">No Chain</option>
                      <option value="1">1</option><option value="2">2</option><option value="3+">3+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Seller Situation</label>
                    <select value={formData.sellerSituation} onChange={(e) => setFormData({...formData, sellerSituation: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">Unknown</option>
                      <option value="Buying Onward">Buying Onward</option>
                      <option value="Renting">Renting</option>
                      <option value="Probate">Probate</option>
                      <option value="Investor Sale">Investor Sale</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Survey Level</label>
                    <select value={formData.surveyLevel} onChange={(e) => setFormData({...formData, surveyLevel: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">Not decided</option>
                      <option value="None Yet">None Yet</option>
                      <option value="Valuation Only">Valuation Only</option>
                      <option value="Level 2 HomeBuyer">Level 2 HomeBuyer</option>
                      <option value="Level 3 Building">Level 3 Building</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Survey Date</label>
                    <input type="date" value={formData.surveyDate} onChange={(e) => setFormData({...formData, surveyDate: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Survey Findings</label>
                    <textarea value={formData.surveyFindings} onChange={(e) => setFormData({...formData, surveyFindings: e.target.value})} rows={3} placeholder="Key findings from the survey..." className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Agent & Listing */}
          <div>
            {renderSectionHeader('agentListing', 'Agent & Listing', <FileText size={18} />)}
            {formSections.agentListing && (
              <div className="p-4 border border-t-0 border-slate-200 dark:border-slate-600 rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Estate Agent</label>
                    <input type="text" value={formData.agent} onChange={(e) => setFormData({...formData, agent: e.target.value})} placeholder="e.g. Hamwic Independent" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Agent Phone</label>
                    <input type="text" value={formData.agentPhone} onChange={(e) => setFormData({...formData, agentPhone: e.target.value})} placeholder="e.g. 023 8210 9508" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Listing URL</label>
                    <input type="url" value={formData.listingUrl} onChange={(e) => setFormData({...formData, listingUrl: e.target.value})} placeholder="https://rightmove.co.uk/..." className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 6.5: Photo Gallery */}
          <div>
            {renderSectionHeader('photoGallery', 'Photo Gallery', <Image size={18} />)}
            {formSections.photoGallery && (
              <div className="p-4 border border-t-0 border-slate-200 dark:border-slate-600 rounded-b-lg space-y-4">
                {(formData.photos || []).length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {formData.photos.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-600" onError={(e) => { e.target.src = ''; e.target.alt = 'Failed to load'; }} />
                        <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove photo">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {showPhotoUrlInput ? (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
                    <input type="url" value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} placeholder="https://media.rightmove.co.uk/..." className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPhoto(); } }} />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setShowPhotoUrlInput(false); setNewPhotoUrl(''); }} className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                      <button type="button" onClick={addPhoto} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Photo</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowPhotoUrlInput(true)} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    <Plus size={16} /> Add Photo URL
                  </button>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500">Paste image URLs from property listings. Tip: Right-click images on Rightmove/Zoopla and copy image address.</p>
              </div>
            )}
          </div>

          {/* Section 7: Viewing & Notes */}
          <div>
            {renderSectionHeader('viewingNotes', 'Viewing & Notes', <Calendar size={18} />)}
            {formSections.viewingNotes && (
              <div className="p-4 border border-t-0 border-slate-200 dark:border-slate-600 rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Viewing Date</label>
                    <input type="datetime-local" value={formData.viewingDate} onChange={(e) => setFormData({...formData, viewingDate: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Viewing Notes</label>
                    <textarea value={formData.viewingNotes} onChange={(e) => setFormData({...formData, viewingNotes: e.target.value})} rows={3} placeholder="Notes from your viewing..." className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Pros</label>
                    <textarea value={formData.pros} onChange={(e) => setFormData({...formData, pros: e.target.value})} rows={2} placeholder="What you liked..." className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Cons</label>
                    <textarea value={formData.cons} onChange={(e) => setFormData({...formData, cons: e.target.value})} rows={2} placeholder="Concerns or issues..." className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 8: Offer History */}
          <div>
            {renderSectionHeader('offerHistory', 'Offer History', <span className="text-lg font-bold">£</span>)}
            {formSections.offerHistory && (
              <div className="p-4 border border-t-0 border-slate-200 dark:border-slate-600 rounded-b-lg space-y-4">
                {(formData.offers || []).length > 0 && (
                  <div className="space-y-2">
                    {formData.offers.map((offer, i) => (
                      <div key={offer.id || i} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg text-sm">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-slate-500">{offer.date}</span>
                          <span className="font-semibold text-slate-700">£{parseInt(offer.amount).toLocaleString()}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            offer.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                            offer.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            offer.status === 'Countered' ? 'bg-orange-100 text-orange-800' :
                            offer.status === 'Withdrawn' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>{offer.status}</span>
                          {offer.notes && <span className="text-slate-500">- {offer.notes}</span>}
                        </div>
                        <button type="button" onClick={() => removeOffer(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
                {showOfferForm ? (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                    <h4 className="text-sm font-medium text-blue-800">Log Offer</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Date</label>
                        <input type="date" value={offerEntry.date} onChange={(e) => setOfferEntry(prev => ({...prev, date: e.target.value}))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Amount (£)</label>
                        <input type="text" value={offerEntry.amount} onChange={(e) => setOfferEntry(prev => ({...prev, amount: e.target.value}))} placeholder="340000" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Status</label>
                        <select value={offerEntry.status} onChange={(e) => setOfferEntry(prev => ({...prev, status: e.target.value}))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="Submitted">Submitted</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Countered">Countered</option>
                          <option value="Withdrawn">Withdrawn</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Notes (optional)</label>
                        <input type="text" value={offerEntry.notes} onChange={(e) => setOfferEntry(prev => ({...prev, notes: e.target.value}))} placeholder="e.g. Verbal offer" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowOfferForm(false)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                      <button type="button" onClick={addOffer} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Offer</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowOfferForm(true)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-all">
                    <Plus size={16} /> Log Offer
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 9: Price History */}
          <div>
            {renderSectionHeader('priceHistory', 'Price History', <History size={18} />)}
            {formSections.priceHistory && (
              <div className="p-4 border border-t-0 border-slate-200 dark:border-slate-600 rounded-b-lg space-y-4">
                {(formData.priceHistory || []).length > 0 && (
                  <div className="space-y-2">
                    {formData.priceHistory.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">{entry.date}</span>
                          <span className="font-semibold text-slate-700">£{parseInt(entry.price).toLocaleString()}</span>
                          {entry.note && <span className="text-slate-500">- {entry.note}</span>}
                        </div>
                        <button type="button" onClick={() => removePriceHistoryEntry(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
                {showPriceHistoryModal ? (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                    <h4 className="text-sm font-medium text-blue-800">Log Price Change</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Date</label>
                        <input type="date" value={priceHistoryEntry.date} onChange={(e) => setPriceHistoryEntry(prev => ({...prev, date: e.target.value}))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Price (£)</label>
                        <input type="text" value={priceHistoryEntry.price} onChange={(e) => setPriceHistoryEntry(prev => ({...prev, price: e.target.value}))} placeholder="350000" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Note (optional)</label>
                        <input type="text" value={priceHistoryEntry.note} onChange={(e) => setPriceHistoryEntry(prev => ({...prev, note: e.target.value}))} placeholder="e.g. Reduced" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowPriceHistoryModal(false)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                      <button type="button" onClick={addPriceHistoryEntry} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Entry</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowPriceHistoryModal(true)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-all">
                    <Plus size={16} /> Log Price Change
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 10: Conveyancing Progress */}
          {formData.status === 'offer_accepted' && (
          <div>
            {renderSectionHeader('conveyancing', 'Conveyancing Progress', <Briefcase size={18} />)}
            {formSections.conveyancing && (
              <div className="p-4 border border-t-0 border-slate-200 dark:border-slate-600 rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'offerAcceptedDate', label: 'Offer Accepted' },
                    { key: 'solicitorInstructedDate', label: 'Solicitor Instructed' },
                    { key: 'mortgageSubmittedDate', label: 'Mortgage Submitted' },
                    { key: 'mortgageOfferDate', label: 'Mortgage Offer Received' },
                    { key: 'mortgageOfferExpiry', label: 'Mortgage Offer Expiry' },
                    { key: 'searchesOrderedDate', label: 'Searches Ordered' },
                    { key: 'searchesReceivedDate', label: 'Searches Received' },
                    { key: 'surveyBookedDate', label: 'Survey Booked' },
                    { key: 'surveyReceivedDate', label: 'Survey Received' },
                    { key: 'enquiriesRaisedDate', label: 'Enquiries Raised' },
                    { key: 'enquiriesResolvedDate', label: 'Enquiries Resolved' },
                    { key: 'exchangeDate', label: 'Exchange of Contracts' },
                    { key: 'completionDate', label: 'Completion' }
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{field.label}</label>
                      <input type="date" value={(formData.conveyancing || {})[field.key] || ''} onChange={(e) => setFormData({...formData, conveyancing: { ...(formData.conveyancing || {}), [field.key]: e.target.value }})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Form Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
              {editingId ? 'Save Changes' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
