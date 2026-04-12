# 🚀 Deployment Guide: Synapse AI Vanguard

This guide outlines the steps to deploy the Synapse AI Vanguard platform using the requested stack.

## 1. 🗄️ Database: MongoDB Atlas
1.  **Create Account:** Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  **Create Cluster:** Create a free Shared Cluster (M0).
3.  **Network Access:** Go to "Network Access" and add IP address `0.0.0.0/0` (Allow access from anywhere for Render).
4.  **Database User:** Create a user with Read/Write permissions.
5.  **Connection String:** Click "Connect" -> "Connect your application" -> Copy the URI.
    *   *Example:* `mongodb+srv://<username>:<password>@cluster0.mongodb.net/synapse_ai?retryWrites=true&w=majority`

---

## 2. ⚙️ Backend: Render
1.  **Create Account:** Sign up at [Render](https://render.com).
2.  **New Web Service:**
    *   Connect your GitHub repository.
    *   **Name:** `synapse-backend`
    *   **Root Directory:** `Synapse Ai/server`
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
3.  **Environment Variables:** Add the following:
    *   `PORT`: `5000`
    *   `MONGODB_URI`: *Your Atlas URI*
    *   `JWT_SECRET`: *A secure random string*
    *   `GROQ_API_KEY`: *Your Groq API Key*
    *   `FRONTEND_URL`: *The URL of your Vercel frontend (you can update this after Vercel deployment)*
4.  **Deploy:** Click "Create Web Service".

---

## 3. 🌐 Frontend: Netlify
1.  **Create Account:** Sign up at [Netlify](https://www.netlify.com).
2.  **Add New Site:**
    *   Connect your GitHub repository.
    *   **Base Directory:** `Synapse Ai/client`
    *   **Build Command:** `npm run build`
    *   **Publish Directory:** `dist`
3.  **Environment Variables:** Go to "Site settings" -> "Environment variables" and add:
    *   `VITE_API_BASE_URL`: *The URL of your Render backend* (e.g., `https://synapse-backend.onrender.com/api`)
4.  **Deploy:** Click "Deploy site".

---

## 🛠️ Verification
After deployment:
1.  Update the `FRONTEND_URL` variable in **Render** with your Netlify URL (e.g., `https://synapse-ai.netlify.app`).
2.  Test the login and registration flow.
3.  Ensure the "Neural Data Link" (MongoDB connection) is established in the Render logs.

---

> [!IMPORTANT]
> Ensure that all environment variables are correctly mapped between the services. The frontend uses `VITE_` prefix for Vite to pick them up, while the backend uses standard names.
