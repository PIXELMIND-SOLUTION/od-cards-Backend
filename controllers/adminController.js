const FAQ = require('../models/FAQ');  // Importing the FAQ model
const FAQImage = require('../models/FAQImage');
const Contact = require('../models/Contact');
const fs = require('fs');
const path = require('path');


exports.createFAQ = async (req, res) => {
  try {
    let { faqs } = req.body;

    if (typeof faqs === 'string') {
      faqs = JSON.parse(faqs);
    }

    if (!Array.isArray(faqs)) {
      return res.status(400).json({
        success: false,
        message: 'faqs should be an array'
      });
    }

    const image = req.file?.filename || null;

    if (image) {
      await FAQImage.deleteMany(); // optional: only one image allowed
      await new FAQImage({ image }).save();
    }

    const newFAQs = [];

    for (let faq of faqs) {
      const { question, answer } = faq;

      const newFAQ = new FAQ({ question, answer });
      await newFAQ.save();
      newFAQs.push(newFAQ);
    }

    res.status(201).json({
      success: true,
      message: 'FAQs created successfully',
      faqImage: image ? `/uploads/faqs/${image}` : null,
      data: newFAQs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};


exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find();

    const faqImageDoc = await FAQImage.findOne(); // Only one image is stored
    const faqImageUrl = faqImageDoc ? `/uploads/faqs/${faqImageDoc.image}` : null;

    res.status(200).json({
      success: true,
      faqImage: faqImageUrl,
      data: faqs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get FAQ by ID
exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      data: faq
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const { question, answer, images } = req.body;

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      req.params.id,
      { question, answer, images },
      { new: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: updatedFAQ
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete FAQ Image
exports.deleteFAQImage = async (req, res) => {
  try {
    const faqImageDoc = await FAQImage.findOne();

    if (!faqImageDoc) {
      return res.status(404).json({
        success: false,
        message: 'No FAQ image found to delete',
      });
    }

    const imagePath = path.join(__dirname, '../public/uploads/faqs', faqImageDoc.image);

    // Delete the file from filesystem
    fs.unlink(imagePath, async (err) => {
      if (err && err.code !== 'ENOENT') {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete image file',
          error: err.message,
        });
      }

      // Remove the document from MongoDB
      await FAQImage.deleteMany();

      res.status(200).json({
        success: true,
        message: 'FAQ image deleted successfully',
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};



exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, number, message } = req.body;

    if (!name || !email || !number || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    const contact = new Contact({ name, email, number, message });
    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully.',
      data: contact
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Contact.find().sort({ createdAt: -1 });

    // Format the createdAt timestamp
    const formattedSubmissions = submissions.map(sub => ({
      _id: sub._id,
      name: sub.name,
      email: sub.email,
      number: sub.number,
      message: sub.message,
      createdAt: sub.createdAt,
      formattedDate: new Date(sub.createdAt).toLocaleDateString(),
      formattedTime: new Date(sub.createdAt).toLocaleTimeString(),
    }));

    res.status(200).json({
      success: true,
      message: 'All contact form submissions retrieved successfully.',
      data: formattedSubmissions
    });
  } catch (error) {
    console.error('Error fetching contact form submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};


exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact submission deleted successfully.',
      data: deletedContact
    });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
