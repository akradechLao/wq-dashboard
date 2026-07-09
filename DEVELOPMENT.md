# Wastewater Quality Monitoring Dashboard - Development Guide

## โปรเจคนี้คืออะไร

ระบบแดชบอร์ดตรวจสอบคุณภาพน้ำเสียแบบ Real-time สำหรับนิคมอุตสาหกรรม อมาต้าซิตี้ ระยอง
- **Live Site:** https://akradechlao.github.io/wq-dashboard/
- **Repository:** https://github.com/akradechLao/wq-dashboard

---

## Tech Stack

| รายการ | เทคโนโลยี | เวอร์ชัน |
|--------|-----------|---------|
| Frontend | React | 19.x |
| Language | TypeScript | strict mode |
| Build Tool | Vite | 8.x |
| CSS | Tailwind CSS | 4.x |
| Charts | ECharts (echarts-for-react) | 3.x |
| Icons | Lucide React | latest |

---

## เริ่มต้นใช้งาน

### Prerequisites

- **Node.js** v18.0. ขึ้นไป ดาวน์โหลดที่ https://nodejs.org
- **npm** v9.0+ (มาพร้อม Node.js)
- **Git** ดาวน์โหลดที่ https://git-scm.com
- **VS Code** (แนะนำ) ดาวน์โหลดที่ https://code.visualstudio.com

### VS Code Extensions (แนะนำ)

- ESLint
- Tailwind CSS IntelliSense
- Prettier
- GitLens

### ติดตั้งและรัน

```bash
# 1. Clone repo
git clone https://github.com/akradechLao/wq-dashboard.git

# 2. เข้า folder
cd wq-dashboard

# 3. ติดตั้ง dependencies
npm install

# 4. รัน dev server
npm run dev

# 5. เปิด browser ไปที่
# http://localhost:5173
```

### คำสั่งที่ใช้บ่อย

```bash
npm run dev          # รัน dev server (port 5173)
npm run build        # build สำหรับ production (output: dist/)
npm run preview      # preview production build
npm run lint         # เช็ค code quality
```

---

## โครงสร้างโปรเจค

```
wq-dashboard/
├── public/                          # Static files
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Sidebar navigation ( responsive )
│   │   │   └── Header.tsx           # Header bar ( sync status, bell icon )
│   │   ├── dashboard/
│   │   │   ├── StationSummaryPage.tsx   # Dashboard main page ( station cards + CCTV )
│   │   │   ├── StationDetailPage.tsx    # Station detail ( 7 charts )
│   │   │   ├── AnalyticsPage.tsx        # Cross-station analytics
│   │   │   ├── AlertsPage.tsx           # Alert list with acknowledge
│   │   │   ├── SettingsPage.tsx         # Station/Parameter config + Security
│   │   │   ├── CameraCard.tsx           # CCTV camera card ( demo video )
│   │   │   └── CameraSection.tsx        # CCTV section container
│   │   └── ui/
│   │       └── LoginPage.tsx            # Admin login page
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── data/
│   │   └── mockData.ts              # Mock data (parameters, stations, cameras)
│   ├── App.tsx                      # Main app (routing, auth, state)
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Tailwind CSS + custom styles
├── .github/
│   └── workflows/
│       └── deploy.yml               # GitHub Actions CI/CD
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Architecture

### Data Flow

```
App.tsx (state management)
  ├── stationsData: Station[]     ← mock data (ในอนาคตจะเป็น API)
  ├── cameras: Camera[]
  └── isSettingsAuthed: boolean

