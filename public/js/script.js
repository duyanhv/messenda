var socket = io();

socket.on('connect', function () {

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
    // console.log(`msg.user: ${msg.user} || msg.mess: ${msg.message}`);

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

var userOnline = {};
var clients = [];
socket.on('usersOnline', (data) => {
    var newData = Object.keys(data).map(key => ({ username: key }));
    // for(let i = 0; i < newData.length; i++){
    //     if(typeof newData[i] === "string"){
    //         userOnline[i] = newData[i]
    //     }
    // }
    var source = $('#usersonline-template').html();
    var template = Handlebars.compile(source);
    var html = template({
        apiUserOnline: newData
    });

    $('#userOnline').html(html);

});

$('#buttonCheckSession').on('click', (e) => {
    $.get('/checkSession').then(data => console.log(data));
});

// function removeA(arr) {
//     var what, a = arguments, L = a.length, ax;
//     while (L > 1 && arr.length) {
//         what = a[--L];
//         while ((ax= arr.indexOf(what)) !== -1) {
//             arr.splice(ax, 1);
//         }
//     }
//     return arr;
// }

// var loadConversations =[];
// socket.on('loadConversations', (data) =>{
    
//     for(let i = 0; i < loadConversations.length; i++){
//         if(loadConversations[i].userReceive == data.userReceive){
//             removeA(loadConversations, loadConversations[i]);
//         }
//     }
//     loadConversations.push(data);
//     var newLoadConversations = loadConversations.map(key => ({ userReceive: key }));
//     console.log(loadConversations)
//     var source1 = $('#loadconversations-template').html();
//     var template1 = Handlebars.compile(source1);
//     var html1 = template1({
//         apiLoadConversations: newLoadConversations
//     });

//     $('#conversation').html(html1);
// });


var currentUserId;


var searchUserId = {};

$('#search').on('keyup', (e) => {
    e.preventDefault();
    $('#search_div').css("display", "none");
    $('#search_div').html('');
    let searchInput = $('input[ name = search ]').val();

    $.ajax({
        url: '/api/chat',
        method: 'POST',
        data: {
            search: searchInput
        }
    }).done((result) => {
        if (result) {
            for (let i = 0; i < result.length; i++) {
                $('#search_div').append('<div class="searchResult_div" id="' + result[i]._id + '"' + 'onClick= "onClickSearchResult(this.id)"' + '>' + result[i].username + '<div class="overlay2"></div>' + '</div>');
                $('#search_div').css("display", "block");
                searchUserId[result[i].username] = result[i]._id;
                console.log(searchUserId);
            }
        } else {
            $('#search_div').html('');
            $('#search_div').css("display", "none");
        }
        if ($('#search').val() === '') {
            $('#search_div').html('');
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


// $('#search_div').on('click', (e) => {
//     if (typeof searchUserId !== 'undefined') {

//     }
// });

let checkChatApi = (url) => {
    var testUrl = '/api/chat';
    socket.emit('url', url.indexOf(testUrl) >= 0);
}

let onClickSearchResult = (clicked_id) => {
    // console.log(clicked_id);
    window.location.replace(`/api/chat/${clicked_id}`);
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