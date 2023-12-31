import { Request,Response } from "express";
import asyncHandler from 'express-async-handler';
import { messageDbInterface } from "../../application/repositories/messageDbRepository";
import { messageRepositoryMongoDB } from "../../framework/database/mongoDB/repositories/messageHelperRepositories";
import { createMessage,getMessages,getAllChats } from "../../application/useCases/message";


const messageControllers = (
    messageDbInterface:messageDbInterface,
    messageDbService:messageRepositoryMongoDB
)=>{
    const messageDbRepository = messageDbInterface(messageDbService())
    const createSingleMessage = asyncHandler(async(req:Request,res:Response)=>{
        const {chatId,senderId,receiverId,message,imgURL} = req.body    
        const response = await createMessage(chatId,senderId,receiverId,message,imgURL,messageDbRepository)
        if(response){
            const chatMessageData = {
                status:true,
                data:response
            }
            res.json(chatMessageData)
        }
    })

    const createSingleImgMessage = asyncHandler(async(req:Request,res:Response)=>{
        const {chatId,senderId,receiverId,message} = req.body
        const imgURL = req.file?.path?.split("/chat-")[1] as string
        const response = await createMessage(chatId,senderId,receiverId,message,imgURL,messageDbRepository)
        if(response){
            const chatMessageData = {
                status:true,
                data:response
            }
            res.json(chatMessageData)
        }
    })

    const getChats = asyncHandler(async(req:Request,res:Response)=>{
        const userId = req.params.userId
        const response = await getAllChats(userId,messageDbRepository)
        if(response){
            const chatMessageData = {
                status:true,
                data:response
            }
            res.json(chatMessageData)
        }
    })

    const getUserMessages = asyncHandler(async(req:Request,res:Response)=>{
        const chatId = req.params.chatId
        const response = await getMessages(chatId,messageDbRepository)
        
        if(response){
            const chatMessageData = {
                status:true,
                data:response
            }
            res.json(chatMessageData)
        }
    })

    return {
        createSingleMessage,
        createSingleImgMessage,
        getChats,
        getUserMessages
    }
}

export default messageControllers