Components รับ props จาก App.tsx ไม่มี local state ซับซ้อน
```

### Authentication

- **Dashboard/Analytics/Alerts** - เปิดดูได้เลย ไม่ต้อง login
- **Settings** - ต้อง login (admin/1975)
- รหัสผ่านเก็บใน **localStorage** key: `wq_admin_pwd`
- หน้า Login มีปุ่ม "Back to Dashboard"

### Parameters (7 ตัวตาม RFQ)

| ID | Name | Unit | Warning Range | Critical Range | Legal Limit |
|----|------|------|---------------|----------------|-------------|
| ph | pH | - | 6.5 - 8.5 | 5.5 - 9.5 | 6.0 - 9.0 |
| temperature | Temperature | °C | 15 - 35 | 5 - 40 | 0 - 40 |
| conductivity | Conductivity/TDS | μS/cm | 100 - 5000 | 50 - 8000 | 0 - 5000 |
| turbidity | Turbidity | NTU | 0 - 50 | 0 - 100 | 0 - 100 |
| do | DO | mg/L | 5 - 14 | 2 - 16 | 2 - 20 |
| cod | COD | mg/L | 0 - 80 | 0 - 120 | 0 - 120 |
| bod5 | BOD5 | mg/L | 0 - 15 | 0 - 20 | 0 - 20 |

### Status Logic

```typescript
if (value <= criticalLow || value >= criticalHigh) → 'critical'
else if (value <= warningLow || value >= warningHigh) → 'warning'
else → 'normal'
```

---

## การทำงานร่วมกัน (Git Workflow)

### Branch Strategy

```
main              ← production (auto deploy)
├── feature/      ← ฟีเจอร์ใหม่
├── fix/          ← แก้ไข bug
└── refactor/     ← ปรับโครงสร้างโค้ด
```

### ขั้นตอนการทำงาน

```bash
# 1. สร้าง branch ใหม่จาก main
git checkout main
git pull origin main
git checkout -b feature/ชื่อฟีเจอร์

# 2. ทำงานและ test
npm run dev
npm run build
npm run lint

# 3. Commit
git add .
git commit -m "feat: คำอธิบายสิ่งที่ทำ"

# 4. Push
git push origin feature/ชื่อฟีเจอร์

# 5. สร้าง Pull Request บน GitHub
# - เลือก base: main ← compare: feature/ชื่อฟีเจอร์
# - กรอกคำอธิบาย
# - รอ approve และ merge
```

### Commit Message Convention

```
feat:     เพิ่มฟีเจอร์ใหม่
fix:      แก้ไข bug
refactor: ปรับโครงสร้างโค้ด (ไม่เปลี่ยน behavior)
style:    ปรับแต่ง UI/CSS
docs:     เพิ่ม/แก้ไขเอกสาร
chore:    ปรับ config, dependencies
```

### ตัวอย่าง

```bash
git commit -m "feat: add CCTV camera monitoring section"
git commit -m "fix: balance parameter grid layout in station detail"
git commit -m "refactor: separate trend chart into multiple axis groups"
```

---

## สิ่งที่ควรรู้

### Do's

- ✅ ใช้ `import type` สำหรับ type-only imports (TypeScript strict mode)
- ✅ รัน `npm run lint` ก่อน commit
- ✅ รัน `npm run build` เพื่อเช็ค compilation
- ✅ ทดสอบหน้าจอทั้ง Desktop และ Mobile
- ✅ อ่านโค้ดเดิมก่อนแก้ไข เพื่อเข้าใจ coding style

### Don'ts

- ❌ ห้าม commit `node_modules/`, `.env`, secrets
- ❌ ห้าม commit hardcoded credentials
- ❌ ห้าม force push เข้า main
- ❌ ห้ามลบ branches ของคนอื่นโดยไม่บอก

---

## Responsive Design

| Breakpoint | Layout |
|------------|--------|
| < 768px | Mobile: bottom nav, hamburger menu |
| 768px - 1024px | Tablet: collapsed sidebar |
| > 1024px | Desktop: full sidebar (220px) |

---

## Deployment

- Push เข้า `main` branch → GitHub Actions auto deploy
- Output folder: `dist/`
- Base URL: `/wq-dashboard/`
- ใช้เวลา deploy ~2-3 นาที

---

## ติดต่อ

- **Repository Owner:** akradechLao
- **Live Site:** https://akradechlao.github.io/wq-dashboard/

---

*อัปเดตล่าสุด: กรกฎาคม 2568*
