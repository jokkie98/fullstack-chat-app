import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ?
 'http://localhost:5001': "/";

export const useAuthStore = create((set, get)=>({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async()=>{
    try{
      const res = await axiosInstance.get('/auth/check', { withCredentials: true });

      set({ authUser: res.data.data });
      get().connectSocket();

    } catch(error){
      console.log('Error im checkAuth', error);
      set({ authUser: null });
    } finally{
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data)=>{
    set({isSigningUp: true})
    try{
      const res = await axiosInstance.post('/auth/signup', data, { withCredentials: true });
      set({ authUser: res.data.data });
      toast.success('Account created successfully');
      get().connectSocket();

    } catch(error){
      toast.error(error.response.data.message);
    } finally{
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', data, { withCredentials: true });
      set({ authUser: res.data.data });
      toast.success('Logged in successfully');

      get().connectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "An unexpected error occurred");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () =>{
    try{
      const res = await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success('Logged out successfully');
      get().disconnectSocket();
    } catch(error){
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async(data) => {
  set({ isUpdatingProfile: true });
  try {
    const res = await axiosInstance.put('/auth/update-profile', data);
    set({ authUser: res.data.data });
    toast.success('Profile updated successfully');
  } catch (error) {
    console.log('error in update profile', error);
    toast.error(
      error?.response?.data?.message || "Something went wrong while updating your profile."
    );
  } finally {
    set({ isUpdatingProfile: false });
  }
},

deleteAccount: async () => {
  try {
    const res = await axiosInstance.delete('/auth/delete');

    set({ authUser: null });

    // Redirect to login page
    navigate('/login');
  } catch (error) {
    console.error('Delete Account Error:', error.response?.data?.message || error.message);
  }
},


  connectSocket: () => {
    const {authUser} = get();

    if(!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if(get().socket?.connected) get().socket.disconnect();
  },

}));
