export const calculateStampDuty = (priceStr, firstTimeBuyer) => {
  const price = parseInt(priceStr) || 0;
  if (price <= 0) return { total: 0, breakdown: [], effectiveRate: '0' };
  let bands;
  if (firstTimeBuyer && price <= 625000) {
    bands = [
      { threshold: 425000, rate: 0 },
      { threshold: 625000, rate: 0.05 }
    ];
  } else {
    bands = [
      { threshold: 250000, rate: 0 },
      { threshold: 925000, rate: 0.05 },
      { threshold: 1500000, rate: 0.10 },
      { threshold: Infinity, rate: 0.12 }
    ];
  }
  let remaining = price;
  let total = 0;
  let prevThreshold = 0;
  const breakdown = [];
  for (const band of bands) {
    if (remaining <= 0) break;
    const bandWidth = band.threshold - prevThreshold;
    const taxable = Math.min(remaining, bandWidth);
    const tax = taxable * band.rate;
    if (taxable > 0) {
      breakdown.push({ from: prevThreshold, to: prevThreshold + taxable, rate: band.rate * 100, tax });
    }
    total += tax;
    remaining -= taxable;
    prevThreshold = band.threshold;
  }
  return { total, breakdown, effectiveRate: ((total / price) * 100).toFixed(1) };
};
