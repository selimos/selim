const express = require('express');
const router = express.Router();
const bycrypt = require('bcryptjs');
const User = require('../models/User');
const passport = require('passport')

router.get('/login', (req, res) => res.render('login'));
router.get('/Profile', (req, res) => res.render('Profile'));
router.get('/News', (req, res) => res.render('News'));
router.get('/register', (req, res) => res.render('register'));

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
  
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please enter all fields' });
    }  
    if (password !== password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
  
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
    if (errors.length > 0) {
      res.render('register', {
        errors,
        name,
        email,
        password,
        password2
      });
    } else {
        User.findOne({email: email})
        .then(user => {
          if(user){
            errors.push({msg: 'Email is already used'})
            res.render('register', {
              errors,
              name,
              email,
              password,
              password2
            });

          }else {
            const newUser = new User({
              name,
              email,
              password
            });
          
            
            bycrypt.genSalt(10, (err, salt) =>
            bycrypt.hash(newUser.password, salt,(err, hash)=>{
              if(err) throw err
              newUser.password = hash;
              newUser.save()
              .then(user =>{
                req.flash('success_msg', 'Welcome to SWAP, You can login now')
                res.redirect('/users/login')
              })
              .catch(err=> console.log(err))
            }))

          }
        });
    } 
  });

  router.post('/login', (req, res, next) =>{
    passport.authenticate('local',{
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
    failureFlash : true  
  })(req, res, next)
  })
  router.get('/logout', (req, res) =>{
  req.logout();
  req.flash('success_msg', 'you are logged out');
  res.redirect('/users/login');
  
  })

module.exports = router;