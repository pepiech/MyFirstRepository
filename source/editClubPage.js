soccer.editClubPage = function () {
    var elementsBound = false;
    var editCurrentTeam;
    var restartLeague;
    var editTeamsCount;
    var editTeamName;
    var editSkillLevel;
    var editShortName;
    var editTeamNext;
    var editTeamPrev;
    var editTeamSave;
    var editTeamDeleteAll;
    var editTeamAdd;
    var editSelectedTeam;
    var editLeagueName;

    var refreshUI = function () {
        var clubCount = soccer.club.getAll().length;
        editTeamsCount.html(clubCount);

        if (editCurrentTeam != -1) {
            var club = soccer.club.getAll()[editCurrentTeam];
            editTeamName.val(club.name);
            editShortName.val(club.short);
            editSkillLevel.val(club.ai);
            editSkillLevel.slider('refresh');
        }
        else {
            editTeamName.val('');
            editShortName.val('');
            editSkillLevel.val(0);
            editSkillLevel.slider('refresh');
        }

        if (clubCount == 0) {
            editTeamPrev.attr("disabled", "disabled");
            editTeamNext.attr("disabled", "disabled");
            editTeamDeleteAll.attr("disabled", "disabled");
        }
        else {
            editTeamDeleteAll.removeAttr("disabled");
            if (editCurrentTeam > 0)
                editTeamPrev.removeAttr("disabled");
            else
                editTeamPrev.attr("disabled", "disabled");

            if (editCurrentTeam < clubCount - 1)
                editTeamNext.removeAttr("disabled");
            else
                editTeamNext.attr("disabled", "disabled");
        }
    }

    var bindElements = function () {
        if (elementsBound)
            return;
        editTeamsCount = $('#editTeamsCount');
        editTeamName = $('#editTeamName');
        editShortName = $('#editShortName');
        editSkillLevel = $('#editSkillLevel');
        editTeamNext = $('#editTeamNext');
        editTeamPrev = $('#editTeamPrev');
        editTeamSave = $('#editTeamSave');
        editTeamDeleteAll = $('#editTeamDeleteAll');
        editTeamAdd = $('#editTeamAdd');
        editSelectedTeam = $('#editSelectedTeam');
        editLeagueName = $('#editLeagueName');

        $(editTeamPrev).bind("click", function () {
            editCurrentTeam--;
            refreshUI();
        });

        $(editTeamNext).bind("click", function () {
            editCurrentTeam++;
            refreshUI();
        });

        $(editTeamSave).bind("click", function () {
            var club;
            if (editCurrentTeam == -1) {
                club = soccer.club.add();
            }
            else {
                club = soccer.club.getAll()[editCurrentTeam];
            }
            club.name = editTeamName.val();
            club.short = editShortName.val();
            club.ai = editSkillLevel.val();
            soccer.club.save();
            editCurrentTeam = club.id - 1;
            refreshUI();
        });

        $(editTeamDeleteAll).bind("click", function () {
            restartLeague = true;
            soccer.club.removeAll();
            soccer.league.removeAll();
            soccer.duel.removeAll();
            editCurrentTeam = -1;
            refreshUI();
        });

        $(editTeamAdd).bind("click", function () {
            editCurrentTeam = -1;
            restartLeague = true;
            refreshUI();
        });

        //select team
        $.each(soccer.club.getAll(), function (index, club) {
            var selected = '';
            if (club.id == soccer.gameLoop.getPlayerTeamId())
                selected = 'selected=\'selected\'';
            var optTempl = '<option value="' + club.id + '" ' + selected + '>' + club.name + '</option>';
            editSelectedTeam.append(optTempl);
        });
        editSelectedTeam.selectmenu();
        editSelectedTeam.selectmenu('refresh', true);

        editLeagueName.val(soccer.gameLoop.getLeagueName());

        $('#editSaveBasic').bind("click", function () {
            soccer.gameLoop.setLeagueName(editLeagueName.val());
            soccer.gameLoop.setPlayerTeamId(editSelectedTeam.val());
        });


        elementsBound = true;
    }

    return {
        pageshow: function () {
            bindElements();
            restartLeague = false;
            editCurrentTeam = soccer.club.getAll().length > 0 ? 0 : -1;
            refreshUI();
        },
        pagebeforehide: function () {
            if (restartLeague) {
                soccer.league.reset();
                soccer.duel.reset();
                soccer.gameLoop.startGame();
            }
        }

    };
} ();
