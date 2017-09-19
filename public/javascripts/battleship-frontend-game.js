

//===================================================================================
//============================== FUNCTIONS OF BATTLESHIP GAME =======================
//===================================================================================


function tableArrange(data) {
    var rows=data.rows;
    var cols=data.cols;
    var ships=data.ships;
    var timeToPlay=data.timeToPLay;

    var tableBoard="<div class='board'><table><tbody>";
    for(var i = 1;i<=rows;i++){
        tableBoard+= '<tr>';
        for(var j = 1;j<=cols;j++){
            tableBoard+='<td class="table-cell-'+j+' ui-droppable" data-cell-pos-x="'+j+'" data-cell-pos-y="'+i+'"></div></td>';
        }
        tableBoard+='</tr>';
    }
    tableBoard+="</tbody></table></div>";



    return (tableBoard);
    // console.log (table);


}

function droppable() {
    $("td").droppable({
        drop:function (event,ui) {

            var shipClass= ui.draggable;
            var x = $(this).attr("data-cell-pos-x");
            var y = $(this).attr("data-cell-pos-y");

            if(x == "1"){
                x=1
            }
            if(x == "2"){
                x=2
            }
            if(x =="3"){
                x=3
            }
            if(x =="4"){
                x=4
            }
            if(x =="5"){
                x=5
            }
            if(x =="6"){
                x=6
            }

            if(x =="7"){
                x=7
            }
            if(x =="8"){
                x=8
            }
            if(x =="9"){
                x=9
            }
            if(x =="10"){
                x=10
            }

            //
            var xPlusOne=x+1;
            var xPlusTwo=x+2;
            var xPlusThree=x+3;
            var xPlusFour=x+4;
            var xminessOne=x-1;
            var xminesstwo=x-2;
            var xminessThree=x-3;
            var xminessFour=x-4;
            var yMiness=y-1;
            var yPlus=y+1;



            if ($(shipClass).hasClass("x-small-ship-drag-1")){
                $("tr").find("td[data-cell-pos-x="+x+"][data-cell-pos-y="+y+"]").addClass("highlight-xs-1");
            }
            if ($(shipClass).hasClass("x-small-ship-drag-2")){
                $("tr").find("td[data-cell-pos-x="+x+"][data-cell-pos-y="+y+"]").addClass("highlight-xs-2");
            }
            if ($(shipClass).hasClass("x-small-ship-drag-3")){
                $("tr").find("td[data-cell-pos-x="+x+"][data-cell-pos-y="+y+"]").addClass("highlight-xs-3");
            }
            if ($(shipClass).hasClass("x-small-ship-drag-4")){
                $("tr").find("td[data-cell-pos-x="+x+"][data-cell-pos-y="+y+"]").addClass("highlight-xs-4");
            }
            if ($(shipClass).hasClass("small-ship-drag-1")){
                $("tr").find("td[data-cell-pos-x="+x+"][data-cell-pos-y="+y+"]").addClass("highlight-s-1");
            }
            if ($(shipClass).hasClass("small-ship-drag-2")){
                $("tr").find("td[data-cell-pos-x="+x+"][data-cell-pos-y="+y+"]").addClass("highlight-s-2");
            }
            if ($(shipClass).hasClass("small-ship-drag-3")){
                $("tr").find("td[data-cell-pos-x="+x+"][data-cell-pos-y="+y+"]").addClass("highlight-s-3");
            }
            if ($(shipClass).hasClass("small-ship-drag-4")){
                $("tr").find("td[data-cell-pos-x="+x+"][data-cell-pos-y="+y+"]").addClass("highlight-s-4");
            }
            if ($(shipClass).hasClass("medium-ship-drag-1")){
                $("tr").find("td[data-cell-pos-x="+xminessOne+"][data-cell-pos-y="+y+"]").addClass("highlight-m-1");
            }
            if ($(shipClass).hasClass("medium-ship-drag-2")){
                $("tr").find("td[data-cell-pos-x="+xminessOne+"][data-cell-pos-y="+y+"]").addClass("highlight-m-2");
            }
            if ($(shipClass).hasClass("medium-ship-drag-3")){
                $("tr").find("td[data-cell-pos-x="+xminessOne+"][data-cell-pos-y="+y+"]").addClass("highlight-m-3");
            }
            if ($(shipClass).hasClass("large-ship-drag-1")){
                $("tr").find("td[data-cell-pos-x="+xminessOne+"][data-cell-pos-y="+y+"]").addClass("highlight-l-1");
            }


        },
        out:function (event,ui) {

            var shipClass= ui.draggable;

            if ($(shipClass).hasClass("x-small-ship-drag-1")) {
                $("td").removeClass("highlight-xs-1")
            }
            if ($(shipClass).hasClass("x-small-ship-drag-2")) {
                $("td").removeClass("highlight-xs-2")
            }
            if ($(shipClass).hasClass("x-small-ship-drag-3")) {
                $("td").removeClass("highlight-xs-3")
            }
            if ($(shipClass).hasClass("x-small-ship-drag-4")) {
                $("td").removeClass("highlight-xs-4")
            }
            if ($(shipClass).hasClass("small-ship-drag-1")) {
                $("td").removeClass("highlight-s-1")
            }
            if ($(shipClass).hasClass("small-ship-drag-2")) {
                $("td").removeClass("highlight-s-2")
            }
            if ($(shipClass).hasClass("small-ship-drag-3")) {
                $("td").removeClass("highlight-s-3")
            }
            if ($(shipClass).hasClass("small-ship-drag-4")) {
                $("td").removeClass("highlight-s-4")
            }
            if ($(shipClass).hasClass("medium-ship-drag-1")) {
                $("td").removeClass("highlight-m-1")
            }
            if ($(shipClass).hasClass("medium-ship-drag-2")) {
                $("td").removeClass("highlight-m-2")
            }
            if ($(shipClass).hasClass("medium-ship-drag-3")) {
                $("td").removeClass("highlight-m-3")
            }
            if ($(shipClass).hasClass("large-ship-drag-1")) {
                $("td").removeClass("highlight-l-1")
            }

        }


    });
}



