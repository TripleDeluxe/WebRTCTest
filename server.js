'use strict';
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

//Gestion template
const pug = require('pug');
const compiledFunction = pug.compileFile('views/view.pug');
app.set("view engine", "pug");

//Firebase
var firebase = require("firebase-admin");
var serviceAccount = require("./smartdoorbellapp-5a6d1-firebase-adminsdk-2g3r7-d3ddc3f754.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://smartdoorbellapp-5a6d1.firebaseio.com"
});

var db = firebase.database();
var usersRef = db.ref("calls");

//Static assets
app.use(express.static(path.join(__dirname, 'public')));

// sets port 8080 to default or unless otherwise specified in the environment
app.set('port', process.env.PORT || 8080);

app.get("/", (req, res) => {
    res.render("view.pug");
});

//app.get('/video', function (req, res) {
//    const path = 'video/videotest.mp4'
//    const stat = fs.statSync(path)
//    const fileSize = stat.size
//    const range = req.headers.range
//    if (range) {
//        const parts = range.replace(/bytes=/, "").split("-")
//        const start = parseInt(parts[0], 10)
//        const end = parts[1]
//            ? parseInt(parts[1], 10)
//            : fileSize - 1
//        const chunksize = (end - start) + 1
//        const file = fs.createReadStream(path, { start, end })
//        const head = {
//            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//            'Accept-Ranges': 'bytes',
//            'Content-Length': chunksize,
//            'Content-Type': 'video/mp4',
//        }
//        res.writeHead(206, head);
//        file.pipe(res);
//    } else {
//        const head = {
//            'Content-Length': fileSize,
//            'Content-Type': 'video/mp4',
//        }
//        res.writeHead(200, head)
//        fs.createReadStream(path).pipe(res)
//    }
//});

app.listen(app.get('port'), () => {
    console.log("Server listening on port " + app.get('port'));
});


