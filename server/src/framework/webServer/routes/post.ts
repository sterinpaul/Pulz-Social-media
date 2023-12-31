import express from "express";
import postControllers from "../../../adapters/controllers/postController";
import { postRepositoryMongoDB } from "../../database/mongoDB/repositories/postHelperRepositories";
import { postDbRepository } from "../../../application/repositories/postDbRepository";
import { uploadPostImgVideo } from "../middlewares/cloudinaryConfig";

const postRouter = ()=>{
    const router = express.Router()
    const controllers = postControllers(postDbRepository,postRepositoryMongoDB)
    router.get('/getpost',controllers.getPost)
    router.post('/addpost',uploadPostImgVideo,controllers.addPost)
    router.put('/unlike',controllers.unlikePost)
    router.put('/like',controllers.likePost)
    router.get('/comment/:postId',controllers.getPostComments)
    router.post('/addcomment',controllers.addComment)
    router.put('/comment/likeunlike',controllers.likeUnlike)
    router.put('/reply/likeunlike',controllers.likeUnlike)
    router.patch('/delete/:id',controllers.deletePost)
    router.patch('/comment/delete',controllers.commentDelete)
    router.put('/report',controllers.reportPost)
    router.patch('/editpost',controllers.editThePost)
    
    return router
}

export default postRouter