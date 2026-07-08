const functions = require("firebase-functions");
const cors = require('cors')({ origin: true });
const fs = require('fs')
const uuid = require('uuid-v4')
const {Storage} = require('@google-cloud/storage')
const storage = new Storage()

function withCors(handler) {
  return (req, res) => cors(req, res, () => handler(req, res));
}

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

// YouTube playlist sync functions
const {
    youtubeChannelWebhook,
    atualizarPlaylistYoutube,
    atualizarPlaylistYoutubeScheduled,
    processarTranscricoesYoutubeScheduled,
    listarVideosTvCamara,
    obterTranscricaoYoutube,
    proxyCmpacatubaOpenData,
    renovarWebhookYoutube,
} = require('./lib/youtubeLib');

const youtubeRegion = functions.region('southamerica-east1');

exports.youtubeChannelWebhook = youtubeRegion.https.onRequest(youtubeChannelWebhook);
exports.atualizarPlaylistYoutube = youtubeRegion.https.onRequest(withCors(atualizarPlaylistYoutube));
exports.listarVideosTvCamara = youtubeRegion.https.onRequest(withCors(listarVideosTvCamara));
exports.obterTranscricaoYoutube = youtubeRegion.https.onRequest(withCors(obterTranscricaoYoutube));
exports.proxyCmpacatubaOpenData = youtubeRegion.https.onRequest(withCors(proxyCmpacatubaOpenData));
exports.renovarWebhookYoutube = youtubeRegion.https.onRequest(withCors(renovarWebhookYoutube));

exports.atualizarPlaylistYoutubeScheduled = youtubeRegion.pubsub
    .schedule('0 * * * *')
    .timeZone('America/Fortaleza')
    .onRun(atualizarPlaylistYoutubeScheduled);

exports.renovarWebhookYoutubeScheduled = youtubeRegion.pubsub
    .schedule('0 3 */3 * *')
    .timeZone('America/Fortaleza')
    .onRun(() => renovarWebhookYoutube());

exports.processarTranscricoesYoutubeScheduled = youtubeRegion.pubsub
    .schedule('20 * * * *')
    .timeZone('America/Fortaleza')
    .onRun(processarTranscricoesYoutubeScheduled);
