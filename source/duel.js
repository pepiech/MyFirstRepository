soccer.duel = function () {
    var duels = [];
    var nextDuel = 0;

    var saveToStore = function () {
        var tosave = [];
        for (var i = 0; i < duels.length; i++) {
            if (typeof duels[i].resultHome == 'undefined')
                tosave.push(duels[i].matchDay + '|' + duels[i].homeId + '|' + duels[i].awayId + '||');
            else
                tosave.push(duels[i].matchDay + '|' + duels[i].homeId + '|' + duels[i].awayId + '|' + duels[i].resultHome + '|' + duels[i].resultAway);
        }
        localStorage.setItem("duels", tosave.join(";"));
    }

    var parseFromStore = function () {
        nextDuel = -1;
        var i = 0;
        var stored = localStorage.getItem('duels');
        var storedData = stored.split(';');
        for (i = 0; i < storedData.length; i++) {
            var data = storedData[i].split('|');
            duels[i] = [];
            duels[i].matchDay = parseInt(data[0]);
            duels[i].homeId = parseInt(data[1]);
            duels[i].awayId = parseInt(data[2]);
            if (data[3]) {
                duels[i].resultHome = parseInt(data[3]);
                duels[i].resultAway = parseInt(data[4]);
            }
            else {
                if (nextDuel == -1)
                    nextDuel = i;
                duels[i].resultHome;
                duels[i].resultAway;
            }
        }
        if (nextDuel == -1)
            nextDuel = i;
    }

    var generateFixture = function (clubs) {
        var teams = clubs.length;
        // If odd number of teams add a "ghost".
        var ghost = false;
        if (teams % 2 == 1) {
            teams++;
            ghost = true;
        }

        // Generate the fixtures using the cyclic algorithm.
        var totalRounds = teams - 1;
        var matchesPerRound = teams / 2;
        var rounds = [];

        for (var round = 0; round < totalRounds; round++) {
            rounds[round] = {};
            for (var match = 0; match < matchesPerRound; match++) {
                var home = (round + match) % (teams - 1);
                var away = (teams - 1 - match + round) % (teams - 1);
                // Last team stays in the same place while the others rotate around it.
                if (match == 0) {
                    away = teams - 1;
                }
                // Add one so teams are number 1 to teams not 0 to teams - 1 upon display.
                rounds[round][match] = (home + 1) + ";" + (away + 1);
            }
        }

        // Interleave so that home and away games are fairly evenly dispersed.
        var interleaved = [];

        var evn = 0;
        var odd = (teams / 2);
        for (var i = 0; i < rounds.length; i++) {
            if (i % 2 == 0) {
                interleaved[i] = rounds[evn++];
            } else {
                interleaved[i] = rounds[odd++];
            }
        }

        rounds = interleaved;

        // Last team can't be away for every game so flip them to home on odd rounds.
        for (var round = 0; round < rounds.length; round++) {
            if (round % 2 == 1) {
                rounds[round][0] = flip(rounds[round][0]);
            }
        }

        var k = 0;

        //generate fixture
        var totalRounds = 2;
        for (var a = 0; a < totalRounds; a++) {
            for (var i = 0; i < rounds.length; i++) {
                for (var j = 0; j < matchesPerRound; j++) {
                    var pos = rounds[i][j].split(';');
                    var homeId = pos[0];
                    var awayId = pos[1];

                    if (a % 2 != 0) {
                        homeId = pos[1];
                        awayId = pos[0];
                    }

                    duels[k] = [];
                    duels[k].matchDay = (i + 1) + (a * (totalRounds + 1));
                    duels[k].homeId = clubs[parseInt(homeId) - 1].id;
                    duels[k].awayId = clubs[parseInt(awayId) - 1].id;
                    duels[k].resultHome;
                    duels[k].resultAway;
                    k++;
                }
            }
        }
    }

    function flip(match) {
        var components = match.split(";");
        return components[1] + ";" + components[0];
    }

    function getGoals(chance) {
        var goals = 0;

        if (Math.random() > 0.60)
            goals++;

        if (Math.random() > 0.85)
            goals++;

        if (chance > 30 && Math.random() > 0.20)
            goals++;

        if (chance > 20 && Math.random() > 0.40)
            goals++;

        if (chance > 10 && Math.random() > 0.60)
            goals++;

        if (chance > 0 && Math.random() > 0.80)
            goals++;

        return goals;
    }

    //public methods and properties
    return {
        noMoreDuels: function () {
            return typeof duels[nextDuel] == 'undefined' ? true : false;
        },
        init: function (clubs) {
            var saved = localStorage.getItem('duels');
            if (saved == "0" && soccer.club.getAll().length > 0) {
                this.reset();
                saved = false;
            }
            if (saved) {
                parseFromStore();
            }
            else {
                generateFixture(clubs);
                nextDuel = 0;
            }
        },
        getHtml: function () {
            var newHTML = [];
            for (var i = 0; i < duels.length; i++) {
                newHTML.push('<tr><td>' + duels[i].matchDay + '.</td>');
                newHTML.push('<td>' + duels[i].homeId + '</td>');
                newHTML.push('<td>vs</td>');
                newHTML.push('<td>' + duels[i].awayId + '</td>');
                newHTML.push('<td></td></tr>');
            }
            return newHTML.join("");
        },
        getAll: function () {
            return duels;
        },
        getCurrentDuel: function () {
            if (typeof duels[nextDuel] == 'undefined')
                return 0;
            else
                return duels[nextDuel];
        },
        getCurrentDuelHtml: function () {
            var duel = this.getCurrentDuel();
            if (!duel)
                return "";
            var newHTML = [];
            newHTML.push(soccer.club.getByID(duel.homeId).name);
            if(typeof duel.resultHome == 'undefined')
                newHTML.push('<span class="result"> - </span>');
            else
                newHTML.push('<span class="result">' + duel.resultHome + ':' + duel.resultAway + '</span>');
            newHTML.push(soccer.club.getByID(duel.awayId).name);
            return newHTML.join("");
        },
        setCurrentDuelResult: function () {
            var duel = this.getCurrentDuel();
            if (!duel)
                return 0;

            if (!duel.resultHome) {
                var aiHome = soccer.club.getByID(duel.homeId).ai;
                var aiAway = soccer.club.getByID(duel.awayId).ai;
                duel.resultHome = getGoals(aiHome - aiAway);
                duel.resultAway = getGoals(aiAway - aiHome);
                saveToStore();
                return duel;
            }
        },
        proceedToNextDuel: function () {
            nextDuel++;
        },
        removeAll: function () {
            nextDuel = 0;
            duels = [];
            localStorage.setItem("duels", "0");
        },
        reset: function () {
            nextDuel = 0;
            localStorage.removeItem('duels');
        }
    };

} ();