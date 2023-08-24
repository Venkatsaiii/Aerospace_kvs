const express=require('express')
const app=express();
const path=require('path');
const mongoose = require('mongoose');
const morgan=require("morgan")
const ejsMate=require("ejs-mate");
const Buyer=require('./models/buyer');
const AppError= require('./utils/AppError');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const flash= require('connect-flash')
const session= require('express-session')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
mongoose.connect('mongodb://127.0.0.1:27017/acomponents', {
  useNewUrlParser: true,
//  useCreateIndex: true,
  useUnifiedTopology: true,})
.then(()=>{
  console.log("connection open");
})
.catch(err=>{
  console.log("error..")
  console.log(err)})
  app.engine('ejs',ejsMate)
  app.set('view engine', 'ejs')
  app.set('views',path.join(__dirname, 'views'))
  app.use(methodOverride('_method'));
  app.use(morgan('tiny'));
  app.use(express.urlencoded({extended:true}))
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//------------------------------------------------------

app.use((req,res,next)=>{

  console.log(req.session);
  res.locals.success=req.flash('success');
  res.locals.error=req.flash('error');
  next();
})
storeReturnTo=(req,res,next)=>{
  if(req.session.returnTo){
    res.locals.returnTo=req.session.returnTo;
  }
  next();
}

isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}


app.get('/register',(req,res)=>{
  res.render('users/register')
})
app.post('/register',async (req, res,next) => {
try{
        const { email, username, password } = req.body;
       const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
           req.flash('success', 'Welcome ');
            res.redirect('/home');
}
catch(e){
 req.flash("error",e.message);
     res.redirect('register');
}
});
//----------------------------------------------------------------
app.get('/login',(req,res)=>{
  res.render('users/login')
})
app.post('/login',storeReturnTo ,passport.authenticate('local', {failureFlash: true,failureRedirect: '/login'}), catchAsync((req, res) => {
try{
  req.flash('success','welcome back');
  const redirectUrl=res.locals.returnTo || '/home'
    res.redirect(redirectUrl);
}
catch(e){
 req.flash("error",e.message);
     res.redirect('/login');
}
}));
app.get('/logout', (req, res,next) => {
  req.session.destroy(err => {
      if (err) {
        console.log('Error destroying session:', err);
      }
    });
  res.redirect('/home');
});

//------------------------------------------------------

app.get("/home",(req,res)=>{
  res.render('home')
})
app.get("/buyer",async(req,res)=>{
  const buyer = await Buyer.find({});
    res.render('buyer',{buyer});

})
app.get("/new",isLoggedIn,(req,res)=>{
  res.render('new')
})
app.post('/new',async(req,res)=>{
  const c= new Buyer(req.body);
  await c.save();
  req.flash('success', 'Successfully added product')
  res.redirect('/seller')

})
app.get("/buyer/:id",isLoggedIn,catchAsync(async(req,res)=>{
  const param=await Buyer.findById(req.params.id)
  if (!param) {
      throw new AppError('Product Not Found', 404);
  }
  res.render("cart",{param})
}))
app.get("/seller",(req,res)=>{
  res.render('seller')
})
app.get("/buynow",(req,res)=>{
  res.render("buynow")
})
app.get("/contact/:id",catchAsync(async(req,res)=>{
  const buyer=await Buyer.findById(req.params.id)
  if (!buyer) {
      throw new AppError('Product Not Found', 404);
  }
  res.render("contact",{buyer})
}))
app.delete('/buyer/:id',async(req,res)=>{
  const { id } = req.params;
      await Buyer.findByIdAndDelete(id);
      req.flash('success', 'Successfully deleted campground')
  res.redirect('/buyer')
})


app.all('*', (req, res, next) => {
    next(new AppError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

  app.listen(3000,(req,res)=>{
    console.log("server connected")
  })
