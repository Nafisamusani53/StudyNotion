const cloudinary = require('cloudinary').v2
require('dotenv').config()

exports.cloudinaryConnect = async() => {
    try{
        cloudinary.config({
            cloud_name : process.env.CLOUD_NAME,
            api_key : process.env.API_KEY,
            api_secret :process.env.API_SECRET 
        })
    }
    catch(err){
        console.log("Issue in connecting cloudinary database")
        console.error(err.message)
    }
}