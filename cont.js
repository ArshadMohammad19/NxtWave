if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const bodyParser = require('body-parser');
const mongoose=require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const session = require('express-session')
const User=require(__dirname+'/model/schema/userSchema.js')
const bcrypt=require('bcrypt');
const port = 3000;
const dbName = 'uplabs';
const url="mongodb+srv://jithendrakrishna:5FDG1l0jCO3LFC2Q@cluster0.a2obq1l.mongodb.net/?retryWrites=true&w=majority";
const client=new MongoClient(url);
const jwt=require('jsonwebtoken');
const cookie=require('cookie');
const cookieparser=require('cookie-parser');
// const JWT_SECRET=process.env.JWT_SECRET;
const app =  express();
const authenticateToken = require(__dirname+'/partials/tokenverify.js');
const otpGenerator = require('otp-generator');
const UserOTP=require(__dirname+'/model/schema/users.js')
const cors = require('cors');
const multer = require('multer');
var nodemailer = require('nodemailer');
var send = require('gmail-send');
app.set('view-engine', 'ejs') 
app.use(express.static(__dirname + '/public/CSS'));
app.use(express.static(__dirname + '/public/java_script'));
app.use(express.static(__dirname + '/public/images'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieparser())
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    if (req.path === '/login') {
      console.log("func wrkng")
      return res.redirect('/');
    }
  }
  else{
    next(); 
  }
};

function notauthenticated(req, res, next) {
  if (!req.cookies || !req.cookies.token) {
    return res.redirect('/login');
  }
  else{ next();}
}
app.get('/login',verifyToken, (req, res) => {
  res.render('login2.ejs');
});
app.post('/login', async (req, res) => {
  const dbe = client.db(dbName).collection('user_data');
  const otpdb = client.db(dbName).collection('user_otp');
  const usermail = req.body.email;
  const userpass = req.body.password;

  try {
    const user = await dbe.findOne({ email: usermail });
    if (user) {
      const hashedPass = user.password;
      const isPasswordMatch = await bcrypt.compare(userpass, hashedPass);
      if (isPasswordMatch) {
        const username = user.name;
        const userid=user._id
        console.log(userid)
        const token = jwt.sign({ id: user._id, username }, 'mysecretkey');
        res.cookie('token', token, { expires: new Date(Date.now() + 86400000), httpOnly: true });
        //enmter the function to generate otp in db 
        const otp =Math.floor(100000 + Math.random() * 900000).toString();;
        const otpCreatedTime = new Date();
        const newUserOTP = new UserOTP({
          email: usermail,
          userId: new mongoose.Types.ObjectId(userid),
          OTP: otp,
          OTPCreatedTime: otpCreatedTime,
          OTPAttempts: 0
        });
        console.log("New User OTP Object:", newUserOTP);
        otpdb.insertOne(newUserOTP).then(isit => {
          var mailserverifo = nodemailer.createTransport({
          service: 'gmail',
          host : "smtp.gmail.com",
          port : "465",
          ssl : true,
          auth: {
          user: 'jdscharan@gmail.com',
          pass: 'wups jfxh buoc cdil'
          }
          });
           var Mailinfo = {
           from: 'noreply-verify@gmail.com',
           to: usermail,
           subject: 'Please enter this OTP to verify your account',
           text: otp
          };
          
          mailserverifo.sendMail(Mailinfo, function(error, info){
          if (error) {
          console.log(error);
          } else {
          console.log('Email Send Success: ' + info.response);
          }
          });
          res.redirect(`/generate-otp?email=${encodeURIComponent(usermail)}&userid=${encodeURIComponent(userid)}`)
        })
        //res.redirect(`/otp-generation?email=${encodeURIComponent(usermail)}&username=${encodeURIComponent(username)}`);
      } else {
        res.render('login2.ejs', { errorMessagess: 'Invalid Username/Password' });
      }
    } else {
      res.render('login2.ejs', { errorMessagess: 'No user Found. Please Register!' });
    }
  } catch (e) {
    console.error('Error:', e);
    res.redirect('/login');
  }
});
app.get('/generate-otp', async (req, res) => {
  const usermail = req.query.email;
  const userid = req.query.userid;
  if (!usermail || !userid) {
    console.log("wtfff?")
    return res.status(400).send("Invalid request. Missing user details.");
  }
  res.render('otp.ejs', { email: usermail, userid: userid });
});

