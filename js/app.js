/**
 * Main Application Logic & Event Handlers
 */

let appliances = [];
let currentRate = 0.16;
let currentCurrency = '$';
let currentCo2Factor = 0.38; // kg CO2 per kWh default (US average)
let currentUsdExchange = 1.0; // Exchange rate to 1 USD

document.addEventListener('DOMContentLoaded', () => {
    initCountryDropdown();
    initTheme();
    loadSavedState();
    setupEventListeners();
    initGlobalTooltips();
    updateUI();
    fetchLiveExchangeRates();
});

/**
 * Initialize Country Dropdown from COUNTRY_DATA
 */
function initCountryDropdown() {
    const select = document.getElementById('locationSelect');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>Select country or custom rate...</option>';
    
    COUNTRY_DATA.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.setAttribute('data-rate', country.rate);
        option.setAttribute('data-currency', country.currency);
        option.setAttribute('data-co2', country.co2Factor);
        option.setAttribute('data-usd', country.usdExchange);
        option.textContent = `${country.name} (${country.currency} ${country.rate}/kWh)`;
        select.appendChild(option);
    });

    const customOption = document.createElement('option');
    customOption.value = 'CUSTOM';
    customOption.textContent = 'Custom Tariff / Rate';
    select.appendChild(customOption);
}

/**
 * Theme Setup & LocalStorage
 */
