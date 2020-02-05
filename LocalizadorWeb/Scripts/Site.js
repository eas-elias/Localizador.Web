
window.onload = function carregarUsuarios() {

    $.ajax({
        url: "/Home/BuscarUsuarios/",
        type: "POST",
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $("#divUsuarios").empty();
            $("#divUsuarios").append("opa tivemos um erro");
        },
        success: function (response, textStatus, XMLHttpRequest) {
            var retorno = JSON.parse('{"dados":' + (response.response) + '}');
            var dados = JSON.parse(retorno.dados);

            for (var i = 0; i < dados.length; i++) {
                $("#divUsuarios").append("<strong>Usuario:</strong> " + dados[i].Usuario + " <strong>Nome:</strong> " + dados[i].Nome + "<br />");
            }
        }
    });

}




function deleteMarkers(markersArray) {
    for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
    }
    markersArray = [];
}

function calcularDistanciaAmigos() {
    var usuario = document.getElementById('txtUsuario').value;

    $.ajax({
        url: "/Home/BuscarAmigos/",
        data: { Usuario: usuario },
        type: "POST",
        dataType: "json",
        beforeSend: function (XMLHttpRequest) {
            $("#divResultado").empty();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $("#divResultado").empty();
            $("#divResultado").append("Opa ocorreu um erro.");
        },
        success: function (response, textStatus, XMLHttpRequest) {
            var retorno = JSON.parse('{"dados":' + (response.response) + '}');
            var dados = JSON.parse(retorno.dados);

            var enderecos = [];

            if (dados.length == 0) {
                alert("Usuário não encontrado.");
                return;
            }

            for (var i = 0; i < dados.length; i++) {
                enderecos[i] = {
                    lat: dados[i].EnderecoAtual.nuLatitude,
                    lng: dados[i].EnderecoAtual.nuLongitude,
                    nome: dados[i].Nome,
                    endereco: '',
                    distancia: 0,
                    tempo: ''
                };
            }

            calcularDistancia(enderecos);
        }
    });

}

function carregarSaida(dados) {

    var divSaida = document.getElementById('divResultado');
    divSaida.innerHTML = '';

    dados.sort(function (a, b) {
        if (parseInt(a.distancia) < parseInt(b.distancia)) {
            return -1;
        }
        if (parseInt(a.distancia) > parseInt(b.distancia)) {
            return 1;
        }
        return 0;
    });

    for (var i = 0; i < dados.length; i++) {
        divSaida.innerHTML += '<strong> Amigo: ' + dados[i].nome + '</strong><br />';
        divSaida.innerHTML += '<strong> Destino: ' + dados[i].endereco + '</strong><br />';
        divSaida.innerHTML += '<strong> Distância: ' + dados[i].tempo + '</strong><br />';
        divSaida.innerHTML += '<br /><br />';
    }

}

function calcularDistancia() {
    calcularDistancia(null);
}

function calcularDistancia(enderecos) {
    var bounds = new google.maps.LatLngBounds;
    var markersArray = [];
    var enderecosEnvio = [];

    var txtLatitude = document.getElementById('latitudeOrigem').value.replace(',', '.');
    var txtLongitude = document.getElementById('longitudeOrigem').value.replace(',', '.');

    var numeroLatitude = parseFloat(txtLatitude);
    var numeroLongitude = parseFloat(txtLongitude);
    var origin = { lat: numeroLatitude, lng: numeroLongitude };


    var geocoder = new google.maps.Geocoder();
    var markersArray = [];
    var destinationIcon = 'https://chart.googleapis.com/chart?' +
        'chst=d_map_pin_letter&chld=D|FF0000|000000';
    var originIcon = 'https://chart.googleapis.com/chart?' +
        'chst=d_map_pin_letter&chld=O|FFFF00|000000';
    var map = new google.maps.Map(document.getElementById('mapaDoGoogle'), {
        center: origin,
        zoom: 10
    });
    var geocoder = new google.maps.Geocoder;

    var service = new google.maps.DistanceMatrixService();

    if (enderecos == null) {
        return;
    } else {
        for (var i = 0; i < enderecos.length; i++) {
            enderecosEnvio.push(new google.maps.LatLng(enderecos[i].lat, enderecos[i].lng));
        }
    }

    service.getDistanceMatrix({
        origins: [origin],
        destinations: enderecosEnvio,
        travelMode: 'DRIVING',
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
        avoidFerries: false

    }, function (response, status) {
        if (status !== 'OK') {
            alert('Error was: ' + status);
        } else {
            var originList = response.originAddresses;
            var destinationList = response.destinationAddresses;

            deleteMarkers(markersArray);

            var showGeocodedAddressOnMap = function (asDestination) {
                var icon = asDestination ? destinationIcon : originIcon;
                return function (results, status) {
                    if (status === 'OK') {
                        map.fitBounds(bounds.extend(results[0].geometry.location));
                        markersArray.push(new google.maps.Marker({
                            map: map,
                            position: results[0].geometry.location,
                            icon: icon
                        }));
                    } else {
                        alert('Geocode was not successful due to: ' + status);
                    }
                };
            };

            for (var i = 0; i < originList.length; i++) {
                var results = response.rows[i].elements;
                geocoder.geocode({ 'address': originList[i] },
                    showGeocodedAddressOnMap(false));
                for (var j = 0; j < results.length; j++) {
                    geocoder.geocode({ 'address': destinationList[j] },
                        showGeocodedAddressOnMap(true));

                    enderecos[j].tempo = results[j].duration.text;
                    enderecos[j].endereco = destinationList[j];
                    enderecos[j].distancia = results[j].distance.value;
                }
            }

            carregarSaida(enderecos);
        }

    });
}


