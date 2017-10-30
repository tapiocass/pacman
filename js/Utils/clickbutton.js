$("#btnenviar").click( function(){
    var nome = $("#nome").val();
    var pontuacao = $("#pontuacao").text();

    writeRanking(nome, pontuacao);

    window.location = "./ranking.html";
});
