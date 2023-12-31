import { Request,Response } from "express";
import asyncHandler from 'express-async-handler';
import { AuthServices } from "../../framework/services/authServices";
import { AuthServiceInterface } from "../../application/services/authServiceInterfaces";
import { UserDbInterface } from "../../application/repositories/userDbRepository";
import { userRepositoryMongoDB } from "../../framework/database/mongoDB/repositories/userHelperRepositories";
import { userSignUp,userSignIn,userGoogleSignIn,userGoogleRegistration } from "../../application/useCases/auth/userAuth";

const authControllers = (
    authServiceInterface:AuthServiceInterface,
    authServices:AuthServices,
    userDbInterface:UserDbInterface,
    userDbService:userRepositoryMongoDB
)=>{
    const userDbRepository = userDbInterface(userDbService())
    const authService = authServiceInterface(authServices())
    
    const signUpUser = asyncHandler(async(req:Request,res:Response)=>{
        const {firstName,lastName,userName,email,password,mobile} = req.body
        
        const user = {
            firstName,
            lastName,
            userName,
            email,
            password,
            mobile
        }
        const userData = await userSignUp(user,userDbRepository,authService)
        res.json(userData)
    })

    const signInUser = asyncHandler(async(req:Request,res:Response)=>{
        const {userName,password} : {userName:string,password:string} = req.body
        const userData = await userSignIn(userName,password,userDbRepository,authService)
        // res.setHeader('authorization',userData?.token)
        res.json(userData)
    })

    const googleSignIn = asyncHandler(async(req:Request,res:Response)=>{
        const email = req.params.email
        const userDetails = await userGoogleSignIn(email as string,userDbRepository,authService)
        res.json(userDetails)
    })

    const googleRegister = asyncHandler(async(req:Request,res:Response)=>{
        const {firstName,lastName,userName,email,password,mobile} = req.body
        
        const user = {
            firstName,
            lastName,
            userName,
            email,
            password,
            mobile
        }
        
        const userData = await userGoogleRegistration(user,userDbRepository,authService)
        res.json(userData)
    })

    return {
        signUpUser,
        signInUser,
        googleSignIn,
        googleRegister
    }
}

export default authControllers