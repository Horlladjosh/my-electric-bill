# ⚡ Energy Cost Calculator

A web app to calculate and track your household energy costs across different appliances. Compare costs across 30+ countries with automatic currency conversion.

## 🌟 Features

- **Multi-Country Support**: Pre-loaded electricity rates and carbon grid factors for 30+ countries
- **Live Currency Conversion**: Real-time USD exchange rate synchronization via `open.er-api.com` supporting ₦, $, £, €, AED, SAR, INR, and more
- **Solar & Battery System Sizing**: Automatic recommendations for PV Array (`kWp`), Hybrid Inverter (`kVA`), Lithium Battery Storage (`kWh`), Turnkey Setup Costs, and ROI Payback Period
- **Carbon Footprint Tracking**: Calculates annual CO₂ emissions, gas car mileage equivalent, and mature tree offset requirement
- **Interactive Visual Analytics**: Toggle between Cost Share (%) Doughnut Chart and Monthly Usage (`kWh`) Bar Chart
- **Data Export**: Export your complete household appliance breakdown to CSV with a single click
- **Minimal & Responsive**: Dark/Light theme toggle with 100% mobile-friendly responsive layout
- **Local Persistence & Offline Resilient**: Bundled local Chart.js with LocalStorage persistence

## 🚀 Live Demo

[Live Demo](https://myelectricbill.vercel.app)

## 💡 How to Use

1. **Select Your Location**: Choose your country from the dropdown (or input a custom electricity rate)
2. **Add Appliances**: Pick from pre-configured appliances or enter custom names, wattages, hours/day, and quantities
3. **View Real-Time Results**: Instant calculations for Daily, Monthly, and Yearly costs
4. **Inspect Solar & Carbon**: Check recommended Solar PV, Inverter, Battery size, setup costs, and annual CO₂ impact
5. **Visual Analytics & Export**: Toggle cost share / usage charts or export data to CSV

## 🔧 Technical Details

- **Tech Stack**: Modular Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Live Exchange API**: Keyless integration with `open.er-api.com`
- **Charts**: Locally bundled Chart.js with fallback support
- **Privacy & Storage**: 100% client-side calculations and LocalStorage persistence

## 📝 Completed Features

- [x] Solar panel & battery turnkey setup calculator
- [x] Live currency exchange rate converter
- [x] Data export to CSV
- [x] Cost share & usage visual analytics charts
- [x] Carbon footprint & tree offset estimation
- [x] Dark/Light theme toggle & mobile responsive design

## 📄 License

MIT License - Feel free to use, modify, and distribute!

## 🙏 Acknowledgments

- Built with ❤️ for anyone looking to save money on electricity
- Inspired by the need for simple, accessible energy tracking tools
- Thanks to all contributors and users!

## 📧 Contact

Questions? Suggestions? Reach out!

- GitHub Issues: [Open an issue](https://github.com/horlladjosh/my-electric-bill/issues)
- Email: contact@horlladjosh.com
- Twitter: [@horllad_josh](https://twitter.com/horllad_josh)

---

**Star ⭐ this repo if you find it useful!**

Made with lots of ❤️ and 💡
