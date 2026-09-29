import { WarehouseSimulator } from './warehouseScene.js';
import { calculateCommercialROI, DEFAULT_CONFIG } from './calculator.js';
import confetti from 'canvas-confetti';

const urlParams = new URLSearchParams(window.location.search);
const initialMode = urlParams.get('mode') || 'led';
const initialCam = urlParams.get('cam') || 'overview';

// State
const state = {
  mode: initialMode,
  cameraPreset: initialCam,
  fixtureCount: 36,
  dailyHours: 14,
  smartSensors: true,
  tariff: DEFAULT_CONFIG.tariffPerKWh
};

// Initialize 3D Engine
const canvasContainer = document.getElementById('webgl-container');
const simulator = new WarehouseSimulator(canvasContainer);
simulator.setMode(initialMode);
simulator.setCameraPreset(initialCam);

// UI Elements
const modeButtons = document.querySelectorAll('[data-mode]');
const camButtons = document.querySelectorAll('[data-cam]');
const dimmerSlider = document.getElementById('dimmer-slider');
const dimmerLabel = document.getElementById('dimmer-val');

// Calculator Controls
const fixturesSlider = document.getElementById('slider-fixtures');
const fixturesVal = document.getElementById('val-fixtures');
const hoursSlider = document.getElementById('slider-hours');
const hoursVal = document.getElementById('val-hours');
const sensorToggle = document.getElementById('toggle-sensors');

// Output Displays
const statSavings = document.getElementById('stat-savings');
const statPayback = document.getElementById('stat-payback');
const statTenYear = document.getElementById('stat-ten-year');
const statCo2 = document.getElementById('stat-co2');
const statPowerDiff = document.getElementById('stat-power-diff');
const statAuditStatus = document.getElementById('stat-audit-status');

// HUD Lighting Status Card
const hudModeTitle = document.getElementById('hud-mode-title');
const hudModeWatts = document.getElementById('hud-mode-watts');
const hudModeCRI = document.getElementById('hud-mode-cri');
const hudModeStatus = document.getElementById('hud-mode-status');

function updateCalculator() {
  const result = calculateCommercialROI({
    fixtureCount: state.fixtureCount,
    dailyHours: state.dailyHours,
    smartSensorsEnabled: state.smartSensors,
    customTariff: state.tariff
  });

  // Animated Tickers
  statSavings.textContent = `$${result.annualDollarSavings.toLocaleString()} AUD`;
  statPayback.textContent = `${result.paybackMonths} Mo`;
  statTenYear.textContent = `+$${result.tenYearCashProfit.toLocaleString()} AUD`;
  statCo2.textContent = `${result.co2TonnesAbated} T`;
  statPowerDiff.textContent = `${result.halideTotalWatts} kW ➔ ${result.ledTotalWatts} kW (-${result.percentageCut}%)`;

  if (result.isCompliant) {
    statAuditStatus.innerHTML = `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40">✓ AS/NZS 1680.2.4 COMPLIANT (${result.estimatedMeanLux} lx)</span>`;
  } else {
    statAuditStatus.innerHTML = `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-500/40">⚠ NON-COMPLIANT (${result.estimatedMeanLux} lx)</span>`;
  }
}

function updateHUDStatus(mode) {
  if (mode === 'led') {
    hudModeTitle.textContent = 'Commercial Smart LED (5000K)';
    hudModeWatts.textContent = '140W / fitting (Effective 91W with motion sensors)';
    hudModeCRI.textContent = 'CRI 85+ • Instant-On • Zero Stroboscopic Effect';
    hudModeStatus.className = 'text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/40';
    hudModeStatus.textContent = 'ENERGY SAVINGS ACTIVE: -75%';
  } else if (mode === 'halide') {
    hudModeTitle.textContent = 'Legacy 400W Metal Halide';
    hudModeWatts.textContent = '455W / fitting (inc. 55W magnetic ballast loss)';
    hudModeCRI.textContent = 'CRI ~65 • 15-min Warmup • 60Hz Ballast Buzz';
    hudModeStatus.className = 'text-xs font-mono text-rose-400 bg-rose-950/80 px-2 py-1 rounded border border-rose-500/40';
    hudModeStatus.textContent = 'HEAVY LOAD: 16.4 kW DRAIN';
  } else if (mode === 'heatmap') {
    hudModeTitle.textContent = 'AS/NZS 1680 Photometric Lux CAD Contour';
    hudModeWatts.textContent = 'Mean Illuminance: 224 Lux (Recommended 160-240 lx)';
    hudModeCRI.textContent = 'Uniformity Ratio U0: 0.68 • Glare Rating UGR < 22';
    hudModeStatus.className = 'text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-500/40';
    hudModeStatus.textContent = 'ENGINEERING COMPLIANCE: 100%';
  }
}

