const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

// Set server parameters
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// Set the database server
mongoose.connect('mongodb://localhost:27017/userDB', {useUnifiedTopology: true, useNewUrlParser: true});

// Create User schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: [true, 'User requires an email.']
    },
    password: {
        type: String,
        require: [true, 'User requires a password.']
    }
});

// 
const secret = 'Thisisoutlittlesecret.';
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});

// Create indiviual documents of the User DB in a collection name users, pass the singular user
const User = mongoose.model('user', userSchema);

// Set the GET requests from the website
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})

// Set the POST requests from the website
app.post('/register', (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(err => {
        if (err) {
            console.log(err);
        } else {
            res.render('secrets')
        }
    })
});

app.post('/login', (req, res) => {
    User.findOne({email: req.body.username}, (err, foundUser) => {
        if (err) { console.log(err); }
        else {
            if (foundUser) {
                if (foundUser.password === req.body.password) {
                    res.render('secrets');
                }
            }
        }
    })
})

const port = 5050;
app.listen(port, () => {
    console.log(`Server starte in port ${port}`);
})