function updateThemeIcons(isLightMode) {
    const iconMoon = document.getElementById('iconMoon');
    const iconSun = document.getElementById('iconSun');
    if (iconMoon && iconSun) {
        iconMoon.style.display = isLightMode ? 'none' : 'block';
        iconSun.style.display = isLightMode ? 'block' : 'none';
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const isLight = savedTheme === 'light';
    if (isLight) {
        document.body.classList.add('light-mode');
    }
    updateThemeIcons(isLight);
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    updateThemeIcons(isLightMode);
    if (typeof refreshChartTheme === 'function') {
        refreshChartTheme();
    }
}

/**
 * Event Listeners
 */
function setupEventListeners() {
    // Country change
    const locationSelect = document.getElementById('locationSelect');
    if (locationSelect) {
        locationSelect.addEventListener('change', function() {
            if (this.value === 'CUSTOM') {
                document.getElementById('electricityRate').focus();
                return;
            }
            const selected = this.options[this.selectedIndex];
            const rate = parseFloat(selected.getAttribute('data-rate'));
            const currency = selected.getAttribute('data-currency');
            const co2 = parseFloat(selected.getAttribute('data-co2'));
            const usdEx = parseFloat(selected.getAttribute('data-usd'));

            if (rate && currency) {
                currentRate = rate;
                currentCurrency = currency;
                currentCo2Factor = co2 || 0.38;
                currentUsdExchange = usdEx || 1.0;
                document.getElementById('electricityRate').value = rate;
                document.getElementById('currencySymbol').textContent = currency;
                const rateSymEl = document.getElementById('rateCurrencySymbol');
                if (rateSymEl) rateSymEl.textContent = currency;
                
                recalculateAll();
                saveState();
            }
        });
    }

    // Custom Rate Change
    const rateInput = document.getElementById('electricityRate');
    if (rateInput) {
        rateInput.addEventListener('input', function() {
            const val = parseFloat(this.value);
            if (val > 0) {
                currentRate = val;
                recalculateAll();
                saveState();
            }
        });
    }

    // Form Sliders
    const hoursInput = document.getElementById('hoursPerDay');
    if (hoursInput) {
        hoursInput.addEventListener('input', function() {
            document.getElementById('hoursValue').textContent = this.value;
        });
    }

    const qtyInput = document.getElementById('quantity');
    if (qtyInput) {
        qtyInput.addEventListener('input', function() {
            document.getElementById('quantityValue').textContent = this.value;
        });
    }

    // Appliance Dropdown custom toggle
    const applianceType = document.getElementById('applianceType');
    if (applianceType) {
        applianceType.addEventListener('change', function() {
            const selected = this.options[this.selectedIndex];
            const watts = selected.getAttribute('data-watts');
            const customGroup = document.getElementById('customNameGroup');

            if (this.value === 'Custom') {
                if (customGroup) customGroup.style.display = 'block';
                document.getElementById('wattage').value = '';
            } else {
                if (customGroup) customGroup.style.display = 'none';
                if (watts) {
                    document.getElementById('wattage').value = watts;
                }
            }
        });
    }
}

/**
 * Add Appliance from Form
 */
function addApplianceFromForm() {
    const typeSelect = document.getElementById('applianceType');
    const customName = document.getElementById('customName').value.trim();
    const wattage = parseFloat(document.getElementById('wattage').value);
    const hours = parseFloat(document.getElementById('hoursPerDay').value);
    const quantity = parseInt(document.getElementById('quantity').value);

    let name = typeSelect.value === 'Custom' ? customName : typeSelect.value;

    if (!name) {
        alert('Please select or type an appliance name!');
        return;
    }
    if (!wattage || wattage <= 0) {
        alert('Please enter power consumption in Watts!');
        return;
    }
    if (isNaN(hours) || hours < 0) {
        alert('Please set hours used per day!');
        return;
    }

    createAndAddAppliance(name, wattage, hours, quantity);

    // Reset Form fields
    typeSelect.selectedIndex = 0;
    document.getElementById('customName').value = '';
    document.getElementById('customNameGroup').style.display = 'none';
    const firstWatts = typeSelect.options[0].getAttribute('data-watts');
    document.getElementById('wattage').value = firstWatts || '1500';
    document.getElementById('hoursPerDay').value = 6;
    document.getElementById('hoursValue').textContent = '6';
    document.getElementById('quantity').value = 1;
    document.getElementById('quantityValue').textContent = '1';
}

/**
 * Helper to construct appliance object and push to list
 */
function createAndAddAppliance(name, wattage, hoursPerDay, quantity) {
    const dailyKwh = (wattage / 1000) * hoursPerDay * quantity;
    const monthlyKwh = dailyKwh * 30;

    const appliance = {
        id: Date.now() + Math.random(),
        name: name,
        wattage: wattage,
        hoursPerDay: hoursPerDay,
        quantity: quantity,
        dailyKwh: dailyKwh.toFixed(2),
        monthlyKwh: monthlyKwh.toFixed(2),
        dailyCost: (dailyKwh * currentRate).toFixed(2),
        monthlyCost: (monthlyKwh * currentRate).toFixed(2),
        yearlyCost: (monthlyKwh * 12 * currentRate).toFixed(2)
    };

    appliances.push(appliance);
    saveState();
    updateUI();
}

/**
 * Remove an appliance by ID
 */
function removeAppliance(id) {
    appliances = appliances.filter(a => a.id !== id);
    saveState();
    updateUI();
}

/**
 * Clear all appliances
 */
function clearAllAppliances() {
    if (confirm('Are you sure you want to clear all appliances?')) {
        appliances = [];
        saveState();
        updateUI();
    }
}

/**
 * Recalculate costs for existing appliances when electricity rate changes
 */
function recalculateAll() {
    appliances = appliances.map(app => {
        const dailyKwh = (app.wattage / 1000) * app.hoursPerDay * app.quantity;
        const monthlyKwh = dailyKwh * 30;
        return {
            ...app,
            dailyKwh: dailyKwh.toFixed(2),
            monthlyKwh: monthlyKwh.toFixed(2),
            dailyCost: (dailyKwh * currentRate).toFixed(2),
            monthlyCost: (monthlyKwh * currentRate).toFixed(2),
            yearlyCost: (monthlyKwh * 12 * currentRate).toFixed(2)
        };
    });
    updateUI();
}

/**
 * Update UI Elements & Layout Mode
 */
function updateUI() {
    const container = document.getElementById('dashboardContainer');
    const badge = document.getElementById('applianceCountBadge');

    if (badge) badge.textContent = `${appliances.length}`;

    if (appliances.length > 0) {
        container.classList.add('has-results');
    } else {
        container.classList.remove('has-results');
    }

    renderAppliancesList();
    updateSummaryCards();
    updateEcoMetrics();
    updateSolarEstimates();

    if (typeof updateCharts === 'function' && appliances.length > 0) {
        updateCharts(appliances, currentCurrency);
    }
}

/**
 * Get context-aware tip for appliance hover tooltip
 */
function getTipForAppliance(app) {
    const name = app.name.toLowerCase();
    if (name.includes('ac') || name.includes('air conditioner')) {
        return 'Setting AC to 24°C (75°F) saves up to 24% on cooling energy.';
    }
    if (name.includes('light') || name.includes('bulb')) {
        return 'Switch to LED bulbs to reduce lighting electricity by up to 80%.';
    }
    if (app.wattage >= 1000) {
        return `High power consumption (${app.wattage}W). Use off-peak hours if available.`;
    }
    return 'Unplug when idle to prevent phantom standby power consumption.';
}

/**
 * Render Compact Appliance Table in Left Pane
 */
function renderAppliancesList() {
    const list = document.getElementById('appliancesList');
    if (!list) return;

    if (appliances.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>No appliances added yet. Add an appliance above!</p>
            </div>
        `;
        return;
    }

    list.innerHTML = `
        <table class="appliance-table">
            <thead>
                <tr>
                    <th>Appliance</th>
                    <th>Usage</th>
                    <th style="text-align: right;">Cost/mo</th>
                    <th style="width: 24px;"></th>
                </tr>
            </thead>
            <tbody>
                ${appliances.map(app => {
                    const tipText = getTipForAppliance(app);
                    return `
                        <tr>
                            <td>
                                <div class="appliance-name-cell">
                                    ${escapeHtml(app.name)}${app.quantity > 1 ? ` (×${app.quantity})` : ''} <span class="tip-icon" data-tooltip="${escapeHtml(tipText)}">i</span>
                                </div>
                            </td>
                            <td>
                                <span class="appliance-sub">${app.wattage}W • ${app.hoursPerDay}h/d</span>
                            </td>
                            <td style="text-align: right; font-weight: 600;">
                                ${currentCurrency}${formatNumber(app.monthlyCost)}
                            </td>
                            <td style="text-align: center;">
                                <button type="button" class="btn-remove-sm" onclick="removeAppliance(${app.id})" title="Remove item">×</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Update Cost Summary Cards (Daily, Yearly, Monthly - Cost & Consumption)
 */
function updateSummaryCards() {
    const totals = appliances.reduce((acc, app) => {
        const kwhD = parseFloat(app.dailyKwh);
        const kwhM = parseFloat(app.monthlyKwh);
        return {
            dailyCost: acc.dailyCost + parseFloat(app.dailyCost),
            yearlyCost: acc.yearlyCost + parseFloat(app.yearlyCost),
            monthlyCost: acc.monthlyCost + parseFloat(app.monthlyCost),
            kwhDaily: acc.kwhDaily + kwhD,
            kwhYearly: acc.kwhYearly + (kwhM * 12),
            kwhMonthly: acc.kwhMonthly + kwhM
        };
    }, { dailyCost: 0, yearlyCost: 0, monthlyCost: 0, kwhDaily: 0, kwhYearly: 0, kwhMonthly: 0 });

    document.querySelectorAll('.currency-sym').forEach(el => el.textContent = currentCurrency);
    
    // Daily Card
    const dailyEl = document.getElementById('totalDaily');
    const dailyKwhEl = document.getElementById('totalKwhDaily');
    if (dailyEl) dailyEl.textContent = formatNumber(totals.dailyCost.toFixed(2));
    if (dailyKwhEl) dailyKwhEl.textContent = formatNumber(totals.kwhDaily.toFixed(1));

    // Yearly Card
    const yearlyEl = document.getElementById('totalYearly');
    const yearlyKwhEl = document.getElementById('totalKwhYearly');
    if (yearlyEl) yearlyEl.textContent = formatNumber(totals.yearlyCost.toFixed(2));
    if (yearlyKwhEl) yearlyKwhEl.textContent = formatNumber(totals.kwhYearly.toFixed(0));

    // Monthly Card
    const monthlyEl = document.getElementById('totalMonthly');
    const monthlyKwhEl = document.getElementById('totalKwhMonthly');
    if (monthlyEl) monthlyEl.textContent = formatNumber(totals.monthlyCost.toFixed(2));
    if (monthlyKwhEl) monthlyKwhEl.textContent = formatNumber(totals.kwhMonthly.toFixed(1));
}

/**
 * Update Environmental CO2 Metrics with Real-World Equivalents
 */
function updateEcoMetrics() {
    const totalMonthlyKwh = appliances.reduce((acc, a) => acc + parseFloat(a.monthlyKwh), 0);
    const yearlyKwh = totalMonthlyKwh * 12;
    
    // Emissions in kg CO2 per year based on selected country grid factor
    const yearlyCo2Kg = yearlyKwh * currentCo2Factor;
    
    // EPA Gas Passenger Car conversion: 1 mile driven = ~0.404 kg CO2
    const carMilesEquiv = Math.round(yearlyCo2Kg / 0.404);

    // Average mature tree absorbs ~21 kg CO2 per year
    const treesRequired = Math.ceil(yearlyCo2Kg / 21);

    // Grid intensity rating badge
    let gridLabel = '(Moderate Grid)';
    if (currentCo2Factor < 0.20) {
        gridLabel = '(Low Carbon Grid)';
    } else if (currentCo2Factor > 0.50) {
        gridLabel = '(High Carbon Grid)';
    }

    const co2El = document.getElementById('co2Value');
    const gridEl = document.getElementById('gridRating');
    const carEl = document.getElementById('carMilesValue');
    const treesEl = document.getElementById('treesValue');
    
    if (co2El) co2El.textContent = `${formatNumber(yearlyCo2Kg.toFixed(0))} kg/yr`;
    if (gridEl) gridEl.textContent = gridLabel;
    if (carEl) carEl.textContent = `~${formatNumber(carMilesEquiv)} miles in gas car`;
    if (treesEl) treesEl.textContent = `~${formatNumber(treesRequired)} tree${treesRequired === 1 ? '' : 's'} to offset`;
}

/**
 * Update Hybrid Solar System (Panels kW + Inverter kVA + Battery kWh + Turnkey Cost & ROI Payback)
 */
function updateSolarEstimates() {
    const totalMonthlyKwh = appliances.reduce((acc, a) => acc + parseFloat(a.monthlyKwh), 0);
    const monthlyCost = appliances.reduce((acc, a) => acc + parseFloat(a.monthlyCost), 0);
    const dailyKwhNeeded = totalMonthlyKwh / 30;

    // Active Peak Wattage draw across appliances
    const peakWatts = appliances.reduce((acc, a) => acc + (a.wattage * a.quantity), 0);

    // 1. Solar PV Panel Array capacity (kWp)
    const recommendedKwVal = (dailyKwhNeeded / 4.5) * 1.25;
    const recommendedKw = recommendedKwVal.toFixed(1);

    // 2. Inverter Rating (kVA) (Micro kits start at 0.3 kVA; commercial systems up to 100 kVA...)
    const STANDARD_INVERTERS = [0.3, 0.5, 1.0, 1.5, 2.5, 3.5, 5.0, 7.5, 10.0, 15.0, 20.0, 30.0, 40.0, 50.0, 60.0, 80.0, 100.0];
    const rawInverterNeeded = (peakWatts * 1.25) / 1000;
    let inverterKvaVal = STANDARD_INVERTERS.find(v => v >= rawInverterNeeded);
    if (!inverterKvaVal) {
        inverterKvaVal = Math.ceil(rawInverterNeeded / 5) * 5;
    }
    const inverterKva = inverterKvaVal.toFixed(1);

    // 3. Lithium Battery Storage Capacity (kWh) (Micro kits start at 0.3 kWh; commercial systems up to 150 kWh...)
    const STANDARD_BATTERIES = [0.3, 0.5, 1.0, 1.5, 2.5, 3.5, 5.0, 7.5, 10.0, 15.0, 20.0, 30.0, 40.0, 50.0, 60.0, 80.0, 100.0, 120.0, 150.0];
    const rawBatteryNeeded = dailyKwhNeeded * 0.5;
    let batteryKwhVal = STANDARD_BATTERIES.find(v => v >= rawBatteryNeeded);
    if (!batteryKwhVal) {
        batteryKwhVal = Math.ceil(rawBatteryNeeded / 5) * 5;
    }
    const batteryKwh = batteryKwhVal.toFixed(1);

    // 4. Complete Turnkey System Setup Cost ($ USD equivalent base)
    // Scale pricing tiers for Plug-and-Play Micro Kits vs Standard Fixed Installations
    let panelRateUSD = 250;
    let inverterRateUSD = 180;
    let batteryRateUSD = 280;
    let bosLaborUSD = 400;

    if (dailyKwhNeeded < 1.0) {
        // Plug-and-Play Micro Solar Kit tier (< 1.0 kWh/day)
        panelRateUSD = 220;
        inverterRateUSD = 140;
        batteryRateUSD = 220;
        bosLaborUSD = 60;
    } else if (dailyKwhNeeded < 2.5) {
        // Small Residential System tier (< 2.5 kWh/day)
        bosLaborUSD = 180;
    } else if (dailyKwhNeeded < 5.0) {
        // Medium Residential System tier
        bosLaborUSD = 300;
    }

    const setupCostUSD = (recommendedKwVal * panelRateUSD) + 
                         (inverterKvaVal * inverterRateUSD) + 
                         (batteryKwhVal * batteryRateUSD) + 
                         bosLaborUSD;

    // Convert setup cost to local currency using country exchange rate
    const activeExchangeRate = (currentUsdExchange && currentUsdExchange !== 1.0) 
        ? currentUsdExchange 
        : getExchangeRateForCurrency(currentCurrency, currentRate);

    const setupCostLocal = setupCostUSD * activeExchangeRate;

    // 5. Estimated 80% monthly bill savings offset & ROI payback period
    const monthlySavingsLocal = monthlyCost * 0.8;
    const yearlySavingsLocal = monthlySavingsLocal * 12;
    const paybackYears = yearlySavingsLocal > 0 ? (setupCostLocal / yearlySavingsLocal).toFixed(1) : 0;

    const kwEl = document.getElementById('solarKw');
    const inverterEl = document.getElementById('solarInverter');
    const batteryEl = document.getElementById('solarBattery');
    const costEl = document.getElementById('solarCost');
    const paybackEl = document.getElementById('solarPayback');
    const savingsEl = document.getElementById('solarSavings');

    if (kwEl) kwEl.textContent = `${recommendedKw} kWp`;
    if (inverterEl) inverterEl.textContent = `${inverterKva} kVA`;
    if (batteryEl) batteryEl.textContent = `${batteryKwh} kWh`;
    if (costEl) costEl.textContent = `${currentCurrency}${formatNumber(setupCostLocal.toFixed(0))}`;
    if (paybackEl) paybackEl.textContent = `(~${paybackYears} yrs payback)`;
    if (savingsEl) savingsEl.textContent = `${currentCurrency}${formatNumber(monthlySavingsLocal.toFixed(2))} / mo`;
}

/**
 * CSV Data Export
 */
function exportCSV() {
    if (appliances.length === 0) {
        alert('No appliance data to export!');
        return;
    }

    let csv = 'Appliance Name,Quantity,Power (Watts),Hours/Day,Monthly kWh,Monthly Cost (' + currentCurrency + '),Yearly Cost (' + currentCurrency + ')\n';
    
    appliances.forEach(app => {
        csv += `"${app.name.replace(/"/g, '""')}",${app.quantity},${app.wattage},${app.hoursPerDay},${app.monthlyKwh},${app.monthlyCost},${app.yearlyCost}\n`;
    });

    const totalMonthly = appliances.reduce((a, b) => a + parseFloat(b.monthlyCost), 0).toFixed(2);
    const totalYearly = appliances.reduce((a, b) => a + parseFloat(b.yearlyCost), 0).toFixed(2);
    csv += `\n"TOTALS",,,,,,${totalMonthly},${totalYearly}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `energy_calculator_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Copy Email Contact
 */
function copyEmail(e) {
    if (e) e.preventDefault();
    const email = 'contact@horlladjosh.com';
    navigator.clipboard.writeText(email).then(() => {
        alert('Email address copied to clipboard: ' + email);
    }).catch(() => {
        prompt('Copy email:', email);
    });
}

/**
 * Save & Load LocalStorage State
 */
function saveState() {
    try {
        localStorage.setItem('myelectricbill_appliances', JSON.stringify(appliances));
        localStorage.setItem('myelectricbill_rate', currentRate.toString());
        localStorage.setItem('myelectricbill_currency', currentCurrency);
        localStorage.setItem('myelectricbill_usd', currentUsdExchange.toString());
        localStorage.setItem('myelectricbill_co2', currentCo2Factor.toString());
    } catch(e) {}
}

/**
 * Helper to derive USD exchange rate from currency or electricity rate
 */
function getExchangeRateForCurrency(currency, rate) {
    const match = COUNTRY_DATA.find(c => c.currency === currency || c.rate === rate);
    if (match && match.usdExchange) return match.usdExchange;
    if (currency === '₦') return 1500;
    if (currency === '₹') return 86.5;
    if (currency === '£') return 0.79;
    if (currency === '€') return 0.92;
    if (currency === '¥') return 155.0;
    if (rate && rate > 5) return rate / 0.16; // Heuristic fallback for high-denom local currency
    return 1.0;
}

/**
 * Fetch real-time live USD currency exchange rates asynchronously
 */
async function fetchLiveExchangeRates() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (response.ok) {
            const data = await response.json();
            if (data && data.rates) {
                const liveRates = data.rates;
                const currencyCodeMap = {
                    '₦': 'NGN', '£': 'GBP', '€': 'EUR', '₹': 'INR', '¥': 'JPY',
                    'R$': 'BRL', 'Mex$': 'MXN', 'R': 'ZAR', 'A$': 'AUD', 'C$': 'CAD',
                    'CHF': 'CHF', 'kr': 'SEK', 'zł': 'PLN', '₺': 'TRY',
                    'S$': 'SGD', 'HK$': 'HKD', 'NZ$': 'NZD', 'AED': 'AED', 'SAR': 'SAR',
                    'E£': 'EGP', 'KSh': 'KES', 'GH₵': 'GHS', 'ARS$': 'ARS', 'CLP$': 'CLP'
                };

                COUNTRY_DATA.forEach(country => {
                    const code = currencyCodeMap[country.currency] || country.currency;
                    if (liveRates[code]) {
                        country.usdExchange = liveRates[code];
                    }
                });

                const code = currencyCodeMap[currentCurrency] || currentCurrency;
                if (liveRates[code]) {
                    currentUsdExchange = liveRates[code];
                }

                updateSolarEstimates();
                saveState();
            }
        }
    } catch(e) {
        // Fallback silently to baseline hardcoded rates
    }
}

