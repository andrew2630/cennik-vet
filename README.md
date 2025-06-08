# 🐾 Cennik Vet

[![Next.js](https://img.shields.io/badge/Next.js-15-blue?style=flat-square)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-enabled-5cb85c?style=flat-square)](https://web.dev/progressive-web-apps/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000?logo=threedotjs&logoColor=fff)](https://threejs.org/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000?logo=shadcnui&logoColor=fff)](https://ui.shadcn.com/)

> **Live demo**: [andrzejpudzisz.com/cennik-vet](https://andrzejpudzisz.com/cennik-vet)

---

## ✨ Features

- 💻 Built with **Next.js 15** (App Router, Exported as static site)
- 🎨 Styled with **Tailwind CSS 4**
- 🧠 **LocalStorage**-based persistence (no backend)
- 📝 Rich transaction form with quantity, discounts, fees, and **remarks**
- 📄 **PDF export** (with full Polish locale support)
- 🔌 **Offline support** with **PWA** (via `next-pwa`)
- ☁️ Works 100% offline (great for home visits)
- 📲 Suggests installation on mobile for quick "Add to Home Screen"
- 🌘 **Dark mode** with automatic theme detection
- 🧾 **Combobox**-based product & client selectors
- ⚡ Smart auto-saving for drafts
- ✅ Description field included in data & PDF

---

## 🧑‍⚕️ Who is it for?

Cennik Vet is designed for individual veterinarians or small practices that need a **simple**, **fast**, and **private** way to handle transactions — without internet or external dependencies.

---

## 🚀 Getting Started

### 1. Clone & install

```bash
git clone https://github.com/andrew2630/cennik-vet.git
cd cennik-vet
npm install
````

### 2. Development server

```bash
npm run dev
```

Open `http://localhost:3000/cennik-vet/` in your browser.

---

## 📦 Static Export

```bash
npm run build
npm start
```

App is exported to `out/` folder and served statically.

---

## 🌐 Deployment

Deploy via any static host:

* ✅ [andrzejpudzisz.com/cennik-vet](https://andrzejpudzisz.com/cennik-vet)
* Vercel / Netlify / GitHub Pages (with routing config)

---

## 📁 Project Structure

```
.
├── components/      # UI components & custom logic
├── app/             # App router structure (Next.js)
├── utils/           # LocalStorage helpers
├── types/           # TypeScript shared types
├── public/          # Icons, manifest, etc.
└── ...
```

---

## 🧾 Data Model (simplified)

```ts
interface Transaction {
  id: string;
  clientId: string;
  date: string;
  items: TransactionItem[];
  discount?: number;
  additionalFee?: number;
  totalPrice: number;
  status: 'draft' | 'finalised';
  description?: string;
}
```
---

## 🙋 FAQ

**Q: Does this app send data anywhere?**
A: No. All data stays in your browser via `localStorage`.

**Q: Can I use it offline?**
A: Yes! It’s a PWA — install it and it works offline like a native app.

**Q: Where is the data saved?**
A: In your browser. You can clear or export it manually in the future.

---

## 🧑‍💻 Author

Built by [@andrew2630](https://github.com/andrew2630)
Site: [andrzejpudzisz.com](https://andrzejpudzisz.com)

---

## 🪪 License

[MIT License](./LICENSE)
