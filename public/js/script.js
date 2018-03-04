
var socket = io();


$('#message').on('keypress', (e) => {
    if (e.keyCode == 13) {
        var user = $("#user").val();
        var message = $("#message").val();
        var output = $('#output').val();
        var feedback = $('#feedback').val();

        // socket.emit('chat', {
        //     user: user,
        //     message: message
        // });
        // console.log(message);
        // socket.on('message')

        // let room = 'chatRoom1';
        // socket.emit('subcribe', room);
        
        socket.emit('send message', {
            message: message
        });
        // message = "";

    }

    socket.emit('typing', user);
});

socket.on('private chat', (msg) => {
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

var currentUserId;
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
        currentUserId = result._id;
        window.location.replace(`/api/chat`);
    });
});

var searchUserId;

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

        if (result) {
            $('#search_div').css("display", "block");
            $('#setUsername').text(result.username);
            searchUserId = result._id;
        } else {
            $('#search_div').css("display", "none");
        }


    });
});

// let checkSearchApi = (currentUserId, searchUserId) => {
//         if (currentUserId == searchUserId) {
//             console.log('chay vao if');
//             $('#search_div').click(false);
//             $('#search_div').css('cursor', 'default');
//         } else {
//             console.log('chay vao else');
//             $('#search_div').click(true);
//             $('#search_div').css('cursor', 'pointer');

//         }
//     }


$('#search_div').on('click', (e) => {
    if (typeof searchUserId !== 'undefined') {
        window.location.replace(`/api/chat/${searchUserId}`);
    }
});

let checkChatApi = (url) => {
    var testUrl = '/api/chat';
    let bool;
    if (url.indexOf(testUrl) >= 0) {
        bool = true;
        socket.emit('url', bool);
    } else {
        bool = false;
        socket.emit('url', bool);
    }
}

$(document).ready(() => {
    var url = window.location.href;
    checkChatApi(url);
    // if (typeof currentUserId !== 'undefined' &&
    //     typeof searchUserId !== 'undefined') {
    //     console.log(currentUserId, searchUserId);
    //     checkChatApi(currentUserId, searchUserId);
    // }
});