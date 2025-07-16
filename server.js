const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Route Imports
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const policyRoutes = require('./routes/policiesRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const aboutRoutes  = require('./routes/AboutRoutes'); // ✅ use consistent casing
const cardCategoryRoutes = require('./routes/cardCategoryRoutes');
const AdminRoutes = require('./routes/AdminRoutes');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Folder for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/aboutus', aboutRoutes);
app.use('/api/aboutcard', cardCategoryRoutes);
app.use('/api/admin', AdminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
