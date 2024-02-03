const bcrypt = require('bcrypt')
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const otp = require('../models/OTP');
const OTP = require('../models/OTP');
import { generateKey, hotp } from "otp-io";
import { hmac, randomBytes } from "otp-io/crypto";
require('dotenv').config();

// send OTP
// need to check this controller
let otpCounter = 0;
exports.sendOTP = async(req, res) => {
    try{
        const email = req.body.email;

        if(!email){
            return res.status(401).json({
                success: false,
                message : "Email not found"
            })
        }

         //check if user already exists
        const existUser = await User.findOne({email});

        //if user already exists, then return a response
        if(existUser){
             //Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success : false,
                message: "User already existed"
            })
        }

        // const key = generateKey(randomBytes, /* bytes: */ 20); // Generate a key for HOTP
        // const code = hotp(hmac, { secret: key, counter: otpCounter, digits: 6 });
        // otpCounter++;

        // const OTP = otp.create({
        //     email : email,
        //     otp: code,
        // })

         //generate OTP -> not practical code for industry -> always use a lib. to generate a guranteed unique otp
         var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        //check unique otp or not
        const result = await OTP.findOne({otp: otp});
        console.log('OTP Generated : ', otp);
        console.log('Result : ', result);
        //if not unique
        while(result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlpahbets: false,
            });
        }

        const otpPayload = {email, otp};
        //create an entry for OTP 
        const otpBody  = await OTP.create(otpPayload);
        console.log('OTP Body', otpBody);

        //return response successfully
        res.status(200).json({
            success: true,
            message: `OTP Sent Successfully`,
            otp,
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// signup
exports.signUp = async(req, res) => {
    try{
        const {
            firstName,
            lastName,
            email,
            contactNo,
            password, 
            confirmPassword,
            otp,
            role
        } = req.body

        if(
            !firstName || 
            !lastName ||
            !email ||
            !password ||
            !confirmPassword||
            !otp) {

            return res.status(404).json({
                success : false,
                message: "Fill the detail properly"
            })
        }

         //check if Password and confirm password matches or not?
        if(password !== confirmPassword){
            return res.status(401).json({
                success: false,
                message: "Password and ConfirmPassword dose not match"
            })
        }

        //check if user already exist or not 
        const existingUser = await User.findOne({email:  email});
        if(existingUser){
            return res.status(401).json({
                success: false,
                message: "User already exists,Please sign in to continue"
            })
        }

        //find most recent OTP for the email
        const checkOTP = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);

        console.log('Response: ', response);
        //validate OTP
        if(checkOTP.length === 0){
            //OTP not found
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            })
        }
        else if(otp !== checkOTP){  // checkOTP[0].otp
            //Invalid OTP
            return res.status(401).json({
                success: false,
                message: "OTP does not match"
            })
        }

        //Hash Password
        const hashPassword = await bcrypt.hash(password ,10)

        //Create the user
        let approved = '';
        approved === 'Instructor' ? (approved = false)  : (approved = true);

        //create the additional profile for user
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNo: contactNo
        })

        let user = await User.create({
            firstName,
            lastName,
            email,
            password: hashPassword, 
            role,
            approved,
            profile: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        user.password = undefined

        res.status(200).json({
            success: true,
            data : user,
            message : "Account created successfully"
        })
    }
    
    catch(err){
        res.status(500).json({
            success: false,
            message: "Failed to create Account",
            error: err.message
        })
    }
}

// login
exports.logIn = async(req,res) => {
    try{
        const {email, pass} = req.body;

        // email or password not entered
        if(!email || !pass){
            //Return 400 Bad Request status code with error message
            return res.status(400).json({
                success : false,
                message: "Email or Password missing, fill the detail properly"
            })
        }

        // check if the email exist or not
        const user = await User.findOne({email});
        if(!user){
            //Return 401 unauthorized status code with error message
            return res.status(401).json({
                success: false,
                message: "User does not exist"
            })
        }

        // Now match the password
        if(await bcrypt.compare(pass, user.password)){
            //Generate JWT
            const payload = {
                email: user.email,
                role: user.role,
                id : user._id
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '2h'
            })

            //save token to user document in database
            user = user.toObject()
            user.token = token
            user.password = undefined

            const options = {
                expires : Date.now() + 3*24*60*60*1000,
                httpOnly: true,
            }
            res.cookies("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "LoggedIn successfully,"
            })
        }
        else{
            return res.status(401).josn({
                success: false,
                message: "Incorrect password or email"
            })
        }

    }
    catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

exports.changePassword = async(req, res) => {
    try{
        //Get user data from req.user
        const id = req.user.id;

        // fetch data from request
        const {oldpassword, password, confirmPassword} = req.body;
        
        // validate data
        if(!oldpassword || !password || !confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Please fill the details properly"
            })
        }

        // check if pass and confirmpass matches or not
        if(password !== confirmPassword){
            // didn't matched
            return res.status(401).json({
                success: false,
                message: "Password and ConfirmPassword dose not match"
            })
        }

        // find user
        const user = await User.findById(id);
        
        // compare old and new password
        if(await bcrypt.compare(oldpassword, user.password)){
            // password matched

            // hash the new password
            const hashPassword = await bcrypt.hash(password ,10)

            // update the password with new one
            const updatedUser = await  User.findByIdAndUpdate(id, {
                password : hashPassword
            },{new: true})
            
            // send email
            try {
                const emailResponse = await mailSender(
                    updatedUser.email,
                    `Password Updated Successfully for ${updatedUser.firstName} ${updatedUser.lastName}`,
                    passwordUpdated(
                        updatedUser.email,
                        updatedUser.firstName,
                    )
                )
                console.log('Email sent successfully................', emailResponse);
            }
            catch (error) {
                //if there's an error sending the email, log the error and return a 500 (Internal Server Error) error
                console.log('Error Occurred While Sending Email: ', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error Occurred While Sending Email',
                    error: error.message,
                });
            }
            return res.status(200).json({
                success:true,
                message : "Password Updated"
            })
            
        }
        //old password does not match, return a 401 (unauthorized) error
        return res.status(401).json({
            success: false,
            message: "Invalid Password"
        })
        
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}