const cloudinary = require('cloudinary').v2
exports.imageUploader = async(file, folder, height, quality) => {
    try{
        const options = {folder};
        if(height){
            options.height = height
        }
        if(quality){
            options.quality = quality
        }

        options.resource_type = "auto"
        return await cloudinary.uploader.upload(file.tempFilePath, options)
    }
    catch(err){
        return({
            success: false,
            message: "Failed to upload media",
            error: err.message
        })
    }
}