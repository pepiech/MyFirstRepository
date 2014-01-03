soccer.leaguePage = function () {
    var elementsBound = false;
    var leagueTable;
    var leagueTableBody;
    var leagueNextMatch;
    var nextMatch;
    var resultMatch;
    var viewMatch;
    var playMatch;
    var leagueHolder;
    var leagueEmptyHolder;
    var leagueEnded;

    var leagueVisibility = function () {
        if (soccer.league.clubCount() == 0) {
            leagueHolder.hide();
            leagueEmptyHolder.show();
        }
        else {
            leagueHolder.show();
            leagueEmptyHolder.hide();
        }
    }

    var leagueHasEnded = function () {
        nextMatch.hide();
        resultMatch.hide();
        viewMatch.hide();
        playMatch.hide();
        leagueNextMatch.hide();
        leagueEnded.show();
    }

    var refreshUI = function () {
        leagueTableBody.html(soccer.league.getLeagueHtmlTable());
        if (soccer.duel.noMoreDuels()) {
            leagueHasEnded();
            return;
        }
        leagueNextMatch.html(soccer.duel.getCurrentDuelHtml());
        var currentDuel = soccer.duel.getCurrentDuel();
        if (currentDuel) {
            if (typeof currentDuel.resultHome == 'undefined') {
                nextMatch.hide();
                resultMatch.show();
            }
            else {
                nextMatch.show();
                resultMatch.hide();
            }
            if (currentDuel.homeId == soccer.gameLoop.getPlayerTeamId() || currentDuel.awayId == soccer.gameLoop.getPlayerTeamId())
                playMatch.show();
            else
                playMatch.hide();
            viewMatch.show();
        }
        else {
            nextMatch.hide();
            resultMatch.hide();
            viewMatch.hide();
            playMatch.hide();
        }
    }

    var bindElements = function () {
        if (elementsBound)
            return;
        leagueTable = $('#leagueTable');
        leagueTableBody = $('#leagueTableBody');
        leagueNextMatch = $('#leagueNextMatch');
        nextMatch = $('#nextMatch');
        resultMatch = $('#resultMatch');
        viewMatch = $('#viewMatch');
        playMatch = $('#playMatch');
        leagueHolder = $('#leagueHolder');
        leagueEmptyHolder = $('#leagueEmptyHolder');
        leagueEnded = $('#leagueEnded');

        $(resultMatch).bind("click", function () {
            var duel = soccer.duel.setCurrentDuelResult();
            soccer.league.updateTable(duel);
            refreshUI();
            resultMatch.hide();
            viewMatch.hide();
            playMatch.hide();
        });

        $(nextMatch).bind("click", function () {
            soccer.duel.proceedToNextDuel();
            refreshUI();
        });

        $('#viewMatch').bind("click", function () {
            $.mobile.changePage('#gamePage', {
                transition: 'slide',
                changeHash: false
            });


            $("#playground").soccer({ homeComputer: true, homeUI: 45, awayUI: 45 });
            $("#matchStart").hide();
        });

        $('#leagueRestart').bind("click", function () {
            soccer.duel.reset();
            soccer.league.reset();
            soccer.gameLoop.startGame();
            soccer.leaguePage.pageshow();
            leagueEnded.hide();
            leagueNextMatch.show();
        });

        elementsBound = true;
    }

    return {
        pageshow: function () {
            bindElements();
            leagueVisibility();
            $('#leagueTitle').html(soccer.gameLoop.getLeagueName());
            refreshUI();
        },
        pagebeforehide: function () {

        }
    };
} ();
