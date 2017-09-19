var myColor, userBlueId, userRedId;
function creategame(data, socket) {
    var gamerTurn = data.gamerTurn;
    var user = JSON.parse(localStorage.getItem('user'));
    var m = data.board.height - 1;
    var n = data.board.width - 1;
    var hedge = data.board.hedges;
    var vedge = data.board.vedges;
    var yourColor, myScore, yourScore;
    var winner = data.winner;
    var message = data.message;
    var timeToPLay = data.timeToPLay;
    var myName, yourName;
    var equal = data.isGameDraw;
    userBlueId = data.userBlue._id;
    userRedId = data.userRed._id;

    // check color
    if (user._id == data.userBlue._id) {
        myColor = "#56C5D0";
        yourColor = "#ff9933";
        myName = data.userBlue.nickname;
        yourName = data.userRed.nickname;
    } else {
        myColor = "#ff9933";
        yourColor = "#56C5D0";
        myName = data.userRed.nickname;
        yourName = data.userBlue.nickname;
    }

    if (equal) {
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

                        var modal = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game" id="id="get_free_charge""></a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                        $("#wrapper").after(modal);
                        $(".btn-next-game").html('دریافت پنج جان رایگان')
                            .attr("href", '/#').attr("onclick", "refresh()");
                        $(".user-modal").addClass('loser-modal');
                        $(".user-modal .user-msg").text("مساوی");
                        $(".user-modal .modal-icon").attr("src", "/images/Equal.png")


                    } else {
                        var modal = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"></a></div><div class="text-center"><a href="/games" type="button" class="btn btn-gray btn-cancel">بی خیال</a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                        $("#wrapper").after(modal);
                        $(".btn-next-game").html('دست بعدی')
                            .attr("href", "#/").attr("onclick", "refresh()");
                        $(".user-modal").addClass('loser-modal');
                        $(".user-modal .user-msg").text("مساوی");
                        $(".user-modal .modal-icon").attr("src", "/images/Equal.png")
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
            }
        });

        return false;
    }

    // check the winner
    if (winner) {
        // console.log(data);
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
        // console.log("winner",winner);
        // console.log("myName",myName);
        setTimeout(function () {
            $("#dot_board_game *").remove();
            $("#loading_title").remove();
            // $("#loading .moliran_loader").remove();
        }, 2000);
        $('.timer *').remove();
        $("#loading").hide();
        // socket.disconnect();
        $("." + winner._id).addClass("winner-cards");
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

                            var modal__loser = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"  id="get_free_charge"></a></div><div class="text-center"><a href="/games" type="button" class="btn btn-gray btn-cancel">بی خیال</a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                            $("#wrapper").after(modal__loser);
                            $(".user-modal").addClass('loser-modal');
                            $(".user-modal .user-msg").text("باختی");
                            $(".user-modal .modal-icon").attr("src", "/images/loser.png");
                            $(".btn-next-game").preventDefault;
                            $(".btn-next-game").html('دریافت 5 جان رایگان');


                        } else {
                            var modal = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"></a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                            $("#wrapper").after(modal);
                            $(".btn-next-game").html('دست بعدی')
                                .attr("href", "#/").attr("onclick", "refresh()");
                            $(".user-modal").addClass('loser-modal');
                            $(".user-modal .user-msg").text("باختی");
                            $(".user-modal .modal-icon").attr("src", "/images/loser.png")
                        }
                    } else {
                        var modal = '<!--START winner/loser modal --><div class="modal fade user-modal" tabindex="-1" role="dialog" data-backdrop="static"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><img src="" class="modal-icon"></div><div class="modal-body"><p class="user-msg"></p><div class="user-info"><p class="user-info__score"><span>جان باقیمانده:</span><span class="pull-left" id="easyRemainedLife"></span></p><p class="user-info__heart"><span>رتبه:</span><span class="pull-left" id="yourRating"></span></p><p class="user-info__total-score"><span>برد:</span><span class="pull-left" id="winsCount"></span></p><p class="user-info__rank"><span>باخت:</span><span class="pull-left" id="lossCount"></span></p></div></div><div class="modal-footer"><div class="text-center"><a href="/charge" type="button" class="btn btn-primary btn-next-game"></a></div><div class="text-center"><a href="/games" type="button" class="btn btn-gray btn-cancel">بی خیال</a></div></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal --><!--END winner/loser modal -->'
                        $("#wrapper").after(modal);
                        $(".user-modal").addClass('winner-modal');
                        $(".user-modal .user-msg").text("بردی");
                        $(".user-modal .modal-icon").attr("src", "/images/winner.png")
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
    } else {
        $("#dot_board_game *").remove();
    }

    if (timeToPLay > 0) {

        $('.timer *').remove();


        $('.timer').css({"top": 0})
            .circularCountDown({
                fontSize: 25,
                size: 85,
                fontColor: '#fff',
                colorCircle: 'white',
                background: '#00d6ff',
                reverseLoading: false,
                duration: {
                    seconds: timeToPLay
                }
            });
    }

    // check score
    for (i in data.board.scores) {
        if (i == user._id) {
            myScore = data.board.scores[i];
        } else {
            yourScore = data.board.scores[i];
        }
    }


    // check user turn
    var yourTurn = false;
    if (gamerTurn == user._id) {
        yourTurn = true;

    }
    if (!yourTurn) {
        $("#loading div h5").html("منتظر پاسخ حریف");
        $("#loading").fadeIn(100);

    } else {
        $("#loading").fadeOut(100);
    }


    // make board
    var dotAndBoxHTML = "";
    dotAndBoxHTML += "<table style='display: inline-block;direction: ltr; padding: 15px; background-color: #fff; border-radius: 3px;' bgcolor='#ffffff' border='0' cellpadding='0' cellspacing='0'><tr>";
    for (i = 0; i < m; i++) {
        for (j = 0; j < n; j++) {
            dotAndBoxHTML += "<td align=center><div class='black-dot'></div></td>";
            var hposition = "h" + "-" + i + "-" + j;
            dotAndBoxHTML += "<td align=center><a id='" + hposition + "' class='side hrow'><div class='inner_dot'></div></a></td>";
        }
        dotAndBoxHTML += "<td align=center><div class='black-dot'></div></td></tr><tr>";
        for (j = 0; j < n; j++) {
            var vposition = "v" + "-" + i + "-" + j;
            dotAndBoxHTML += "<td align=center><a id='" + vposition + "' class='side vrow'><div class='inner_dot'></div></a></td>";
            dotAndBoxHTML += "<td align=center><div id='" + i + "_" + j + "' class='block'></div></td>";
        }
        var vvposition = "v" + "-" + i + "-" + j;
        dotAndBoxHTML += "<td align=center><a id='" + vvposition + "' class='side vrow'><div class='inner_dot'></div></a></td></tr>";
    }
    for (j = 0; j < n; j++) {
        dotAndBoxHTML += "<td align=center><div class='black-dot'></div></td>";
        var hhposition = "h" + "-" + i + "-" + j;
        dotAndBoxHTML += "<td align=center><a id='" + hhposition + "' class='side hrow'><div class='inner_dot'></div></a></td>";
    }
    dotAndBoxHTML += "<td align=center><div class='black-dot'></div></td></tr>";
    dotAndBoxHTML += "</table>";
    dotAndBoxHTML += "<div class='score_wrapper'><div class='score_item' style='border-color: " + myColor + ";'><p class='score_name'>" + "من" + "</p><h2 id='you'> " + myScore + " </h2></div><div class='score_item' style='border-color: " + yourColor + ";'><p class='score_name'>" + yourName + "</p><h2 id='opponent'> " + yourScore + " </h2></div></div>";
    // dotAndBoxHTML += "<div class='turn-box'><div class='col-light text-center'><div class='light-bulb-box'><div id='light-bulb-opponent' class='light-bulb-opponent'></div></div><div class='light-bulb-box'><div id='light-bulb-me' class='light-bulb-me'></div></div></div><div class='col-person text-center'><div class='person-name-box'>" + yourName + "</div><div class='person-name-box'>" + "من" + "</div></div></div>";
    $('#dot_board_game').append(dotAndBoxHTML);

    // if (yourTurn) {
    //
    //     console.log("aaaa");
    //     $("#light-bulb-opponent").removeClass("light-bulb-opponent-active");
    //     $("#light-bulb-me").addClass("light-bulb-me-active");
    // } else {
    //     $("#light-bulb-opponent").addClass("light-bulb-opponent-active");
    //     $("#light-bulb-me").removeClass("light-bulb-me-active");
    // }


    checkLoop(hedge, vedge, m, n);
    checkBoxsWins(data.board.wins, myName, yourName);
    return myColor;


}


