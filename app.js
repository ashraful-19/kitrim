
const express = require ("express");
const app = express();
require('dotenv').config();
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT;
app.set("view engine","ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const db = require('./config/db');   
const flash = require('connect-flash');
const multer = require('multer');


const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport")




const authRoute = require('./routes/authRoutes');
const homeRoute = require('./routes/homeRoutes');




app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.dbURL,
      collectionName: "sessions",
    }),
    cookie: { 
      maxAge: 1000 * 60 * 60 * 24 * 60, 
     },
  })
);


app.use(flash());


// Add middleware to expose flash messages to views
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success');
  res.locals.error_messages = req.flash('error');
  console.log(res.locals)
  next();
});





app.use(passport.initialize());
app.use(passport.session());



app.use((req,res,next) => {
  if (req.isAuthenticated()) {
    console.log(req.user)
  }
console.log(req.session)

next();
});


app.use(function(req, res, next) {
  res.locals.req = req;
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});






// // Visiting this route logs the user out
app.use('/auth', authRoute);
app.use('/', homeRoute);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images'); // Replace with your upload directory
  },
  filename: function (req, file, cb) {

    const randomName = `${Date.now()}-qs`;
    const ext = file.originalname.split('.').pop();
    const newFilename = `${randomName}.${ext}`;
    
    cb(null, newFilename);
  },
});

const upload = multer({ storage: storage }).single('image');

app.post("/upload", upload, (req, res, next) => {
  const file = req.file;
  console.log('file updlad errorrr vaiya ')
  console.log(file);
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }

  const uploadedFilePath = `/images/${req.file.filename}`;
  console.log(`Uploaded file path: http://localhost:8080${uploadedFilePath}`);
  res.json({ link: uploadedFilePath });
});

app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});