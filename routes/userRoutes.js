const express = require('express');
const router = express.Router();
const { registerUser,
    getUserById,
    updateUserById
} = require("../controllers/UserController");

router.post('/register', registerUser);
router.get('/user/:id', getUserById);
router.put('/updateuser/:id', updateUserById)

module.exports = router;
