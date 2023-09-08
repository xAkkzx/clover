// https://expressjs.com/
const express = require('express')
const accessroute = require('./routes/access-route')
const jwt = require('jsonwebtoken');
require("dotenv").config();

const port = process.env.PORT || 3000
const app = express()

app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())

// aggiunta autenticazione
//      https://github.com/auth0/express-jwt ?
// validazione 
//      https://github.com/hapijs/joi#readme

// routes
app.use('/security', accessroute)

app.get('/', (req, res, next) => {
    console.log(req.body.prompt)
    // res.send('ciao capo')
    res.redirect('/home')
})

app.get('/home', (req, res, next) => {
    res.send('ciao user')
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

// route not found error
app.use((req, res, next) => {
    const error = new Error('Unable to match incoming request to an operation.')
    error.status = 404
    next(error)
})

 // handle errors
 app.use((err, req, res, next) => { 
    console.error('Error catched when processing the request: ' + err)
    res.status(500).send(err)
 })

 module.exports = app