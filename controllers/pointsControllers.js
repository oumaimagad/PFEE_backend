const schedule = require('node-schedule');
const Points = require('./pointModel'); // Assuming your Mongoose model is in pointsModel.js
const user =require( "../models/userModel")

// Function to calculate points based on deposit amount and duration
function calculatePoints(depositAmount, durationInDays) {
  // Check if deposit amount is greater than or equal to 100000 da
  if (depositAmount >= 100000) {
    // Check if duration is at least 1 month (30 days)
    if (durationInDays >= 30) {
      // Calculate the number of points to add
      const pointsToAdd = Math.floor(depositAmount / 10000);
      // Return the updated points
      return pointsToAdd;
    }
  } 
  // If the conditions are not met, return 0 points
  return 0;
}

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
    const pointsToAdd = calculatePoints(depositAmount, durationInDays);

    // Update pointsEpargne
    existingPoints.pointsEpargne += pointsToAdd;

    // Save the updated points data to the database
    await existingPoints.save();

    console.log('PointsEpargne updated successfully');

    // Schedule the next update
    const nextUpdate = schedule.scheduleJob({hour: 0, minute: 0}, updatePointsEpargne);
  } catch (error) {
    console.error('Error updating pointsEpargne:', error);
  }
};

module.exports = { updatePointsEpargne }; // Exporting the function to be used in your application