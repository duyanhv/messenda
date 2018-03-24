var socket = io();

socket.on('connect', function () {
    console.log('check 1', socket.connected);
});

$('#message').on('keypress', (e) => {
    if (e.keyCode == 13) {

        var message = $("#message").val();
        var output = $('#output').val();
        var feedback = $('#feedback').val();

        var urlSpit = "http://localhost:8080/api/chat/";
        var url = window.location.href;
        var receiver_id = url.split(urlSpit)[1];
        // console.log(receiver_id);
        socket.emit('send message', {
            message: message,
            receiver_id: receiver_id
        });
        $("#message").val('');

        // socket.emit('chat', {
        //     user: user,
        //     message: message
        // });
        // console.log(message);
        // socket.on('message')

        // let room = 'chatRoom1';
        // socket.emit('subcribe', room);


    }
    else if ($("#message").val() !== "") {
        socket.emit('typing', username);
    }
    else if (!$("#message").val()) {
        socket.emit('stoptyping', '');
    }
});

var username = "";
socket.on('username', (data) => {
    username = data;
});

socket.on('private chat', (msg) => {
    feedback.innerHTML = '';
    output.innerHTML += '<p><strong>' + msg.user + ': </strong>' + msg.message + '</p>';
    console.log(`msg.user: ${msg.user} || msg.mess: ${msg.message}`);

    socket.emit('saveMess', {
        username: msg.user,
        message: msg.message,
        receiver: msg.receiver,
        userid: msg.userid
    });
});

socket.on('typing', (data) => {
    if (data) {
        feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
    } else {
        feedback.innerHTML = '';
    }
});

socket.on('stoptyping', (data) => {
    if (data) {
        feedback.innerHTML = '';
    }
});

var userOnline = [];
socket.on('usersOnline', (data) =>{
    if(data){
        $(() =>{
            var source = $('#usersonline-template').html();
            var template = Handlebars.compile(source);
            var html = template({
                apiUsersOnline: Object.keys(data)
            });
            console.log(Object.keys(data));
            $('#userOnline').html(html);
        });
    }
});

$('#buttonCheckSession').on('click', (e) => {
    $.get('/checkSession').then(data => console.log(data));
});


var currentUserId;


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
    socket.emit('url', url.indexOf(testUrl) >= 0);
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