const cloudinary = require('cloudinary').v2

function extractPublicId(cloudinaryUrl) {
    // Split the URL by "/"
    const parts = cloudinaryUrl.split("/");
  
    // Find the index of "version"
    const uploadIndex = parts.indexOf("upload");
  
    // The public ID is the next segment in the URL after "version"
    if (uploadIndex !== -1) {
      const publicId =  parts[parts.length - 1].split(".")[0];
      return publicId;
    }
    // If "version" is not found or there's no segment after "version", return null
    return null;
  }
exports.deleteFile = async(file, folder) => {
    try{
      let publicId = extractPublicId(file);
      publicId = `${folder}/${publicId}`

       if(publicId){
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
       }
       if (result.result === 'ok') {
        return({ message: 'File deleted successfully' });
      } else {
        return({ message: 'Failed to delete file' });
      }
    }
    catch(err){
        return ({
            success: false,
            message: "Failed to delete media",
            error: err.message
        })
    }
}