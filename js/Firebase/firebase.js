var config = {
    apiKey: "AIzaSyASIfdgjdoJHjAqHPHn7BsIa81eil4ZrKY",
    authDomain: "pacman-tes.firebaseapp.com",
    databaseURL: "https://pacman-tes.firebaseio.com",
    projectId: "pacman-tes",
    storageBucket: "pacman-tes.appspot.com",
    messagingSenderId: "672008536830"
};

firebase.initializeApp(config);

var database = firebase.database();

function writeRanking(name, score) {
    database.ref('Ranking').push().set({
        name:name,
        score:score
    });
}

function getRanking(){

    var list = [];

    database.ref('Ranking')
        .once('value')
        .then(function (snapshot) {
            console.log(snapshot.val())
            snapshot.forEach(function(child){

                info = {
                    name: child.child("name").val(),
                    score: child.child("score").val()
                };

                list.push(info);

            });
            createRanking(list);
        });
}