//===================================================================================
//============================== MAIN SETTING OF BATTLESHIP GAME ====================
//===================================================================================

    $("[class*='x-small-ship-drag']").draggable({
        snap:"td",
        snapMode :"inner",
        revert: 'invalid',
        stop: function(){
            $(this).draggable('option','revert','invalid');
        },
        containment:".board"

    });
    $("[class*='small-ship-drag']").draggable({
        snap:"td",
        snapMode :"inner",
        revert: 'invalid',
        stop: function(){
            $(this).draggable('option','revert','invalid');
        },
        containment:".board"

    });
    $("[class*='medium-ship-drag']").draggable({
        snap:"td",
        snapMode :"inner",
        revert: 'invalid',
        stop: function(){
            $(this).draggable('option','revert','invalid');
        },
        containment:".board"

    });
    $("[class*='large-ship-drag']").draggable({
        snap:"td",
        snapMode :"inner",
        revert: 'invalid',
        stop: function(){
            $(this).draggable('option','revert','invalid');
        },
        containment:".board"


    });



    $('.x-small-ship').droppable({
        tolerance: 'fit'
    });

    $(".x-small-ship").droppable({
        greedy: true,
        tolerance: 'touch',
        drop: function(event,ui){
            ui.draggable.draggable('option','revert',true);
        }
    });
    $('.small-ship').droppable({
        tolerance: 'fit'
    });

    $(".small-ship").droppable({
        greedy: true,
        tolerance: 'touch',
        drop: function(event,ui){
            ui.draggable.draggable('option','revert',true);
        }
    });

    $('.medium-ship').droppable({
        tolerance: 'fit'
    });

    $(".medium-ship").droppable({
        greedy: true,
        tolerance: 'touch',
        drop: function(event,ui){
            ui.draggable.draggable('option','revert',true);
        }
    });

    $('.large-ship').droppable({
        tolerance: 'fit'
    });

    $(".large-ship").droppable({
        greedy: true,
        tolerance: 'touch',
        drop: function(event,ui){
            ui.draggable.draggable('option','revert',true);
        }
    });

    function arrangeDone() {


        var shipArr = [];

        $("[class*='highlight']").each(function () {
            var posX = $(this).data().cellPosX;
            var posY = $(this).data().cellPosY;
            var shipSize = $(this).context.className.split(" ")[2];

            if (shipSize == "highlight-s-1" || shipSize == "highlight-s-2" || shipSize == "highlight-s-3" || shipSize == "highlight-s-4") {
                shipSize = 2;
            }
            if (shipSize == "highlight-xs-1" || shipSize == "highlight-xs-2" || shipSize == "highlight-xs-3" || shipSize == "highlight-xs-4") {
                shipSize = 1
            }
            if (shipSize == "highlight-m-1" || shipSize == "highlight-m-2" || shipSize == "highlight-m-3") {
                shipSize = 3
            }
            if (shipSize == "highlight-l-1") {
                shipSize = 4
            }

            var horizontal = true;
            shipArr.push({i: posX, j: posY, size: shipSize, hits: 0, horizontal: horizontal});
        });

        if (shipArr.length == 12) {
            // console.log("done");
            // console.log(shipArr);
            var shipObj = {rows: 10, cols: 10, ships: shipArr};
            return shipObj;
        }
        else {
            alert("لطفا تمام کشتی ها را بچینید")
        }


    }
