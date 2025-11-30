import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import workspaceRouter from './routes/workspaceRoutes.js';
import { protect } from './middlewares/authMiddleware.js';


const app = express();
 
app.use(express.json());
app.use(cors());
//adding clerk integration in the backend
app.use(clerkMiddleware());

app.get('/',(req,res)=>res.send('Server is live!'));

app.use("/api/inngest", serve({ client: inngest, functions }));

//Routes
//First the protect(middleware) will run which has  implementation that is which checks if user is there if user is there then only workspace controller function will run
app.use('/api/workspaces',protect ,workspaceRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>console.log(`Server running on port ${PORT}`))