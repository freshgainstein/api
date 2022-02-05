require('dotenv').config({
  path: 'process.env'
})
const express = require('express')
const rateLimit = require("express-rate-limit");
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')

const db = require('./utils/db')
const ProjectRoutes = require('./routes/Project')
const getChainData = require("./utils/getChainData")
const removeTrailingSlash = require('./middleware/removeTrailingSlash');


const PORT = process.env.PORT

// Call getChainData here to begin chain data update loop and start caching new data to database
getChainData() 

const app = express()

// Limit request rate
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
 
//  apply to all requests
app.use(cors())
app.use(bodyParser.text())


// limit requests
app.use(limiter);

// remove trailing slash
app.use(removeTrailingSlash);


// Logging
app.use(morgan('tiny'))

// Remove trailing slash

// Routes
app.use(/^\/$/, (req, res) => {
  res.send("Welcome to the FGS API!")
})

// add cached data to req
app.use('/v1/', async (req, res, next) => {
  const client = db.getClient()
  try {
    await db.getCachedProjectData(client).then(result => req.chainData = result)
  }
  catch(err){
    console.log("error getting data")
    console.log(err)
  }
  next()
})

app.use('/v1/', ProjectRoutes)

app.use((req, res) => {
  res.status(404).json({error: true, message: "Resource not found"})
})

app.listen(PORT)

console.log(`App listening on ${PORT}`)