
import multer from 'multer';
import {CloudinaryStorage } from 'multer-storage-cloudinary';
import {v2 as cloudinary} from 'cloudinary';
          

const profileOptions = {
    cloudinary:cloudinary,
    params:{
        folder: 'profilePics',
        allowed_formats : ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif', 'jfif', 'webp'],
        // transformation: [{ width: 500, height: 500, crop: 'limit' }] ,
        public_id: (req:any,file:any) => {
            const originalname = file.originalname.split('.')
            return `image-${Date.now()}-${originalname[0]}`
        }
    }
}
const profilePicStorage = new CloudinaryStorage(profileOptions)
export const uploadProfilePic = multer({storage:profilePicStorage }).single('profilePic')


const postImagesAndVideo = {
    cloudinary:cloudinary,
    params:(req:any,file:any)=>{
        return {
            folder: file.mimetype.startsWith('image/') ? 'postImg' : 'postVideo',
            allowed_formats : ['jpg', 'jpeg', 'png', 'svg', 'gif', 'webp','mp4', 'mpeg', 'ogg', 'wmv'],
            resource_type: file.mimetype.startsWith('image/') ? 'image' : 'video',
            public_id: `post-${Date.now()}-${file.originalname.split('.')[0]}`
            // transformation: [{ width: 500, height: 500, crop: 'limit' }] ,
            // public_id: (req:any,file:any) => {
            //     const originalname = file.originalname.split('.')
            //     return `post-${Date.now()}-${originalname[0]}`
            // }
        }
    }
}

const postStorage = new CloudinaryStorage(postImagesAndVideo)
export const uploadPostImgVideo = multer({storage:postStorage }).single('postImgVideo')


const chatImages = {
    cloudinary:cloudinary,
    params:{
        folder: 'chatImg',
        allowed_formats : ['jpg', 'jpeg', 'png', 'webp', 'gif', 'jfif', 'webp','gif'],
        transformation: [{ width: 500, height: 500, crop: 'limit' },{ quality: '60' }],
        public_id: (req:any,file:any) => {
            const originalname = file.originalname.split('.')
            return `chat-${Date.now()}-${originalname[0]}`
        }
    }
}

const chatStorage = new CloudinaryStorage(chatImages)
export const uploadChatImg = multer({storage:chatStorage }).single('imgChat')