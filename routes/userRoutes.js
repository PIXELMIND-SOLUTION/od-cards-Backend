const express = require('express');
const router = express.Router();
const { registerUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
} = require("../controllers/UserController");

router.post('/register', registerUser);
router.get('/getallusers', getAllUsers);
router.get('/user/:id', getUserById);
router.put('/updateuser/:id', updateUserById);
router.delete('/deleteuser/:id', deleteUserById);

module.exports = router;
