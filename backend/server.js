//server.js
const app = require("./app")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const express = require("express")
dotenv.config({ path: "./.env" })
mongoose.connect(process.env.MONGOURL)
    .then(() => { console.log("connected"); })
    .catch((error) => {
        console.log(error)
    })

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Generate unique filenames
    }
});

const upload = multer({ storage: storage });
module.exports.upload = upload;

app.listen(3001, () => {
    console.log('example app listening on port 3001')
})