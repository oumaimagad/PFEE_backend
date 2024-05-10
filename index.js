require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Offre = require('./models/offreModel');
const Money = require('./models/usermoneyModel');
const Points = require('./models/pointsModels');
const Scheduled = require('./models/scheduledModel');
const jwt = require('jsonwebtoken');
const schedule = require('node-schedule');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const CryptoJS = require("crypto-js");
const Programme=require('./models/programmeModel')
app.use(cors());
app.use(express.json());
app.use('/api', router);

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch(err => {
        console.error("MongoDB connection failed:", err);
    });

// Import routes
const reclamationRoutes = require('./routes/reclamationRoute');
app.use('/api/reclamation', reclamationRoutes);

//crud functions-------------------------------------------------------------------------------------------
app.get('/api/users', async (req, res) => {
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
});

// Function to decrypt password
const decryptPassword = (encryptedPassword) => {
   

    // Replace 'your_secret_key' with your encryption key
    const decryptPassword = (encryptedPassword) => {
      const bytes  = CryptoJS.AES.decrypt(encryptedPassword, process.env.SECRET);
      return bytes.toString(CryptoJS.enc.Utf8);
    };
    
    module.exports = decryptPassword;
};

// Route to create a new user
app.post('/api/users', async (req, res) => {
    console.log(req.body)
	try {
		const newPassword = await bcrypt.hash(req.body.password, 10)
		await User.create({
			matricule: req.body.matricule,
			password: newPassword,
		})
		res.json({ status: 'ok' })
	} catch (err) {
		res.json({ status: 'error', error: 'Duplicate matricule' })
	}
  });
  
  // Route to update an existing user
app.put('/api/users/:id', async (req, res) => {
    try {
      const { matricule, password, roles } = req.body;
      
      // Perform validation if needed
      
      const user = await User.findById(req.params.id);
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
  });
  
  
  // Route to delete a user
app.delete('/api/users/:id', async (req, res) => {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      await user.remove();
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting user' });
    }
  });
  
  
//---------------------------------------------Authentification-------------------------------------------------------------

app.post('/api/register', async (req, res) => {
  console.log(req.body);
  try {
      const { matricule, password, role } = req.body;

      // Check if the provided role is either "user" or "admin"
      if (role !== "user" && role !== "admin" && role!="partenaire") {
          return res.json({ status: 'error', error: 'Invalid role' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
          matricule,
          password: hashedPassword,
          role:role // Assign the provided role to the user
      });

      await newUser.save();
      res.json({ status: 'ok' });
  } catch (err) {
      if (err.code === 11000) {
          // Duplicate key error (matricule already exists)
          return res.json({ status: 'error', error: 'Duplicate matricule' });
      } else {
          // Other errors
          console.error(err);
          return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
      }
  }
});

app.post('/api/login', async (req, res) => {
  try {
      const user = await User.findOne({
          matricule: req.body.matricule,
      });

      if (!user) {
          return res.json({ status: 'error', error: 'Invalid login' });
      }

      const isPasswordValid = await bcrypt.compare(
          req.body.password,
          user.password
      );

      if (isPasswordValid) {
          const token = jwt.sign(
              {
                  matricule: user.matricule,
                  role: user.role // Include user roles in the token
              },
              process.env.SECRET
          )

          // Redirect to default page if user does not have admin role
          return res.json({ status: 'ok', user: token });
      } else {
          return res.json({ status: 'error', error: 'Invalid password' });
      }
  } catch (error) {
      return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
});






exports.logout = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    // await Blacklist.create({ token });
    res.status(200).json({ success: true, data: {} });
  };
  
  router.get('/logout', exports.logout);


app.post("/userData", async (req, res) => {
    const [token] = req.body;
    try {
        const user = jwt.verify(token, process.env.SECRET);
        const userMatricule = user.matricule;
        User.findOne({ matricule: userMatricule })
            .then((data) => {
                res.send({ status: "OK", data: data });
            })
            .catch((error) => {
                res.send({ status: "error", data: error });
            });
    } catch (error) {}
});

app.post('/api/logout', async (req, res) => {

})


//---------------------------------MONEY MANIPULATION--------------------------------
// Define Pointsuser function
async function Pointsuser() {
  try {
    // Find the user's money data based on their matricule
    const userMoney = await Money.findOne({ matricule: User.matricule });

    // Check if userMoney is found
    if (userMoney) {
       // Check if updatedAt is more than 30 days older than createdAt
        const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        const timeDifference = userMoney.createdAt.getTime() - userMoney.updatedAt.getTime();
      // Check if money is divisible by 10000 and > 10000
      if ((timeDifference > thirtyDaysInMillis) &&userMoney.money>10000 && userMoney.money % 10000 === 0) {
        // Increment points by 10 if conditions are met
        const pointsToAdd = Math.floor(userMoney.money /10000);
        Points.points = 10*pointsToAdd
      }
    }
  } catch (error) {
    console.error('Error fetching user money:', error);
    throw error; // Rethrow the error
  }

  return Points.points; // Return the updated points
}

// POST endpoint to add money for a user
app.post('/api/money', async (req, res) => {
  try {
    
    if (Money.matricule === User.matricule) {
      const { money, matricule } = req.body;
      const moneyClient = new Money({
        matricule,
        money,
      });
      await moneyClient.save(); // Save money entry to the database
    }
    
    res.json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add money for user' });
  }
});


// Get user points
app.get('/api/points/:matricule', async (req, res) => {
  try {
    const { matricule } = req.params;
    res.status(200).json({ matricule, pointsEpargne });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get user points' });
  }
});

// Update user points
app.put('/points/:matricule', async (req, res) => {
  try {
    const { matricule } = req.params;

    // Calculate new points for the user
    const totalPoints = await Pointsuser(User.matricule);

    // Update user points
    const user = await User.findOneAndUpdate(
      { matricule },
      { points: totalPoints },
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ matricule: user.matricule, points: user.points });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update user points' });
  }
});

// Route to get all programs
app.get('/api/programs', async (req, res) => {
  try {
    const programs = await Programme.find();
    res.json(programs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving programs' });
  }
});

// Route to create a new program
app.post('/api/programs', async (req, res) => {
  try {
    const { content } = req.body;
    const newProgram = await Programme.create({ content });
    res.status(201).json(newProgram);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating program' });
  }
});
// Route to get the last program
app.get('/api/programs/last', async (req, res) => {
  try {
    const lastProgram = await Programme.findOne().sort({ _id: -1 });
    res.json(lastProgram);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving last program' });
  }
});
// Update a program
router.put('/api/programs/:_id', async (req, res) => {
  try {
      const { _id } = req.params;
      const { content } = req.body;

      const updatedProgram = await Programme.findByIdAndUpdate(_id, { content }, { new: true });

      if (!updatedProgram) {
          return res.status(404).json({ message: 'Program not found' });
      }

      res.status(200).json(updatedProgram);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating program' });
  }
});


app.listen(process.env.PORT,()=>{
console.log('Server started on',process.env.PORT)})

