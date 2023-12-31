const mongoose = require('mongoose')

const tagsSchema = new mongoose.Schema({
    title: {
        type:String,
        required: true,
        trim :true,
    },
    course:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    }]
})