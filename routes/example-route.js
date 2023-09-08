const express = require('express')
const router = express.Router()
const jwt = require("jsonwebtoken")
require("dotenv").config();
// const jwt = require('jsonwebtoken') // Import the JWT library

router.get('/search', async (req, res, next) => {
    try {
        console.log('fake searching')

        const data = await (new Promise((resolve, reject) => {
            resolve(['pippo', 'pluto'])
        }))

        res.json({ data })
    } catch (err) {
        next(err)
    }
})

router.get('/napoli', async (req, res, next) => {
    try {
        console.log(`fake terun ${req.body.prompt}`)

        const data = await (new Promise((resolve, reject) => {
            resolve(['vesuvio', 'erutta'])
        }))

        res.json({ data })
    } catch (err) {
        next(err)
    }
})

module.exports = router