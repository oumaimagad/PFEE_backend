const schedule = require("node-schedule");
const user =require( "../models/userModel")
const scheduled =require( "../models/scheduledModel")

const userId = user._id;

const checkDate = new schedule.checkDate.Date(Date.now() + 5 * 1000);

function update(u) {
  console.log(u);
}

const job1 = schedule.scheduleJob(
  `check_${userId}`,
  checkDate,
  update.bind(null, userId)
);