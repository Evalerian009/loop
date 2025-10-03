<<<<<<< HEAD
# 📖 README: Loop — Real-Time Chat App

## 📌 Overview
**Loop** is a minimal **Slack-inspired chat application** built with **Next.js, Prisma, NextAuth, and Socket.io**.  
It features **channels, direct messages, and real-time communication**, showcasing collaborative features in a modern full-stack app.  

---

## 🚀 Tech Stack
- **Frontend & Backend**: [Next.js 14](https://nextjs.org/)  
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) + `bcrypt`  
- **Database & ORM**: [Prisma](https://www.prisma.io/) + [Postgres (Supabase/Neon)]  
- **Real-Time**: [Socket.io](https://socket.io/)  
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)  
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)  
- **Extras**: [emoji-mart](https://github.com/missive/emoji-mart) (emoji picker), file uploads (Cloudinary/S3)  

---

## 🎯 Features
- 🔑 **Authentication** (register/login with hashed passwords)  
- 💬 **Real-time messaging** (channels & direct messages)  
- 📂 **Channels** (join, switch, and chat in groups)  
- 👥 **Direct messages** (1-on-1 private chats)  
- 😀 **Emoji support** (via emoji-mart)  
- 📎 **File uploads** (optional: images, PDFs)  
- 📱 **Responsive UI** (desktop + mobile)  

---

## 🗺 Project Milestones

### **Milestone 1: Project Setup**
- Bootstrap with Next.js 14 (App Router).  
- Install dependencies (`next-auth`, `prisma`, `socket.io`, `zustand`, `tailwindcss`).  
- Initialize Prisma (`npx prisma init`) + connect to DB.  
- Basic `layout.tsx` + landing page.  

✅ *End Result*: Loop runs locally with DB connected and Tailwind working.  

---

### **Milestone 2: Database & Models**
- Define `User`, `Channel`, `Message` models in Prisma.  
- Run `npx prisma migrate dev --name init`.  
- Seed database with test users + channels (optional).  

✅ *End Result*: Database schema ready with tables.  

---

### **Milestone 3: Authentication**
- Setup `next-auth` with `CredentialsProvider`.  
- Implement login + registration pages.  
- Use `bcrypt` for password hashing.  
- Protect dashboard routes with session middleware.  

✅ *End Result*: Users can sign up, log in, and stay authenticated.  

---

### **Milestone 4: Channels**
- Sidebar with **list of channels** user belongs to.  
- API routes to create/join channels.  
- Channel page `/channels/[channelId]` with message history.  

✅ *End Result*: Users can switch between channels and view past messages.  

---

### **Milestone 5: Real-Time Messaging**
- Setup Socket.io server in `/app/api/socket/route.ts`.  
- Connect client with `socket.io-client`.  
- Emit + broadcast new messages.  
- Persist messages in DB with Prisma.  

✅ *End Result*: Messages appear live for all users in a channel.  

---

### **Milestone 6: Direct Messages (DMs)**
- Extend schema to support private DMs.  
- Add `/dms/[userId]` route for 1-on-1 chats.  
- Sidebar → list users → open DM window.  

✅ *End Result*: Users can DM each other in real-time.  

---

### **Milestone 7: Extras**
- Add **emoji picker** to chat input.  
- Add **file uploads** (images/PDFs).  
- Add **typing indicator** + read receipts (optional).  
- Polish UI with `shadcn/ui` components.  

✅ *End Result*: Feels closer to Slack with modern UI/UX.  

---

### **Milestone 8: Deployment**
- Deploy app to **Vercel**.  
- Host DB on **Supabase/Neon**.  
- Configure `.env` with secrets (NEXTAUTH_SECRET, DATABASE_URL).  

✅ *End Result*: Production-ready, live portfolio project.  

---

## ⚡ Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/loop.git
cd loop

# Install dependencies
npm install

# Setup Prisma
npx prisma migrate dev

# Run dev server
npm run dev
```

---

## 🔮 Future Enhancements
- ✅ Search messages  
- ✅ Reactions (like Slack emoji reacts)  
- ✅ Push notifications (mobile/web)  

---

## 👨‍💻 Author
Built by **Valerian** — showcasing **Next.js full-stack development + real-time websockets** in a portfolio project.  
=======
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


layout.tsx
globals.css
app/  
  |--(auth)/          ***Auth. using clerk directives***
    |--sign-in/
      |--[[...sign-in]]/
        |--page.tsx
    |--sign-out/
      |--[[...sign-out]]/
        |--page.tsx 
  |--(root)/
    |--page.tsx       ***Homepage***
    |--documents/
      |--page.tsx     ***Documents List***
      |--[id]/
        |--page.tsx   ***DocumentPage with editor***
components/
  |--CommentsPannelProps.tsx
  |--Header.tsx
  |--ShareDialog.tsx
  |--VersionsTable.tsx
  |--OnlineUsers.tsx
  |--NotificationsDropdown.tsx
  |--SyncUser.tsx
convex/
  |--schema.ts
  |--_generated/ ***Content is auto-generated so I'll skip em***
  |--functions/
    |--comments.ts
    |--documents.ts
    |--notifications.ts
    |--permissions.ts
    |--resolveUserId.ts
    |--updateTitle.ts
    |--users.ts
    |--versions.ts
lib/
  |--convex.ts
utils/
  |--debounce.ts
hocusocus-server.js
middleware.ts
.env.local

***This is pretty much the main stuff, i skipped some for brevity but this is pretty muuch it. i guess you can pretty much figure out what the files are for cus i didn't add to it all the defaults files that .... well irrelevant.***
>>>>>>> 0e4d343317a51763be69c43dc79d1eb46ac47b72
