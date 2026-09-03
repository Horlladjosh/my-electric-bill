/**
 * Chart.js Integration & Tabbed Visual Analytics Manager
 */
let costChartInstance = null;
let usageChartInstance = null;
let currentChartTab = 'cost';

// Palette of distinct, highly visible colors for appliances (consistent across Cost & Usage charts)
const CHART_COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#f97316', // Orange
    '#14b8a6', // Teal
    '#6366f1'  // Indigo
];

function getThemeColors() {
    const isLightMode = document.body.classList.contains('light-mode');
    return {
        textColor: isLightMode ? '#0a0a0a' : '#ffffff',
        subTextColor: isLightMode ? '#666666' : '#888888',
        gridColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
        tooltipBg: isLightMode ? '#ffffff' : '#151515',
        tooltipText: isLightMode ? '#0a0a0a' : '#ffffff',
        tooltipBorder: isLightMode ? '#e0e0e0' : '#222222'
    };
}

/**
 * Switch Chart Tab (Cost Share vs Monthly kWh Usage)
 */
function switchChartTab(tab) {
    currentChartTab = tab;
    const costBtn = document.getElementById('tabBtnCost');
    const usageBtn = document.getElementById('tabBtnUsage');
    const costBox = document.getElementById('costChartBox');
    const usageBox = document.getElementById('usageChartBox');

    if (tab === 'cost') {
        if (costBtn) costBtn.classList.add('active');
        if (usageBtn) usageBtn.classList.remove('active');
        if (costBox) costBox.style.display = 'block';
        if (usageBox) usageBox.style.display = 'none';
    } else {
        if (usageBtn) usageBtn.classList.add('active');
        if (costBtn) costBtn.classList.remove('active');
        if (usageBox) usageBox.style.display = 'block';
        if (costBox) costBox.style.display = 'none';
    }

    if (typeof appliances !== 'undefined' && appliances.length > 0) {
        updateCharts(appliances, typeof currentCurrency !== 'undefined' ? currentCurrency : '$');
    }
}

/**
 * Main update function called whenever appliances list or rate changes
 */
