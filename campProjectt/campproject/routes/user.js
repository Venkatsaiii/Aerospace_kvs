const express=require('express')
const router=express.Router();
const passport=require('passport');
const catchAsync = require('../utils/catchAsync');
const User=require('../models/user')
const {storeReturnTo}=require('../middleware')



router.get('/register',(req,res)=>{
  res.render('users/register')
})


router.post('/register',catchAsync(async(req,res)=>{
try{
const {email,username,password}=req.body;
//passing email,username into object (making an instance)
const user=new User({email,username});
//converting password into bcrypt
const registerduser=await User.register(user,password);
//it gives authentication for all the routes once the user registerd
req.login(registerduser,err=>{
  if(err) return next(err);
req.flash('sucess','registered');
res.redirect('campgrounds');
})}
catch(e){
  req.flash('error',e.message)
  res.redirect('register');
}}));


router.get('/login',async(req,res)=>{
  res.render('users/login');
})
//syntax for login in passport package
router.post('/login',storeReturnTo,passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}),(req,res)=>{
  req.flash('success','welcome back');
  const redirectUrl=res.locals.returnTo || '/campgrounds'
  delete req.session.returnTo;
  res.redirect(redirectUrl);
})


router.get('/logout',(req,res,next)=>{
  req.logout(function (err){
    if(err){
       return next(err)
    }
  req.flash('success','loggedout!')
  res.redirect('/campgrounds')
});});
module.exports=router;
