const About = require('../models/about');

exports.createAbout = async (req, res) => {
  try {
    const { description } = req.body;
    const image = req.file ? `/uploads/about/${req.file.filename}` : '';
    const about = new About({ description, image });
    await about.save();
    res.status(201).json(about);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAbout = async (req, res) => {
  try {
    const data = await About.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAbout = async (req, res) => {
  try {
    const { description } = req.body;
    const update = { description };
    if (req.file) update.image = `/uploads/about/${req.file.filename}`;

    const updated = await About.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAbout = async (req, res) => {
  try {
    await About.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
