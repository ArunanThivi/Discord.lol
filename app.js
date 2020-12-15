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
    bot.user.setActivity('Use !help for Commands');
    console.log('Ready!');
});

bot.on('message', message => {
    if (message.content.startsWith("!record")) {
        let messageParams = message.content.split(" ");
        let page = 0;
        if (messageParams.length == 3) {
            page = parseInt(messageParams[2]);
        }
        let e = new Discord.MessageEmbed();
        LeagueAPI.getSummonerByName(messageParams[1])
            .then(function (account) {
                let pfpURL = profiles.data[account.profileIconId].image.full;
                let attachment = new Discord.MessageAttachment(`./DDragon/img/profileicon/${pfpURL}`, "profile.png");
                e.attachFiles(attachment);
                e.setAuthor(messageParams[1], 'attachment://profile.png', `https://op.gg/summoner/userName=${messageParams[1]}`);
                e.setThumbnail('attachment://profile.png');
                LeagueAPI.getMatchList(account.accountId)
                    .then(function (MatchList) {
                        for (let j = 0; j < 5; j++) {
                            LeagueAPI.getMatch(MatchList.matches[j].gameId)
                                .then(function (match) {
                                    let team1 = '';
                                    let team2 = '';
                                    e.addField("QUEUE", queues.find(element => element.queueId == match.queueId).description, true);
                                    e.addField("Time", new Date(match.gameCreation).toLocaleString(), true);
                                    for (let i = 0; i < 5; i++) {
                                        team1 += match.participantIdentities[i].player.summonerName + " (" + Object.entries(champions.data).find(element => element[1].key == match.participants[i].championId)[1].name + ")\n";
                                        if (match.participantIdentities[i].player.accountId == account.accountId) {
                                            if (match.teams[(match.participants[match.participantIdentities[i].participantId - 1].teamId) / 100 - 1].win == "Win") {
                                                e.addField("Result", "VICTORY", true);
                                            } else {
                                                e.addField("Result", "DEFEAT", true);
                                            }
                                            e.addField("KDA", match.participants[match.participantIdentities[i].participantId - 1].stats.kills + "/" + match.participants[match.participantIdentities[i].participantId - 1].stats.deaths + "/" + match.participants[match.participantIdentities[i].participantId - 1].stats.assists, true);
                                        }
                                    }
                                    for (let i = 5; i < 10; i++) {
                                        team2 += match.participantIdentities[i].player.summonerName + " (" + Object.entries(champions.data).find(element => element[1].key == match.participants[i].championId)[1].name + ")\n";
                                        if (match.participantIdentities[i].player.accountId == account.accountId) {
                                            if (match.teams[(match.participants[match.participantIdentities[i].participantId - 1].teamId) / 100 - 1].win == "Win") {
                                                e.addField("Result", "VICTORY", true);
                                            } else {
                                                e.addField("Result", "DEFEAT", true);
                                            }
                                            e.addField("KDA", match.participants[match.participantIdentities[i].participantId - 1].stats.kills + "/" + match.participants[match.participantIdentities[i].participantId - 1].stats.deaths + "/" + match.participants[match.participantIdentities[i].participantId - 1].stats.assists, true);
                                        }
                                    }
                                    e.addField("Blue Team", team1, true);
                                    e.addField("Red Team", team2, true);
                                    e.setFooter(`Use Command !record ${messageParams[1]} ${page + 1} to get more results`);
                                    if (j == ((4 * page + 4) - 1)) {
                                        message.channel.send(e);
                                    }
                                })
                                .catch(console.log);
                        }
                    })
                    .catch(console.log);
            })
            .catch(console.log);

    }
    if (message.content.startsWith("!live")) {
        let name = message.content.substring(6);
        let e = new Discord.MessageEmbed()
            .setTitle(`Live Game for ${name}`);
        LeagueAPI.getSummonerByName(name)
            .then(function (account) {
                let pfpURL = profiles.data[account.profileIconId].image.full;
                let attachment = new Discord.MessageAttachment(`./DDragon/img/profileicon/${pfpURL}`, "Profile.png");
                e.attachFiles(attachment);
                e.setAuthor(message.content.substring(6), 'attachment://Profile.png', `https://op.gg/summoner/userName=${name}`);
                LeagueAPI.getActiveGames(account)
                    .then(function (match) {
                        let team1 = '';
                        let team2 = '';
                        let champPic = '';
                        e.addField("QUEUE", queues.find(element => element.queueId == match.gameQueueConfigId).description, true);
                        for (let i = 0; i < 5; i++) {
                            team1 += match.participants[i].summonerName + " (" + Object.entries(champions.data).find(element => element[1].key == match.participants[i].championId)[1].name + ")\n";
                            if (match.participants[i].summonerId == account.id) {
                                champPic = Object.entries(champions.data).find(element => element[1].key == match.participants[i].championId)[1].image.full;
                            }
                        }

    
                        for (let i = 5; i < 10; i++) {
                            team2 += match.participants[i].summonerName + " (" + Object.entries(champions.data).find(element => element[1].key == match.participants[i].championId)[1].name + ")\n";
                            if (match.participants[i].summonerId == account.id) {
                                champPic = Object.entries(champions.data).find(element => element[1].key == match.participants[i].championId)[1].image.full;
                            }
                        }
                        e.addField("Blue Team", team1, true);
                        e.addField("Red Team", team2, true);
                        attachment = new Discord.MessageAttachment(`./DDragon/img/champion/${champPic}`, "champ.png");
                        e.attachFiles(attachment);
                        e.setThumbnail('attachment://champ.png');
                        /*e.addField("QUEUE", queues.find(element => element.queueId == match.gameQueueConfigId).description, true);
                        for (p of match.participants) {
                            e.addField(p.summonerName, Object.entries(champions.data).find(element => element[1].key == p.championId)[1].name, true);
                        }*/
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
                                        if (match.teams[(match.participants[p.participantId - 1].teamId) / 100 - 1].win == "Win") {
                                            e.setColor("#00BFFF");
                                            e.addField("Result", "VICTORY");
                                        } else {
                                            e.setColor("#FF0000");
                                            e.addField("Result", "DEFEAT");
                                        }
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
                                e.setThumbnail(`attachment://champ.png`);
                                e.addFields(
                                    { name: "Level", value: stats.champLevel },
                                    { name: "KDA", value: stats.kills + "/" + stats.deaths + "/" + stats.assists },
                                    { name: "Largest Multikill", value: stats.largestMultiKill },
                                    { name: "Total Damage Done", value: stats.totalDamageDealt, inline: true },
                                    { name: "Total Damage Done to Champions", value: stats.totalDamageDealtToChampions, inline: true },
                                    { name: "Total Damage Taken", value: stats.totalDamageTaken, inline: true },
                                    { name: "Creep Score", value: (stats.totalMinionsKilled + stats.neutralMinionsKilled) },
                                    { name: "Vision Score", value: stats.visionScore, inline: true },
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
    if (message.content.startsWith("!help")) {
        let e = new Discord.MessageEmbed()
        .setTitle("Commands for LeagueBot")
        .addFields(
            {name: "!record [Summoner] [page = 0]", value: "Returns Game Data on The Summoner's most recently finished matches."},
            {name: "!live [Summoner]", value: "Returns Game Data on live match if summoner is currently in match"},
            {name: "!recent [Summoner]", value: "Returns in-game Statistics from the Summoner's most recently completed match"},
            {name: "!OP [Summoner]", value: "Returns a link to the Summoner's OP.GG page for further statisitcs"},
            {name: "!help", value: "Show this page!"}
        )
        .setFooter("Developed by Arunan Thiviyanathan", "https://arunanthivi.com");
        message.channel.send(e);
    }
});

bot.login(discordToken);


