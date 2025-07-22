const express = require('express');
const router = express.Router();
const { createFAQ, getAllFAQs, getFAQById, updateFAQ, deleteFAQ, deleteFAQImage, submitContactForm, getAllSubmissions, deleteSubmission } = require('../controllers/adminController.js');
const { uploadFAQImageSingle } = require('../middleware/upload.js');
const contactController = require('../controllers/contactInfoController');


// Routes for FAQs
router.post('/createfaq', uploadFAQImageSingle, createFAQ); // Create new FAQ
router.get('/getallfaqs', getAllFAQs); // Get all FAQs
router.get('/singlefaq/:id', getFAQById); // Get FAQ by ID
router.put('/updatefaq/:id', updateFAQ); // Update FAQ by ID
router.delete('/deletefaq/:id', deleteFAQ); // Delete FAQ by ID
router.delete('/faq-image', deleteFAQImage);

router.post('/submit', submitContactForm);

router.get('/submissions', getAllSubmissions);

router.delete('/submissions/:id', deleteSubmission);

// Create
router.post('/create', contactController.createContactInfo);

// Get
router.get('/get', contactController.getContactInfo);

// Update
router.put('/update/:id', contactController.updateContactInfo);

// Delete
router.delete('/delete/:id', contactController.deleteContactInfo);

module.exports = router;
