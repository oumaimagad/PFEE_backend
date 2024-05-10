const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Function to decrypt password
const decryptPassword = (encryptedPassword) => {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, process.env.SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
};

// Controller function to retrieve users
const getUsers = async (req, res) => {
    try {
        const users = await User.find().exec();
        const decryptedUsers = users.map(user => {
            const decryptedPassword = decryptPassword(user.password); // Decrypt password
            return { ...user.toObject(), password: decryptedPassword };
        });
        res.json(decryptedUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving users' });
    }
};

// Controller function to create a new user
const createUser = async (req, res) => {
    try {
        const newPassword = await bcrypt.hash(req.body.password, 10);
        await User.create({
            matricule: req.body.matricule,
            password: newPassword,
        });
        res.json({ status: 'ok' });
    } catch (err) {
        res.json({ status: 'error', error: 'Duplicate matricule' });
    }
};

// Controller function to update an existing user
const updateUser = async (req, res) => {
    try {
        const { matricule, password, roles } = req.body;
        
        // Perform validation if needed
        
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
    
        // Update user fields
        user.matricule = matricule || user.matricule;
        if (password) {
            // Hash the new password before updating
            user.password = await bcrypt.hash(password, 10);
        }
        user.roles = roles || user.roles;
    
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating user' });
    }
};

// Controller function to delete a user
const deleteUser = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: 'No such user'})
    }
  
    const user = await User.findOneAndDelete({_id: id})
  
    if(!user) {
      return res.status(400).json({error: 'No such user'})
    }
  
    res.status(200).json(user)
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser
};
