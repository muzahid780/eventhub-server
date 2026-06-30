# 🌍 EventHub - Server Side

## 📌 Live API URL

[EventHub API](https://eventhub-server.vercel.app/api/health)

---

## 📌 Features

- ✅ **User Authentication** - Register/Login with JWT Token
- ✅ **Create Events** - Organize social service events with future date validation
- ✅ **Join Events** - Join community events and track participation
- ✅ **Manage Events** - Update or delete your own events
- ✅ **Filter & Search** - Search events by name and filter by type
- ✅ **Secure API** - JWT Authentication & Authorization
- ✅ **MongoDB Atlas** - Cloud database for scalable storage
- ✅ **Error Handling** - Proper error messages and validation
- ✅ **CORS Enabled** - Secure cross-origin requests

---

## 🛠️ Technologies Used

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **express-validator** - Input validation

---

## 📁 Project Structure

eventhub-server/
├── src/
│ ├── config/
│ │ └── db.config.js
│ ├── controllers/
│ │ ├── auth.controller.js
│ │ └── event.controller.js
│ ├── middlewares/
│ │ ├── auth.middleware.js
│ │ └── validation.middleware.js
│ ├── models/
│ │ ├── User.model.js
│ │ ├── Event.model.js
│ │ └── Participant.model.js
│ ├── routes/
│ │ ├── auth.routes.js
│ │ └── event.routes.js
│ ├── utils/
│ │ └── helpers.js
│ └── server.js
├── .env
├── .gitignore
├── package.json
├── vercel.json
└── README.md
