import { userRepositoryMongoDB } from "../../framework/database/mongoDB/repositories/userHelperRepositories";

export const userDbRepository = (repository:ReturnType<userRepositoryMongoDB>)=>{
    const addUser = async(user:{
        firstName:string,
        lastName:string,
        userName:string,
        email:string,
        password:string,
        mobile:string
    })=>{
        const addedUser = await repository.addUser(user)
        addedUser.password = ""
        return addedUser
    }

    const getUserByEmail = async(email:string)=>{
        return await repository.getUserByEmail(email)
    }

    const getUserByUsername = async(userName:string)=>{
        return await repository.getUserByUserName(userName)
    }

    const getUserByMobile = async(mobile:string)=>{
        return await repository.getUserByMobile(mobile)
    }

    const getUser = async(userData:string)=>{
        return await repository.getUserByNameMailMobile(userData)
    }

    const getUserNotifications = async(userData:string)=>{
        return await repository.getNotifications(userData)
    }

    const getAllPost = async(userName:string,skip:number)=>{
        return await repository.getPost(userName,skip)
    }

    const postProfilePicture = async(userName:string,profilePic:string)=>{
        return await repository.postProfilePicture(userName,profilePic)
    }

    const followUnfollowHandler = async(userName:string,followUser:string)=>{
        return await repository.followHandler(userName,followUser)
    }

    const saveThePost = async(userName:string,postId:string)=>{
        return await repository.postSave(userName,postId)
    }

    const getSavedPosts = async(userName:string)=>{
        return await repository.userSavedPosts(userName)
    }

    const getUserBySearch = async(searchText:string)=>{
        return await repository.userSearch(searchText)
    }

    const updateUserName = async(userName:string,newUserName:string)=>{
        return await repository.userNameUpdate(userName,newUserName)
    }

    const updateUserProfile = async(
        userName:string,
        firstName:string,
        lastName:string,
        gender:string,
        city:string,
        bio:string
    )=>{
        return repository.userProfileUpdate(userName,firstName,lastName,gender,city,bio)
    }

    const removeNotification = async(
        userName:string,
        id:string
    )=>{
        return repository.removeUserNotification(userName,id)
    }

    return {
        addUser,
        getUser,
        getUserByEmail,
        getUserByUsername,
        getUserByMobile,
        getUserNotifications,
        getAllPost,
        postProfilePicture,
        followUnfollowHandler,
        saveThePost,
        getSavedPosts,
        getUserBySearch,
        updateUserName,
        updateUserProfile,
        removeNotification
    }
}
export type UserDbInterface = typeof userDbRepository