const { default: mongoose } = require('mongoose')
const {instance} = require('../config/razorpay')
const Course = require('../models/Course')
const User = require('../models/User')
const {mailSender} = require('../utils/mailSender')


exports.capturePayment = async(req, res) => {
    // fetch courseId and UserId
    const {courseId} = req.body;
    const userId = req.user.id;

    // validate
    if(!courseId || !userId){
        res.status(401).json({
            success: true,
            message: "Missing property"
        })
    }

    // validate CourseDetail
    let course;
    try{
        course = await Course.findById(courseId);
        if(!course){
            res.status(401).json({
                success: true,
                message: "Course not found"
            })
        }

        // check if user already enrolled in the course
        const id = new mongoose.Types.ObjectId(userId)
        if(course.studentsEnrolled.includes(id)){
            return res.status(200).json({
                success: false,
                message : "Already enrolled in the course",
            })
        }


    }
    catch(err){
        console.error(err.message);
        res.status(500).json({
            success: false,
            error: err.message
        }) 
    }
    
    // create order

    const amount = course.price;
    const currency = "INR";

    const options = {
        amount : amount*100,
        currency : currency,
        receipt : Math.random(Date.now()).toString(),
        notes: {
            courseId,
            userId,
        }
    }

    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse)

        // return response
        return res.status(200).json({
            success: true,
            courseName: course.coureseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        })

    }
    catch(err){
        console.error(err.message);
        res.status(500).json({
            success: false,
            message: "Order not created",
            error: err.message
        }) 
    }
    
}

exports.verifySignature = async(req, res) => {
    const webhookSecret = '12345678';

    const signature = req.headers['x-razorpay-signature']

    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest){
        console.log("Payment is authorized")

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
            // find the course and enroll the students in it
            const courseUpdate = await Course.findByIdAndUpdate(courseId, {
                $push : {
                    studentsEnrolled: userId
                }
            },{new: true})

            if(!courseUpdate){
                return res.status(500).json({
                    success: true,
                    message: "Course Not Found"
                })
            }

            console.log(courseUpdate)

            // update the student details
            const updateStudents = await User.findByIdAndUpdate(userId, {
                $push: {
                    courses: courseUpdate._id
                }
            },{new : true});
            
            const mailResponse = await mailSender(updateStudents.email, "SuccessFully enrolled", 
            "Congratulations you have successfully enrolled in the course")
            
            console.log(mailResponse)
    
            return res.status(200).json({
                success: true,
                message : "Signature Verified and Course Added"
            })
        }
        catch(err){
            res.status(500).json({
                success: false,
                error: err.message
            }) 
        }
    }
    // signature not verified
    return res.status(400).json({
        success: false,
        message: "Invalid request"
    }) 
}