const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 5000;
dotenv.config({ path: './config.env' })
require('./db/conn');
app.use(express.json());
app.use(cookieParser());

// require model
const User = require('./model/userSchema');

// middlewares{
// link the router file
app.use(require('./router/auth'));

// }


app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});