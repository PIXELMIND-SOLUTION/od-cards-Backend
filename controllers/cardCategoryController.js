const CardCategory = require('../models/CardCategory');

exports.createCardCategory = async (req, res) => {
  try {
    const { title, description, count } = req.body;
    const image = req.file ? `/uploads/cardCategories/${req.file.filename}` : '';
    const card = new CardCategory({ title, description, count, image });
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllCardCategories = async (req, res) => {
  try {
    const cards = await CardCategory.find();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCardCategory = async (req, res) => {
  try {
    const { title, description, count } = req.body;
    const update = { title, description, count };
    if (req.file) update.image = `/uploads/cardCategories/${req.file.filename}`;

    const updated = await CardCategory.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCardCategory = async (req, res) => {
  try {
    await CardCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
