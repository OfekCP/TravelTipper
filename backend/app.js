//app.js
const express = require("express")
const app = express()
const cookieParser = require('cookie-parser');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes')
const travelRoute=require('./routes/TravelRoutes')
const commentRoute=require('./routes/commentsRoutes')
const ratingRoute=require('./routes/ratingRoutes')
app.use(
    session({
      secret: 'Ofekza',
      resave: false,
      saveUninitialized: true,
    })
  );
var cors = require("cors")
app.use(cors())
app.use(express.json())
app.use(cookieParser());
app.use('/auth', authRoutes);
app.use('/uploads', express.static('./uploads'))

app.get("/", (req, res) => {
    res.send("hi")
})
app.use('/api/travel', travelRoute,commentRoute,ratingRoute);
module.exports = app