const Discord = require('discord.js');
const { stat } = require('fs');
let LeagueAPI = require('leagueapiwrapper');
const { discordToken, leagueAPIKey} = require('./keys.json');

LeagueAPI = new LeagueAPI(leagueAPIKey, Region.NA);
const bot = new Discord.Client();
/*
LeagueAPI.getSummonerByName('Loo9')
    .then(function(account) {
        // do something with accountInfo
        LeagueAPI.getMatchList(account.accountId)
        .then(function(MatchList){
            matches = MatchList.matches.slice(0, 10);
            for (const matchID of matches) {
                LeagueAPI.getMatch(matchID.gameId)
                .then(function(match){
                    console.log("Blue Team " + match.teams[0].win.toUpperCase());
                    console.log("Tower Kills " + match.teams[0].towerKills);
                    for (let i = 0; i < 5; i++) {
                        console.log(match.participantIdentities[i].player.summonerName + " " + match.participants[i].championId);
                    }
                    let team1Bans = "";
                    for (c of match.teams[0].bans) {
                        team1Bans += c.championId+ " ";
                    }
                    console.log("BANS: " + team1Bans);
                    console.log("Red Team " + match.teams[1].win.toUpperCase());
                    console.log("Tower Kills " + match.teams[1].towerKills);
                    for (let i = 5; i < 10; i++) {
                        console.log(match.participantIdentities[i].player.summonerName + " " + match.participants[i].championId);
                    }
                    let team2Bans = "";
                    for (c of match.teams[1].bans) {
                        team2Bans += c.championId+ " ";
                    }
                    console.log("BANS: " + team2Bans);
                })
                .catch(function() {console.log("Match not found!")});
            }[i]
        })
        .catch( function(){console.log("No games found for Summoner")});
    })
    .catch(function() {console.log("Summoner not found!")});
*/
/*
LeagueAPI.getSummonerByName('ArunanT')
    .then(function(account) {
        LeagueAPI.getMatchList(account.accountId)
        .then(function(MatchList){
            LeagueAPI.getMatch(MatchList.matches[0].gameId)
            .then(function(match){
                let stats = '';
                let champ = ';'
                for (p of match.participantIdentities) {
                    if (p.player.accountId == account.accountId) {
                        console.log(match.teams[(match.participants[p.participantId - 1].teamId) / 100 - 1].win.toUpperCase())
                        stats = match.participants[p.participantId - 1].stats;
                        champ = match.participants[p.participantId - 1].championId;
                        break;
                    }
                }
                console.log(champ);
                console.log("Level " + stats.champLevel);
                console.log(stats.kills+"/" + stats.deaths+"/"+stats.assists);
                console.log("KDA: " + Math.round(((stats.kills + stats.assists) / stats.deaths) * 100) / 100 + ":1");
                console.log("Largest Multikill: " + stats.largestMultiKill);
                console.log("Total Damage Done: " + stats.totalDamageDealt);
                console.log("Total Damage Done to Champions: " + stats.totalDamageDealtToChampions);
                console.log("Total Damage Taken: " + stats.totalDamageTaken);
                console.log("Vision Score: " + stats.visionScore);
                console.log("Creep Score: " + (stats.totalMinionsKilled + stats.neutralMinionsKilled));
                if (stats.firstBloodKill) {console.log("FIRST BLOOD")}
                if (stats.firstBloodAssist) {console.log("FIRST BLOOD (Assist)")}
                if (stats.firstTowerKill) {console.log("FIRST TOWER")}
                if (stats.firstTowerAssist) {console.log("FIRST TOWER (Assist)")}

            })
            .catch(function(){console.log});
        })
        .catch(function(){console.log});
    })
    .catch(function() {console.log("Summoner not found!")});
*/
LeagueAPI.getSummonerbyName("Loo9")
    .then(function(account){
        LeagueAPI.getActiveGames(account)
        .then(function(match) {
            console.log("QUEUE: " + match.gameQueueConfigId);
            for (p of match.participants) {
                console.log(p.summonerName + " " + p.championId);
            }
        })
        .catch(console.log);
    })
    .catch(console.log);


//console.log("https://op.gg/summoner/userName=ArunanT");