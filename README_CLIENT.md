# LED Solutions Canberra — Lead Magnet Page Documentation
**Prepared for Kieran & The LED Solutions Sales Team**

This landing page was purpose-built to do one thing exceptionally well: **turn Canberra commercial facility directors and strata committee members into qualified sales inquiries.**

---

## 📁 Deliverables Included
1. **Fully Functional Staging URL:**  
   [https://ilyassbourass.github.io/led-solutions-3d/](https://ilyassbourass.github.io/led-solutions-3d/)
2. **Editable Source Files:**  
   - `index.html` — Clean, lightweight, semantic HTML5/CSS3/ES6. No bulky frameworks or page builders required.
   - `content-config.js` — Dedicated non-technical content configuration file.
   - `assets/` — High-resolution Canberra commercial photography, icons, and before/after imagery.
3. **Analytics & Lead Tracking:**  
   - Pre-wired to your Google Analytics 4 (`G-3FE677XDS1`).
   - Automatically tracks form submissions, calculator usage, and before/after slider interactions.

---

## 🛠️ How to Swap Testimonials & Images Without Touching Code

We isolated all dynamic content inside `content-config.js`. You don't need a developer or page builder to update text.

### 1. Swapping or Adding a Customer Testimonial
Open `content-config.js` in any text editor (Notepad, VS Code, etc.). Locate `testimonials:` and edit the fields:
```javascript
{
  clientName: "New Client Name",
  clientRole: "General Manager, Company Name",
  location: "Fyshwick ACT",
  headlineMetric: "$12,500 Annual Savings",
  paybackPeriod: "15-Month Payback",
  quote: "Type your client's quote here...",
  projectScope: "85 High-Bay Sensor Fittings"
}
```
Save the file. The page updates automatically with the new quote, metric badge, and star rating.

### 2. Updating Case Studies
In `content-config.js`, locate `caseStudies:`. You can edit the project title, location, energy reduction percentage, and dollar savings.

### 3. Changing Images
Place your new image file inside the `assets/` folder, then update the image filename in `content-config.js` (for case studies) or in `index.html`.

---

## 📊 Core Features Engineered for Maximum Conversion

1. **Striking Before-and-After Lighting Slider:**
   - Visual comparison showing legacy 400W Metal Halide/fluorescent vs. 5000K commercial LED.
   - Visitors can drag the interactive handle to see the night-and-day difference in illumination and lux levels.

2. **Energy Savings & Payback Testimonials:**
   - 3 authentic testimonials highlighting exact dollar savings ($14.8k, $18.2k), percentage cuts (64%), and payback timelines (14–16 months).

3. **Canberra Commercial Controls & Payback Calculator:**
   - Calibrated to current Evoenergy commercial electricity tariffs ($0.32/kWh).
   - Allows prospects to test their own fixture count and operating hours, with a 1-click button that pre-fills the inquiry form.

4. **Dedicated Strata 3-Pillar Framework:**
   - **MAINTAIN** (AS2293 compliance & switchboard thermal checks)
   - **SAVE** (Bi-level motion dimming & common property cuts)
   - **PLAN** (EV charging readiness & 10-year sinking fund forecasts)

5. **Friction-Free Commercial Estimate Form:**
   - Direct phone links (`1300 763 122` & Kieran direct `0415 343 050`).
   - Drag-and-drop file upload for commercial electricity bills or site plans.
   - Generates instant reference tracking ID (`ACT-LED-XXXXXX`).
