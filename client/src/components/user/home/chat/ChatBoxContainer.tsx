import { List, Avatar, Dialog, Button } from "@material-tailwind/react"
import SingleChat from "./SingleChat"
import { SetStateAction, useEffect, useRef, useState } from "react"
import { chattedUsers } from "../../../../interfaces/userInterface"
import { CLOUDINARY_CHAT_URL, CLOUDINARY_PROFILE_PHOTO_URL, PROFILE_PHOTO, SOCKET_URL } from "../../../../api/baseURL"
import { getUserbySearch } from "../../../../api/apiConnections/userConnection"
import { createSingleImgMessage, createSingleMessage, getUserMessages } from "../../../../api/apiConnections/messageConnection"
// import { createNewChat } from "../../../../api/apiConnections/chatConnection"
import { messageInterface } from "../../../../interfaces/messageInterface"
import { getAllChats } from "../../../../api/apiConnections/messageConnection"
// import { getAllChats } from "../../../../api/apiConnections/chatConnection"
import { useSelector, useDispatch } from "react-redux";
import { setOnlineUsers, setChatList, setReceivedMessages, setUserChatId } from "../../../../redux/userRedux/chatSlice"
import { io, Socket } from 'socket.io-client'
import InputEmoji from "react-input-emoji"
import moment from 'moment'
import {v4 as uuid} from 'uuid'
import {toast} from 'react-toastify'

// import VideoCall from "./VideoCall"


