/**
 * =======================================================================
 * LED SOLUTIONS CANBERRA — CLIENT CONTENT CONFIGURATION
 * =======================================================================
 * Kieran & Team: You can edit testimonials, case studies, and stats
 * directly in this file without touching any HTML or CSS code!
 * Simply change the text inside the quotes, save, and reload the page.
 * =======================================================================
 */

window.LED_CONFIG = {
  // Global Proof Points
  proof: {
    googleRating: "5.0",
    googleReviewsCount: "27",
    yearsInCanberra: "14",
    fittingsInstalled: "57,000+",
    contractorLicence: "2009974",
    phoneOffice: "1300 763 122",
    phoneKieranDirect: "0415 343 050",
    email: "kieran@ledsolutions.com.au"
  },

  // Customer Testimonials (Speaking to Energy Savings & Fast Paybacks)
  testimonials: [
    {
      id: 1,
      clientName: "Marcus Vance",
      clientRole: "Facilities Director, Fyshwick Logistics Hub",
      location: "Fyshwick ACT",
      headlineMetric: "$14,800 Annual Electricity Savings",
      paybackPeriod: "14-Month Payback",
      quote: "Our quarterly electricity bill dropped by $3,700 immediately after the retrofit. Kieran's team upgraded 120 high-bays over a single weekend with zero downtime to our distribution operations. The capital payback was under 14 months, exactly as modeled in his initial proposal.",
      projectScope: "120 Commercial Sensor High-Bays",
      verified: true
    },
    {
      id: 2,
      clientName: "Sarah Lin",
      clientRole: "Treasurer, Strata Plan 3824",
      location: "Belconnen ACT",
      headlineMetric: "64% Common Area Bill Cut",
      paybackPeriod: "16-Month Payback",
      quote: "The basement carpark was a massive energy drain burning 24/7. Kieran installed occupancy-dimming LEDs that idle at 30% background light until cars or residents enter. The carpark feels safer, brighter, and our body corporate electricity bill dropped by $1,520 each quarter.",
      projectScope: "74 Bi-Level Carpark Luminaires",
      verified: true
    },
    {
      id: 3,
      clientName: "David Thornton",
      clientRole: "Operations Manager, Mitchell Commercial Park",
      location: "Mitchell ACT",
      headlineMetric: "$18,200 Saved Annually",
      paybackPeriod: "AS/NZS 1680 Certified",
      quote: "We were constantly replacing failed fluorescent ballasts across our warehouses. Kieran gave us an honest energy audit, handled the complete supply and install, and our maintenance calls dropped to zero. Truly the best commercial lighting team in Canberra.",
      projectScope: "210 Commercial Office & Workshop Fixtures",
      verified: true
    }
  ],

  // Commercial Case Studies (Proving Large Commercial Installs)
  caseStudies: [
    {
      id: "case-1",
      title: "Canberra Logistics Hub — 120 High-Bay Retrofit",
      location: "Fyshwick, ACT",
      image: "assets/warehouse-commercial.jpg",
      challenge: "Legacy 400W metal halide fixtures running 16 hours daily. Frequent lamp failures, high operating temperatures, and an unsustainable $21,000 annual lighting electricity bill.",
      solution: "Engineered 140W commercial LED high-bays equipped with integrated microwave occupancy sensors and automated daylight harvesting.",
      stats: [
        { label: "Annual Energy Cut", value: "68%" },
        { label: "Net Annual Savings", value: "$14,800 AUD" },
        { label: "Capital Payback", value: "14 Months" },
        { label: "Lux Level Increase", value: "+180 Lux" }
      ],
      compliance: "Certified to AS/NZS 1680.1:2006 Interior & Workplace Lighting"
    },
    {
      id: "case-2",
      title: "IRT Kangara Waters — Multi-Building Strata Retrofit",
      location: "Belconnen, ACT",
      image: "assets/carpark-commercial.jpg",
      challenge: "5 residential apartment towers with 370 common-property corridor and basement fixtures burning 24/7 electricity at full power.",
      solution: "Bi-level sensor lighting system. In unoccupied zones, 43% of fittings extinguish completely while 57% dim to a compliant 30% security standby level.",
      stats: [
        { label: "Buildings Upgraded", value: "5 Towers" },
        { label: "Fittings Per Building", value: "74 Lights" },
        { label: "Auto-Off When Vacant", value: "43%" },
        { label: "Annual Strata Savings", value: "$18,400 AUD" }
      ],
      compliance: "Certified to AS/NZS 2293 Emergency Evacuation Lighting"
    }
  ],

  // Before & After Lighting Data
  beforeAfter: {
    beforeTitle: "Legacy 400W Metal Halide / T8 Fluorescent",
    beforeWattage: "480W Total Load / Fitting",
    beforeLux: "140 Lux (Uneven & Dim)",
    beforeCost: "$14,200 / Year Operating Cost",
    beforeIssues: "Yellow tint, high heat, ballast buzz, dark perimeter corners",
    afterTitle: "LED Solutions 5000K Commercial Retrofit",
    afterWattage: "140W Smart Sensor LED (-71%)",
    afterLux: "320 Lux (Crisp Uniform Daylight)",
    afterCost: "$4,100 / Year Operating Cost",
    afterBenefits: "5-Year warranty, microwave motion dimming, zero lamp maintenance"
  }
};
