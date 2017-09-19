var flip_item;
var myColor;
function createBoard(data, socket) {
    // console.log(data);
    var gamerTurn = data.gamerTurn;
    var user = JSON.parse(localStorage.getItem('user'));
    var winner = data.winner;
    var message = data.message;
    var timeToPLay = data.timeToPLay;
    var myName, yourName, yourColor, myScore, yourScore;
    var equal=data.isGameDraw;


    if (equal){
        $.ajax({
            method: "POST",
            url: window.location.protocol+"//"+window.location.hostname+"/user/me",
            data: {_token: localStorage.getItem("token")},
            success: function (result) {
                if (result.result) {

                    $.ajax({
                        method: "POST",
                        url: window.location.protocol+"//"+window.location.hostname+"/record",
                        data: {_token: localStorage.getItem("token")},
                        success: function (result) {
                            if (result.result) {
                                $("#yourRating").text(result.yourRating);
                            }
                        },
                    });//get user rank

                        if (result.data.user.easyRemainedLife<=0) {
                            var modal__loser = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"  id="get_free_charge"></a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                            $("#wrapper").after(modal__loser);
                            $(".user-modal").addClass('loser-modal');
                            $(".user-modal .user-msg").text("مساوی");
                            $(".user-modal .modal-icon").attr("src", "/images/Equal.png");
                            $(".btn-next-game").preventDefault;
                            $(".btn-next-game").html('دریافت 5 جان رایگان');
                        }  else {
                        var modal = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"></a></div><div class="text-center"><a href="/games" type="button" class="btn btn-gray btn-cancel">بی خیال</a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                        $("#wrapper").after(modal);
                        $(".user-modal").addClass('equal-modal');
                        $(".user-modal .modal-icon").attr("src", "/images/Equal.png");
                        $(".user-modal .user-msg").text("مساوی");
                        $(".btn-next-game").html('دست بعدی')
                            .attr("href", "#/").attr("onclick","refresh()");
                    }
                    $("#easyRemainedLife").text(result.data.user.easyRemainedLife);
                    $("#winsCount").text(result.data.user.winsCount);
                    $("#lossCount").text(result.data.user.playsCount - result.data.user.winsCount);
                    if (message) {
                        var msg = message[user._id];
                        $(".user-info").after('<p class="server-msg">'+msg+'</p>');
                    }
                    setTimeout(function () {
                        $(".user-modal").modal('show');
                    }, 2000);//set 2s delay for display modal
                }
            },
        });
        return false;
    }

    // check the winner
    if (winner) {
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
        $("."+winner._id).addClass("winner-cards");
        setTimeout(function () {
            $("#card_board_game *").remove();
            $("#loading_title").remove();
            $("#loading .moliran_loader").remove();
        }, 2000);
        // console.log(winner);
        $('.timer *').remove();
        $("#opponent").parent().fadeOut();
        $("#loading").hide();
        // socket.disconnect();
        $.ajax({
            method: "POST",
            url: window.location.protocol+"//"+window.location.hostname+"/user/me",
            data: {_token: localStorage.getItem("token")},
            success: function (result) {
                if (result.result) {

                    $.ajax({
                        method: "POST",
                        url: window.location.protocol+"//"+window.location.hostname+"/record",
                        data: {_token: localStorage.getItem("token")},
                        success: function (result) {
                            if (result.result) {
                                $("#yourRating").text(result.yourRating);
                            }
                        },
                    });//get user rank
                    if (user._id != winner._id) {
                        if (result.data.user.easyRemainedLife<=0) {
                            var modal__loser = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"  id="get_free_charge"></a></div</div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                            $("#wrapper").after(modal__loser);
                            $(".user-modal").addClass('loser-modal');
                            $(".user-modal .user-msg").text("باختی");
                            $(".user-modal .modal-icon").attr("src", "/images/loser.png");
                            $(".btn-next-game").preventDefault;
                            $(".btn-next-game").html('دریافت 5 جان رایگان');
                        } else {
                            var modal = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"></a></div><div class="text-center"><a href="/games" type="button" class="btn btn-gray btn-cancel">بی خیال</a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                            $("#wrapper").after(modal);
                            $(".user-modal").addClass('loser-modal');
                            $(".user-modal .modal-icon").attr("src", "/images/loser.png")
                            $(".user-modal .user-msg").text("باختی");
                            $(".btn-next-game").html('دست بعدی')
                                .attr("href", "#/").attr("onclick","refresh()");
                        }
                    } else {
                        var modal = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"></a></div><div class="text-center"><a href="/games" type="button" class="btn btn-gray btn-cancel">بی خیال</a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                        $("#wrapper").after(modal);
                        $(".user-modal").addClass('winner-modal');
                        $(".user-modal .modal-icon").attr("src", "/images/winner.png")
                        $(".user-modal .user-msg").text("بردی");
                        $(".btn-next-game").html('دست بعدی')
                            .attr("href", "#/").attr("onclick","refresh()");
                    }
                    $("#easyRemainedLife").text(result.data.user.easyRemainedLife);
                    $("#winsCount").text(result.data.user.winsCount);
                    $("#lossCount").text(result.data.user.playsCount - result.data.user.winsCount);
                    if (message) {
                        var msg = message[user._id];
                        $(".user-info").after('<p class="server-msg">'+msg+'</p>');
                    }
                    setTimeout(function () {
                        $(".user-modal").modal('show');
                    }, 2000);//set 2s delay for display modal
                }
            },
        });
        return false;
    } else {
        $("#card_board_game *").remove();
    }// end winner IF

    if (timeToPLay > 0) {

        $('.timer *').remove();

        $('.timer').circularCountDown({
            fontSize: 35,
            size: 110,
            fontColor: '#fff',
            colorCircle: 'white',
            background: '#00d6ff',
            reverseLoading: false,
            duration: {
                seconds: timeToPLay
            }
        });
    }

    // check color
    if (user._id == data.gamer1._id) {
        myColor = "#56C5D0";
        yourColor = "#ff9933";
        myName = data.gamer1.nickname;
        yourName = data.gamer2.nickname;
    } else {
        myColor = "#ff9933";
        yourColor = "#56C5D0";
        myName = data.gamer2.nickname;
        yourName = data.gamer1.nickname;
    }

    // check score
    for (i in data.scores) {
        if (i == user._id) {
            myScore = data.scores[i];
        } else {
            yourScore = data.scores[i];
        }
    }

    // check user turn
    var yourTurn = false;
    if (gamerTurn == user._id) {
        yourTurn = true;
    }
    if (!yourTurn) {
        $("#loading div h5").html("منتظر پاسخ حریف");
        $("#loading").delay(800).fadeIn(100);
    } else {
        $("#loading").fadeOut(100);
    }


    // make game
    function setWidth() {
        var wrapper, windowWidth;
        windowWidth = $(window).innerWidth();
        if (windowWidth < 768) {
            wrapper = data.board.length * 74 + 'px';
            $("#card_board_game").css("width", wrapper);
            $('.flip-container, .front, .back').css('width', '70px');
            $('.flip-container, .front, .back').css('height', '80px');
            $('.flip-container').css('margin', '2px');
            $('#card_board_game .card').css('width', '70px');
            $('#card_board_game .card').css('height', '80px');
            $('.back > i').css('font-size', '45px');
            $('.back > i').css('margin', '20px auto');
        } else {
            wrapper = data.board.length * 80 + 'px';
            $("#card_board_game").css("width", wrapper);
            $('.flip-container, .front, .back').css('width', '70px');
            $('.flip-container, .front, .back').css('height', '75px');
            $('.flip-container').css('margin', '5px');
            $('#card_board_game .card').css('width', '70px');
            $('#card_board_game .card').css('height', '75px');
            $('.back > i').css('font-size', '30px');
            $('.back > i').css('margin', '23px auto');
        }
    }

    $(window).resize(function () {
        setWidth();
    });

    $("#card_board_game").append("<div class='score_wrapper'><div class='score_item' style='border-color: " + myColor + ";'><p class='score_name'>" + "من" + "</p><h2 id='you'>" + myScore + " </h2></div><div class='score_item' style='border-color: " + yourColor + ";'><p class='score_name'>" + yourName + "</p><h2 id='opponent'> " + yourScore + " </h2></div></div>");

    for (var i = 0; i < data.board.length; i++) {
        for (var j = 0; j < data.board[0].length; j++) {

            $("#card_board_game").append("<div class='flip-container'><div class='flipper card' id='elem-" + i + '-' + j + "'><div class='front'></div><div class='back'><i class='fa'></i></div></div></div>");

            var elem = "#elem-" + i + '-' + j;

            if (data.board[i][j].symbol === '') {
                $(elem + " > .front").addClass("null");
                if ($(elem + " > .front").hasClass("pending")) {
                    $(elem + " > .front").removeClass("pending");
                }
            } else {
                $(elem).parent().addClass("hover_no_animate");
                $(elem + " > .back").children("i").addClass(data.board[i][j].symbol);
                $(elem + " > .back").children("i").addClass("done");
                $(elem + " > .back").addClass(data.board[i][j].winnerId);
                // set flipperd card colors
                if (user._id == data.board[i][j].winnerId) {
                    $(elem + " > .back").css("background-color", myColor);
                } else {
                    $(elem + " > .back").css("background-color", yourColor);
                }
                $(elem + " > .front").addClass("pending");
            }

        }
    }




    var flippedElement;
    if (data.flip) {
        flippedElement = "#elem-" + data.flip.i + '-' + data.flip.j;
        $(flippedElement + " > .back").children("i").addClass(data.flip.symbol);
        $(flippedElement + " > .back").children("i").addClass("done");
        $(flippedElement + " > .back").addClass("pending");
        $(flippedElement + " > .back").removeClass("null");
        $(flippedElement).parent().addClass("hover");
        flip_item = data.flip;
    }

    if (data.flips) {
        for (i = 0; i < data.flips.length; i++) {
            flippedElement = "#elem-" + data.flips[i].i + '-' + data.flips[i].j;
            if (flip_item && flip_item.i == data.flips[i].i && flip_item.j == data.flips[i].j) {
                $(flippedElement + " > .back").children("i").addClass(data.flips[i].symbol);
                $(flippedElement + " > .back").children("i").addClass("done");
                $(flippedElement).parent().addClass("hover_no_animate");
            } else {
                $(flippedElement + " > .back").children("i").addClass(data.flips[i].symbol);
                $(flippedElement + " > .back").children("i").addClass("done");
                $(flippedElement + " > .back").addClass("pending");
                $(flippedElement + " > .back").removeClass("null");
                $(flippedElement).parent().addClass("hover");
            }
        }
        setTimeout(function () {
            for (i = 0; i < data.flips.length; i++) {
                flippedElement = "#elem-" + data.flips[i].i + '-' + data.flips[i].j;
                $(flippedElement + " > .back").children("i").removeClass(data.flips[i].symbol);
                $(flippedElement + " > .back").children("i").removeClass("done");
                $(flippedElement + " > .back").removeClass("pending");
                $(flippedElement + " > .back").addClass("null");
                $(flippedElement).parent().addClass("hover");
            }
        }, 1000)
    }

    if (!data.flip && !data.flips) {
        flip_item = null;
    }

    setWidth();



}
