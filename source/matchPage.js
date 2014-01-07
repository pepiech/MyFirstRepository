soccer.matchPage = function () {
    var matchesHolder;
    var onlyOwnDuels = true;
    var matchToNext;

    var printDuels = function () {
        var newHTML = [];
        for (var i = 0; i < soccer.duel.getAll().length; i++) {
            var duel = soccer.duel.getAll()[i];
            if (onlyOwnDuels && (duel.homeId != soccer.gameLoop.getPlayerTeamId() && duel.awayId != soccer.gameLoop.getPlayerTeamId()))
                continue;

            if (duel.homeId == soccer.gameLoop.getPlayerTeamId()) {
                newHTML.push('<tr><td>' + soccer.club.getByID(duel.homeId).name + '</td>');
                if (typeof duel.resultHome == 'undefined')
                    newHTML.push('<td><span class="result">-</span></td>');
                else
                    newHTML.push('<td><span class="result">' + duel.resultHome + ':' + duel.resultAway + '</span></td>');
                newHTML.push('<td>' + soccer.club.getByID(duel.awayId).name + '</td></tr>');
            }
            else {
                newHTML.push('<tr><td>' + soccer.club.getByID(duel.awayId).name + '</td>');
                if (typeof duel.resultHome == 'undefined')
                    newHTML.push('<td><span class="result">-</span></td>');
                else
                    newHTML.push('<td><span class="result">' + duel.resultAway + ':' + duel.resultHome + '</span></td>');
                newHTML.push('<td>' + soccer.club.getByID(duel.homeId).name + '</td></tr>');
            }
        }
        matchesHolder.html(newHTML.join(""));
    }

    var refreshUI = function () {
        printDuels();
    }

    var bindElements = function () {
        matchesHolder = $('#matchesHolder');
        matchToNext = $('#matchToNext');

        $(matchToNext).bind("click", function () {
            soccer.duel.computeUntilOwnMatch();
            $.mobile.changePage('#leaguePage', {
                transition: 'fade',
                changeHash: false
            });
        });
    }

    return {
        pageshow: function () {
            bindElements();
            refreshUI();
        },
        pagebeforehide: function () {

        }

    };
} ();
