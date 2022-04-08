import express, { Router,Response } from "express";
import { authenticatetoken } from "../middleware/authenticate";
import { Req } from "../middleware/authenticate";
const router:Router=express.Router()

//check if request user is authenticated
router.get("/auth", authenticatetoken, (req:Req, res:Response) => {
    res.status(200).json({
      userData: {
        username: req.user?.accountAddr,
        email: req.user?.email,
        date_created:req.user?.date_created.toDateString()
      },
    });
  });
