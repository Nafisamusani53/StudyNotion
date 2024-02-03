const express = require("express")
const app = express()
require('dotenv').config()
const {dbConnect} = require('./config/database')
const {cloudinaryConnect} = require('./config/cloudinay');
const cors = require('cors')
const cookieparser = require('cookie-parser')
const fileUpload = require('express-fileupload')

// imports all the routes here

app.use(express.json());

// connect with databases
dbConnect();

// middlewares
app.use(express.json())
app.use(cookieparser())
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}))
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp'
}))

// connection with cloudinary
cloudinaryConnect();


// mount the routes
app.use('/api/v1/auth', userRoutes);
app.use('api/v1/profile', profileRoutes)
app.use('api/v1/course', courseRoutes)
app.use('api/v1/payment', paymentRoutes)

// default route
app.get('/', (req,res) => {
    res.send("This is Homepage")
})

// start the app
const port = process.env.PORT || 3000
app.listen(port , ()=>{
    console.log("App started")
})

