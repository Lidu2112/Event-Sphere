const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const transporter = require("../config/email");
const { pool, generateId } = require('../config/database');

const router = express.Router();



/*
REGISTER
*/

router.post("/register", async(req,res)=>{


try{

const {
    name,
    email,
    phone,
    password,
    role
} = req.body;



let existingUser = null;

if (email) {
    existingUser = await User.findOne({ email });
}

if (phone) {
    existingUser = await User.findOne({ phone });
}

if (existingUser) {
    return res.status(400).json({
        message: "User already exists"
    });
}



const hashedPassword =
await bcrypt.hash(password,10);



const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    provider: "local",
    role: role || "attendee"
});

// create session token on register
const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
try {
    const sessionRow = { id: generateId(), data: JSON.stringify({ token, userId: user._id, createdAt: new Date() }) };
    await pool.query('INSERT INTO sessions (id, data) VALUES (?, ?)', [sessionRow.id, sessionRow.data]);
} catch (e) { console.error('Session save failed:', e.message); }

res.json({
    message: "User created successfully",
    token,
    user
});



}catch(error){

res.status(500).json({
message:error.message
});

}


});





/*
LOGIN
*/

router.post("/login", async(req,res)=>{


try{


const {
    email,
    phone,
    password
} = req.body;

let user = null;

if (email) {
    user = await User.findOne({ email });
} else if (phone) {
    user = await User.findOne({ phone });
}



if(!user){

return res.status(400).json({
message:"Invalid email or password"
});

}




const match =
await bcrypt.compare(
password,
user.password
);



if(!match){

return res.status(400).json({
message:"Invalid email or password"
});

}



const token =
jwt.sign(

{
id:user._id,
role:user.role
},

process.env.JWT_SECRET,

{
expiresIn:"1d"
}

);



res.json({

message:"Login successful",

token,

user:{
id:user._id,
name:user.name,
email:user.email,
role:user.role
}


});



}catch(error){

res.status(500).json({
message:error.message
});

}


});


// GOOGLE REGISTER / LOGIN

router.post("/google", async (req,res)=>{

    try{

        const {
            name,
            email,
            googleId,
            action
        } = req.body;


        let user = await User.findOne({email});


        // REGISTER WITH GOOGLE
        if(action === "register"){

            if(user){

                return res.status(400).json({
                    message:"Google account already registered. Please login."
                });

            }


            user = await User.create({

                name:name,

                email:email,

                googleId:googleId,

                provider:"google",

                role:"attendee",

                password:"google-user"

            });

            const token = jwt.sign(
                {
                    id:user._id,
                    role:user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn:"1d"
                }
            );

            // store session
            try {
                const sessionRow = { id: generateId(), data: JSON.stringify({ token, userId: user._id, createdAt: new Date() }) };
                await pool.query('INSERT INTO sessions (id, data) VALUES (?, ?)', [sessionRow.id, sessionRow.data]);
            } catch (e) { console.error('Session save failed:', e.message); }

            return res.json({
                message:"Google registration successful",
                token,
                user:{
                    id:user._id,
                    name:user.name,
                    email:user.email,
                    role:user.role
                }
            });


        }



        // LOGIN WITH GOOGLE
        if(action === "login"){


            if(!user){

                return res.status(400).json({

                    message:"Account not found. Please register first."

                });

            }



            const token = jwt.sign(

                {
                    id:user._id,
                    role:user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:"1d"
                }

            );



            return res.json({

                token,

                user:{

                    id:user._id,

                    name:user.name,

                    email:user.email,

                    role:user.role

                }

            });

        }



    }

    catch(error){

        res.status(500).json({
            message:error.message
        });

    }


});
// ===============================
// FORGOT PASSWORD
// ===============================

router.post("/forgot-password", async(req,res)=>{

    console.log("forgot password API called");
    console.log(req.body);


    try{

        const { email } = req.body;


        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                message:"User not found"
            });

        }


        const resetToken =
        Math.floor(100000 + Math.random()*900000).toString();



        user.resetToken = resetToken;


        user.resetTokenExpire =
        Date.now() + 10 * 60 * 1000;
console.log("Generated Code:", resetToken);

        await user.save();
console.log("Saved User:", await User.findOne({ email }));


       await transporter.sendMail({

    from:"EventSphere@gmail.com",

    to:email,

    subject:"EventSphere Password Reset Code",

    text:`Your password reset code is ${resetToken}`

});


res.json({

    message:"Reset code sent to your email"

});


    }
    catch(error){

        console.log(error);

        res.status(500).json({
            message:error.message
        });

    }

});





// ===============================
// RESET PASSWORD
// ===============================
router.post("/reset-password", async (req, res) => {

    try {

        const {
            email,
            code,
            newPassword
        } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check reset code
        if (user.resetToken !== code) {
            return res.status(400).json({
                message: "Invalid reset code"
            });
        }

        // Check expiration
        if (Number(user.resetTokenExpire) < Date.now()) {
            return res.status(400).json({
                message: "Reset code has expired"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpire = null;

        await user.save();

        res.json({
            message: "Password reset successful"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }

});
module.exports = router;