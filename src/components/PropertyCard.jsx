import React, { useCallback, useRef } from 'react';
import { Star, MapPin, Car, Bath, Bed, Wifi, Clock, ChevronDown, ChevronUp, Edit2, Trash2, BarChart3, AlertTriangle, Shield, FileCheck, Check, History, Briefcase, ExternalLink, Image, Printer, Archive, RotateCcw } from 'lucide-react';
import { statusColors, statusLabels, emptyProperty, preOfferDocs, postOfferDocs } from '../utils/constants';
import { calculateStampDuty } from '../utils/stampDuty';

export default function PropertyCard({
  property,
  expanded,
  printMode,
  compareIds,
  commuteDestinations,
  professionalContacts,
  swipedCardId,
  onToggleExpand,
  onEdit,
  onDelete,
  onRestore,
  onToggleFavorite,
  onUpdateRating,
  onToggleCompare,
  onToggleDocumentCheck,
  onPrintSingle,
  onLightboxPhoto,
  onSwipedCardId
}) {
  const touchRef = useRef({ startX: 0, startY: 0, currentX: 0, swiping: false });

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchRef.current = { startX: touch.clientX, startY: touch.clientY, currentX: touch.clientX, swiping: false };
  }, []);

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    const deltaX = touchRef.current.startX - touch.clientX;
    const deltaY = Math.abs(touchRef.current.startY - touch.clientY);
    touchRef.current.currentX = touch.clientX;
    if (deltaX > 10 && deltaX > deltaY) {
      touchRef.current.swiping = true;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const deltaX = touchRef.current.startX - touchRef.current.currentX;
    if (touchRef.current.swiping && deltaX > 60) {
      onSwipedCardId(prev => prev === property.id ? null : property.id);
    } else if (touchRef.current.swiping && deltaX < -60) {
      onSwipedCardId(null);
    }
    touchRef.current.swiping = false;
  }, [property.id, onSwipedCardId]);

  const isExpanded = expanded || printMode;

  // Commute times display
  const commuteTimes = property.commuteTimes || {};
  const legacyTimes = {};
  if (!commuteTimes.eastleigh && property.commuteToEastleigh) legacyTimes.eastleigh = property.commuteToEastleigh;
  if (!commuteTimes.totton && property.commuteToTotton) legacyTimes.totton = property.commuteToTotton;
  const allTimes = { ...commuteTimes, ...legacyTimes };
  const commuteColors = ['bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300', 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'];
  const commuteEntries = commuteDestinations.filter(d => allTimes[d.id]).map((d, i) => ({ ...d, time: allTimes[d.id], color: commuteColors[i % commuteColors.length] }));

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${property.archived ? 'opacity-70' : ''} relative break-inside-avoid`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe-revealed actions (mobile) */}
      {swipedCardId === property.id && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center gap-1 px-2 bg-slate-100 dark:bg-slate-700 z-10 md:hidden">
          <button onClick={() => { onToggleFavorite(property.id); onSwipedCardId(null); }} className={`p-3 rounded-lg transition-all ${property.favorite ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'text-slate-400 hover:text-amber-500 bg-white dark:bg-slate-600'}`}>
            <Star size={20} fill={property.favorite ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => { onEdit(property); onSwipedCardId(null); }} className="p-3 rounded-lg text-slate-500 bg-white dark:bg-slate-600 dark:text-slate-300 hover:text-blue-500 transition-all">
            <Edit2 size={20} />
          </button>
          {property.archived && (
            <button onClick={() => { onRestore(property.id); onSwipedCardId(null); }} className="p-3 rounded-lg text-emerald-500 bg-white dark:bg-slate-600 hover:text-emerald-600 transition-all">
              <RotateCcw size={20} />
            </button>
          )}
          <button onClick={() => { onDelete(property.id); onSwipedCardId(null); }} className="p-3 rounded-lg text-red-500 bg-white dark:bg-slate-600 hover:text-red-600 transition-all">
            {property.archived ? <Trash2 size={20} /> : <Archive size={20} />}
          </button>
        </div>
      )}

      {/* Card Header */}
      <div className={`p-4 md:p-5 transition-transform duration-200 ${swipedCardId === property.id ? '-translate-x-44 md:translate-x-0' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {property.archived && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300">Archived</span>}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[property.status]}`}>{statusLabels[property.status]}</span>
              {property.tenure === 'freehold' && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Freehold</span>}
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">{property.address}</h3>
            {property.postcode && <p className="text-slate-500 text-sm flex items-center gap-1"><MapPin size={14} /> {property.postcode}</p>}
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button onClick={() => onToggleCompare(property.id)} className={`p-2 rounded-lg transition-all ${compareIds.includes(property.id) ? 'text-blue-600 bg-blue-50 ring-2 ring-blue-300' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'}`} title={compareIds.includes(property.id) ? 'Remove from comparison' : 'Add to comparison'}>
              <BarChart3 size={20} />
            </button>
            <button onClick={() => onToggleFavorite(property.id)} className={`p-2 rounded-lg transition-all ${property.favorite ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'}`}>
              <Star size={20} fill={property.favorite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={() => onEdit(property)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
              <Edit2 size={20} />
            </button>
            {property.archived && (
              <button onClick={() => onRestore(property.id)} className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all" title="Restore">
                <RotateCcw size={20} />
              </button>
            )}
            <button onClick={() => onDelete(property.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all" title={property.archived ? 'Delete permanently' : 'Archive'}>
              {property.archived ? <Trash2 size={20} /> : <Archive size={20} />}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          {property.price && <div className="flex items-center gap-1.5 text-slate-700 font-semibold"><span className="text-emerald-600 font-bold">£</span>{parseInt(property.price).toLocaleString()}</div>}
          <div className="flex items-center gap-1.5 text-slate-600"><Bed size={16} className="text-slate-400" />{property.bedrooms} bed</div>
          <div className="flex items-center gap-1.5 text-slate-600"><Bath size={16} className="text-slate-400" />{property.bathrooms} bath</div>
          {property.parking && <div className="flex items-center gap-1.5 text-slate-600"><Car size={16} className="text-slate-400" />{property.parking}</div>}
          {property.broadband && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Wifi size={16} className="text-slate-400" />{property.broadband}
              {property.postcode && (
                <a href={`https://www.broadbandchecker.co.uk/postcode/${encodeURIComponent(property.postcode)}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 print:hidden" title="Check broadband">
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Commute Times */}
        {commuteEntries.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            {commuteEntries.map(e => (
              <span key={e.id} className={`px-2.5 py-1 ${e.color} rounded-lg flex items-center gap-1`}>
                <Clock size={12} /> {e.time} min to {e.name}
              </span>
            ))}
          </div>
        )}

        {/* Risk Warning Badges */}
        {((['Zone 2 - Medium', 'Zone 3 - High'].includes(property.floodRisk)) ||
          (['Medium', 'High'].includes(property.subsidenceRisk)) ||
          (['Present', 'Nearby'].includes(property.japaneseKnotweed)) ||
          property.nearbyPlanning === 'Major Concern') && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {property.floodRisk === 'Zone 3 - High' && <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg flex items-center gap-1"><AlertTriangle size={12} /> Flood: High</span>}
            {property.floodRisk === 'Zone 2 - Medium' && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg flex items-center gap-1"><AlertTriangle size={12} /> Flood: Medium</span>}
            {property.subsidenceRisk === 'High' && <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg flex items-center gap-1"><AlertTriangle size={12} /> Subsidence: High</span>}
            {property.subsidenceRisk === 'Medium' && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg flex items-center gap-1"><AlertTriangle size={12} /> Subsidence: Medium</span>}
            {property.japaneseKnotweed === 'Present' && <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg flex items-center gap-1"><AlertTriangle size={12} /> Knotweed: Present</span>}
            {property.japaneseKnotweed === 'Nearby' && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg flex items-center gap-1"><AlertTriangle size={12} /> Knotweed: Nearby</span>}
            {property.nearbyPlanning === 'Major Concern' && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg flex items-center gap-1"><AlertTriangle size={12} /> Major planning nearby</span>}
          </div>
        )}

        {/* Latest Offer & Mortgage Expiry */}
        {(property.offers || []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {(() => {
              const latest = property.offers[property.offers.length - 1];
              return (
                <span className={`px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                  latest.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                  latest.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                  latest.status === 'Countered' ? 'bg-orange-100 text-orange-700' :
                  latest.status === 'Withdrawn' ? 'bg-gray-100 text-gray-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  Offer: £{parseInt(latest.amount).toLocaleString()} ({latest.status})
                </span>
              );
            })()}
            {(() => {
              const conv = property.conveyancing || {};
              if (!conv.mortgageOfferExpiry) return null;
              const daysUntil = Math.ceil((new Date(conv.mortgageOfferExpiry) - new Date()) / (1000 * 60 * 60 * 24));
              if (daysUntil <= 14 && daysUntil > 0) return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg flex items-center gap-1"><AlertTriangle size={12} /> Mortgage expires in {daysUntil} days</span>;
              if (daysUntil <= 0) return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg flex items-center gap-1"><AlertTriangle size={12} /> Mortgage offer expired</span>;
              return null;
            })()}
          </div>
        )}

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-slate-500">Your rating:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => onUpdateRating(property.id, star)} className={`transition-all ${star <= (property.rating || 0) ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}>
                <Star size={18} fill={star <= (property.rating || 0) ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => { onToggleExpand(); onSwipedCardId(null); }}
          className="mt-3 w-full flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-slate-700 py-2 border-t border-slate-100 print:hidden"
        >
          {expanded ? <>Show Less <ChevronUp size={16} /></> : <>Show More <ChevronDown size={16} /></>}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 md:px-5 pb-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex justify-end pt-3 print:hidden">
            <button onClick={() => onPrintSingle(property.id)} className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
              <Printer size={14} /> Print
            </button>
          </div>

          {/* Photo Gallery */}
          {(property.photos || []).length > 0 && (
            <div className="pt-4 pb-2">
              <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2"><Image size={16} /> Photos ({property.photos.length})</h4>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {property.photos.map((url, i) => (
                  <button key={i} onClick={() => onLightboxPhoto(url)} className="focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg">
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-600 hover:opacity-80 transition-opacity cursor-pointer" onError={(e) => { e.target.style.display = 'none'; }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Property Details */}
            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2">Property Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-slate-500">Type:</span> <span className="text-slate-700 capitalize">{property.propertyType}</span></p>
                {property.sqft && <p><span className="text-slate-500">Size:</span> <span className="text-slate-700">{property.sqft} sq ft</span></p>}
                {property.epcRating && <p><span className="text-slate-500">EPC:</span> <span className="text-slate-700">{property.epcRating}</span></p>}
                {property.councilTaxBand && <p><span className="text-slate-500">Council Tax:</span> <span className="text-slate-700">Band {property.councilTaxBand}</span></p>}
                <p><span className="text-slate-500">Garden:</span> <span className="text-slate-700">{property.garden ? 'Yes' : 'No'}</span></p>
                {property.buildYear && <p><span className="text-slate-500">Build Year:</span> <span className="text-slate-700">{property.buildYear}</span></p>}
                {property.constructionType && <p><span className="text-slate-500">Construction:</span> <span className="text-slate-700">{property.constructionType}</span></p>}
                {property.price && (() => {
                  const sdlt = calculateStampDuty(property.price, property.firstTimeBuyer);
                  return (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <p><span className="text-slate-500">Stamp Duty:</span> <span className="text-slate-700 font-medium">£{sdlt.total.toLocaleString()}</span> <span className="text-slate-400 text-xs">({sdlt.effectiveRate}%{property.firstTimeBuyer ? ' FTB' : ''})</span></p>
                      {sdlt.breakdown.length > 0 && (
                        <div className="mt-1 text-xs text-slate-500">
                          {sdlt.breakdown.map((b, i) => <p key={i}>£{b.from.toLocaleString()} - £{b.to.toLocaleString()} @ {b.rate}% = £{b.tax.toLocaleString()}</p>)}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Agent Details */}
            {(property.agent || property.listingUrl) && (
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2">Agent & Listing</h4>
                <div className="space-y-1 text-sm">
                  {property.agent && <p><span className="text-slate-500">Agent:</span> <span className="text-slate-700">{property.agent}</span></p>}
                  {property.agentPhone && <p><span className="text-slate-500">Phone:</span> <span className="text-slate-700">{property.agentPhone}</span></p>}
                  {property.listingUrl && <a href={property.listingUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">View Listing →</a>}
                </div>
              </div>
            )}

            {/* Viewing Info */}
            {property.viewingDate && (
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2">Viewing</h4>
                <p className="text-sm text-slate-700">{new Date(property.viewingDate).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            )}

            {/* Offer History */}
            {(property.offers || []).length > 0 && (
              <div className="md:col-span-2">
                <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2">Offer History</h4>
                <div className="space-y-2">
                  {property.offers.map((offer, i) => (
                    <div key={offer.id || i} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: offer.status === 'Accepted' ? '#16a34a' : offer.status === 'Rejected' ? '#dc2626' : offer.status === 'Countered' ? '#ea580c' : '#3b82f6' }} />
                      <span className="text-slate-500 min-w-[80px]">{offer.date}</span>
                      <span className="font-semibold text-slate-700">£{parseInt(offer.amount).toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${offer.status === 'Accepted' ? 'bg-green-100 text-green-800' : offer.status === 'Rejected' ? 'bg-red-100 text-red-800' : offer.status === 'Countered' ? 'bg-orange-100 text-orange-800' : offer.status === 'Withdrawn' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>{offer.status}</span>
                      {offer.notes && <span className="text-slate-500">- {offer.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pros & Cons */}
            {(property.pros || property.cons) && (
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.pros && <div className="bg-green-50 rounded-lg p-3"><h4 className="font-medium text-green-800 mb-1 text-sm">Pros</h4><p className="text-green-700 text-sm whitespace-pre-wrap">{property.pros}</p></div>}
                  {property.cons && <div className="bg-red-50 rounded-lg p-3"><h4 className="font-medium text-red-800 mb-1 text-sm">Cons</h4><p className="text-red-700 text-sm whitespace-pre-wrap">{property.cons}</p></div>}
                </div>
              </div>
            )}

            {/* Notes */}
            {property.viewingNotes && (
              <div className="md:col-span-2">
                <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2">Notes</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap bg-white rounded-lg p-3 border border-slate-200">{property.viewingNotes}</p>
              </div>
            )}

            {/* Risk Assessment */}
            {(property.floodRisk || property.subsidenceRisk || property.japaneseKnotweed || property.nearbyPlanning || property.mobileSignal) && (
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2"><Shield size={16} /> Risk Assessment</h4>
                <div className="space-y-1 text-sm">
                  {property.floodRisk && <p><span className="text-slate-500">Flood Risk:</span> <span className="text-slate-700">{property.floodRisk}</span></p>}
                  {property.subsidenceRisk && <p><span className="text-slate-500">Subsidence:</span> <span className="text-slate-700">{property.subsidenceRisk}</span></p>}
                  {property.japaneseKnotweed && <p><span className="text-slate-500">Knotweed:</span> <span className="text-slate-700">{property.japaneseKnotweed}</span></p>}
                  {property.nearbyPlanning && <p><span className="text-slate-500">Planning:</span> <span className="text-slate-700">{property.nearbyPlanning}</span></p>}
                  {property.mobileSignal && <p><span className="text-slate-500">Mobile Signal:</span> <span className="text-slate-700">{property.mobileSignal}</span></p>}
                </div>
              </div>
            )}

            {/* Chain & Survey */}
            {(property.chainLength || property.sellerSituation || property.surveyLevel || property.surveyDate) && (
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2">Chain & Survey</h4>
                <div className="space-y-1 text-sm">
                  {property.chainLength && <p><span className="text-slate-500">Chain:</span> <span className="text-slate-700">{property.chainLength}</span></p>}
                  {property.sellerSituation && <p><span className="text-slate-500">Seller:</span> <span className="text-slate-700">{property.sellerSituation}</span></p>}
                  {property.surveyLevel && <p><span className="text-slate-500">Survey:</span> <span className="text-slate-700">{property.surveyLevel}</span></p>}
                  {property.surveyDate && <p><span className="text-slate-500">Survey Date:</span> <span className="text-slate-700">{new Date(property.surveyDate).toLocaleDateString('en-GB')}</span></p>}
                  {property.surveyFindings && <p><span className="text-slate-500">Findings:</span> <span className="text-slate-700">{property.surveyFindings}</span></p>}
                </div>
              </div>
            )}

            {/* Price History */}
            {(property.priceHistory || []).length > 0 && (
              <div className="md:col-span-2">
                <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2"><History size={16} /> Price History</h4>
                <div className="space-y-2">
                  {property.priceHistory.map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="text-slate-500 min-w-[80px]">{entry.date}</span>
                      <span className="font-semibold text-slate-700">£{parseInt(entry.price).toLocaleString()}</span>
                      {entry.note && <span className="text-slate-500">- {entry.note}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Checklist */}
            <div className="md:col-span-2">
              <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2"><FileCheck size={16} /> Documents & Checks</h4>
              {(() => {
                const docs = { ...emptyProperty.documents, ...(property.documents || {}) };
                const total = Object.keys(docs).length;
                const completed = Object.values(docs).filter(Boolean).length;
                const percent = Math.round((completed / total) * 100);
                return (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{completed} of {total} complete</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${percent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })()}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Pre-Offer Checks</h5>
                  <div className="space-y-1">
                    {preOfferDocs.map(doc => (
                      <label key={doc.key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-100 rounded p-1 -mx-1 transition-all">
                        <input type="checkbox" checked={(property.documents || {})[doc.key] || false} onChange={() => onToggleDocumentCheck(property.id, doc.key)} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                        <span className={(property.documents || {})[doc.key] ? 'text-slate-500 line-through' : 'text-slate-700'}>{doc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Post-Offer Documents</h5>
                  <div className="space-y-1">
                    {postOfferDocs.map(doc => (
                      <label key={doc.key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-100 rounded p-1 -mx-1 transition-all">
                        <input type="checkbox" checked={(property.documents || {})[doc.key] || false} onChange={() => onToggleDocumentCheck(property.id, doc.key)} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                        <span className={(property.documents || {})[doc.key] ? 'text-slate-500 line-through' : 'text-slate-700'}>{doc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Conveyancing Progress */}
            {property.status === 'offer_accepted' && (
              <div className="md:col-span-2">
                <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2"><Briefcase size={16} /> Conveyancing Progress</h4>
                {(() => {
                  const conv = { ...emptyProperty.conveyancing, ...(property.conveyancing || {}) };
                  const steps = [
                    { key: 'offerAcceptedDate', label: 'Offer Accepted' },
                    { key: 'solicitorInstructedDate', label: 'Solicitor Instructed' },
                    { key: 'mortgageSubmittedDate', label: 'Mortgage Submitted' },
                    { key: 'mortgageOfferDate', label: 'Mortgage Offer' },
                    { key: 'searchesOrderedDate', label: 'Searches Ordered' },
                    { key: 'searchesReceivedDate', label: 'Searches Received' },
                    { key: 'surveyBookedDate', label: 'Survey Booked' },
                    { key: 'surveyReceivedDate', label: 'Survey Received' },
                    { key: 'enquiriesRaisedDate', label: 'Enquiries Raised' },
                    { key: 'enquiriesResolvedDate', label: 'Enquiries Resolved' },
                    { key: 'exchangeDate', label: 'Exchange' },
                    { key: 'completionDate', label: 'Completion' }
                  ];
                  const completedSteps = steps.filter(s => conv[s.key]).length;
                  const percent = Math.round((completedSteps / steps.length) * 100);
                  const daysSinceAccepted = conv.offerAcceptedDate ? Math.floor((new Date() - new Date(conv.offerAcceptedDate)) / (1000 * 60 * 60 * 24)) : null;
                  return (
                    <>
                      <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>{completedSteps} of {steps.length} steps complete</span>
                        <span className="flex gap-3">
                          {daysSinceAccepted !== null && <span>{daysSinceAccepted} days since accepted</span>}
                          {conv.mortgageOfferExpiry && (() => {
                            const daysUntil = Math.ceil((new Date(conv.mortgageOfferExpiry) - new Date()) / (1000 * 60 * 60 * 24));
                            if (daysUntil <= 14 && daysUntil > 0) return <span className="text-amber-600 font-medium">Mortgage expires in {daysUntil}d</span>;
                            if (daysUntil <= 0) return <span className="text-red-600 font-medium">Mortgage expired</span>;
                            return <span>Mortgage expires in {daysUntil}d</span>;
                          })()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                        <div className={`h-2 rounded-full transition-all ${percent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {steps.map(step => (
                          <div key={step.key} className={`text-xs p-2 rounded-lg border ${conv[step.key] ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'}`}>
                            <div className="flex items-center gap-1.5">
                              {conv[step.key] ? <Check size={12} className="text-emerald-600" /> : <div className="w-3 h-3 rounded-full border-2 border-slate-300" />}
                              <span className="font-medium">{step.label}</span>
                            </div>
                            {conv[step.key] && <p className="mt-0.5 text-emerald-600">{new Date(conv[step.key]).toLocaleDateString('en-GB')}</p>}
                          </div>
                        ))}
                      </div>

                      {/* Professional Contacts Summary */}
                      {professionalContacts && (professionalContacts.solicitor.name || professionalContacts.broker.name || professionalContacts.mortgage.lender) && (
                        <div className="mt-4 pt-3 border-t border-slate-200">
                          <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Your Professionals</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            {professionalContacts.solicitor.name && (
                              <div className="bg-white p-2 rounded-lg border border-slate-200">
                                <p className="font-medium text-slate-700">Solicitor</p>
                                <p className="text-slate-600">{professionalContacts.solicitor.name}</p>
                                {professionalContacts.solicitor.firm && <p className="text-slate-500">{professionalContacts.solicitor.firm}</p>}
                                {professionalContacts.solicitor.phone && <p className="text-slate-500">{professionalContacts.solicitor.phone}</p>}
                              </div>
                            )}
                            {professionalContacts.broker.name && (
                              <div className="bg-white p-2 rounded-lg border border-slate-200">
                                <p className="font-medium text-slate-700">Broker</p>
                                <p className="text-slate-600">{professionalContacts.broker.name}</p>
                                {professionalContacts.broker.firm && <p className="text-slate-500">{professionalContacts.broker.firm}</p>}
                              </div>
                            )}
                            {professionalContacts.mortgage.lender && (
                              <div className="bg-white p-2 rounded-lg border border-slate-200">
                                <p className="font-medium text-slate-700">Mortgage</p>
                                <p className="text-slate-600">{professionalContacts.mortgage.lender}</p>
                                {professionalContacts.mortgage.rate && <p className="text-slate-500">{professionalContacts.mortgage.rate}% {professionalContacts.mortgage.product}</p>}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
