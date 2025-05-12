const Category = require('../models/Category');  // Importing the Category model

// ✅ Create Category
exports.createCategory = async (req, res) => {
  try {
    const { category, image } = req.body;

    // Check if the required fields are provided
    if (!category || !image) {
      return res.status(400).json({ message: 'Category name and image are required.' });
    }

    // Create a new category instance
    const newCategory = new Category({
        category,
      image
    });

    // Save the new category to the database
    const savedCategory = await newCategory.save();
    res.status(201).json({ message: 'Category created successfully.', category: savedCategory });
  } catch (error) {
    console.error('Error in createCategory:', error);
    res.status(500).json({ message: 'Server error while creating category.' });
  }
};

// ✅ Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ message: 'Categories fetched successfully.', categories });
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    res.status(500).json({ message: 'Server error while fetching categories.' });
  }
};

// ✅ Get Category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.status(200).json({ message: 'Category fetched successfully.', category });
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    res.status(500).json({ message: 'Server error while fetching category.' });
  }
};

// ✅ Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updates = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(categoryId, updates, { new: true });

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.status(200).json({ message: 'Category updated successfully.', category: updatedCategory });
  } catch (error) {
    console.error('Error in updateCategory:', error);
    res.status(500).json({ message: 'Server error while updating category.' });
  }
};

// ✅ Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.status(200).json({ message: 'Category deleted successfully.', category: deletedCategory });
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    res.status(500).json({ message: 'Server error while deleting category.' });
  }
};
