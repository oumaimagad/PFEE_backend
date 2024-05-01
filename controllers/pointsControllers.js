// pointsController.js

const cron = require('node-cron');
const Points = require('./pointsModel'); // Assuming your Mongoose model is in pointsModel.js


const Points = require('./pointsModel'); // Assuming your Mongoose model is in pointsModel.js

// Controller function to update points when an action is completed
exports.updatePoints = async (req, res) => {
    const { pointsGAB, pointsTPE, pointsEpargne } = req.body; // Assuming you're passing updated points data in the request body

    try {
        // Find the existing points document (assuming there's only one document in the collection)
        let existingPoints = await Points.findOne();

        // If no existing document is found, create a new one
        if (!existingPoints) {
            existingPoints = new Points();
        }

        // Update the points data
      
        existingPoints.pointsEpargne += pointsEpargne;

        // Save the updated points data to the database
        await existingPoints.save();

        res.status(200).json({ message: 'Points updated successfully' });
    } catch (error) {
        console.error('Error updating points:', error);
        res.status(500).json({ error: 'An error occurred while updating points' });
    }
};

// Function to update pointsEpargne
const updatePointsEpargne = async () => {
    try {
        // Find the existing points document (assuming there's only one document in the collection)
        let existingPoints = await Points.findOne();

        // If no existing document is found, create a new one
        if (!existingPoints) {
            existingPoints = new Points();
        }

        // Calculate the points to be added to pointsEpargne based on the duration elapsed
        const pointsToAdd = calculatePointsToAdd(); // Implement this function to calculate points based on duration

        // Update pointsEpargne
        existingPoints.pointsEpargne += pointsToAdd;

        // Save the updated points data to the database
        await existingPoints.save();

        console.log('PointsEpargne updated successfully');
    } catch (error) {
        console.error('Error updating pointsEpargne:', error);
    }
};

// Schedule the updatePointsEpargne function to run every day at midnight (adjust as needed)
cron.schedule('0 0 * * *', updatePointsEpargne);

// Function to calculate points to be added based on duration elapsed (dummy implementation)
const calculatePointsToAdd = () => {
    // Implement your logic to calculate points based on duration elapsed
    return 10; // Dummy points for demonstration
};

module.exports = {Points,updatePointsEpargne }; // Exporting the function to be used in your application