function loadSavedState() {
    try {
        const savedAppliances = localStorage.getItem('myelectricbill_appliances');
        const savedRate = localStorage.getItem('myelectricbill_rate');
        const savedCurrency = localStorage.getItem('myelectricbill_currency');
        const savedUsd = localStorage.getItem('myelectricbill_usd');
        const savedCo2 = localStorage.getItem('myelectricbill_co2');

        if (savedRate) {
            currentRate = parseFloat(savedRate);
            document.getElementById('electricityRate').value = currentRate;
        }

        if (savedCurrency) {
            currentCurrency = savedCurrency;
            document.getElementById('currencySymbol').textContent = currentCurrency;
            const rateSymEl = document.getElementById('rateCurrencySymbol');
            if (rateSymEl) rateSymEl.textContent = currentCurrency;
        }

        if (savedUsd) {
            currentUsdExchange = parseFloat(savedUsd);
        } else if (savedCurrency) {
            currentUsdExchange = getExchangeRateForCurrency(savedCurrency, currentRate);
        }

        if (savedCo2) {
            currentCo2Factor = parseFloat(savedCo2);
        } else if (savedCurrency) {
            const match = COUNTRY_DATA.find(c => c.currency === savedCurrency);
            if (match && match.co2Factor) currentCo2Factor = match.co2Factor;
        }

        // Sync dropdown selection if matching country exists
        const select = document.getElementById('locationSelect');
        if (select && savedCurrency) {
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].getAttribute('data-currency') === savedCurrency) {
                    select.selectedIndex = i;
                    const matchedCo2 = parseFloat(select.options[i].getAttribute('data-co2'));
                    if (matchedCo2) currentCo2Factor = matchedCo2;
                    break;
                }
            }
        }

        if (savedAppliances) {
            appliances = JSON.parse(savedAppliances);
        }
    } catch(e) {}
}

