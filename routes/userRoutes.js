const express = require('express');
const router = express.Router();
const {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/usersControllers');

// Route to get all users
router.get('/', getUsers);

// Route to create a new user
router.post('/', createUser);

// Route to update an existing user
router.put('/:id', updateUser);

// Route to delete a user
router.delete('/:id', deleteUser);

module.exports = router;
