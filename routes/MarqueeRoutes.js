const express = require('express');
const router = express.Router();
const marqueeController = require('../controllers/MarqueeController');

router.post('/add', marqueeController.createMarquee);
router.get('/getall', marqueeController.getAllMarquees);
router.put('/update/:id', marqueeController.updateMarquee);
router.delete('/delete/:id', marqueeController.deleteMarquee);

module.exports = router;
