# 📁 Cấu Trúc Dự Án - Phiên Bản Đơn Giản

## 🌳 Tổng Quan

```
agile-project-management/
│
├── 📁 client/                          # Frontend React App
│   ├── public/                         # Static files
│   └── src/
│       ├── assets/                     # Images, icons, styles
│       ├── components/                 # React components
│       │   ├── common/                 # Buttons, inputs, tables...
│       │   ├── layout/                 # Header, sidebar, footer
│       │   ├── auth/                   # Login, register forms
│       │   ├── student/                # Student components
│       │   ├── supervisor/             # Supervisor components  
│       │   ├── reviewer/               # Reviewer components
│       │   └── admin/                  # Admin components
│       ├── pages/                      # Page components (routes)
│       ├── hooks/                      # Custom React hooks
│       ├── contexts/                   # React Context (global state)
│       ├── services/                   # API calls & Firebase
│       ├── utils/                      # Helper functions
│       ├── types/                      # TypeScript types
│       ├── routes/                     # Router configuration
│       └── App.tsx                     # Main component
│
├── 📁 server/                          # Backend Firebase Functions
│   └── functions/
│       └── src/
│           ├── controllers/            # Request handlers
│           ├── services/               # Business logic
│           ├── middleware/             # Auth, validation
│           ├── triggers/               # Firestore triggers
│           ├── scheduled/              # Cron jobs
│           └── index.ts                # Entry point
│
├── 📁 shared/                          # Shared code
│   ├── types/                          # Shared types
│   ├── constants/                      # Shared constants
│   └── utils/                          # Shared utilities
│
├── 📁 firebase/                        # Firebase config
│   ├── firestore.rules                # Security rules
│   ├── firestore.indexes.json         # Database indexes
│   └── storage.rules                  # Storage rules
│
├── 📁 docs/                            # Documentation
│   ├── diagrams/                       # Visual diagrams
│   ├── DATABASE_SCHEMA.md
│   ├── ERD_DIAGRAM.md
│   ├── USE_CASE_SPECIFICATIONS.md
│   └── ...
│
├── 📁 scripts/                         # Utility scripts
│   ├── seed/                           # Database seeding
│   ├── migration/                      # Data migration
│   └── backup/                         # Backup scripts
│
├── .gitignore
├── package.json                        # Root package.json
├── firebase.json                       # Firebase configuration
└── README.md
```

---

## 📂 Chi Tiết Các Thư Mục Chính

### 1️⃣ CLIENT (Frontend)

```
client/src/
├── components/         → UI Components
│   ├── common/        → Button, Input, Modal, Table...
│   ├── student/       → Student-specific components
│   ├── supervisor/    → Supervisor-specific components
│   └── admin/         → Admin-specific components
│
├── pages/             → Route pages
│   ├── student/       → StudentDashboard, TopicRegistration...
│   ├── supervisor/    → SupervisorDashboard, MyStudents...
│   └── admin/         → AdminDashboard, UserManagement...
│
├── services/          → API & Firebase
│   ├── firebase/      → auth, firestore, storage
│   └── api/           → API calls for each entity
│
├── hooks/             → useAuth, useFirestore, useForm...
├── types/             → TypeScript definitions
└── utils/             → Helper functions
```

### 2️⃣ SERVER (Backend)

```
server/functions/src/
├── controllers/       → HTTP request handlers
├── services/          → Business logic
├── middleware/        → Auth, validation, error handling
├── triggers/          → Firestore event listeners
├── scheduled/         → Cron jobs (daily reminders...)
└── index.ts           → Export all functions
```

### 3️⃣ SHARED

```
shared/
├── types/             → Shared TypeScript types
├── constants/         → Shared constants (roles, status...)
└── utils/             → Shared utilities
```

---

## 🎯 Các File Quan Trọng

### Root Level
```
├── package.json                # Dependencies & scripts
├── firebase.json              # Firebase configuration
├── .env                       # Environment variables
└── tsconfig.json             # TypeScript config
```

### Client
```
client/
├── src/App.tsx               # Main app component
├── src/index.tsx             # Entry point
├── package.json              # Frontend dependencies
├── vite.config.ts            # Vite bundler config
└── tailwind.config.js        # Tailwind CSS config
```

### Server
```
server/functions/
├── src/index.ts              # Cloud Functions entry
├── package.json              # Backend dependencies
└── tsconfig.json             # TypeScript config
```

---

## 📊 Tổng Kết Nhanh

| Thư mục | Mục đích | Số lượng files |
|---------|----------|----------------|
| **client/** | Frontend React app | ~150-200 |
| **server/** | Backend Firebase Functions | ~50-70 |
| **shared/** | Code dùng chung | ~20 |
| **docs/** | Tài liệu dự án | ~15 |
| **scripts/** | Helper scripts | ~10 |

---

## 🚀 Commands Nhanh

```bash
# Development
npm run dev                    # Start frontend dev server
firebase emulators:start       # Start backend locally

# Build
npm run build                  # Build all workspaces

# Deploy
firebase deploy               # Deploy to production
firebase deploy --only hosting # Deploy frontend only
firebase deploy --only functions # Deploy backend only

# Test
npm test                      # Run all tests
```

---

## 💡 Convention Nhanh

- **Components**: PascalCase (`Button.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Services**: camelCase + `.service.ts` (`auth.service.ts`)
- **Types**: camelCase + `.types.ts` (`user.types.ts`)
- **Pages**: PascalCase + `Page` suffix (`LoginPage.tsx`)

---

## ✨ Điểm Nổi Bật

✅ **Monorepo** - Quản lý nhiều packages trong 1 repo  
✅ **TypeScript** - Type safety toàn dự án  
✅ **Firebase** - Backend as a Service  
✅ **React** - Modern UI library  
✅ **Vite** - Fast build tool  
✅ **Tailwind CSS** - Utility-first CSS  

---

Cấu trúc này đơn giản, dễ hiểu và dễ mở rộng! 🎉
