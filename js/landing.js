/**
 * Landing Page Theme & Interactive Preview Demo Engine
 */
document.addEventListener('DOMContentLoaded', () => {
    initLandingTheme();
});

function initLandingTheme() {
    const savedTheme = localStorage.getItem('theme');
    const isLight = savedTheme !== 'dark';
    if (isLight) {
        document.body.classList.add('light-mode');
        updateLandingThemeIcons(true);
    } else {
        document.body.classList.remove('light-mode');
        updateLandingThemeIcons(false);
    }
}

function toggleLandingTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateLandingThemeIcons(isLight);
}

function updateLandingThemeIcons(isLight) {
    const iconMoon = document.getElementById('iconMoon');
    const iconSun = document.getElementById('iconSun');
    if (iconMoon && iconSun) {
        if (isLight) {
            iconMoon.style.display = 'none';
            iconSun.style.display = 'block';
        } else {
            iconMoon.style.display = 'block';
            iconSun.style.display = 'none';
        }
    }
}

/**
 * Interactive Demo Preview Calculation Switcher
 */
const SAMPLE_APPLIANCES = {
    ac: {
        name: 'Air Conditioner (1.5 HP)',
        watts: 1500,
        hours: 8,
        qty: 1,
        dailyCost: '$1.92',
        monthlyCost: '$57.60',
        yearlyCost: '$691.20',
        co2: '1,752 kg',
        trees: '88 trees',
        pv: '3.0 kWp',
        inverter: '2.5 kVA',
        battery: '6.0 kWh',
        setup: '$2,800',
        payback: '4.1 yrs'
    },
    tv: {
        name: 'LED Smart TV (110W)',
        watts: 110,
        hours: 6,
        qty: 2,
        dailyCost: '$0.21',
        monthlyCost: '$6.34',
        yearlyCost: '$76.03',
        co2: '193 kg',
        trees: '10 trees',
        pv: '0.5 kWp',
        inverter: '1.0 kVA',
        battery: '2.5 kWh',
        setup: '$950',
        payback: '6.2 yrs'
    },
    fridge: {
        name: 'Refrigerator (180W)',
        watts: 180,
        hours: 24,
        qty: 1,
        dailyCost: '$0.69',
        monthlyCost: '$20.74',
        yearlyCost: '$248.83',
        co2: '631 kg',
        trees: '32 trees',
        pv: '1.2 kWp',
        inverter: '1.0 kVA',
        battery: '2.5 kWh',
        setup: '$1,400',
        payback: '5.6 yrs'
    },
    heater: {
        name: 'Water Heater (2500W)',
        watts: 2500,
        hours: 3,
        qty: 1,
        dailyCost: '$1.20',
        monthlyCost: '$36.00',
        yearlyCost: '$432.00',
        co2: '1,095 kg',
        trees: '55 trees',
        pv: '2.2 kWp',
        inverter: '3.5 kVA',
        battery: '5.0 kWh',
        setup: '$2,300',
        payback: '5.3 yrs'
    }
};

function selectDemoAppliance(key, btnEl) {
    const data = SAMPLE_APPLIANCES[key];
    if (!data) return;

    // Update active tab styling
    document.querySelectorAll('.demo-pill-btn').forEach(btn => btn.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    // Smoothly update metrics
    const setElemText = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.textContent = txt;
    };

    setElemText('demoDaily', data.dailyCost);
    setElemText('demoMonthly', data.monthlyCost);
    setElemText('demoYearly', data.yearlyCost);
    setElemText('demoCo2', data.co2);
    setElemText('demoTrees', data.trees);
    setElemText('demoPv', data.pv);
    setElemText('demoInverter', data.inverter);
    setElemText('demoBattery', data.battery);
    setElemText('demoSetup', data.setup);
    setElemText('demoPayback', `(${data.payback} payback)`);
}

/**
 * Mobile Hamburger Dropdown Navigation Handler
 */
function toggleMobileMenu() {
    const dropdown = document.getElementById('mobileMenuDropdown');
    const openIcon = document.getElementById('iconMenuOpen');
    const closeIcon = document.getElementById('iconMenuClose');
    if (!dropdown) return;

    const isOpen = dropdown.classList.toggle('active');
    document.body.classList.toggle('menu-open', isOpen);
    document.documentElement.classList.toggle('menu-open', isOpen);
    if (isOpen) {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    }

    if (openIcon && closeIcon) {
        openIcon.style.display = isOpen ? 'none' : 'block';
        closeIcon.style.display = isOpen ? 'block' : 'none';
    }
}

function closeMobileMenu() {
    const dropdown = document.getElementById('mobileMenuDropdown');
    const openIcon = document.getElementById('iconMenuOpen');
    const closeIcon = document.getElementById('iconMenuClose');
    if (dropdown) dropdown.classList.remove('active');
    document.body.classList.remove('menu-open');
    document.documentElement.classList.remove('menu-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    if (openIcon && closeIcon) {
        openIcon.style.display = 'block';
        closeIcon.style.display = 'none';
    }
}

// Close mobile dropdown menu when clicking outside
document.addEventListener('click', (e) => {
    const header = document.querySelector('.landing-header');
    if (header && !header.contains(e.target)) {
        closeMobileMenu();
    }
});
