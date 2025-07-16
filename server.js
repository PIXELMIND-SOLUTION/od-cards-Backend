const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const path = require('path');
const policyRoutes = require('./routes/policiesRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
<<<<<<< HEAD
const aboutRoutes  = require('./routes/AboutRoutes');
const cardCategoryRoutes = require('./routes/cardCategoryRoutes');
=======
const aboutRoutes  = require('./routes/aboutRoutes');
const cardCategoryRoutes = require('./routes/cardCategoryRoutes');
const AdminRoutes = require('./routes/AdminRoutes');
>>>>>>> 8a5b658 (16/07/25)



dotenv.config();
connectDB();

const app = express(); 

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder to access uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/aboutus", aboutRoutes);
app.use("/api/aboutcard", cardCategoryRoutes);
<<<<<<< HEAD
=======
app.use("/api/admin", AdminRoutes);
>>>>>>> 8a5b658 (16/07/25)



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