function updateCharts(appliances, currencySymbol) {
    if (!appliances || appliances.length === 0) return;

    const theme = getThemeColors();
    const labels = appliances.map(a => a.name + (a.quantity > 1 ? ` (×${a.quantity})` : ''));
    const monthlyCosts = appliances.map(a => parseFloat(a.monthlyCost));
    const monthlyKwh = appliances.map(a => parseFloat(a.monthlyKwh));
    const itemColors = appliances.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

    if (!window.Chart) {
        renderFallbackAnalytics(appliances, currencySymbol);
        return;
    }

    const costCanvas = document.getElementById('costChart');
    const usageCanvas = document.getElementById('usageChart');

    // 1. Smoothly update or render Cost Share Doughnut Chart
    if (currentChartTab === 'cost' && costCanvas) {
        try {
            const isMobile = window.innerWidth <= 640;
            if (costChartInstance) {
                costChartInstance.data.labels = labels;
                costChartInstance.data.datasets[0].data = monthlyCosts;
                costChartInstance.data.datasets[0].backgroundColor = itemColors;
                costChartInstance.options.plugins.legend.position = isMobile ? 'bottom' : 'right';
                costChartInstance.options.plugins.legend.labels.color = theme.textColor;
                costChartInstance.update(); // Silky-smooth in-place transition!
            } else {
                const existingCost = Chart.getChart(costCanvas);
                if (existingCost) existingCost.destroy();
                
                costChartInstance = new Chart(costCanvas, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: monthlyCosts,
                            backgroundColor: itemColors,
                            borderWidth: 2,
                            borderColor: 'transparent'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 300 },
                        plugins: {
                            legend: {
                                position: isMobile ? 'bottom' : 'right',
                                labels: {
                                    color: theme.textColor,
                                    font: { family: 'system-ui, -apple-system, sans-serif', size: 11, weight: '500' },
                                    padding: isMobile ? 8 : 12,
                                    usePointStyle: true,
                                    pointStyle: 'circle'
                                }
                            },
                            tooltip: {
                                backgroundColor: theme.tooltipBg,
                                titleColor: theme.tooltipText,
                                bodyColor: theme.tooltipText,
                                borderColor: theme.tooltipBorder,
                                borderWidth: 1,
                                padding: 10,
                                callbacks: {
                                    label: function(context) {
                                        const val = context.raw || 0;
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                                        return ` Cost: ${currencySymbol}${val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${pct}%)`;
                                    }
                                }
                            }
                        },
                        cutout: '65%'
                    }
                });
            }
        } catch(e) {
            console.error('Error rendering cost chart:', e);
        }
    } 
    // 2. Smoothly update or render Usage Bar Chart
    else if (currentChartTab === 'usage' && usageCanvas) {
        try {
            if (usageChartInstance) {
                usageChartInstance.data.labels = labels;
                usageChartInstance.data.datasets[0].data = monthlyKwh;
                usageChartInstance.data.datasets[0].backgroundColor = itemColors;
                usageChartInstance.options.scales.x.ticks.color = theme.textColor;
                usageChartInstance.options.scales.y.ticks.color = theme.textColor;
                usageChartInstance.options.scales.y.title.color = theme.textColor;
                usageChartInstance.options.scales.x.grid.color = theme.gridColor;
                usageChartInstance.options.scales.y.grid.color = theme.gridColor;
                usageChartInstance.update(); // Silky-smooth in-place transition!
            } else {
                const existingUsage = Chart.getChart(usageCanvas);
                if (existingUsage) existingUsage.destroy();

                usageChartInstance = new Chart(usageCanvas, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Monthly kWh',
                            data: monthlyKwh,
                            backgroundColor: itemColors,
                            borderRadius: 4,
                            maxBarThickness: 36
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 300 },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: theme.tooltipBg,
                                titleColor: theme.tooltipText,
                                bodyColor: theme.tooltipText,
                                borderColor: theme.tooltipBorder,
                                borderWidth: 1,
                                padding: 10,
                                callbacks: {
                                    label: function(context) {
                                        return ` Consumption: ${context.raw.toFixed(1)} kWh/mo`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: { color: theme.textColor, font: { size: 11, weight: '500' } },
                                grid: { color: theme.gridColor }
                            },
                            y: {
                                ticks: { color: theme.textColor, font: { size: 11 } },
                                grid: { color: theme.gridColor },
                                title: {
                                    display: true,
                                    text: 'kWh',
                                    color: theme.textColor,
                                    font: { family: 'system-ui, -apple-system, sans-serif', size: 11, weight: '600' }
                                }
                            }
                        }
                    }
                });
            }
        } catch(e) {
            console.error('Error rendering usage chart:', e);
        }
    }
}

/**
 * Fallback visual breakdown if Chart.js fails to initialize
 */
function renderFallbackAnalytics(appliances, currencySymbol) {
    const costBox = document.getElementById('costChartBox');
    if (!costBox) return;

    const totalCost = appliances.reduce((sum, a) => sum + parseFloat(a.monthlyCost), 0);
    
    costBox.innerHTML = `
        <div style="padding: 10px 0; font-size: 0.85rem;">
            ${appliances.map((app, i) => {
                const cost = parseFloat(app.monthlyCost);
                const pct = totalCost > 0 ? ((cost / totalCost) * 100).toFixed(1) : 0;
                const color = CHART_COLORS[i % CHART_COLORS.length];
                return `
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span><span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color}; margin-right:6px;"></span>${app.name}</span>
                            <span style="font-weight:600;">${currencySymbol}${cost.toFixed(2)} (${pct}%)</span>
                        </div>
                        <div style="width: 100%; height: 6px; background: rgba(128,128,128,0.2); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${pct}%; height: 100%; background: ${color}; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Update chart theme colors when user toggles dark/light mode
 */
function refreshChartTheme() {
    if (typeof appliances !== 'undefined' && appliances.length > 0) {
        updateCharts(appliances, typeof currentCurrency !== 'undefined' ? currentCurrency : '$');
    }
}
