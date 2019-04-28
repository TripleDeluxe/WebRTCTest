

//Create an account on Firebase, and use the credentials they give you in place of the following
var config = {
    apiKey: "AIzaSyBZ7ndGY01tIyAvgR9EU6hVKPi8xinpLjQ",
    authDomain: "smartdoorbellapp-5a6d1.firebaseapp.com",
    databaseURL: "https://smartdoorbellapp-5a6d1.firebaseio.com",
    projectId: "smartdoorbellapp-5a6d1",
    storageBucket: "smartdoorbellapp-5a6d1.appspot.com",
    messagingSenderId: "497576824721"
};
firebase.initializeApp(config);

var db = firebase.firestore();
var yourVideo = document.getElementById("myVideo");
var friendsVideo = document.getElementById("otherVideo");
var yourId = Math.floor(Math.random() * 1000000000);
var servers = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }, { 'urls': 'turn:numb.viagenie.ca', 'credential': 'Guerin@35', 'username': 'guerin.thomas35000@gmail.com' }] };
var pc = new RTCPeerConnection(servers);
pc.onicecandidateerror = (event) => {
    console.log(event);
}
pc.onicecandidate = (event => event.candidate ? sendMessage(JSON.stringify({ 'sender': yourId, 'ice': event.candidate })) : console.log("Sent All Ice"));
//DEPRECATED
//pc.onaddstream = (event => friendsVideo.srcObject = event.stream);
//pc.ontrack = e => {
//    friendsVideo.srcObject = e.streams[0];
//    //hangupButton.disabled = false;
//    return false;
//}
pc.ontrack = ({ streams: [stream] }) => friendsVideo.srcObject = stream;

//db.collection("userTest").doc("dede").set({"nom": "didier" , "nouvelAppel":""} ).catch((err) => {
//    console.log("erreur set dede " + err);
//});
var dedeRef = db.collection("userTest").doc("dede");

var isFirstSnapshot = true;

dedeRef.onSnapshot(function (doc) {
    var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
    console.log(source, " data: ", doc.data());

    if (isFirstSnapshot) {
        isFirstSnapshot = false;
        return;
    }

    readMessage(doc.data().nouvelAppel);
});

function sendMessage(data) {

    dedeRef.update({ "nouvelAppel": data }).then(() => {
        console.log("message envoyé : " + data.toString());
    }).catch((err) => {
        console.log("Erreur lors de l'écriture de nouvelAppel de " + yourId);
    });
    //var msg = db.collection("calls").where("nom", "==", "dédé").then(function (querySnapshot) {
    //    querySnapshot.forEach(function (doc) {
    //        if (querySnapshot.docs.length > 1) {
    //            console.log("Erreur, il y a plusieurs users du nom de dédé");
    //            return;
    //        }

    //        querySnapshot.docs.forEach(function (doc) {
    //            doc.ref.update({
    //                nouvelAppel: data
    //            });
    //        });
    //    });
    //});
    

}

function clearCollection() {
    db.collection("calls").where("nom", "==", "dédé").then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            doc.delete();
        });
    })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
}

function readMessage(data) {
    if (data != "") {
        var msg = JSON.parse(data);
        var sender = msg.sender;
        
        if (sender != yourId) {
            console.log("readMessage : " + data);
            if (msg.ice != undefined) {
                pc.addIceCandidate(new RTCIceCandidate(msg.ice));
            } else if (msg.sdp.type == "offer") {
                pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
                    .then(() => pc.createAnswer())
                    .then(answer => pc.setLocalDescription(answer))
                    .then(() => sendMessage(JSON.stringify({ 'sender': yourId, 'sdp': pc.localDescription })));
            } else if (msg.sdp.type == "answer") {
                console.log(msg.sdp.sdp);
                pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            }

            //RESET NOUVEL APPEL
            //dedeRef.update({ "nouvelAppel": data }).then(() => {
            //    console.log("Message bien effacé");
            //}).catch((err) => {
            //    console.log("Erreur lors de l'effaçage de nouvelAppel de " + yourId);
            //});
        }
    }
};

function showMyFace() {
    //navigator.mediadevices.getusermedia({ audio: true, video: true })
    //    .then(stream => yourvideo.srcobject = stream)
    //    .then(stream => pc.addstream(stream));

    //var videoStream = document.getElementById("myVideo").captureStream();
    //pc.addStream(videoStream);
    //var audioStreamTrack = 
}

function showFriendsFace() {
    pc.createOffer({ 'offerToReceiveAudio': true, 'offerToReceiveVideo': true })
        .then(offer => pc.setLocalDescription(offer))
        .then(() => sendMessage(JSON.stringify({ 'sender': yourId, 'sdp': pc.localDescription })));
}

//async function openCall(pc) {
//    const gumstream = await navigator.mediadevices.getusermedia(
//        { video: true, audio: true });

//    for (const track of gumstream.gettracks()) {
//        pc.addtrack(track, gumstream);
//    }
//    yourVideo.srcObject = gumStream;
//}

//showMyFace();
//openCall(pc);

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
    for (const track of mediaStream.getTracks()) {
        pc.addTrack(track, mediaStream);
    }
    yourVideo.srcObject = mediaStream;
    console.log(mediaStream);
}).catch((err) => {
    console.log(err);
});