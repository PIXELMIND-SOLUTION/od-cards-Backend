const Marquee = require('../models/Marquee');

// Create
exports.createMarquee = async (req, res) => {
    try {
        const marquee = new Marquee(req.body);
        await marquee.save();
        res.status(201).json(marquee);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get All
exports.getAllMarquees = async (req, res) => {
    try {
        const marquees = await Marquee.find().sort({ createdAt: -1 });
        res.status(200).json({ marquees });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update
exports.updateMarquee = async (req, res) => {
    try {
        const marquee = await Marquee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!marquee) return res.status(404).json({ error: 'Marquee not found' });
        res.status(200).json(marquee);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete
exports.deleteMarquee = async (req, res) => {
    try {
        const result = await Marquee.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ error: 'Marquee not found' });
        res.status(200).json({ message: 'Marquee deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
