# 🎓 Scholarship Management System

A full-stack MERN application for managing and applying to university scholarships. It supports role-based dashboards for users, moderators, and admins to maintain a dynamic and secure scholarship system.

## 🚀 Live Project

**Frontend:** [Live Site URL here]  
**Admin Credentials:**  
Email: admin@example.com  
Password: admin_password  

**Moderator Credentials:**  
Email: moderator@example.com  
Password: moderator_password  

## 📁 Repository Links

- **Frontend Repo:** [GitHub Frontend Link]  
- **Backend Repo:** [GitHub Backend Link]

## 🎯 Project Purpose

This system was built to:

- Help students find and apply to scholarships
- Allow users to track applications and submit reviews
- Enable moderators and admins to manage scholarships and user applications with role-based access

## 👥 User Roles

- **User** – Apply for scholarships, write reviews, manage profile  
- **Moderator** – Manage scholarships, user applications, and reviews  
- **Admin** – Full control over users, scholarships, applications, and analytics  

## ✨ Key Features

- Fully responsive (Mobile, Tablet, Desktop)
- Firebase Email/Password + Google Auth
- JWT-based private route protection
- Stripe payment integration
- Review system with rating and comment
- TanStack Query for data fetching (GET)
- Role-based dashboards with protected routes
- Real-time search, sort, and filtering
- Chart analytics in Admin dashboard
- Sweetalert2 and React Hot Toast for feedback
- Secure .env configuration for Firebase & MongoDB
- Deployment on Vercel (Client & Server)

## 📌 Major Pages

- **Home Page** – Banner, 6 scholarships, custom sections, All Scholarship link  
- **All Scholarships** – Search, filter, card layout  
- **Scholarship Details** – Full info, reviews slider, Apply button  
- **Application Page** – Pre-payment form, payment, submit data to DB  
- **User Dashboard** – Profile, Applied Scholarships, My Reviews  
- **Moderator Dashboard** – Add/Edit/Delete scholarships, view all applications and reviews  
- **Admin Dashboard** – Full access to manage users, applications, reviews, scholarships, analytics  

## 🧩 Technologies Used

### Client:

- React.js, React Router DOM  
- Tailwind CSS, DaisyUI  
- Firebase Auth  
- TanStack React Query  
- React Hook Form, Swiper.js  
- Axios, SweetAlert2, React Hot Toast  
- Recharts or Chart.js  

### Server:

- Node.js, Express.js  
- MongoDB, Mongoose  
- Firebase Admin SDK  
- Stripe Payment  
- JWT, dotenv, cors  

## 🔐 Security

- Environment variables for Firebase & MongoDB  
- JWT token validation  
- CORS and error handling  
- Firebase domain whitelisting  
- SPA fallback routing handled

## ✅ Deployment Checklist

- ✅ 20+ client & 12+ server commits with descriptive messages  
- ✅ Vercel deployed with error-free routes (404/500 handled)  
- ✅ Firebase keys hidden in `.env`  
- ✅ MongoDB credentials secured  
- ✅ Firebase domain auth added  
- ✅ Application fully responsive  
- ✅ SPA routes reload-safe  
- ✅ Private routes do not redirect on reload

## 📄 Notes

- Forgot password & email verification skipped (as per instruction)  
- Completely original layout — no copied design  
- Sweet alerts used for all feedback interactions  
- Modals used for edit reviews/applications

---

> **Developed by:** Md Soriful Islam  
> MERN Stack Developer

---

⭐ Feel free to fork, explore, and contribute!
