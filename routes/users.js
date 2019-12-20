const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const json = require("../public/data/taskData.json");

// Initialize Firebase
var firebaseConfig = {
  apiKey: "AIzaSyBNEF17RYaE7W0tRFBche1TsR7iRNORA_Q",
  authDomain: "dec-self.firebaseapp.com",
  databaseURL: "https://dec-self.firebaseio.com",
  projectId: "dec-self",
  storageBucket: "dec-self.appspot.com",
  messagingSenderId: "432462687749",
  appId: "1:432462687749:web:063e2040ac1077e265b66c"
};
firebase.initializeApp(firebaseConfig);


// HomeBoard
router.get('/homeboard', function (req, res) {
  var user = firebase.auth().currentUser;
  if (user != null) {
    res.render('home', { user: user });
  }
  else {
    req.flash('error_msg', 'Please log in to view that resource!');
    res.redirect('/users/login')
    console.log('error-User Not Logged IN')
  }
})

router.get('/dashboard',function(req,res){
  var user = firebase.auth().currentUser;
  if (user != null) {
    res.render('dash', { user: user });
  }
  else {
    req.flash('error_msg', 'Please log in to view that resource!');
    res.redirect('/users/login')
    console.log('error-User Not Logged IN')
  }
});

// Render Task Page:
router.get("/dashboard/tasks/:num", function(req, res, next) {
  var user = firebase.auth().currentUser;
  if (user != null) {
    let taskNum = Number(req.params.num);
    if (Number.isInteger(taskNum) && taskNum >= 1 && taskNum <= 10) {
      res.render("task_page", json[taskNum - 1]);
    } else {
      res.render("not_found");
    }
  } else {
    req.flash("error_msg", "Please log in to view that resource!");
    res.redirect("/users/login");
    console.log("error-User Not Logged IN");
  }
});


// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));


// ============= Login and Registration =====================

router.post('/register', (req, res) => {
  var UserName = req.body.name;
  var UserCollege = req.body.college;
  var address= req.body.address;
  var team_name = req.body.team_name;
  var Phone = req.body.number;
  var email = req.body.email;
  var password = req.body.password;
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function (data) {
      var user = firebase.auth().currentUser;
      logUser(user.uid, UserName, UserCollege, Phone, team_name, email,address);
      req.flash(
        'success_msg',
        'You are now registered and can log in'
      );
      res.redirect('/users/login');
    })
    .catch(function (error) {
      var errorMessage = error.message;
      req.flash('error_msg', 'Email Already Taken!');
      res.redirect('/users/login')
    })

});

function logUser(userID, name, college, number, team_name, email,address) {
  let newData = firebase.database().ref('users/' + userID).push()
  newData.set({
    name: name,
    college: college,
    number: number,
    team_name: team_name,
    email: email,
    address:address
  });

}

router.post('/login', (req, res, next) => {
  var UserMail = req.body.email;
  var UserPass = req.body.password;
  firebase.auth().signInWithEmailAndPassword(UserMail, UserPass)
    .then(function (data) {
      res.redirect('/users/homeboard')
    })
    .catch(function (error) {
      let errorMessage = error.MESSAGE;
      req.flash('error_msg', errorMessage);
      res.render('login');
    })

});

// ======================================================

// Edit Profile
router.get('/editprofile', function (req, res) {
  res.render('profileEdit');
});


// ============ Password Reset===========================

router.get('/forgotpassword', (req, res) => {
  res.render('passRest');
})

router.post('/forgotpassword', (req, res) => {
  var email = req.body.email;
  firebase.auth().sendPasswordResetEmail(email)
    .then(function () {
      req.flash('success_msg', 'Email Has been sent to your mail!!!');
      res.redirect('/users/login');
    })
    .catch(function () {
      // Handle Errors here.
      let errorMessage = error.MESSAGE;
      req.flash('error_msg', errorMessage);
    })
})

// =============================================


// Logout
router.get('/logout', function (req, res) {
  firebase.auth().signOut()
    .then(function () {
      req.flash('success_msg', 'You are logged out');
      res.render('login');
    })
});

module.exports = router;