import {
  VideoCameraIcon,
  // PaperAirplaneIcon,
  EllipsisVerticalIcon,
  PhotoIcon,
  // VideoCameraSlashIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom"



interface chatBoxInterface {
  chatOpen: boolean,
  chatContainerHandler: () => void,
  videoDisplay:boolean,
  setVideoDisplay:(value:boolean)=>void
}

const ChatBoxContainer: React.FC<chatBoxInterface> = ({ chatOpen, chatContainerHandler}) => {

  const { userName,userId, profilePic } = useSelector((store: { user: { userName: string, userId: string, darkMode: boolean, profilePic: string } }) => store.user)
  const { onlineUsers, receivedMessages } = useSelector((store: { chat: { onlineUsers: [], receivedMessages: [] } }) => store.chat)
  const [allChatUsers, setAllChatUsers] = useState<chattedUsers[]>([])
  const [sendMessage, setSendMessage] = useState({})
  const [searchText, setSearchText] = useState('')
  const [chats, setChats] = useState<messageInterface[]>([])

  const [imgChat,setImgChat] = useState<File | null>(null)
  const [imgDialogOpen,setImgDialogOpen] = useState(false)

  const scroll = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const dispatch = useDispatch()
  const [chatUserName, setChatUserName] = useState('')
  const [chatUserId, setChatUserId] = useState('')
  const [chatUserPic, setChatUserPic] = useState('')
  const [commentText, setCommentText] = useState('')
  const socket = useRef<Socket | null>(null)

  const dialogOpen = ()=>{
    if(imgChat)setImgChat(null)
    setImgDialogOpen(!imgDialogOpen)
  }

  const getChatList = async () => {
    try {
      const response = await getAllChats(userId)
      if (response?.status) {
        setAllChatUsers(response.data)
        dispatch(setChatList(response.data))
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getChatList()
  }, [sendMessage, receivedMessages, onlineUsers])

  useEffect(() => {
    socket.current = io(SOCKET_URL, { transports: ['websocket'] })
    if (userId.length) {
      socket.current.emit('add-new-user', userId)
      socket.current.on('get-users', (users) => {
        dispatch(setOnlineUsers(users))
      })
    }

    socket.current.on('connect', () => {
      console.log('Connected to Server')
    })

    // Handling the error
    socket.current.on('connect_error', (error) => {
      console.log('Connection error:', error)
    })

    return () => {
      if (socket?.current) {
        socket.current.disconnect()
      }
    }
  }, [userId])


  useEffect(() => {
    const receiveMessageHandler = (data: any) => {
      if (data && chatUserId === data.senderId) {
        setChats((chat) => [...chat, data])
      }

      let exists = receivedMessages.some((obj: any) => obj.chatId === data.chatId)

      if (!exists) {
        dispatch(setReceivedMessages(data))
      }
      scroll.current?.scrollIntoView({ behavior: 'smooth' })
    }

    socket.current?.on('receive-message', receiveMessageHandler)
    return () => {
      socket.current?.off('receive-message', receiveMessageHandler)
    }
  }, [chatUserId])


  useEffect(() => {
    if (sendMessage !== null) {
      socket.current?.emit('send-message', sendMessage)
      scroll.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [sendMessage])

  const focusMessageInput = async (data: { _id: string, userName: string, profilePic: string, chatId?: string }) => {
    setSearchText('')
    scroll.current?.scrollIntoView({ behavior: 'smooth' })
    if (textAreaRef.current) {
      if (data?.chatId !== undefined) {
        const response = await getUserMessages(data.chatId)
        if (response?.status) {
          setChats(response?.data)
        }
      } else {
        setChats([])
      }

      textAreaRef?.current?.focus()
      setChatUserId(data._id)
      dispatch(setUserChatId(data._id))
      setChatUserName(data.userName)
      setChatUserPic(data.profilePic)
    }
  }

  const sendAMessage = async () => {
    if (commentText.trim().length && chatUserName.length) {

      const response: { status: boolean, data: messageInterface } = await createSingleMessage(chats[0]?.chatId, userId, chatUserId, commentText)
      if (response?.status) {
        setChats([...chats, response?.data])
        setSendMessage({ _id: response.data._id, senderId: userId, chatId: response.data.chatId, message: commentText, receiverId: chatUserId,imgURL:response.data?.imgURL })
      }
      setCommentText('')

      // if (chats?.length) {
        // const response: { status: boolean, data: messageInterface } = await createSingleMessage(chats[0]?.chatId, userId, commentText)
        // if (response?.status) {
        //   setChats([...chats, response?.data])
        //   setSendMessage({ _id: response?.data?._id, senderId: userId, chatId: chats[0]?.chatId, message: commentText, receiverId: chatUserId })
        // }
        
      // } else {
        // const response: { status: boolean, data: { _id: string } } = await createNewChat(userId, chatUserId)
        // if (response?.status) {
        //   const messageResponse: { status: boolean, data: any } = await createSingleMessage(response.data?._id, userId, commentText)
        //   setChats([messageResponse?.data])
        //   setSendMessage({ _id: messageResponse?.data?._id, senderId: userId, chatId: response.data?._id, message: commentText, receiverId: chatUserId })
        // }
      // }
    }else if(imgChat !== null && chatUserName.length){
      setImgDialogOpen(!imgDialogOpen)
      const response: { status: boolean, data: messageInterface } = await createSingleImgMessage(chats[0]?.chatId, userId, chatUserId,imgChat)
      if (response?.status) {
        setChats([...chats, response?.data])
        setSendMessage({ _id: response.data._id, senderId: userId, chatId: response.data.chatId, message: commentText, receiverId: chatUserId,imgURL:response.data?.imgURL })
      }
      setImgChat(null)
    }
    textAreaRef.current?.focus()
  }

  const searchUserForChat = async (event: { target: { value: SetStateAction<string> } }) => {
    setSearchText(event.target.value)
    if (event?.target?.value?.toString().trim().length) {
      const userData = await getUserbySearch(event.target.value as string)
      const previousChatUsers = allChatUsers

      if (userData.length) {
        // Create a Map to store the unique objects by userName
        const uniqueMap = new Map<string, typeof userData[0]>();

        // Add objects from array a to the Map
        userData.forEach((item: { userName: string }) => {
          uniqueMap.set(item.userName, item)
        })

        // Add objects from array b to the Map (overwrite duplicates based on userName)
        allChatUsers.forEach((item: { userName: string }) => {
          uniqueMap.set(item.userName, item)
        })

        // const uniqueObjects = Array.from(uniqueMap.values())

        // setSearchedUser(Array.from(uniqueMap.values()))
        setAllChatUsers(Array.from(uniqueMap.values()))
      } else {
        setAllChatUsers(previousChatUsers)
        setAllChatUsers([])
      }
    }
  }

  const chooseChatImg = ()=>{
    if(chatUserName.length){
      setImgDialogOpen(true)
    }
  }

  // Video chat
  const navigate = useNavigate()
  const openVideoChat = () => {
    const roomId = uuid()
    socket.current?.emit('call-started', {roomId,userName,chatUserId})
    navigate(`/chat/${roomId}`)
  }

  

  useEffect(()=>{
    const videoCallReceiveHandle = (data:{userName:string,roomId:string})=>{

      toast.success(`${data.userName} is calling...`, {
        autoClose:10000,
        onClick:()=>navigate(`/chat/${data.roomId}`)
      })
    }
    socket.current?.on('call-received',videoCallReceiveHandle)
    return ()=>{
      socket.current?.off('call-received',videoCallReceiveHandle)
    }
  },[])


  //   const endCall = ()=>{
  //     setCallEnded(true)
  //     setStartVideoCall(false)
  //     setCallAccepted(false)
  //     setReceivingCall(false)
  //     setStream(undefined)
  //     setCaller('')
  //     setName('')
  //     setCallerSignal(null)
  //     connectionRef.current?.destroy()
  //     if(stream){
  //       const tracks = stream.getTracks()
  //       tracks.forEach((track:any) => {
  //         track.stop();
  //       })
  //     }
  //   }


  return (
    <Dialog open={chatOpen} handler={chatContainerHandler} size='lg' className='overflow-hidden h-[96vh] flex'>
      {/* {videoDisplay ? (
        <>
          <VideoCall chatUserName={chatUserName} chatUserId={chatUserId} setVideoDisplay={setVideoDisplay} socket={socket} />
        </>
      ) : ( */}
        <>
          <div className='w3/5'>
              <div className='p-1 flex gap-1 items-center justify-evenly h-16 bg-gray-500'>
                <div className='w-12 h-12 rounded-full'>
                  <img className='object-cover w-full h-full rounded-full' src={profilePic ? (CLOUDINARY_PROFILE_PHOTO_URL+profilePic) : PROFILE_PHOTO}/>
                </div>
                <div>
                  <input className='bg-gray-100 focus:outline-none p-1 px-4 w-100 rounded text-black' onChange={searchUserForChat} value={searchText} type="text" maxLength={20} placeholder='Search' />
                </div>
              </div>
              
              <List className='p-0 overflow-y-scroll'>
                  {allChatUsers.length ? allChatUsers.map((user:chattedUsers)=>{
                    return (
                      <SingleChat key={user._id} user={user} focusMessageInput={focusMessageInput} onlineUsers={onlineUsers} />
                      )
                    })
                   : <></>}
              </List>
          </div>
      
      <div className='w-full bg-blue-gray-100 h-[96vh] flex flex-col justify-between'>
        <div className="h-full flex flex-col overflow-y-scroll">
          {chatUserName.length ? <div className='pl-4 bg-blue-gray-200 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-2'>
                <Avatar variant="circular" alt="Profile Pic" src={chatUserPic?.length ? CLOUDINARY_PROFILE_PHOTO_URL+chatUserPic : PROFILE_PHOTO} />
              </div>
              <h1 className='text-black capitalize'>{chatUserName}</h1>
            </div>

            <div>
              <button onClick={openVideoChat} className='m-2'><VideoCameraIcon className='w-7 h-7 text-black mr-2'/></button>  
              <button><EllipsisVerticalIcon className='w-7 h-7 text-black mr-2'/></button>
            </div>

          </div> : null}
          <div className='overflow-y-scroll flex flex-col'>
            {chats.length ? chats.map((data:{_id:string,senderId:string,message?:string,imgURL?:string,createdAt:string},index)=>{
              if(data.senderId===userId){
                return (
                  <div key={data._id} ref={index===chats.length-1 ? scroll : null} className='rounded bg-light-blue-100 m-2 w-52 p-1 self-end'>
                    {data.message ? <p className='text-black'>{data.message}</p> : <img src={CLOUDINARY_CHAT_URL+data.imgURL} />}
                    <p className='text-xs text-right'>{moment(data.createdAt).calendar()}</p>
                  </div>
                  )
                }else{
                  return (
                    <div key={data._id} ref={index===chats.length-1 ? scroll : null} className='rounded bg-yellow-100 m-2 w-52 p-1 self-start'>
                      {data.message ? <p className='text-black'>{data.message}</p> : <img src={CLOUDINARY_CHAT_URL+data.imgURL} />}
                      <p className='text-xs text-right'>{moment(data.createdAt).calendar()}</p>
                    </div>
                  )
                }
              }
            )
            : null}
          </div>
        </div>
          <div className='flex justify-around items-center p-2 bg-blue-gray-200'>
            <div className="w-16 h-12">
              <Avatar variant="circular" alt="Profile Pic" src={profilePic ? CLOUDINARY_PROFILE_PHOTO_URL+profilePic : PROFILE_PHOTO} />
            </div>
            <InputEmoji ref={textAreaRef} onChange={setCommentText} value={commentText} cleanOnEnter onEnter={sendAMessage} placeholder="Type something" />
            <button onClick={chooseChatImg} className="mr-2"><PhotoIcon className="w-6 h-6" /></button>
            
            
            <Dialog open={imgDialogOpen} handler={dialogOpen} size="xs" className="outline-none" >
              <div className="m-2 flex flex-col justify-center items-center">
                <form onSubmit={(e)=>{
                  e.preventDefault()
                  sendAMessage()
                  }} encType="multipart/form-data">
                  <div className="flex flex-col justify-center items-center">
                      <label className="w-20 bg-blue-500 hover:bg-blue-600 text-white text-center py-1 rounded-lg cursor-pointer">Choose
                          <input className="hidden" onChange={(e:any)=>setImgChat(e.target?.files?.[0])} name='profilePic' type="file" accept=".jpg,.jpeg,.png" />
                      </label>
                      <p className="file-label">Allowed formats: JPG, JPEG, PNG</p>
                      <img className="max-h-96" src={imgChat ? URL.createObjectURL(imgChat) : ""} />
                      <Button type="submit" size="sm" className=" m-2 capitalize" disabled={imgChat ? false : true}>Send</Button>
                  </div>
                </form>
              </div>
            </Dialog>
          </div>
      </div>
      </>
      {/* )} */}

    </Dialog>
  )
}

export default ChatBoxContainer