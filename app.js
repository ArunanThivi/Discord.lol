const Discord = require('discord.js');
const { stat } = require('fs');
const url = require('url');
let LeagueAPI = require('leagueapiwrapper');
const { discordToken, leagueAPIKey } = require('./keys.json');
var champions = require('./DDragon/champion.json');
var queues = require('./DDragon/queues.json');
var profiles = require('./DDragon/profileicon.json');
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
        let e = new Discord.MessageEmbed()
        .setTitle("Live Game for " + message.content.substring(6));
        LeagueAPI.getSummonerByName(message.content.substring(6))
        .then(function (account) {
            LeagueAPI.getActiveGames(account)
                .then(function (match) {
                    e.addField("QUEUE", queues.find(element => element.queueId == match.gameQueueConfigId).description);
                    for (p of match.participants) {
                        e.addField(p.summonerName, Object.entries(champions.data).find(element => element[1].key == p.championId)[1].name);
                    }
                    message.channel.send(e);
                })
                .catch(console.log);
        })
        .catch(console.log);
    }
    if (message.content.startsWith("!recent")) {
        let e = new Discord.MessageEmbed()
        .setTitle("Latest Game stats");
        LeagueAPI.getSummonerByName(message.content.substring(8))
            .then(function (account) {
                let pfpURL = profiles.data[account.profileIconId].image.full;
                let attachment = new Discord.MessageAttachment(`./DDragon/img/profileicon/${pfpURL}`, "Profile.png");
                e.attachFiles(attachment);
                e.setAuthor(message.content.substring(8), 'attachment://Profile.png', `https://op.gg/summoner/userName=${message.content.substring(8)}`);
                LeagueAPI.getMatchList(account.accountId)
                    .then(function (MatchList) {
                        LeagueAPI.getMatch(MatchList.matches[0].gameId)
                            .then(function (match) {
                                let stats = '';
                                let champ = '';
                                let champName = '';
                                let champPic = '';
                                for (p of match.participantIdentities) {
                                    if (p.player.accountId == account.accountId) {
                                        e.addField("Result", (match.teams[(match.participants[p.participantId - 1].teamId) / 100 - 1].win == "Win" ? "VICTORY" : "DEFEAT"));
                                        stats = match.participants[p.participantId - 1].stats;
                                        champ = Object.entries(champions.data).find(element => element[1].key == match.participants[p.participantId - 1].championId)[1];
                                        champName = champ.name;
                                        champPic = champ.image.full;
                                        break;
                                    }
                                }
                                e.addField("Champion", champName, true);
                                attachment = new Discord.MessageAttachment(`./DDragon/img/champion/${champPic}`, "champ.png");
                                e.attachFiles(attachment);
                                e.setThumbnail(`attachment://champ.png`);=
                                e.addFields(
                                    {name: "Level", value: stats.champLevel},
                                    {name: "KDA", value: stats.kills + "/" + stats.deaths + "/" + stats.assists},
                                    {name: "Largest Multikill", value: stats.largestMultiKill},
                                    {name: "Total Damage Done", value: stats.totalDamageDealt, inline: true},
                                    {name: "Total Damage Done to Champions", value: stats.totalDamageDealtToChampions, inline: true},
                                    {name: "Total Damage Taken", value: stats.totalDamageTaken, inline: true},
                                    {name: "Creep Score", value: (stats.totalMinionsKilled + stats.neutralMinionsKilled)},
                                    {name: "Vision Score", value: stats.visionScore, inline: true},
                                )

                                message.channel.send(e);
                            })
                            .catch(console.log);
                    })
                    .catch(console.log);
            })
            .catch(console.log);
    }
    if (message.content.startsWith("!OP")) {
        message.channel.send(`https://op.gg/summoner/userName=${message.content.substring(4)}`);
    }
});

bot.login(discordToken);

console.log();