// Event Listeners for Lighting Modes
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedMode = btn.getAttribute('data-mode');
    state.mode = selectedMode;
    simulator.setMode(selectedMode);

    modeButtons.forEach(b => {
      b.classList.remove('bg-emerald-500', 'text-slate-950', 'bg-amber-500', 'bg-cyan-500', 'active-mode');
      b.classList.add('bg-slate-900/80', 'text-slate-300');
    });

    btn.classList.remove('bg-slate-900/80', 'text-slate-300');
    if (selectedMode === 'led') btn.classList.add('bg-emerald-500', 'text-slate-950', 'active-mode');
    else if (selectedMode === 'halide') btn.classList.add('bg-amber-500', 'text-slate-950', 'active-mode');
    else if (selectedMode === 'heatmap') btn.classList.add('bg-cyan-500', 'text-slate-950', 'active-mode');

    updateHUDStatus(selectedMode);
  });
});

// Event Listeners for Camera Angles
camButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const preset = btn.getAttribute('data-cam');
    state.cameraPreset = preset;
    simulator.setCameraPreset(preset);

    camButtons.forEach(b => b.classList.remove('border-emerald-400', 'text-emerald-400'));
    btn.classList.add('border-emerald-400', 'text-emerald-400');
  });
});

// Dimmer
dimmerSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  dimmerLabel.textContent = `${Math.round(val * 100)}%`;
  simulator.setDimming(val);
});

// Calculator Sliders
fixturesSlider.addEventListener('input', (e) => {
  state.fixtureCount = parseInt(e.target.value, 10);
  fixturesVal.textContent = state.fixtureCount;
  updateCalculator();
});

hoursSlider.addEventListener('input', (e) => {
  state.dailyHours = parseInt(e.target.value, 10);
  hoursVal.textContent = `${state.dailyHours} hrs`;
  updateCalculator();
});

sensorToggle.addEventListener('change', (e) => {
  state.smartSensors = e.target.checked;
  updateCalculator();
});

// Modal Logic
const modal = document.getElementById('audit-modal');
const openModalBtns = document.querySelectorAll('.open-audit-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const auditForm = document.getElementById('audit-form');
const successState = document.getElementById('modal-success');

openModalBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });
});

closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
});

auditForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const businessName = document.getElementById('form-biz-name').value;
  const contactName = document.getElementById('form-name').value;
  const phone = document.getElementById('form-phone').value;
  const suburb = document.getElementById('form-suburb').value;

  // Dispatch GA4 event
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', {
      event_category: 'Commercial_Audit',
      event_label: `${suburb} - ${businessName}`,
      value: state.fixtureCount * 285
    });
  }

  // Trigger celebration confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });

  // Switch to success card
  auditForm.classList.add('hidden');
  successState.classList.remove('hidden');
  document.getElementById('ref-code').textContent = `ACT-LED-${Math.floor(100000 + Math.random() * 900000)}`;
});

// Initial Setup
updateCalculator();
updateHUDStatus(initialMode);

// Sync mode button styling
modeButtons.forEach(b => {
  b.classList.remove('bg-emerald-500', 'text-slate-950', 'bg-amber-500', 'bg-cyan-500', 'active-mode');
  b.classList.add('bg-slate-900/80', 'text-slate-300');
  if (b.getAttribute('data-mode') === initialMode) {
    b.classList.remove('bg-slate-900/80', 'text-slate-300');
    if (initialMode === 'led') b.classList.add('bg-emerald-500', 'text-slate-950', 'active-mode');
    else if (initialMode === 'halide') b.classList.add('bg-amber-500', 'text-slate-950', 'active-mode');
    else if (initialMode === 'heatmap') b.classList.add('bg-cyan-500', 'text-slate-950', 'active-mode');
  }
});

// Sync cam button styling
camButtons.forEach(b => {
  b.classList.remove('border-emerald-400', 'text-emerald-400');
  if (b.getAttribute('data-cam') === initialCam) {
    b.classList.add('border-emerald-400', 'text-emerald-400');
  }
});