function checkBoxsWins(wins, myName, yourName) {
    // console.log(wins);
    // console.log("userRedId", userRedId)
    // console.log("userBlueId", userBlueId)
    if (typeof(myName)==='undefined') myName = "";
    if (typeof(yourName)==='undefined') yourName = "";
    for (var w1 = 0; w1 < wins.length; w1++) {
        for (var w = 0; w < wins[w1].length; w++) {
            if (wins[w1][w] == "r") {
                var idr = "#" + w1 + "_" + w;
                $(idr).css('background', "#ff9933").addClass(userRedId);
            } else if (wins[w1][w] == "b") {
                var idb = "#" + w1 + "_" + w;
                $(idb).css('background', "#56C5D0").addClass(userBlueId);
            }
        }
    }
}

function checkLoop(hedge, vedge, m, n) {
    for (var i = 0; i <= m; i++) {
        for (var j = 0; j <= n; j++) {
            if (hedge[i][j] == "b") {
                hmove(hedge, i, j);
            } else if (hedge[i][j] == "r") {
                hmove(hedge, i, j);
            }
        }
    }
    for (i = 0; i <= m; i++) {
        for (j = 0; j <= n; j++) {
            if (vedge[i][j] == "b") {
                vmove(vedge, i, j);
            } else if (vedge[i][j] == "r") {
                vmove(vedge, i, j);
            }
        }
    }
}

function hmove(hedge, i, j) {     //horizontal move by user
    if (hedge[i][j] !== 0) {
        sethedge(i, j);
    }
}

function sethedge(x, y) {      //Sets horizontal edge
    var id = "#h" + "-" + x + "-" + y + " > div";
    $(id).css('background-color', '#1b1b1b');
    $(id).addClass("done");
}

function vmove(vedge, i, j) {     //vertical move by user
    if (vedge[i][j] !== 0) {
        setvedge(i, j);
    }
}

function setvedge(x, y) {      //Sets vertical edge
    var id = "#v" + "-" + x + "-" + y + " > div";
    $(id).css('background-color', '#1b1b1b');
    $(id).addClass("done");
}

$(document).on('mouseover', 'a.side', function (e) {
    if ($(this).find('div').hasClass('done')) {
        return false;
    } else {
        $(this).find('div').css('background', myColor);
    }
});

$(document).on('mouseout', 'a.side', function (e) {
    if ($(this).find('div').hasClass('done')) {
        return false;
    } else {
        if (!$(this).hasClass('clicked')) {
            $(this).find('div').css('background', "white");
        }
    }
});