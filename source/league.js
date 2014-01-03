soccer.league = function () {
    var leagueTable = [];

    var sortLeagueTable = function () {
        leagueTable[0].table.sort(compare);
    }

    var compare = function (a, b) {
        if (a.p > b.p)
            return -1;
        if (a.p < b.p)
            return 1;
        return 0;
    }

    var saveToStore = function () {
        var tosave = [];
        for (var i = 0; i < leagueTable[0].table.length; i++) {
            var item = leagueTable[0].table[i];
            tosave.push(item.clubid + '|' + item.m + '|' + item.w + '|' + item.d + '|' + item.l + '|' + item.gf + '|' + item.ga + '|' + item.p);
        }
        localStorage.setItem("leagueTables", tosave.join(";"));
    }

    var parseFromStore = function () {
        var stored = localStorage.getItem('leagueTables');
        var storedData = stored.split(';');
        for (var i = 0; i < storedData.length; i++) {
            var data = storedData[i].split('|');
            leagueTable[0].table[i] = [];
            leagueTable[0].table[i].clubid = parseInt(data[0]);
            leagueTable[0].table[i].m = parseInt(data[1]);
            leagueTable[0].table[i].w = parseInt(data[2]);
            leagueTable[0].table[i].d = parseInt(data[3]);
            leagueTable[0].table[i].l = parseInt(data[4]);
            leagueTable[0].table[i].gf = parseInt(data[5]); //goals for
            leagueTable[0].table[i].ga = parseInt(data[6]); //goals against
            leagueTable[0].table[i].p = parseInt(data[7]);
        }
    }

    //public methods and properties
    return {
        title: "Soccer League",
        clubCount: function () {
            if (leagueTable.length == 0)
                return 0;
            else
                return leagueTable[0].table.length;
        },
        init: function (clubs) {

            leagueTable[0] = [];
            leagueTable[0].id = 1;
            leagueTable[0].table = [];

            var saved = localStorage.getItem('leagueTables');
            if (saved == "0" && soccer.club.getAll().length > 0) {
                this.reset();
                saved = false;
            }
            if (saved) {
                parseFromStore();
            }
            else {
                for (var i = 0; i < clubs.length; i++) {
                    leagueTable[0].table[i] = [];
                    leagueTable[0].table[i].clubid = clubs[i].id;
                    leagueTable[0].table[i].m = 0;
                    leagueTable[0].table[i].w = 0;
                    leagueTable[0].table[i].d = 0;
                    leagueTable[0].table[i].l = 0;
                    leagueTable[0].table[i].gf = 0; //goals for
                    leagueTable[0].table[i].ga = 0; //goals against
                    leagueTable[0].table[i].p = 0;
                }
            }
            return;
        },
        getLeague: function () {
            return leagueTable[0].table;
        },
        getLeagueHtmlTable: function () {
            sortLeagueTable();
            var newHTML = [];
            for (var i = 0; i < this.getLeague().length; i++) {
                var tableRow = this.getLeague()[i];
                newHTML.push('<tr' + (soccer.gameLoop.getPlayerTeamId() == tableRow.clubid ? ' class=\'ui-bar-a\'' : '') + '><td>' + (i + 1) + '.</td>');
                newHTML.push('<td>' + soccer.club.getByID(tableRow.clubid).name + '</td>');
                newHTML.push('<td>' + tableRow.m + '</td>');
                newHTML.push('<td>' + tableRow.w + '</td>');
                newHTML.push('<td>' + tableRow.d + '</td>');
                newHTML.push('<td>' + tableRow.l + '</td>');
                newHTML.push('<td>' + tableRow.gf + ':' + tableRow.ga + '</td>');
                newHTML.push('<td>' + tableRow.p + '</td></tr>');
            }
            return newHTML.join("");
        },
        updateTable: function (duel) {
            var homeRow;
            var awayRow;

            for (var i = 0; i < this.getLeague().length; i++) {
                if (this.getLeague()[i].clubid == duel.homeId)
                    homeRow = this.getLeague()[i];
                else if (this.getLeague()[i].clubid == duel.awayId)
                    awayRow = this.getLeague()[i];
            }

            //pocet zapasu + 1
            homeRow.m++;
            awayRow.m++;

            //vyhra remiza prohra a body
            if (duel.resultHome > duel.resultAway) {
                homeRow.w++;
                awayRow.l++;
                homeRow.p += 3;
            }
            else if (duel.resultHome == duel.resultAway) {
                homeRow.d++;
                awayRow.d++;
                homeRow.p++;
                awayRow.p++;
            }
            else {
                awayRow.w++;
                homeRow.l++;
                awayRow.p += 3;
            }

            //goly
            homeRow.gf += duel.resultHome;
            homeRow.ga += duel.resultAway;
            awayRow.gf += duel.resultAway;
            awayRow.ga += duel.resultHome;

            sortLeagueTable();
            saveToStore();
        },
        removeAll: function () {
            leagueTable = [];
            localStorage.setItem("leagueTables", "0");
        },
        reset: function () {
            localStorage.removeItem('leagueTables');
        }
    };
} ();
