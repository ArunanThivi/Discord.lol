const Discord = require('discord.js');
let LeagueAPI = require('leagueapiwrapper');
var champions = require('./DDragon/champion.json');
var queues = require('./DDragon/queues.json');
var profiles = require('./DDragon/profileicon.json');
LeagueAPI = new LeagueAPI(process.env.RIOT_API_KEY, Region.NA);
const bot = new Discord.Client();

bot.once('ready', () => {
    bot.user.setActivity('Use !help for Commands');
    console.log('Ready!');
});

bot.on('message', message => {
    if (message.content.startsWith("!record")) {
        let messageParams = message.content.split(" ");
        let msg = messageParams.length == 3 ? record(messageParams[1], messageParams[2]) : record(messageParams[1]);      
        msg.then((m) => message.channel.send(m));

    }
    if (message.content.startsWith("!live")) {
        let msg = live(message.content.substring(6));
        msg.then((m) => message.channel.send(m));

    }
    if (message.content.startsWith("!recent")) {
        let msg = recent(message.content.substring(8));
        msg.then((m) => message.channel.send(m));

    }
    if (message.content.startsWith("!OP")) {
        message.channel.send(`https://op.gg/summoner/userName=${message.content.substring(4)}`);
    }
    if (message.content.startsWith("!help")) {
        let e = new Discord.MessageEmbed()
            .setTitle("Commands for LeagueBot")
            .addFields(
                { name: "!record [Summoner] [page = 0]", value: "Returns Game Data on The Summoner's most recently finished matches." },
                { name: "!live [Summoner]", value: "Returns Game Data on live match if summoner is currently in match" },
                { name: "!recent [Summoner]", value: "Returns in-game Statistics from the Summoner's most recently completed match" },
                { name: "!OP [Summoner]", value: "Returns a link to the Summoner's OP.GG page for further statisitcs" },
                { name: "!help", value: "Show this page!" }
            )
            .setFooter("Developed by Arunan Thiviyanathan", "https://arunanthivi.com");
        message.channel.send(e);
    }
});

async function live(name) {
    let e = new Discord.MessageEmbed()
        .setTitle(`Live Game for ${name}`);
    try {
        let account = await LeagueAPI.getSummonerByName(name);
        e.setAuthor(name, `http://ddragon.leagueoflegends.com/cdn/10.25.1/img/profileicon/${profiles.data[account.profileIconId].image.full}`, `https://op.gg/summoner/userName=${name}`);
        let match = await LeagueAPI.getActiveGames(account);
        let team1 = '';
        let team2 = '';
        let champPic = '';
        if (match.gameQueueConfigId == 0) {
            e.addField("QUEUE", "Custom Match", true);
        } else if (queues.find(element => element.queueId == match.gameQueueConfigId) == undefined) {
            e.addField("QUEUE", "Special Mode", true);
        } else{
            e.addField("QUEUE", queues.find(element => element.queueId == match.gameQueueConfigId).description, true);
        }
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
        e.setThumbnail(`http://ddragon.leagueoflegends.com/cdn/10.25.1/img/champion/${champPic}`);
        return e;
    } catch (error) {
        console.log(error);
        return "There was an error processing your request. Summoner is most likely not currently in a match. Please try again later";
    }
}

async function recent(name) {
    let e = new Discord.MessageEmbed()
        .setTitle(`Latest Game stats for ${name}`);
    try {
        let account = await LeagueAPI.getSummonerByName(name).catch(e => { console.log(e) });
        e.setAuthor(name, `http://ddragon.leagueoflegends.com/cdn/10.25.1/img/profileicon/${profiles.data[account.profileIconId].image.full}`, `https://op.gg/summoner/userName=${name}`);
        let MatchList = await LeagueAPI.getMatchList(account.accountId).catch(e => { console.log(e) })
        let match = await LeagueAPI.getMatch(MatchList.matches[0].gameId).catch(e => { console.log(e) });
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
        e.setThumbnail(`http://ddragon.leagueoflegends.com/cdn/10.25.1/img/champion/${champPic}`);
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
        return e;
    } catch (error) {
        console.log(error);
        return "There was an error processing your request. Please check the Summoner's name and try again";
    }

}

async function record(name, page = 0) {
    let e = new Discord.MessageEmbed()
    .setTitle(`Match History for ${name}`);
    try {
        let account = await LeagueAPI.getSummonerByName(name);
        e.setAuthor(name, `http://ddragon.leagueoflegends.com/cdn/10.25.1/img/profileicon/${profiles.data[account.profileIconId].image.full}`, `https://op.gg/summoner/userName=${name}`);
        e.setThumbnail(`http://ddragon.leagueoflegends.com/cdn/10.25.1/img/profileicon/${profiles.data[account.profileIconId].image.full}`);
        let MatchList = await LeagueAPI.getMatchList(account.accountId);
        for (let j = 4 * page; j < 4 * page + 4; j++) {
            let match = await LeagueAPI.getMatch(MatchList.matches[j].gameId);
            let team1 = '';
            let team2 = '';
            //Define Type of Queue
            if (match.queueId == 0) {
                e.addField("QUEUE", "Custom Match", true);
            } else if (queues.find(element => element.queueId == match.queueId) == undefined) {
                e.addField("QUEUE", "Special Mode", true);
            } else{
                e.addField("QUEUE", queues.find(element => element.queueId == match.queueId).description, true);
            }
            //Define Time that Game Started
            e.addField("Time", new Date(match.gameCreation).toLocaleString(), true);
            //Define Members of Team 1
            for (let i = 0; i < 5; i++) {
                team1 += match.participantIdentities[i].player.summonerName + " (" + Object.entries(champions.data).find(element => element[1].key == match.participants[i].championId)[1].name + ")\n";
                if (match.participantIdentities[i].player.accountId == account.accountId) { //If this participant is the same as the parameter
                    if (match.teams[(match.participants[match.participantIdentities[i].participantId - 1].teamId) / 100 - 1].win == "Win") { //Define whether this game was an L or a W
                        e.addField("Result", "VICTORY", true);
                    } else {
                        e.addField("Result", "DEFEAT", true);
                    }
                    //Define KDA
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
            e.addField("Blue Team", team1, true); //Add Teams to the Embed
            e.addField("Red Team", team2, true);
        }
        e.setFooter(`Use Command !record ${name} ${page + 1} to get more results`);
        return e; //Send to Channel
    } catch (error) {
        console.log(error);
        return "There was an error processing your request. Please check the Summoner's name and try again";
    }

}

bot.login(process.env.DISCORD_KEY);