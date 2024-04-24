const express = require ("express");
const axios = require('axios');
const {Otp,User} = require("../models/userModel");
require("../config/passport");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const ejs = require('ejs');
const flash = require('connect-flash');

const getRegister = async (req, res) => {
  try {
    res.send('Get Login');
    
    
    } 
    catch (error) {
   
  }};

const getLogin = async (req, res) => {
    try {

      res.render('auth/login');
      
      } 
      catch (error) {
     
    }};



    // const postLogin = async (req, res) => {
    //   try {
    //     console.log('passport is working cool');
    //     const returnTo = req.session.returnTo || '/';
    //     delete req.session.returnTo;
    //     res.redirect(returnTo);
    //     // res.redirect('/success');
    //   } catch (error) {
    //     console.error(error);
    //     res.redirect('/failure');
    //   }
    // };
 
  
    const getSendOtp = async (req, res) => {
      try {
      let phoneNumber = req.query.phone;
      res.render('auth/otp', {phoneNumber})
      } catch (error) {
        console.error(error);
        // Handle other errors here
        return res.status(500).json({ error: "Internal server error" });
      }
    };
    
  
    const postSendOtp = async (req, res) => {
      try {
        let phoneNumber = req.body.phone;
        let name = req.body.name;
        let institution = req.body.institution;
  
        // Remove the prefix '+88' if it exists
        if (phoneNumber.startsWith("+88")) {
            phoneNumber = phoneNumber.slice(3);
        }
        if (phoneNumber.startsWith("88")) {
            phoneNumber = phoneNumber.slice(2);
        }
  
        // Validate the resulting phone number
        if (/^01[0-9]{9}$/.test(phoneNumber)) {
            console.log(`phone number ok: ${phoneNumber}`);
        } else {
            console.log("Invalid phone number");
            return res.json({ message: "invalid" });
        }
  
        const existUser = await User.findOne({ phone: phoneNumber });
  
        if (!existUser && (!name || !institution)) {
            console.log('Please register');
            return res.json({ phoneNumber, message: "register" });
        }


        const sendOtp = async (phoneNumber) => {
          try {
            // OTP GENERATOR
            const otpCode = Math.floor(Math.random() * 9000) + 1000;
            console.log(`Your OTP is: ${otpCode}`);
        
            // Check if the phone number already exists in the Otp collection
            const existingOtp = await Otp.findOne({ phone: phoneNumber });
            if (existingOtp) {
              console.log("Existing OTP found. Deleting...");
              await Otp.deleteOne({ phone: phoneNumber });
            }
        
            const userotp = new Otp({
              phone: phoneNumber,
              otp: otpCode,
            });
        
            // Save OTP to the database
            await userotp.save();
            console.log("OTP saved to database");
        
            // SMS SENDING TO USER
            const api_key = 'MJM96MHLQ4XW9NN'; // Update with your API key
            const senderid = '8809601004771'; // Update with your Sender Id
            const url = 'https://api.mimsms.com/api/SmsSending/SMS';
            const data = {
              "UserName": "jlhs0177@gmail.com", // Update with your username
              "Apikey": api_key,
              "MobileNumber": "88" + phoneNumber, // Corrected format
              "CampaignId": "null",
              "SenderName": senderid,
              "TransactionType": "T",
              "Message": `${otpCode} is your OTP - Mission School`,
            };
            // Send SMS
            const response = await axios.post(url, data, {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            console.log('SMS sent successfully:', response.data);
            return otpCode; // Optionally, you can return the OTP for further use
          } catch (error) {
            console.error('Error sending OTP:', error);
            throw new Error("Failed to send OTP");
          }
        };
        
        if (!existUser && (name || institution)) {
            console.log('Saving Registration Name and Info');
            
            // Create a new user instance
            const newUser = new User({
                name: name,
                institution: institution,
                phone: phoneNumber
            });

            // Save the new user to the database
            await newUser.save();
            const otp = await sendOtp(phoneNumber);
        }

        // Handle the case when the user already exists
        if (existUser) {
            console.log('User exists');
            const otp = await sendOtp(phoneNumber);
        }

      return res.json({ phoneNumber, message: "UserExists" });

      } catch (error) {
        console.error(error);
        // Handle other errors here
        return res.status(500).json({ error: "Internal server error" });
      }
    };
    
  

        const postUpdateProfile = async (req, res) => {
          try {
            const userId = req.user.id;
        console.log(userId)
            // Prepare update object with only the fields that are not empty in the request body
            const updateFields = {};
           updateFields.name = req.body.name;
           updateFields.institution = req.body.institution;
          
           // Add condition to check if email field is not already set in the database
if (req.user.email === undefined || req.user.email === null || req.user.email === "") {
  updateFields.email = req.body.email;
}
// Add condition to check if phone field is not already set in the database
if (req.user.phone === undefined || req.user.phone === null || req.user.phone === "") {
  
  let phoneNumber = req.body.phone;

  if (phoneNumber.startsWith("+88")) {
      phoneNumber = phoneNumber.slice(3);
  } else if (phoneNumber.startsWith("88")) {
      phoneNumber = phoneNumber.slice(2);
  }
  
  updateFields.phone = phoneNumber;
  }

        
            // Find the user object by user ID and update the fields
            const result = await User.findOneAndUpdate(
              { _id: userId },
              { $set: updateFields },
              { new: true }
            );
        
            if (result) {
              console.log('data updated successfully');
              req.flash('success', 'Profile updated successfully!');
              return res.redirect('/dashboard');
            } else {
              return res.status(404).json({ error: 'User not found' });
            }
          } catch (error) {
            return res.status(500).json({ error: error.message });
          }
        };
        






      const postUpdateProfilePic = async (req, res) => {
              try {
                const result = await User.findOneAndUpdate(
                { phone: req.user.phone },
                { $set: { profile_pic: req.file.filename } },
                { new: true }
              );
              res.json({data: req.user.phone});
                
              }
                catch (error) {
               
              }};               
                  
                       

        
    
  
  const logout = async (req, res, next) => {
    try{
      req.logout(function(err) {
        if (err) { return next(err); }
      res.redirect('/auth/login');
      });
    
      }
     catch (error) {
             console.log(error.message)
         }};
          

module.exports = {
  
  getLogin,
  getRegister,
  // postLogin,
  getSendOtp,
  postSendOtp,
  postUpdateProfile,
  postUpdateProfilePic,
  logout,
};




