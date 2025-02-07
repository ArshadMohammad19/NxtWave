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
  app.post('/login',async(req,res)=>{
    const dbe = client.db(dbName).collection('user_data');
      const usermail=req.body.email;
      const userpass=req.body.password;
      try{
       const isit=await dbe.findOne({email:usermail})
       if (isit) {
        const hashedpass=isit.password;
        await bcrypt.compare(userpass,hashedpass).then((result2)=>{
          if(!result2){
            res.render("login2.ejs",{errorMessagess:"Invalid Username/Password"})
            return;
          }
          else{
          const username=isit.name;
          const token =jwt.sign({id:isit._id,username:username},'mysecretkey');
          res.cookie('token', token,'cookieName=cookieValue; SameSite=None; Secure',{ expires: new Date(Date.now() + 86400000), httpOnly: true });
          req.cookie=token;
          return res.redirect("/");
          }
        })
      }
      else {
         const errorMessagess="No user Found Please Register!"
         res.render("login2.ejs",{errorMessagess})
         return
      }
    }
      catch(e){
        console.error('Error:', e);
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
        res.render('otp.ejs', { user: username });
      }
    });
  }
  else{
    res.render('index.ejs',)  
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
  app.post('/users/bookmark',async(req,res)=>{
    const da=req.body;
    const project=da.projectid;
    const user=da.userid;
    const dbe = client.db(dbName).collection('users_bookmarked');
     try {
   const rest= await dbe.findOne({"_id":user})
   if(rest){
    let currentProjectIds =rest.projectid || [];
    if (!currentProjectIds.includes(project)) {
      currentProjectIds.push(project);
    }
    await dbe.updateOne({ _id: user }, { $set: { projectid: currentProjectIds } });
    return res.json({ success: true, bookmarked: true });
        } 
  else {
          dbe.insertOne({"_id":user,"projectid":['project']})
        }
  }
  catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, bookmarked: false });
  }
  })
  
  app.get('/cards',(req, res) => {
    const token=req.cookies.token;
    if(token){
      const secret= 'mysecretkey';
      jwt.verify(token,secret, (err, decodedToken) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Token verification failed' });
        } else {
          const { username } = decodedToken;
          res.render('project_cards.ejs', { user: username });
        }
      });
    }
    else{
      res.render('project_cards.ejs')
    }
   
  })
  
  app.get('/register', (req, res) => {
      res.render('register.ejs')
    })
  
  app.post('/register',async (req,res)=>{
      const db = client.db(dbName).collection('user_data');
      const username=req.body.name;
      const useremail=req.body.email;
      const userpassword=req.body.password;
        if(username!=" " && userpassword.length>=6 && useremail!=" "){
          if(await db.findOne({email:useremail})){
            errorMessagess="MAIL IS ALREADY REGISTERED!!";
            res.render("Login2.ejs",{errorMessagess})
            return 
          }
          const newUser = new User({
            name: username,
            email: useremail,
            password: await bcrypt.hash(userpassword,10)
          });
           db.insertOne(newUser).then(isit => {
            res.redirect('/login')
          })
          .catch(err => {
            console.error('Error Registering User:', err);
          })
        } 
        else{
          if(userpassword.length<=6){
          errorMessagess="Password must  be atleast 6 characters long";
          res.render("register.ejs",{errorMessagess})
          }
        }
  })
  
  app.get('/bookmarkedbyuser', async (req, res) => {
    try {
      const token = req.cookies.token;
      const decoded = jwt.verify(token, 'mysecretkey');
      if(decoded){
      const userId = decoded.id;
      const db = client.db(dbName).collection('users_bookmarked');
      const result= await db.findOne({ "_id": userId });
      if(result){
        if (result && result.projectid && Array.isArray(result.projectid)) {
          const bookmarkedProjects = result.projectid;
          res.json(bookmarkedProjects);
        } else {
          res.json([]);
        }
      }
      else{ 
        res.json("no bookmarks yet!!");
      }
    } 
    else{
      return res.json("error occured")
    }
  }
     catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.post('/removeBookmark', async(req, res) => {
    const projectId = req.body.projectId;
    const token = req.cookies.token;
    if(token){
       const dec=jwt.decode(token,'mysecretkey')
       const username=dec.id;
    const dbe = client.db(dbName).collection('users_bookmarked');
     const resu=await dbe.findOne({"_id":username})
     if(resu){
      await dbe.updateOne(
        { _id:username },
        { $pull: { projectid: projectId } }
      );
      res.json("success")
     }
  }
  
  });
  
  
  
  
  app.get('/start',notauthenticated,(req,res)=>{
    res.render('Raise.ejs')
  })
  app.post('/start',(req,res)=>{
    const token=req.cookies.token;
    const dataa=req.body;
    if(token){
      const dec=jwt.decode(token,'mysecretkey')
      const uid=dec.id;
      dataa.userid = uid;
    const db = client.db(dbName).collection('user_requests');
    db.insertOne(dataa).then(isit=>{
      res.redirect('/dashboard');
     });
    }
    else {
      res.status(401).send("Unauthorized");
    }
  })
  app.get('/pendingrequests',async (req,res)=>{
    const token=req.cookies.token;
    if(token){
    const dec=jwt.decode(token,'mysecretkey');
     const id=dec.id;
    const db = client.db(dbName).collection('user_requests');
    const rest=await db.findOne({"userid":id});
    if(rest){
      res.json(rest);
      // console.log(rest) 
    }
    else{
      res.json({message:"no requests raised"})
    }
    }
  
  })
  const { ObjectId } = require('mongodb'); 
  app.post('/removeUserRequest', async (req, res) => {
    const { id } = req.body;
    // const { ObjectId } = require('mongodb'); 
  
    try {
      const dbur = client.db(dbName).collection('user_requests');
      const objectId = new ObjectId(id); 
  
      const removedRequest = await dbur.findOneAndDelete({ _id: objectId });
  
      if (!removedRequest.value) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      return res.json({ message: 'Request removed successfully', id });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  
  app.get('/api/userspage',async(req,res)=>{
    const projdata = client.db(dbName).collection('users_ideas_db');
    try{
      const result=await projdata.find({}).toArray();
      res.json(result);
    } catch (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: 'An error occurred while retrieving data' });
    }
  })
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
  
  app.post('/api/approve',async(req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    const dbdata = client.db(dbName).collection('users_ideas_db');
    const data = req.body;
    await dbdata.insertOne(data).then(mess=>{
      res.status(200).json({message:'Approved Successfully'})
    })
  })
  app.get('/payment',(req,res)=>{
    res.render('payment.ejs')
  })
  app.post('/cards/payment',async(req,res)=>{
    userref=req.body.user_id;
    projectref=req.body.div_id;
    const dbdata = client.db(dbName).collection('users_ideas_db');
    const objectId2 = new ObjectId(projectref); 
    const result = await dbdata.find({"_id":objectId2}).toArray();
    res.json(result);
  })
  app.get("/adminhome",(req,res)=>{
    res.render("adminhome.ejs")
  })
  
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
    // res.render("index.ejs")
  })
  
  const { generateOTP, verifyOTP } = require("../controllers/authController");
  
  // Generate OTP and send email
  router.post("/generate-otp", generateOTP);
  
  // Verify OTP
  router.post("/verify-otp", verifyOTP);
  
  module.exports = router;
  
  app.listen(port)