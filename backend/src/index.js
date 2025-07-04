import express from "express";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import path from 'path';

import { connectDB } from './lib/db.js';

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const _dirname = path.resolve();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true
}));

//ROUTE
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(_dirname, "../frontend/dist")));
  
  app.get("*", (req, res)=>{
    res.sendFile(path.join(_dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, ()=>{
  console.log(`listening at http://localhost:${PORT}`);
  connectDB();
});