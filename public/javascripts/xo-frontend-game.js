function createBoard(data, socket) {

    $('.sweet-overlay').remove();
    $('.sweet-alert').remove();

    var board = data.board;
    var gamerTurn = data.gamerTurn;
    var userO = data.userO;
    var userX = data.userX;
    var winner = data.winner;
    var message = data.message;
    var timeToPLay = data.timeToPLay;
    var equal = data.isGameDraw;

    var user = JSON.parse(localStorage.getItem('user'));


    if (timeToPLay > 0) {

        $('.timer *').remove();

        $('.timer').circularCountDown({
            fontSize: 25,
            size: 60,
            fontColor: '#FFF',
            colorCircle: 'white',
            background: '#00d6ff',
            reverseLoading: false,
            duration: {
                seconds: timeToPLay
            }
        });
    }

    var yourTurn = false;

    // check user turn
    if (gamerTurn == user._id) {
        yourTurn = true;
    }

    //...
    if (!yourTurn) {
        $("#loading_title").html("منتظر پاسخ حریف");
        $("#loading").fadeIn(100);
    } else {
        $("#loading").fadeOut(100);
    }

    // make board
    $('#xo_game_board').html('');
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var faClass = xoChar = '';
            if (board[i][j] != 0) {
                xoChar = board[i][j];
            }

            var classHtml = 'effect';
            if (xoChar !== '') {
                classHtml = '';
            }
            if (xoChar == 'o') {
                faClass = ' fa-circle-o ';
            } else if (xoChar == 'x') {
                faClass = ' fa-close ';
            }

            // $('div#xo_game_board').append('<a data-x="' + i + '" data-y="' + j + '" class="xo-btn fa ' + classHtml + '">' + xoChar + '</a>');
            $('#xo_game_board').append('<a data-x="' + i + '" data-y="' + j + '" class="xo-btn fa ' + classHtml + faClass + '">' + '</a>');
        }
    }

    // set marker
    var marker = 'x';
    var opponent = userO.nickname;
    if (userO._id == user._id) {
        marker = 'o';
        opponent = userX.nickname;
        var me = userO.nickname;
    }
    $('div#xo_game_board').append('<span id="xo_marker" class="hidden">' + marker + '</span>');
    if (marker == 'x') {
        var markerIco = '<i class="fa fa-circle-o" style="margin:0 2px; color: #FF5722"></i>';
        var markerIcoMe = '<i class="fa fa-close" style="margin:0 2px; color: #FF5722"></i>'
    } else if (marker == 'o') {
        var markerIco = '<i class="fa fa-close" style="margin:0 2px; color: #2196F3"></i>';
        var markerIcoMe = '<i class="fa fa-circle-o" style="margin:0 2px; color: #FF5722"></i>'
    }
    $("#opponent").html(opponent + ' (' + markerIco + ')');
    $("#me").html(' (' + markerIcoMe + ')');

    $("#opponent").parent().fadeIn();


    // check if we have draw
    if(equal == true){
        $.ajax({
            method: "POST",
            url: window.location.protocol + "//" + window.location.hostname + "/user/me",
            data: {_token: localStorage.getItem("token")},
            success: function (result) {
                if (result.result) {
                    $.ajax({
                        method: "POST",
                        url: window.location.protocol + "//" + window.location.hostname + "/record",
                        data: {_token: localStorage.getItem("token")},
                        success: function (result) {
                            if (result.result) {
                                $("#yourRating").text(result.yourRating);
                            }
                        },
                    });//get user rank
                    if (result.data.user.easyRemainedLife <= 0) {

            var modal__loser = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"  id="get_free_charge"></a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
            $("#wrapper").after(modal__loser);
            $(".user-modal").addClass('loser-modal');
            $(".user-modal .user-msg").text("مساوی");
            $(".user-modal .modal-icon").attr("src", "/images/Equal.png");
            $(".btn-next-game").preventDefault;
            $(".btn-next-game").html('دریافت 5 جان رایگان');
                    }

                            var modal = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"></a></div><div class="text-center"><a href="/games" type="button" class="btn btn-gray btn-cancel">بی خیال</a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                            $("#wrapper").after(modal);
                            $(".user-modal").addClass('draw-modal');
                            $(".user-modal .user-msg").text("مساوی");
                            $(".user-modal .modal-icon").attr("src", "/images/Equal.png")
                            $(".btn-next-game").html('دست بعدی')
                                .attr("href", "#/").attr("onclick", "refresh()");



                    $("#easyRemainedLife").text(result.data.user.easyRemainedLife);
                    $("#winsCount").text(result.data.user.winsCount);
                    $("#lossCount").text(result.data.user.playsCount - result.data.user.winsCount);
                    if (message) {
                        var msg = message[user._id];
                        $(".user-info").after('<p class="server-msg">' + msg + '</p>');
                    }
                    setTimeout(function () {
                        $(".user-modal").modal('show');
                    }, 2000);//set 2s delay for display modal
                }
                }

        });

        return false;
    }


    // check the winner
    // console.log(board[4][1]);
    if (winner) {

        var winner_sign;
        if (winner._id == userO._id) {
            winner_sign = 'o';
        } else {
            winner_sign = 'x';
        }

        var signs = [];
        for (var i = 0; i < board.length; i++) {
            var row = board[i];
            for (var j = 0; j < row.length; j++) {
                // console.log(board[3]);
                if (row[j] == winner_sign) {
                    if (typeof board[i + 1] !== 'undefined' && typeof board[i + 2] !== 'undefined' && board[i + 1][j] == winner_sign && board[i + 2][j] == winner_sign)
                        signs.push([i, j], [i + 1, j], [i + 2, j]);
                    else if (board[i][j + 1] == winner_sign && board[i][j + 2] == winner_sign)
                        signs.push([i, j], [i, j + 1], [i, j + 2]);
                    else if (typeof board[i + 1] !== 'undefined' && typeof board[i - 1] !== 'undefined' && board[i + 1][j + 1] == winner_sign && board[i - 1][j - 1] == winner_sign)
                        signs.push([i, j], [i + 1, j + 1], [i - 1, j - 1]);
                    else if (typeof board[i + 1] !== 'undefined' && typeof board[i - 1] !== 'undefined' && board[i - 1][j + 1] == winner_sign && board[i + 1][j - 1] == winner_sign)
                        signs.push([i, j], [i - 1, j + 1], [i + 1, j - 1]);
                }
            }
        }
        for (var i = 0; i < signs.length; i++) {
            $("a.xo-btn[data-x='" + signs[i][0] + "'][data-y='" + signs[i][1] + "']").addClass("winner-cards");
        }
        // $("a.xo-btn").each(function () {
        //    var x = $(this).data("x");
        //    var y = $(this).data("y");
        //
        // });
// var toast_title = "";
// if (winner._id == user._id) {
//     var type = window.location.href.split("/");
//     var gameType = type[type.length - 2];
//     if (user.userLevels[gameType].indexOf("normal") === -1 && winner.userLevels[gameType].indexOf("normal") !== -1) {
//         toast_title = '<p class="text-right">مرحله متوسط برای شما فعال شد</p>';
//     }
//     if (user.userLevels[gameType].indexOf("hard") === -1 && winner.userLevels[gameType].indexOf("hard") !== -1) {
//         toast_title = '<p class="text-right">مرحله سخت برای شما فعال شد</p>';
//     }
//     localStorage.setItem('user', JSON.stringify(winner));
// }
        setTimeout(function () {
            $("#xo_game_board *").remove();
            $("#loading_title").remove();
            $("#loading .moliran_loader").remove();
        }, 2000);
        $('.timer *').remove();
        $("#opponent").parent().fadeOut();
        $("#loading").hide();
        // socket.disconnect();
        $("body").append("<div class='mask'></div>")
// var modal = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"></a></div><div class="text-center"><a href="/games" type="button" class="btn btn-gray btn-cancel">بی خیال</a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
// $("#wrapper").after(modal);
// var hintText = "شما برنده شدید.";
        $.ajax({
            method: "POST",
            url: window.location.protocol + "//" + window.location.hostname + "/user/me",
            data: {_token: localStorage.getItem("token")},
            success: function (result) {
                if (result.result) {
                    $.ajax({
                        method: "POST",
                        url: window.location.protocol + "//" + window.location.hostname + "/record",
                        data: {_token: localStorage.getItem("token")},
                        success: function (result) {
                            if (result.result) {
                                $("#yourRating").text(result.yourRating);
                            }
                        },
                    });//get user rank

                    if (user._id != winner._id) {
                        if (result.data.user.easyRemainedLife <= 0) {

                            var modal__loser = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"  id="get_free_charge"></a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                            $("#wrapper").after(modal__loser);
                            $(".user-modal").addClass('loser-modal');
                            $(".user-modal .user-msg").text("باختی");
                            $(".user-modal .modal-icon").attr("src", "/images/loser.png");
                            $(".btn-next-game").preventDefault;
                            $(".btn-next-game").html('دریافت 5 جان رایگان');


                            // $(".btn-next-game").html('<i class="fa fa-heart heartbeat modal-heart"></i>جان بگیر')
                            //     .attr("href", "/charge");
                        } else {
                            var modal = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"></a></div><div class="text-center"><a href="/games" type="button" class="btn btn-gray btn-cancel">بی خیال</a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                            $("#wrapper").after(modal);
                            $(".user-modal").addClass('loser-modal');
                            $(".user-modal .user-msg").text("باختی");
                            $(".user-modal .modal-icon").attr("src", "/images/loser.png")
                            $(".btn-next-game").html('دست بعدی')
                                .attr("href", "#/").attr("onclick", "refresh()");
                        }
                    } else if(user._id == winner._id) {
                        var modal = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"></a></div><div class="text-center"><a href="/games" type="button" class="btn btn-gray btn-cancel">بی خیال</a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                        $("#wrapper").after(modal);
                        $(".user-modal").addClass('winner-modal');
                        $(".user-modal .modal-icon").attr("src", "/images/winner.png");
                        $(".user-modal .user-msg").text("بردی");
                        $(".btn-next-game").html('دست بعدی')
                            .attr("href", "#/").attr("onclick", "refresh()");
                    }


                    $("#easyRemainedLife").text(result.data.user.easyRemainedLife);
                    $("#winsCount").text(result.data.user.winsCount);
                    $("#lossCount").text(result.data.user.playsCount - result.data.user.winsCount);
                    if (message) {
                        var msg = message[user._id];
                        $(".user-info").after('<p class="server-msg">' + msg + '</p>');
                    }
                    setTimeout(function () {
                        $(".user-modal").modal('show');
                    }, 2000);//set 2s delay for display modal
                }
            },
        });

// $.toast({
//     heading: '<p class="text-right">' + hintText + '<br/>' + toast_title + '</p> ',
//     text: '<p class="text-right"><a class="btn btn-primary" onclick="refresh()">بازی مجدد</a> <a class="btn btn-primary" href="/games">صفحه بازی ها</a></p>',
//     showHideTransition: 'fade',
//     hideAfter: false,
//     position: 'bottom-right',
//     allowToastClose: false
// });
        return false;
    }
    else{

    }


}


function placeMarker(socket, xoBtn, x, y) {
    // xoBtn.text($('span#xo_marker').text());
    var marker = $('#xo_marker').text();
    //console.log (marker);
    if (marker == 'o') {
        xoBtn.addClass("fa-circle-o");
    } else {
        xoBtn.addClass("fa-close");
    }
    xoBtn.removeClass("effect");
    socket.emit('xo_placeMarker', {'x': x, 'y': y});
}
