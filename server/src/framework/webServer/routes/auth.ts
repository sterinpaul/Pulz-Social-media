import express from "express";
import authControllers from "../../../adapters/controllers/userAuthController";
import {authServices} from "../../services/authServices";
import { authServiceInterface } from "../../../application/services/authServiceInterfaces";
import { userRepositoryMongoDB } from "../../database/mongoDB/repositories/userHelperRepositories";
import { userDbRepository } from "../../../application/repositories/userDbRepository";

const authRouter = ()=>{
    const router = express.Router()
    const controllers = authControllers(
        authServiceInterface,
        authServices,
        userDbRepository,
        userRepositoryMongoDB
        )
        router.post('/signup',controllers.signUpUser)
        router.post('/signin',controllers.signInUser)
        router.get('/googlesignin/:email',controllers.googleSignIn)
        router.post('/googlereg',controllers.googleRegister)

    return router
}

export default authRouter