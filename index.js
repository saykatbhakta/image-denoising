if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const port = 3000;

const methodOverride=require("method-override");

const homesRouter=require("./routes/home.js")
const userRouter=require("./routes/user.js")

const session=require("express-session");
const MongoStore=require("connect-mongo")
const flash=require("connect-flash");

const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {isLoggedIn}=require("./middleware.js")


//---------------------------------------------------------
const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//---------------------------------------------------------
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//------------------------------------------------------------
const mongoose = require("mongoose");
const {connect}=require("http2");

const dbUrl=process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}
//-------------------------------------------------
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24 * 3600,
});
store.on("error",()=>{
    console.log("Error in Mongo session store",err);
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+ 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httponly:true
    }
};

// app.get("/", (req, res) => {
//     res.send("Hi, I am root!");
// });

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"student",
//     });
//     let registeredUser=await User.register(fakeUser,"student");
//     res.send(registeredUser);
// });

//-------------------------------------------------------------
app.use("/homes",homesRouter);
app.use("/",userRouter);

//-------------------------------------------------------------

app.get("/upload",isLoggedIn, (req, res) => {
    res.render("homes/uploads.ejs");
});
//-------------------------------------------------------------

app.get("/result",isLoggedIn, (req, res) => {
    res.render("homes/result.ejs");
});

//-------------------------------------------------------------

app.get("/contact",isLoggedIn, (req, res) => {
    res.render("homes/contact.ejs");
});

//-------------------------------------------------------------
app.get("/help",isLoggedIn, (req, res) => {
    res.render("homes/help.ejs");
});


//--------------------------------------------------------------


app.all("*",(req,res,next)=>{
next(new ExpressError(404, "Page Not Found!"))
});

app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong!"}=err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});



app.listen(port, () => {
    console.log(`connected to server to port ${port}`);
});