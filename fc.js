		var paused;
        var speed = 500;
        var timerSpeed = 2000;
        var time = 0;
        var computerContinue = false;
        var compResumeCoord;
        var homeMovesCount = 0;
        var awayMovesCount = 0;

        function end()
        {
            paused = true;
        }

        function changeSpeed(s){
            speed = s;
        }
          
        function changeGrid(id){
            $("#gr").attr("src","zabava/gird"+id+".png");
        }

        $.fn.soccer = function (options) {
            var opts = $.extend({}, { width: 360, height: 510, step: 30, homeComputer: true, homeUI: 0, awayComputer: true, awayUI: 0 }, options);
            $(this).click(onClick);

            var context;
            var allCoord = {};
            var points = [];
            var lastCoord;
            var isRobotTurn;
            var availableTurns = [];
            var gameOver = false;
            var allPaths;
            var traversion = 0;
            var chosenNode;
            var level = -1;
            var teamHomeTurn = true;
            var movementCount = 0;
            var timerMovements = 0;

            var drawingCanvas = document.getElementById('background');
            var drawingCanvas2 = document.getElementById('playground');
            var ball = document.getElementById("ball");
            var ball2 = document.getElementById("ball2");
            var goalTopNet = document.getElementById("goalTopNet");
            var goalBottomNet = document.getElementById("goalBottomNet");


            if (drawingCanvas.getContext) {
                if (opts.homeComputer)
                    isRobotTurn = true;
                context = drawingCanvas.getContext('2d');
                context2 = drawingCanvas2.getContext('2d');
                start(null);
            }

            function onBlur() {
                paused = true;
            };
            function onFocus() {
                if (gameOver || !isRobotTurn)
                    return;
                paused = false;
                if (computerContinue) {
                    computerContinue = false;
                    computerPlay(compResumeCoord);
                }
            };

            if (/*@cc_on!@*/false) {
                document.onfocusin = onFocus;
                document.onfocusout = onBlur;
            } else {
                window.onfocus = onFocus;
                window.onblur = onBlur;
            }



            function start(coord) {
                initField();
                allCoord = {};
                points = [];
                if (coord == null) {
                    showEmotions("me", "potlesk");
                    coord = [185, 275];
                }
                lastCoord = coord;
                drawStartPoint(coord);
                context.strokeStyle = "#000000";
                points[lastCoord] = 1;

                if (opts.homeComputer && opts.awayComputer) {
                    isRobotTurn = true;
                }

                if (isRobotTurn) {
                    setTimeout(function () { computerPlay(lastCoord); }, 1000);

                }
            }            

            function onClick(e) {
                if (isRobotTurn || gameOver)
                    return;

                var x = Math.floor((e.pageX - $("#background").offset().left) / 10);
                var y = Math.floor((e.pageY - $("#background").offset().top) / 10);
                if (y == 5)
                    y = 3;
                else if (y >= 49)
                    y = 51;

                //kliklo se na vertex
                if (x * 10 % opts.step < 12 && y * 10 % opts.step < 12) {

                    coord = requestedCoord(x, y);
                    //alert(coord[0] + ", " + coord[1]);
                    playerMoves(coord);
                }
                return false;
            }

            function playerMoves(coord) {
                if (canMoveTo(coord)) {

                    if (coord[1] <= 60) {
                        if (coord[0] == 185) {
                            context2.clearRect(lastCoord[0] - 8, lastCoord[1] - 8, 18, 18);
                            drawBall(coord[0] - 8, coord[1] - 8);
                            goalForAway();
                            return;
                        }
                        else
                            return;
                    }
                    else if (coord[1] >= 490) {
                        if (coord[0] == 185) {
                            context2.clearRect(lastCoord[0] - 8, lastCoord[1] - 8, 18, 18);
                            drawBall(coord[0] - 8, coord[1] - 8);
                            goalForHome();
                            return;
                        }
                        else
                            return;
                    }

                    if (!canMoveAround(coord))
                        eraseField(coord);

                    movementCount++;
                    if (++timerMovements == 4) {
                        timerMovements = 0;
                        $("#timer").text(++time + " min.");
                    }

                    context2.clearRect(lastCoord[0] - 8, lastCoord[1] - 8, 18, 18);

                    moveBallTo(coord);
                    if (!canMoveNext(coord)) {
                        moveEnd(false);
                        teamHomeTurn = !teamHomeTurn;
                        drawBall(coord[0] - 8, coord[1] - 8);
                        allCoord[lastCoord + "," + coord] = 1;
                        points[coord] = 1;
                        lastCoord = coord;

                        if ((teamHomeTurn && opts.homeComputer) || (!teamHomeTurn && opts.awayComputer)) {
                            isRobotTurn = true;
                            setTimeout(function () { computerPlay(lastCoord); }, 300);
                        }
                        else
                            isRobotTurn = false;

                    }
                    else {
                        drawBall(coord[0] - 8, coord[1] - 8);
                        allCoord[lastCoord + "," + coord] = 1;
                        points[coord] = 1;
                        lastCoord = coord;
                    }
                }
            }

            var scoreHome = 0;
            var scoreAway = 0;

            //gol nahore
            function goalForHome() {
                showEmotions("he", "x");
                context2.drawImage(goalBottomNet, 153, 484);
                $("#homeScore").text(++scoreHome);
                gameOver = true;
                resetGame(false);
            }

            //gol dole
            function goalForAway() {
                showEmotions("ae", "x");
                context2.drawImage(goalTopNet, 153, 27);
                $("#awayScore").text(++scoreAway);
                gameOver = true;
                resetGame(true);
            }

            function resetGame(isGoalForHome) {
                teamHomeTurn = isGoalForHome;
                if ((isGoalForHome && opts.awayComputer) || (!isGoalForHome && opts.homeComputer))
                    isRobotTurn = false;
                else
                    isRobotTurn = true;

                setTimeout(function () {
                    drawingCanvas.width = drawingCanvas.width;
                    drawingCanvas2.width = drawingCanvas2.width;
                    gameOver = false;
                    start(null);
                }, 2000);
            }


            function traverse(node) {
                node.next = [];
                getAvailableTurnsComp(node);

                for (var o in node.next) {
                    if (typeof node.next[o] == 'undefined')
                        continue;

                    if (node.next[o].canMoveNext) {
                        node.pathTo = node.next[o];
                        if (traversion++ < 10000)
                            traverse(node.next[o]);
                    }
                }
            }

            function computerPlay(coordFrom) {
                if (gameOver)
                    return;
                else if (paused) {
                    computerContinue = true;
                    compResumeCoord = coordFrom;
                    return;
                }

                level = -1;
                traversion = 0;
                allPaths = {};
                allPaths = coordFrom;
                allPaths.canMoveNext = true;
                allPaths.level = 0;
                traverse(allPaths);

                if (allPaths.length == 0) {
                    eraseField(lastCoord);
                    return;
                }

                bestX = 10000;
                bestY = teamHomeTurn ? 0 : 1000;
                bestyCoord = [];

                var rand = Math.floor(Math.random() * 100);
                var ui = 0;

                if (teamHomeTurn && opts.homeComputer)
                    ui = opts.homeUI;
                else if (!teamHomeTurn && opts.awayComputer)
                    ui = opts.awayUI;

                strategyIndex = 200 - rand - ui;

                if (strategyIndex > 120) {
                    moveBallToComp(allPaths);
                }
                else if (strategyIndex > 50) {
                    traverseResult(allPaths);
                    getRandomBestFromY();
                    moveBallNode(chosenNode, 1);
                }
                else {
                    traverseResult(allPaths);
                    getBestFromBestY();
                    moveBallNode(chosenNode, 1);
                }
            }

            var bestX, bestY;
            var bestyCoord = [];

            function traverseResult(node) {
                if ((teamHomeTurn && !node.canMoveNext && node[1] >= bestY) || (!teamHomeTurn && !node.canMoveNext && node[1] <= bestY)) {
                    if (bestY != node[1])
                        bestyCoord = [];
                    bestY = node[1];
                    bestyCoord[bestyCoord.length] = node;
                }
                if (node.next != null) {
                    for (var i = 0; i < node.next.length; i++) {
                        traverseResult(node.next[i]);
                    }
                }
            }
            function getRandomBestFromY() {
                chosenNode = bestyCoord[Math.floor(Math.random() * bestyCoord.length)];
            }

            function getBestFromBestY() {
                chosenNode = bestyCoord[0];
                var bestXb = bestyCoord[0][0];

                for (var i = 0; i < bestyCoord.length; i++) {
                    if ((!teamHomeTurn && bestyCoord[i][1] > 240) || (teamHomeTurn && bestyCoord[i][1] < 180)) {
                        if (bestyCoord[i][0] > 185 && bestXb < bestyCoord[i][0]) {
                            bestXb = bestyCoord[i][0];
                            chosenNode = bestyCoord[i];
                        }
                        else if (bestyCoord[i][0] <= 185 && bestXb >= bestyCoord[i][0]) {
                            bestXb = bestyCoord[i][0];
                            chosenNode = bestyCoord[i];
                        }
                    }
                    else if (Math.abs(bestyCoord[i][0] - 186) <= bestX) {
                        bestX = Math.abs(bestyCoord[i][0] - 185);
                        chosenNode = bestyCoord[i];
                    }
                }
            }

            function moveBallNode(to, lvl) {
                if (!to) {
                    eraseField(lastCoord);
                    return;
                }

                if (to.parent != null) {
                    moveBallNode(to.parent, (lvl + 1));
                    setTimeout(function () { moveBall(to); }, to.level * speed);
                }
            }

            function ballMovedCallback() {
                if ((teamHomeTurn && opts.homeComputer) || (!teamHomeTurn && opts.awayComputer)) {
                    computerPlay(lastCoord);
                }
                else {
                    isRobotTurn = false;
                }
            }

            function moveBall(node) {
                movementCount++;
                if (++timerMovements == 4) {
                    timerMovements = 0;
                    $("#timer").text(++time + " min.");
                }
                var fromTo = node.pathFromTo;
                context.beginPath();
                context.moveTo(fromTo[0], fromTo[1]);
                context.lineTo(fromTo[2], fromTo[3]);
                context.stroke();
                context2.clearRect(fromTo[0] - 8, fromTo[1] - 8, 18, 18);
                drawBall(fromTo[2] - 8, fromTo[3] - 8);
                lastCoord = [fromTo[2], fromTo[3]];
                points[lastCoord] = 1;
                allCoord[fromTo[0] + "," + fromTo[1] + "," + fromTo[2] + "," + fromTo[3]] = 1;

                if (lastCoord[1] < 36 && lastCoord[0] == 185) {
                    compDrawLastBall();
                    goalForAway();
                    return;
                }
                else if (lastCoord[1] > 514 && lastCoord[0] == 185) {
                    compDrawLastBall()
                    goalForHome();
                    return;
                }

                if (!node.canMoveNext) {
                    moveEnd(true);
                    teamHomeTurn = !teamHomeTurn;
                    compDrawLastBall();
                    setTimeout(function () { ballMovedCallback(); }, speed);
                }

            }

            function moveBallToComp(node) {
                movementCount++;
                if (++timerMovements == 4) {
                    timerMovements = 0;
                    $("#timer").text(++time + " min.");
                }
                context.beginPath();
                context.moveTo(node[0], node[1]);
                if (!node.next) {
                    moveEnd(true);
                    teamHomeTurn = !teamHomeTurn;
                    compDrawLastBall();
                    setTimeout(function () { ballMovedCallback(); }, speed);
                    return;
                }
                var rand = Math.floor(Math.random() * node.next.length);

                if (!node.next[rand]) {
                    eraseField(lastCoord);
                    return;
                }

                context.lineTo(node.next[rand][0], node.next[rand][1]);
                context.stroke();
                context2.clearRect(node[0] - 8, node[1] - 8, 18, 18);
                drawBall(node.next[rand][0] - 8, node.next[rand][1] - 8);
                lastCoord = [node.next[rand][0], node.next[rand][1]];
                points[lastCoord] = 1;
                allCoord[lastCoord + "," + node] = 1;

                if (lastCoord[1] < 36 && lastCoord[0] == 185) {
                    compDrawLastBall();
                    goalForAway();
                    return;
                }
                else if (lastCoord[1] > 514 && lastCoord[0] == 185) {
                    compDrawLastBall();
                    goalForHome();
                    return;
                }

                if (node.next[rand].canMoveNext) {
                    setTimeout(function () { moveBallToComp(node.next[rand]) }, speed);
                }
                else {
                    moveEnd(true);
                    teamHomeTurn = !teamHomeTurn;
                    compDrawLastBall();
                    setTimeout(function () { ballMovedCallback(); }, speed);
                }
            }

            function compDrawLastBall() {
                context2.clearRect(lastCoord[0] - 8, lastCoord[1] - 8, 18, 18);
                drawBall(lastCoord[0] - 8, lastCoord[1] - 8);
            }

            function canMoveAround(coord) {
                var k = 0;
                for (var i = -opts.step; i <= opts.step; i += opts.step) {
                    for (var j = -opts.step; j <= opts.step; j += opts.step) {
                        if (i == 0 && j == 0)
                            continue;

                        var toCoord = [coord[0] + i, coord[1] + j];

                        if (toCoord[0] < 0 || toCoord[0] > 366 || toCoord[1] < 36 || toCoord[1] > 511 || (toCoord[0] == lastCoord[0] && toCoord[1] == lastCoord[1]))
                            continue;

                        if (typeof allCoord[coord + "," + toCoord] == 'undefined' && typeof allCoord[toCoord + "," + coord] == 'undefined' &&
                            Math.abs(coord[0] - toCoord[0]) <= 50 && Math.abs(coord[1] - toCoord[1]) <= 50)
                            return true;
                    }
                }
                return false;
            }

            function getAvailableTurnsComp(node) {
                var k = 0;
                for (var i = -opts.step; i <= opts.step; i += opts.step) {
                    for (var j = -opts.step; j <= opts.step; j += opts.step) {
                        if (i == 0 && j == 0)
                            continue;

                        var index = node.next.length;
                        node.next[index] = [node[0] + i, node[1] + j];
                        node.next[index].parent = node;
                        node.next[index].pathFromTo = [node[0], node[1], node[0] + i, node[1] + j];
                        node.next[index].pathToFrom = [node[0] + i, node[1] + j, node[0], node[1]];
                        node.next[index].level = node.next[index].parent.level + 1;

                        if (canMoveToComp(node.next[index])) {
                            node.next[index].canMoveNext = canMoveNextComp(node.next[index]);
                        }
                        else {
                            node.next.splice(index, 1);
                        }
                    }
                }
            }

            function canMoveNextComp(node) {
                var canMove = false;
                if (typeof points[node] != 'undefined')
                    canMove = true;
                else if (typeof allCoord[node.parent[0] + "," + node[1] + "," + node[0] + "," + node.parent[1]] != 'undefined' ||
                typeof allCoord[node[0] + "," + node.parent[1] + "," + node.parent[0] + "," + node[1]] != 'undefined')
                    canMove = true;
                if (canMove) {
                    var currNode = node;
                    while (currNode.parent != null) {
                        if (currNode.pathFromTo[currNode.parent[0], currNode.parent[1], currNode[0], currNode[1]] == 1 ||
                        currNode.pathFromTo[currNode[0], currNode[1], currNode.parent[0], currNode.parent[1]] == 1) {
                            return false;
                        }
                        currNode = currNode.parent;
                    }
                    return true;
                }
                return canMove;
            }

            function canMoveToComp(node) {
                if (node[0] < 0 || node[0] > 366)
                    return false;
                if (node[1] < 36) {
                    return node[0] == 185;
                }
                else if (node[1] >= 515) {
                    return node[0] == 185;
                }

                if (typeof allCoord[node[0] + "," + node[1] + "," + node.parent[0] + "," + node.parent[1]] == 'undefined'
                        && typeof allCoord[node.parent[0] + "," + node.parent[1] + "," + node[0] + "," + node[1]] == 'undefined') {
                    var currNode = node;
                    while (currNode.parent != null) {
                        if (compare(node.pathFromTo, currNode.parent.pathFromTo) ||
                            compare(node.pathFromTo, currNode.parent.pathToFrom)) {

                            return false;
                        }
                        currNode = currNode.parent;
                    }
                    return true;
                }
                else {
                    return false;
                }
            }

            function compare(nodeFrom, nodeTo) {
                if (nodeFrom == null || nodeTo == null)
                    return false;
                return (nodeFrom[0] == nodeTo[0] && nodeFrom[1] == nodeTo[1] && nodeFrom[2] == nodeTo[2] && nodeFrom[3] == nodeTo[3]);
            }


            function canMoveTo(coord) {
                return (typeof allCoord[coord + "," + lastCoord] == 'undefined' && typeof allCoord[lastCoord + "," + coord] == 'undefined' &&
                    Math.abs(coord[0] - lastCoord[0]) <= 50 && Math.abs(coord[1] - lastCoord[1]) <= 50);
            }


            function moveBallTo(coord) {
                context.beginPath();
                context.moveTo(lastCoord[0], lastCoord[1]);
                context.lineTo(coord[0], coord[1]);
                context.stroke();
            }

            function canMoveNext(coord) {
                if (typeof points[coord] != 'undefined')
                    return true;
                else if (typeof allCoord[coord[0] + "," + lastCoord[1] + "," + lastCoord[0] + "," + coord[1]] != 'undefined' ||
                typeof allCoord[lastCoord[0] + "," + coord[1] + "," + coord[0] + "," + lastCoord[1]] != 'undefined')
                    return true;
                else
                    return false;
            }

            function requestedCoord(x, y) {
                xClean = Math.round(x * 10 / opts.step) * opts.step + 5;
                yClean = Math.round(y * 10 / opts.step) * opts.step + 5;
                return [xClean, yClean];
            }

            function drawGrid() {
                context.strokeStyle = "#000000";
                context.beginPath();
                context.lineWidth = 1;
                for (var x = 5; x < opts.width + opts.step; x += opts.step) {

                    context.moveTo(x, 5);
                    context.lineTo(x, opts.height + 5);

                    context.stroke();


                }
                for (var x = 5; x < opts.height + opts.step; x += opts.step) {

                    context.moveTo(5, x);
                    context.lineTo(opts.height + 5, x);

                    context.stroke();
                }
            }

            function drawBall(x, y) {
                if (teamHomeTurn)
                    context2.drawImage(ball, x, y);
                else
                    context2.drawImage(ball2, x, y);
            }

            function drawStartPoint(coord) {
                drawBall(coord[0] - 8, coord[1] - 8);
            }

            function initField() {

                context2.font = "bold 11px 'tahoma'";
                context2.fillStyle = "#F2F2F2";
                context2.textAlign = "center";
                context2.fillText(homeTeamName, 180, 30);
                context2.fillText(awayTeamName, 180, 530);

            }

            function showEmotions(elem, smiley) {
                $("#" + elem).html($("#s" + smiley));
                $("#s" + smiley).show();
                setTimeout(function () { $("#s" + smiley).hide(); }, 3000);
            }

            function moveEnd(isComp) {
                if (movementCount > 10)
                    showEmotions(teamHomeTurn ? "he" : "ae", "nahoru");

                if (teamHomeTurn)
                    homeMovesCount += movementCount;
                else
                    awayMovesCount += movementCount;

                $("#hdm").text(Math.round(100 / (homeMovesCount + awayMovesCount) * homeMovesCount));
                $("#adm").text(Math.round(100 / (homeMovesCount + awayMovesCount) * awayMovesCount));
                $("#hpri").text(homeMovesCount);
                $("#apri").text(awayMovesCount);

                movementCount = 0;
                if (time >= 90) {
                    $(".score").addClass("gameover");
                    gameOver = true;

                    //$("#saved").text("výsledek uložen");
                }

            };

            var homeRoh = 0;
            var awayRoh = 0;
            var homeZak = 0;
            var awayZak = 0;

            function eraseField(coord) {
                if (teamHomeTurn)
                    $("#hzak").text(++homeZak);
                else
                    $("#azak").text(++awayZak);

                if (coord[1] == 485 && (coord[0] == 5 || coord[0] == 365)) {
                    $("#hroh").text(++homeRoh);
                }
                else if (coord[1] == 65 && (coord[0] == 5 || coord[0] == 365)) {
                    $("#aroh").text(++awayRoh);
                }


                setTimeout(function () {
                    drawingCanvas.width = drawingCanvas.width;
                    drawingCanvas2.width = drawingCanvas2.width;
                    start(lastCoord);
                }, 1000);
            }

        };
        
