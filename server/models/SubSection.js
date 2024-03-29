const mongoose = require('mongoose')

const subSectionSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true,
        trim: true,
    },
    duration: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    videoUrl:{
        type: String,
        required: true,
    }
})

module.exports = mongoose.model("SubSection", subSectionSchema)