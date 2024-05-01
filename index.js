require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Points = require('./models/pointsModels');
const Scheduled = require('./models/scheduledModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

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

// Listen for changes in Points model
Points.watch().on('change', async (change) => {
    if (change.operationType === 'insert' || change.operationType === 'update') {
        // Calculate sum of points
        const points = await Points.aggregate([
            {
                $group: {
                    _id: null,
                    totalPoints: { $sum: "$pointsGAB" } // Assuming you want to sum pointsGAB only, you can include other fields as well
                }
            }
        ]);
        const totalPoints = points.length > 0 ? points[0].totalPoints : 0;

        // Update Scheduled model with the total points
        try {
            await Scheduled.findOneAndUpdate({}, { somme: totalPoints }, { upsert: true });
        } catch (error) {
            console.error('Error updating Scheduled model:', error);
        }
    }
});

app.post('/api/register', async (req, res) => {
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
})

app.post('/api/login', async (req, res) => {
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
            },
            'secret123'
        );

        return res.json({ status: 'ok', user: token });
    } else {
        return res.json({ status: 'error', user: false });
    }
});

exports.logout = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    await Blacklist.create({ token });
    res.status(200).json({ success: true, data: {} });
  };
  
  router.get('/logout', exports.logout);


app.post("/userData", async (req, res) => {
    const [token] = req.body;
    try {
        const user = jwt.verify(token, "secret123");
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


// POST endpoint to add points
router.post('/api/Points', async (req, res) => {
    const { pointsGAB, pointsTPE, pointsEpargne, Created_At } = req.body;

    try {
        // Create a new document using the Points model
        await Points.create({
            pointsGAB,
            pointsTPE,
            pointsEpargne,
            Created_At
        });
        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Error adding points:', error);
        res.status(500).json({ status: 'error', error: 'An error occurred while adding points' });
    }
});


app.listen(process.env.PORT,()=>{
console.log('Server started on',process.env.PORT)

var task = cron.schedule('* * * * * *', () => {
console.log('task submitted succesfully')
})
setTimeout(()=>{
task.start()
},3000);

setTimeout(()=>{
	task.stop()
	},5000);
})
