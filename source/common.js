var soccer = {};

soccer.gameLoop = function () {
    var playerTeamId = 0;
    var leagueName = "League Table";

    var saveToStore = function () {
        localStorage.setItem("gamedata", playerTeamId + ';' + leagueName);
    }

    var parseFromStore = function () {
        var stored = localStorage.getItem('gamedata');
        var storedData = stored.split(';');
        playerTeamId = parseInt(storedData[0]);
        leagueName = storedData[1];
    }

    return {
        getLeagueName: function () {
            return leagueName;
        },
        getPlayerTeamId: function () {
            return playerTeamId;
        },
        setLeagueName: function (value) {
            leagueName = value;
            saveToStore();
        },
        setPlayerTeamId: function (value) {
            playerTeamId = value;
            saveToStore();
        },
        startGame: function () {
            var saved = localStorage.getItem('gamedata');
            if (saved == "0")
                return;
            if (saved)
                parseFromStore();

            soccer.club.init();
            if (soccer.club.getAll().length > 0) {
                soccer.league.init(soccer.club.getAll());
                if (soccer.league.clubCount() > 0) {
                    soccer.duel.init(soccer.club.getAll());
                }
            }
        },
        resetGameDefaults: function () {
            soccer.club.reset();
            soccer.duel.reset();
            soccer.league.reset();
            soccer.gameLoop.startGame();
        }
    };
} ();



$(document).bind("mobileinit", function (event) {
    $.extend($.mobile.zoom, { locked: false, enabled: true });
});

document.addEventListener("deviceready", function () {
    document.addEventListener("menubutton", menuKeyDown, true);
}, false);


function menuKeyDown() {
    $.mobile.changePage('#settingsPage', {
        transition: 'slide',
        changeHash: false
    });
}


//default values
var defaultClubs = [];
defaultClubs[0] = [];
defaultClubs[0].id = 1;
defaultClubs[0].name = "Manchester Reds";
defaultClubs[0].short = "A";
defaultClubs[0].ai = 90;
defaultClubs[1] = [];
defaultClubs[1].id = 2;
defaultClubs[1].name = "Southampton";
defaultClubs[1].short = "B";
defaultClubs[1].ai = 70;
defaultClubs[2] = [];
defaultClubs[2].id = 3;
defaultClubs[2].name = "West Ham";
defaultClubs[2].short = "C";
defaultClubs[2].ai = 50;
defaultClubs[3] = [];
defaultClubs[3].id = 4;
defaultClubs[3].name = "Birmingham";
defaultClubs[3].short = "D";
defaultClubs[3].ai = 30;
defaultClubs[4] = [];
defaultClubs[4].id = 5;
defaultClubs[4].name = "London Blues";
defaultClubs[4].short = "E";
defaultClubs[4].ai = 30;
defaultClubs[5] = [];
defaultClubs[5].id = 6;
defaultClubs[5].name = "Everton";
defaultClubs[5].short = "S";
defaultClubs[5].ai = 30;
defaultClubs[6] = [];
defaultClubs[6].id = 7;
defaultClubs[6].name = "Sunderland";
defaultClubs[6].short = "S";
defaultClubs[6].ai = 30;
defaultClubs[7] = [];
defaultClubs[7].id = 8;
defaultClubs[7].name = "Reading";
defaultClubs[7].short = "S";
defaultClubs[7].ai = 30;