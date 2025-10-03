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
