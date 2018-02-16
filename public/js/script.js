
var socket = io();


$('#message').on('keypress', (e) => {
    if (e.keyCode == 13) {
        var user = $("#user").val();
        var message = $("#message").val();
        var output = $('#output').val();
        var feedback = $('#feedback').val();

        socket.emit('chat', {
            user: user,
            message: message
        });
        console.log(message);
        socket.on('message')
        message = "";

    }

    socket.emit('typing', user);
});

socket.on('chat', (msg) => {
    feedback.innerHTML = '';
    output.innerHTML += '<p><strong>' + msg.user + ': </strong>' + msg.message + '</p>';
});

socket.on('typing', (data) => {
    if (data) {
        feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
    } else {
        feedback.innerHTML = '';
    }
});

$('#btnLogin').on('click', (e) => {
    e.preventDefault();

    let username = $('input[name = username]').val();
    let password = $('input[name = pass]').val();

    $.ajax({
        url: '/api/login',
        method: 'POST',
        data: {
            username: username,
            password: password
        }
    }).done((result) => {
        window.location.replace(`/api/chat`);
    });
});

$('#search').on('keyup', (e) => {
    e.preventDefault();

    let searchInput = $('input[ name = search ]').val();

    $.ajax({
        url: '/api/chat',
        method: 'POST',
        data: {
            search: searchInput
        }
    }).done((result) => {

        if(result){
            $('#search_div').css("display", "block");
            $('#setUsername').text(result.username);
        }else{
            $('#search_div').css("display", "none");
        }
        

    });
});

$(document).ready(() => {
    var url = window.location.href;
    var newUrl = url.split('http://localhost:8080')[1];
    socket.emit('url', newUrl);
});