// Utility Helpers
function formatNumber(num) {
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Bulletproof Screen-Clamped Global Tooltip Engine
 * Never cuts off on left, right, top, or bottom on any device!
 */
function initGlobalTooltips() {
    let tooltipEl = document.getElementById('globalTooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'globalTooltip';
        tooltipEl.className = 'global-tooltip';
        document.body.appendChild(tooltipEl);
    }

    let hideTimeout;

    function positionAndShow(iconEl) {
        const text = iconEl.getAttribute('data-tooltip');
        if (!text) return;

        clearTimeout(hideTimeout);
        tooltipEl.textContent = text;
        tooltipEl.style.display = 'block';

        const rect = iconEl.getBoundingClientRect();
        const tooltipWidth = Math.min(220, window.innerWidth - 24);
        tooltipEl.style.width = tooltipWidth + 'px';

        // Calculate horizontally centered position relative to icon
        let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

        // Strictly clamp within 12px screen padding
        const maxLeft = window.innerWidth - tooltipWidth - 12;
        if (left < 12) left = 12;
        if (left > maxLeft) left = maxLeft;

        // Position vertically above icon, or below if near top of screen
        let top = rect.top - tooltipEl.offsetHeight - 8;
        if (top < 12) {
            top = rect.bottom + 8;
        }

        tooltipEl.style.left = left + 'px';
        tooltipEl.style.top = top + 'px';
        tooltipEl.classList.add('visible');
    }

    function hide() {
        hideTimeout = setTimeout(() => {
            if (tooltipEl) {
                tooltipEl.classList.remove('visible');
                tooltipEl.style.display = 'none';
            }
        }, 80);
    }

    document.body.addEventListener('mouseover', (e) => {
        const icon = e.target.closest('.tip-icon');
        if (icon) {
            positionAndShow(icon);
        }
    }, true);

    document.body.addEventListener('mouseout', (e) => {
        const icon = e.target.closest('.tip-icon');
        if (icon) {
            hide();
        }
    }, true);

    document.body.addEventListener('click', (e) => {
        const icon = e.target.closest('.tip-icon');
        if (icon) {
            positionAndShow(icon);
            e.stopPropagation();
        } else {
            hide();
        }
    }, true);

    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide, { passive: true });
}
