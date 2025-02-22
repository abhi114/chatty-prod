import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set,get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      //console.log("hite heree" + JSON.stringify(res.data));
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async(messageData)=>{
    const {selectedUser,messages} = get();
    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`,messageData);
      set({messages:[...messages,res.data]})
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  subscribeToMessages: ()=>{
    const {selectedUser} = get();
    if(!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    //optimize this
    socket.on("newMessage",(newMessage)=>{
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id; // if this check is not done then it will populate the message without checking the user id is getting recieved from for eg if the message is send from user 1 but atht that time we had user 2 open then i will populate on the user 2 chat screen
      if(!isMessageSentFromSelectedUser) return;
      set({
        messages:[...get().messages,newMessage]
      })
    })
  },
  unsubscribeFromMessage:()=>{
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
//   optimize this one later
  setSelectedUser: (selectedUser)=>set({selectedUser})
}));