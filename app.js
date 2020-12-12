const Discord = require('discord.js');
const { stat } = require('fs');
let LeagueAPI = require('leagueapiwrapper');
const { discordToken, leagueAPIKey } = require('./keys.json');
var champions = require('./DDragon/champion.json');
var queues = require('./DDragon/queues.json');
LeagueAPI = new LeagueAPI(leagueAPIKey, Region.NA);
const bot = new Discord.Client();

bot.once('ready', () => {
    console.log('Ready!');
});

bot.on('message', message => {
    if (message.content.startsWith("!record")) {
    /*  
        let msg = "";
        LeagueAPI.getSummonerByName(message.content.substring(8))
            .then(function (account) {
                // do something with accountInfo
                LeagueAPI.getMatchList(account.accountId)
                    .then(function (MatchList) {
                        matches = MatchList.matches.slice(0, 10);
                        for (const matchID of matches) {
                            LeagueAPI.getMatch(matchID.gameId)
                                .then(function (match) {
                                    msg = "---------------" + "\n";
                                    msg += "QUEUE: " + queues.find(element => element.queueId == match.queueId).description + "\n\n";
                                    msg += "Blue Team " + match.teams[0].win.toUpperCase() + "\n";
                                    msg += "Tower Kills " + match.teams[0].towerKills + "\n\n";
                                    for (let i = 0; i < 5; i++) {
                                        msg += match.participantIdentities[i].player.summonerName + " " + Object.entries(champions.data).find(element => element[1].key == match.participants[i].championId)[1].name + "\n";
                                    }
                                    let team1Bans = "";
                                    for (c of match.teams[0].bans) {
                                        if (c.championId != -1)
                                            team1Bans += Object.entries(champions.data).find(element => element[1].key == c.championId)[1].name + ", ";
                                    }
                                    msg += "\nBANS: " + team1Bans + "\n\n";
                                    msg += "Red Team " + match.teams[1].win.toUpperCase() + "\n";
                                    msg += "Tower Kills " + match.teams[1].towerKills + "\n\n";
                                    for (let i = 5; i < 10; i++) {
                                        msg += match.participantIdentities[i].player.summonerName + " " + Object.entries(champions.data).find(element => element[1].key == match.participants[i].championId)[1].name + "\n";
                                    }
                                    let team2Bans = "";
                                    for (c of match.teams[1].bans) {
                                        if (c.championId != -1)
                                            team2Bans += Object.entries(champions.data).find(element => element[1].key == c.championId)[1].name + ", ";
                                    }
                                    msg += "\nBANS: " + team2Bans + "\n\n";
                                    msg += "---------------\n\n";
                                    message.channel.send(`${msg}`);
                                })
                                //.catch(function() {console.log("Match not found!")});
                                .catch(console.log);
                        }
                    })
                    //.catch( function(){console.log("No games found for Summoner")});
                    .catch(console.log);
            })
            //.catch(function() {console.log("Summoner not found!")});
            .catch(console.log);
            */
    }
    if (message.content.startsWith("!live")) {
        let msg = "";
        LeagueAPI.getSummonerByName(message.content.substring(6))
        .then(function (account) {
            LeagueAPI.getActiveGames(account)
                .then(function (match) {
                    msg += "QUEUE: " + queues.find(element => element.queueId == match.gameQueueConfigId).description + "\n";
                    for (p of match.participants) {
                        msg += p.summonerName + " " + Object.entries(champions.data).find(element => element[1].key == p.championId)[1].name + "\n";
                    }
                    msg += "\n";
                    message.channel.send(`${msg}`);
                })
                .catch(console.log);
        })
        .catch(console.log);
    }
    if (message.content.startsWith("!recent")) {
        let msg = "";
        LeagueAPI.getSummonerByName(message.content.substring(8))
            .then(function (account) {
                LeagueAPI.getMatchList(account.accountId)
                    .then(function (MatchList) {
                        LeagueAPI.getMatch(MatchList.matches[0].gameId)
                            .then(function (match) {
                                let stats = '';
                                let champ = '';
                                for (p of match.participantIdentities) {
                                    if (p.player.accountId == account.accountId) {
                                        msg += (match.teams[(match.participants[p.participantId - 1].teamId) / 100 - 1].win == "Win" ? "VICTORY" : "DEFEAT") + "\n";
                                        stats = match.participants[p.participantId - 1].stats;
                                        champ = Object.entries(champions.data).find(element => element[1].key == match.participants[p.participantId - 1].championId)[1].name + " ";;
                                        break;
                                    }
                                }
                                msg += champ + "\n";
                                msg += "Level " + stats.champLevel + "\n";
                                msg += stats.kills + "/" + stats.deaths + "/" + stats.assists + "\n";
                                msg += "KDA: " + Math.round(((stats.kills + stats.assists) / stats.deaths) * 100) / 100 + ":1" + "\n";
                                msg += "Largest Multikill: " + stats.largestMultiKill + "\n";
                                msg += "Total Damage Done: " + stats.totalDamageDealt + "\n";
                                msg += "Total Damage Done to Champions: " + stats.totalDamageDealtToChampions + "\n";
                                msg += "Total Damage Taken: " + stats.totalDamageTaken + "\n";
                                msg += "Vision Score: " + stats.visionScore + "\n";
                                msg += "Creep Score: " + (stats.totalMinionsKilled + stats.neutralMinionsKilled) + "\n";
                                if (stats.firstBloodKill) { msg += "FIRST BLOOD" + "\n"; }
                                if (stats.firstBloodAssist) { msg += "FIRST BLOOD (Assist)" + "\n"; }
                                if (stats.firstTowerKill) { msg += "FIRST TOWER" + "\n"; }
                                if (stats.firstTowerAssist) { msg += "FIRST TOWER (Assist)" + "\n"; }
                                message.channel.send(`${msg}`);
                            })
                            .catch(function () { console.log });
                    })
                    .catch(function () { console.log });
            })
            .catch(function () { console.log("Summoner not found!") });
    }
    if (message.content.startsWith("!OP")) {
        message.channel.send(`https://op.gg/summoner/userName=${message.content.substring(4)}`);
    }
});

bot.login(discordToken);


function live(summonerName) {
    
}

