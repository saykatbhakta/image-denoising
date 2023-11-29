const express=require("express");
const router=express.Router();

const wrapAsync=require("../utils/wrapAsync.js")
const ExpressError=require("../utils/ExpressError.js")
const {isLoggedIn}=require("../middleware.js")
//-------------------------------------------------------------

router.get("/",wrapAsync(async(req,res)=>{
    res.render("homes/index.ejs")
}));


//-------------------------------------------------------------
module.exports=router;