app.post('/verify-otp', async (req, res) => {
  const otpdb = client.db(dbName).collection('user_otp');
  const { digit1, digit2, digit3, digit4, digit5, digit6, userid,email } = req.body;
  const enteredOTP = `${digit1}${digit2}${digit3}${digit4}${digit5}${digit6}`; 
  console.log(enteredOTP)
  try {
    const userotp = await otpdb.findOne({userId: new mongoose.Types.ObjectId(userid) });
    if (!userotp) {
      console.log("npouser")
      res.render('login2.ejs', {errorMessagess: 'Error in Otp validation, please try again' });
    }
    const currentTime = new Date();
    const otpExpiryTime = new Date(userotp.OTPCreatedTime);
    otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 10);

    if (currentTime > otpExpiryTime) {
      return res.status(400).send('OTP expired. Please request a new one.');
    }
    if (enteredOTP === userotp.OTP) {
      await otpdb.deleteOne({ userId: new mongoose.Types.ObjectId(userid) }); // Remove OTP after successful login
      res.redirect('/dashboard'); 
    } else {
      // Increment OTP attempts
      await otpdb.updateOne(
        { userId: new mongoose.Types.ObjectId(userid) },
        { $inc: { OTPAttempts: 1 } }
      );

      return res.status(400).send('Invalid OTP. Please try again.');
    }
  } catch (e) {
    console.error('Error verifying OTP:', e);
    res.status(500).send('Server error');
  }
});
app.get('/dashboard',notauthenticated,(req,res)=>{
  const token=req.cookies.token;
  if(token){
    const secret= 'mysecretkey';
    jwt.verify(token,secret, (err, decodedToken) => {
      if (err) {
        console.error(err);
        res.render('/login',{errorMessagess:"please login to access!"})
      } else {
        const { username } = decodedToken;
        res.render('userpage.ejs', { user: username });
      }
    });
  }
  else{ 
  res.redirect("/login")
  }
})
app.get('/',(req,res) => {
  const token = req.cookies.token;
  if(token){
  const secret= 'mysecretkey';
  jwt.verify(token,secret, (err, decodedToken) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Token verification failed' });
    } else {
      const { username } = decodedToken;
      res.render('login2.ejs', { user: username });
    }
  });
}
else{
  res.render('login2.ejs',)  
}
})

app.get('/tokensplace',(req,res)=>{
  const token = req.cookies.token;
  if(token){
  if(jwt.verify(token,'mysecretkey')){
    const decodedToken = jwt.decode(token);
    if (decodedToken.exp < Date.now() / 1000) {
      res.json("expired");
    } else {
      const data={"token":"Valid","_id":decodedToken.id};
      // console.log(data);
      res.json(data);
    }
  }
}
else{
  res.json("notValid")
}
})

app.get('/register', (req, res) => {
    res.render('register.ejs')
  })

  app.post('/register', async (req, res) => {
    const db = client.db(dbName).collection('user_data');
    if(db){
      console.log("in db");
    }
    const { name, email, password, age, dob, companyName } = req.body;
  
    // Validate required fields
    if (name?.trim() && email?.trim() && password.length >= 6 && age && dob && companyName?.trim()) {
      const userExist = await db.findOne({email:email});
      if (userExist) {
        let errorMessagess = "MAIL IS ALREADY REGISTERED!!";
        res.render("Login2.ejs", { errorMessagess });
        return;
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        name,
        email,
        password: hashedPassword,
        age: parseInt(age),
        dateOfBirth: new Date(dob),
        companyName
      };
      
      try {
        await db.insertOne(newUser);
        console.log("in inserting level ")
        res.redirect('/login');
      } catch (err) {
        console.error('Error Registering User:', err);
        res.status(500).send("Error registering user");
      }
    } else {
      let errorMessagess = "Please fill all required fields correctly!";
      res.render("register.ejs", { errorMessagess });
    }
  });
  

app.get('/getdata', async(req, res) => {
  const db = client.db(dbName);
  try {
    const result = await db.collection('user_requests').find({}).toArray();
    res.json(result);
  } catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).json({ error: 'An error occurred while retrieving data' });
  }
});
app.get('/dashboard',notauthenticated,(req,res)=>{
  const token=req.cookies.token;
  if(token){
    const secret= 'mysecretkey';
    jwt.verify(token,secret, (err, decodedToken) => {
      if (err) {
        console.error(err);
        res.render('/login',{errorMessagess:"please login to access!"})
      } else {
        const { username } = decodedToken;
        res.render('userpage.ejs', { user: username });
      }
    });
  }
  else{ 
  res.redirect("/login")
  }
})
app.get("/logout",(req,res)=>{
  res.clearCookie('token');
  res.redirect('/login');
  // res.render("login2.ejs")
})

  
app.listen(port)