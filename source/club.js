soccer.club = function () {
    var clubs = [];
    var index = {};

    var createIndex = function () {
        for (var i = 0; i < clubs.length; i++) {
            index[clubs[i].id] = i;
        }
    }

    var saveToStore = function () {
        var tosave = [];
        for (var i = 0; i < clubs.length; i++) {
            tosave.push(clubs[i].id + '|' + clubs[i].name + '|' + clubs[i].short + '|' + clubs[i].ai);
        }
        localStorage.setItem("clubs", tosave.join(";"));
    }

    var parseFromStore = function () {
        var stored = localStorage.getItem('clubs');
        var storedClubs = stored.split(';');
        for (var i = 0; i < storedClubs.length; i++) {
            var data = storedClubs[i].split('|');
            clubs[i] = [];
            clubs[i].id = data[0];
            clubs[i].name = data[1];
            clubs[i].short = data[2];
            clubs[i].ai = parseInt(data[3]);
        }
    }

    return {
        init: function () {
            var saved = localStorage.getItem('clubs');
            if (saved == "0")
                return;
            if (saved)
                parseFromStore();
            else
                clubs = defaultClubs;
            createIndex();
        },
        getAll: function () {
            return clubs;
        },
        getByID: function (id) {
            return clubs[index[id]];
        },
        add: function () {
            clubs[clubs.length] = [];
            clubs[clubs.length - 1].id = clubs.length;
            createIndex();
            return clubs[clubs.length - 1];
        },
        save: function () {
            saveToStore();
        },
        removeAll: function () {
            clubs = [];
            localStorage.setItem("clubs", "0");
        },
        reset: function () {
            clubs = [];
            localStorage.removeItem('clubs');
        }
    };
} ();
