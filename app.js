require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

// Set server parameters
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// Set cookies
app.use(session({
    secret: 'This is my secret personally, only mine nobody else!',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Set the database server
mongoose.connect('mongodb://localhost:27017/userDB', {useUnifiedTopology: true, useNewUrlParser: true});

mongoose.set('useCreateIndex', true);

// Create User schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: [true, 'User requires an email.']
    },
    password: {
        type: String,
        require: [true, 'User requires a password.']
    }
});

userSchema.plugin(passportLocalMongoose);

// Create indiviual documents of the User DB in a collection name users, pass the singular user
const User = mongoose.model('user', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set the GET requests from the website
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/secrets');
    } else {
        res.render('login')
    }
});

app.get('/register', (req, res) => {
    res.render('register')
});

app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Set the POST requests from the website
app.post('/register', (req, res) => {
    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if (err) { console.log(err); }
        else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets')
            })
        }
    })    
});

app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, (err) => {
        if(err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            });
        }
    })
})

const port = 5050;
app.listen(port, () => {
    console.log(`Server started in port ${port}`);
})
