const functions = require("firebase-functions");
const cors = require('cors')({origin: true})
const fs = require('fs')
const uuid = require('uuid-v4')
const {Storage} = require('@google-cloud/storage')
const storage = new Storage({
    projectId: 'eu-desenvolvo',
    keyFile: 'eu-desenvolvo.json'
})

// Dep. Express
const bodyParser = require('body-parser')
const express = require('express')

// Stripe - Key
// const stripe = require('stripe')('sk_live_TKvI4wvhhSdkqN00ROpskePF00U5fowZ5o')

// function send(res, code, body) {
//     res.send({
//         statusCode: code,
//         headers: {'Acess-Controll-Allow-Origin': '*'},
//         body: JSON.stringify(body)
//     })
// }

// const createOrderAndSessionApp = express();
// createOrderAndSessionApp.use(cors);

// function createOrderAndSessionApp(req, res){
//     const body = JSON.parse(req.body);

//     const currency = body.currency
//     const quantity = body.quantity
//     const amount = body.amount
//     const name = body.name
//     const description = body.description
//     let images = []
//     images[0] = body.image
//     const customerEmail = body.customerEmail
//     const clientId = body.clientId


// }



// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.uploadImage = functions.https.onRequest((request, response) => {
    
});
