import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs';

cloudinary.config({ 
    cloud_name: 'du8mivok0', 
    api_key: '519784284791842', 
    api_secret: 'jUJDWr77vKN6uTjtdYmWztjo1Lw'
  });

//   cloudinary.uploader
//   .upload("my_image.jpg")
//   .then(result=>console.log(result));


const uploadOnCloudinary = async (filePath) => {
        try {
            if(!filePath)
                return null;
            const response = await cloudinary.uploader.upload(filePath);
            console.log(response.url);
            // fs.unlinkSync(filePath);            
            return response;
        } catch (error) {
            console.log(error);
            // fs.unlinkSync(filePath); 
            return null;
        }
    }
export default uploadOnCloudinary;
