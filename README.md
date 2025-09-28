# 📌 PROJECT ROADMAP — TypeTogether (Convex + Clerk)

## 🛠 TECH STACK & ROLES

| Layer             | Choice                                         | Notes                                                                  |
| ----------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| **Framework**     | Next.js (App Router)                           | Frontend + API routes                                                  |
| **Styling**       | TailwindCSS + Headless UI                      | Responsive UI, modals, dropdowns                                       |
| **Auth**          | Clerk                                          | Handles Google login, sessions, secure cookies                         |
| **Database**      | Convex                                         | Realtime, strongly-typed document DB                                   |
| **DB Access**     | Convex Client                                  | Direct queries & subscriptions                                         |
| **Editor**        | Tiptap                                         | Rich text editor                                                       |
| **Collaboration** | Y.js                                           | CRDT for realtime sync                                                 |
| **Transport**     | Convex + Y.js                                  | Convex handles reactive DB updates; Y.js handles collaborative editing |
| **Notifications** | Convex subscriptions                           | Trigger on comments, shares, presence                                  |
| **Hosting**       | Vercel (frontend), Convex Cloud (backend + DB) | Hosting & deployment                                                   |

---

## 📆 MILESTONES

### Milestone 1 – Setup

* Init Next.js + Tailwind + Headless UI
* Install & configure Clerk for authentication
* Setup Convex project & link to Next.js
* ✅ Feature: User authentication integrated with Convex for secure data access
---

### Milestone 2 – Database & Document Management

* Create Convex tables: `users`, `documents`, `permissions`
* Implement CRUD for documents via Convex functions
* Build UI with search, sort, and document creation
* ✅ Feature: Docs dashboard like Google Docs home screen
* ✅ Feature: Document creation, deletion, and inline title editing (basic)
* ✅ Feature: Permissions system for owners / collaborators
---

### Milestone 3 – Collaborative Editor (Updated)

* Add Tiptap editor for rich-text editing
* Integrate Y.js for CRDT-based collaborative editing
* Use Hocuspocus server for realtime collaboration and snapshot persistence
* Use Convex for document metadata, permissions, and updatedAt tracking
✅ Feature: Realtime collaborative editing with persistence
✅ Feature: Inline document title editing for owners
✅ Feature: Save versions manually through “Save Version” button
✅ Feature: Presence / active cursors (awareness) 
---

### Milestone 4 – Sharing & Permissions

* Add share dialog (email / username / link)
* Store roles (owner / editor / viewer) in `permissions` table
* Enforce roles in editor UI & API functions
* Auto-detect user by email **or** username (with Clerk + placeholders)
* ✅ **Feature:** Secure doc sharing with role-based access
---

### Milestone 5 – Comments

* Create `comments` table (`docId`, `userId`, `text`, `inlineRange`, `parentId`)
* Inline + threaded comments UI (sidebar)
* Sync comments with Convex subscriptions
* ✅ **Feature:** Threaded inline comments

---

### Milestone 6 – Active Collaborators

* Use Y.js awareness API
* Show active collaborators (avatars + colored cursors)
* Sync presence via Convex reactive updates
* ✅ **Feature:** Realtime collaborator presence

---

### Milestone 7 – Notifications

* Create `notifications` table in Convex (`userId`, `type`, `message`, `read`)
* Trigger notifications on shares, comments, collaborator joins
* Add in-app notifications UI (dropdown)
* ✅ **Feature:** Notifications system

---

### Milestone 8 – Responsiveness & Deploy

* Polish mobile + desktop layouts
* Add document search, sort, filters
* Provide loading states, skeleton UIs
* Deploy frontend → **Vercel**, backend → **Convex Cloud**
* ✅ **Feature:** Polished, portfolio-ready app