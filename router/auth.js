const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate')


// db connection
require('../db/conn')
// require model
const User = require('../model/userSchema');

// to user router
const router = express.Router();

// routes
router.get("/", (req, res) => {
    res.send("<h1>Hello World</h1>");
});
router.get("/about", authenticate, (req, res) => {
    console.log("ABOUT")
    res.send(req.rootUser);
});
// for contact and home page
router.get("/getdata", authenticate, (req, res) => {
    res.send(req.rootUser);
})
router.post("/contact", authenticate, async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !phone || !message) {
            console.log("contact form error");
            return res.json({ error: "Please Fill the contact form" });
        }
        const userContact = await User.findOne({ _id: req.userID });
        if (userContact) {
            const userMessage = await userContact.addMessage(name, email, phone, message);
            await userContact.save();
            res.status(201).json({ message: "Added Successfully" })
        }

    } catch (error) {
        console.log(error);
    }

});
router.get("/loggedin", (req, res) => {
    res.send("<h1>Hello login</h1>");
});
router.get("/signup", (req, res) => {
    res.send("<h1>Hello signup</h1>");
});

// request post method when you have to get data from the database
router.post('/register', async (req, res) => {
    const { name, email, phone, work, password, cpassword } = req.body;

    if (!name || !email || !phone || !work || !cpassword || !password) {
        return res.status(422).json({ error: "Please fill the name and email" });
    }
    // using async await
    try {
        const response = await User.findOne({ email: email })
        if (response) {
            return res.status(422).json({ error: "Email already regisred try logging in" });
        }

        const user = new User({ name, email, phone, work, password, cpassword });

        const userRegister = await user.save();

        if (userRegister) {
            res.status(201).json({ message: "Added Successfully" })
        }

    } catch (error) {
        console.log(error);
    }


    // using promises
    // User.findOne({ email })
    //     .then((userExists) => {
    //         if (userExists) {
    //             return res.status(422).json({ error: "Email already regisred try logging in" });
    //         }
    //     }).catch((err) => {
    //         console.log(err);
    //     })

    // const user = new User({
    //     name,
    //     email,
    //     phone,
    //     work,
    //     password,
    //     cpassword
    // }) //using ES6 key value 

    // user.save().then(() => {
    //     res.status(201).json({ message: "Added Successfully" })
    // }).catch(err => {
    //     res.status(500).json({ error: err + "Failed to add" })
    // })

});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // check if it is empty.
        if (!email || !password) {
            return res.status(400).send({ error: 'Fill the details correctly' })
        }

        const user = await User.findOne({ email: email });
        if (user) {
            // jwt token code in schema file
            const token = await user.generateAuthToken();
            res.cookie('jwtoken', token, {
                expires: new Date(Date.now() + 2592000000),
                httpOnly: true
            })

            // comparing hashed password with user password
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return res.status(200).json({ message: "Successfully logged in}" });
            } else {
                return res.status(400).json({ error: "Invalid Credentials" })
            }
        } else {
            return res.status(400).json({ error: 'Email Not Registered Try Signing Up' })
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/logout', (req, res) => {
    console.log("Logout");
    res.clearCookie('jwtoken', { path: '/' }); //for logout
    res.status(200).send("User Logged Out")
})

module.exports = router;