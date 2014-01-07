var soccer = {};

soccer.gameLoop = function () {
    var playerTeamId = 1;
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
            localStorage.removeItem('gamedata');
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
var defaultClubs = "Arsenal|80;Manchester City|80;Chelsea|80;Liverpool|75;Everton|70;Tottenham Hotspur|70;Manchester United|75;Newcastle United|70;Southampton|65;Hull City|50;Aston Villa|60;Stoke City|50;Swansea City|45;West Bromwich Albion|45;Norwich City|45;Fulham|45;Cardiff City|40;Crystal Palace|35;West Ham United|45;Sunderland|40";
