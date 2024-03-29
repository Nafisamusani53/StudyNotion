const mongoose = require("mongoose")

const courseProgressSchema = new mongoose.Schema({
    courseId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"Course"
    },
    completedVideos:[{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "SubSection"
    }]
})

module.exports = mongoose.model("CourseProgress", courseProgressSchema)