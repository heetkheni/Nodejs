import express from "express";
import path from "path"
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const app = express();
var users = [];

app.set("view engine","ejs")

mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName:"User",
}).then(() => console.log("Database Connectetd")).catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
});

const UserModel = mongoose.model("UserModel",userSchema)
app.use(express.static(path.join(path.resolve(),"public")))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


// Login Route
app.post('/register', async (req,res) => {

    const {name , email , password} = req.body

    let user = await UserModel.findOne({email})

    if(user){
        res.render("login")
    }
    else {


        const hashedPassword =await bcrypt.hash(password,10)
        user =  await UserModel.create({
            name:name,
            email:email,
            password: hashedPassword
        })
    
        const token = jwt.sign({_id:user.id},"secretkey")
    
    
        res.cookie('token',token,{
            httpOnly:true,
            expires:new Date(Date.now() + 60*1000)
        })
    
        res.redirect('/')

    }

    
})


app.post('/login',async (req,res) => {
    
    const { email , password} = req.body;

    let user = await UserModel.findOne({email});

    if(!user){
        res.render('register')
    }
    else {

        const match = await bcrypt.compare(password , user.password);

        if(!match){
            return res.render("login",{  email , message:"Incorrect Password"})
        }
        else{
            const token = jwt.sign({_id:user.id},"secretkey")
    
    
            res.cookie('token',token,{
                httpOnly:true,
                expires:new Date(Date.now() + 60*1000)
            })
        
            res.redirect('/')
        }
    }


})


// Logout Route
app.post('/logout', (req,res) => {
    res.cookie('token','iamin',{
        httpOnly:true,
        expires:new Date(Date.now())
    })
    res.redirect('/')
})

// MiddleWare for autheticating the user
const isAuthenticated = async (req,res,next) => {
    const {token} = req.cookies;
    if(token){

        const decoded = jwt.verify(token , "secretkey");

        console.log(decoded)

        req.user = await UserModel.findById(decoded._id)

        next()
    }
    else{
        res.render("register")
    }
}

// Autheticating and routing as per the user credentials
app.get('/', isAuthenticated, async (req,res) => {

    console.log(req.user);
    res.render("logout",{name:req.user.name})
})

app.listen(1212 , ()=>{
    console.log("server is up at 1212")
})




// const pathLocation = path.resolve();
// console.log(pathLocation)
// res.sendFile(pathLocation/index.html)

// const http = require('http')
// import http from "http"
// import {data , dataTwo} from "./module.js"
// import path from "path"


// console.log(path.dirname("home/index.js"))
// console.log(path.extname("home/index.js"))

// console.log(data())
// console.log(dataTwo(4))

// const server = http.createServer((req,res) => {
//     if(req.url == 'about'){
//         res.end('<h1>About</h1>')
//     }
//     if(req.url == 'contact'){
//         res.end('<h1>Contact</h1>')
//     }
//     if(req.url == '/'){
//         res.end('<h1>home</h1>')
//     }
// })

// server.listen(1212, () => {
//     console.log("server is up at 1212")
// })

// app.get('/users',(req,res) => {
//     res.json(users)
// })

// app.get('/add', async (req,res) =>  {
//     await MessageModel.create({
//         name:"hello2",
//         contact:"world2"
//     })
// })


//app.post('/add', async (req,res) => {
    //     //users.push({name: req.body.name,contact:req.body.contact});
    //     //await MessageModel.create({name:req.body.name , contact:req.body.contact})
    //     const { name , contact} = req.body;
    //     await MessageModel.create({name , contact})
    //     res.redirect("/success")
        
    // })