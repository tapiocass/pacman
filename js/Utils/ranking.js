
function criaTd(dado){
    var td = $("<td></td>");
    td.text(dado);
    return td;
}

function createRanking(lista){

    var dados = $("#ranking");

    lista.forEach(function(chave) {

        var tr = $("<tr> </tr>");
        tr.append(criaTd(chave.name));
        tr.append(criaTd(chave.score));

        dados.append(tr);
    });
}

$(document).ready(function () {
    getRanking();
});