const Discord = require('discord.js');
let LeagueAPI = require('leagueapiwrapper');
//require('dotenv').config(); //Uncomment this line to run locally with dotenv package
var champions = require('./DDragon/champion.json');
var queues = require('./DDragon/queues.json');
var profiles = require('./DDragon/profileicon.json');
LeagueAPI = new LeagueAPI(process.env.RIOT_API_KEY, Region.NA);
const bot = new Discord.Client();
bettingRecord = {};
bets = [];
claimTimer = undefined;

bot.once('ready', () => {
    bot.user.setActivity('Use !help for Commands');
    console.log('Ready!');
});
bot.on('message', message => {
    if (message.content.toLowerCase().startsWith("!record")) {
        let messageParams = message.content.split(" ");
        let msg = messageParams.length == 3 ? record(messageParams[1], messageParams[2]) : record(messageParams[1]);
        msg.then((m) => message.channel.send(m));
    }
    if (message.content.toLowerCase().startsWith("!live")) {
        let msg = live(message.content.substring(6));
        msg.then((m) => message.channel.send(m));
    }
    if (message.content.toLowerCase().startsWith("!rank")) {
        let msg = rank(message.content.substring(6));
        msg.then((m) => message.channel.send(m));
    }
    if (message.content.toLowerCase().startsWith("!recent")) {
        let msg = recent(message.content.substring(8));
        msg.then((m) => message.channel.send(m));
    }
    if (message.content.toLowerCase().startsWith("!op")) {
        message.channel.send(`https://op.gg/summoner/userName=${message.content.substring(4)}`);
    }
    if (message.content.toLowerCase().startsWith("!help")) {
        let e = new Discord.MessageEmbed()
            .setTitle("Commands for LeagueBot")
            .addFields(
                { name: "!record [Summoner] [page = 0]", value: "Returns Game Data on The Summoner's most recently finished matches." },
                { name: "!live [Summoner]", value: "Returns Game Data on live match if summoner is currently in match" },
                { name: "!rank [Summoner]", value: "Returns information about this summoner's rank this season" },
                { name: "!recent [Summoner]", value: "Returns in-game Statistics from the Summoner's most recently completed match" },
                { name: "!OP [Summoner]", value: "Returns a link to the Summoner's OP.GG page for further statistics" },
                { name: "!help", value: "Show this page!" }
            )
            .setFooter("Developed by Arunan Thiviyanathan", "https://arunanthivi.com");
        message.channel.send(e);
    }
    /*if (message.content.toLowerCase().startsWith("!bet")) {
        let messageParams = message.content.split(" ");
        if (messageParams.length != 3) {
            message.channel.send("Message does not have the correct number of Parameters!");
        } else {
            let msg = predict(message.author, messageParams[1], messageParams[2] == 'W');
            msg.then((m) => message.channel.send(m));
            if (claimTimer == undefined) {
                claimTimer = setInterval(claim, 2400000);
            }
        }
    }
    if (message.content.toLowerCase().startsWith("!claim")) {
        if (bets.length == 0) {
            message.channel.send("No Predictions Found, start by making a prediction!");
        } else{
            let msg = claim();
            msg.then((m) => message.channel.send(m));
        }
    }
    if (message.content.toLowerCase().startsWith("!leaderboard")) {
        let e = new Discord.MessageEmbed();
        for (user of Object.values(bettingRecord)) {
            e.addFields(
                { name: "Name", value: user.user, inline: true },
                { name: "Win Loss Record", value: user.wins + '/' + user.losses, inline: true },
                { name: "% Correct", value: (user.wins/(user.wins + user.losses)) * 100, inline: true }
            )
        }
        message.channel.send(e);
    }*/
});

async function live(name) {
    let e = new Discord.MessageEmbed();

    try {
        let account = await LeagueAPI.getSummonerByName(name);
        e.setTitle(`Live Game for ${account.name}`);
        e.setAuthor(account.name, `http://ddragon.leagueoflegends.com/cdn/11.3.1/img/profileicon/${profiles.data[account.profileIconId].image.full}`, `https://op.gg/summoner/userName=${name}`);
        let match = await LeagueAPI.getActiveGames(account);
        let team1 = '';
        let team2 = '';
        let champPic = '';
        if (match.gameQueueConfigId == 0) {
            e.addField("QUEUE", "Custom Match", true);
        } else if (queues.find(element => element.queueId == match.gameQueueConfigId) == undefined) {
            e.addField("QUEUE", "Special Mode", true);
        } else {
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
        e.setThumbnail(`http://ddragon.leagueoflegends.com/cdn/11.3.1/img/champion/${champPic}`);
        return e;
    } catch (error) {
        console.log(error);
        return "There was an error processing your request. Summoner is most likely not currently in a match. Please try again later";
    }
}

async function rank(name) {
    let e = new Discord.MessageEmbed()
        .setTitle(`Latest Game stats for ${name}`);
    try {
        let account = await LeagueAPI.getSummonerByName(name).catch(e => { console.log(e) });
        e.setTitle(`Summoner Information for ${account.name}`);
        e.setAuthor(account.name, `http://ddragon.leagueoflegends.com/cdn/11.3.1/img/profileicon/${profiles.data[account.profileIconId].image.full}`, `https://op.gg/summoner/userName=${name}`);
        e.setThumbnail(`http://ddragon.leagueoflegends.com/cdn/11.3.1/img/profileicon/${profiles.data[account.profileIconId].image.full}`);
        let rankInfo = await LeagueAPI.getLeagueRanking(account.id).catch(e => { console.log(e) });
        let soloRank = rankInfo.find(element => element.queueType === "RANKED_SOLO_5x5");
        let flexRank = rankInfo.find(element => element.queueType === "RANKED_FLEX_SR");
        if (soloRank != undefined) {
            e.addField("Rank (Solo/Duo)", soloRank.tier.toTitleCase() + " " + soloRank.rank + " (" + soloRank.leaguePoints + "LP)", true);
            e.addField("Record (Solo/Duo)", soloRank.wins + "W " + soloRank.losses + "L", true);
            let soloPercent = soloRank.wins / (soloRank.wins + soloRank.losses)
            e.addField('Win %', (100 * soloPercent).toFixed(2), true);
        }
        if (flexRank != undefined) {
            e.addField("Rank (Flex)", flexRank.tier.toTitleCase() + " " + flexRank.rank + " (" + flexRank.leaguePoints + "LP)", true);
            e.addField("Record (Flex)", flexRank.wins + "W " + flexRank.losses + "L", true);
            let flexPercent = flexRank.wins / (flexRank.wins + flexRank.losses);
            e.addField('Win %', (100 * flexPercent).toFixed(2), true);
        }
        console.log(rankInfo[0].miniSeries);
        return e;
    } catch (error) {
        console.log(error);
        return "There was an error processing your request. Please check the Summoner's name and try again";
    }
}

async function recent(name) {
    let e = new Discord.MessageEmbed()
        .setTitle(`Latest Game stats for ${name}`);
    try {
        let account = await LeagueAPI.getSummonerByName(name).catch(e => { console.log(e) });
        e.setTitle(`Latest Game stats for ${account.name}`);
        e.setAuthor(account.name, `http://ddragon.leagueoflegends.com/cdn/11.3.1/img/profileicon/${profiles.data[account.profileIconId].image.full}`, `https://op.gg/summoner/userName=${name}`);
        let MatchList = await LeagueAPI.getMatchList(account.accountId).catch(e => { console.log(e) })
        let match = await LeagueAPI.getMatch(MatchList.matches[0].gameId).catch(e => { console.log(e) });
        let stats = '';
        let champ = '';
        let champName = '';
        let champPic = '';
        if (match.gameQueueConfigId == 0) {
            e.addField("QUEUE", "Custom Match", true);
        } else if (queues.find(element => element.queueId == match.gameQueueConfigId) == undefined) {
            e.addField("QUEUE", "Special Mode", true);
        } else {
            e.addField("QUEUE", queues.find(element => element.queueId == match.gameQueueConfigId).description, true);
        }
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
        e.setThumbnail(`http://ddragon.leagueoflegends.com/cdn/11.3.1/img/champion/${champPic}`);
        e.addFields(
            { name: "Level", value: stats.champLevel },
            { name: "KDA", value: stats.kills + "/" + stats.deaths + "/" + stats.assists, inline: true },
            { name: "Largest Multikill", value: stats.largestMultiKill, inline: true },
            { name: '\u200b', value: '\u200b', inline: true },
            { name: "Total Damage Done", value: stats.totalDamageDealt, inline: true },
            { name: "Total Damage Done to Champions", value: stats.totalDamageDealtToChampions, inline: true },
            { name: "Total Damage Taken", value: stats.totalDamageTaken, inline: true },
            { name: "Creep Score", value: (stats.totalMinionsKilled + stats.neutralMinionsKilled), inline: true },
            { name: "Vision Score", value: stats.visionScore, inline: true },
        )
        return e;
    } catch (error) {
        console.log(error);
        return "There was an error processing your request. Please check the Summoner's name and try again";
    }

}

async function record(name, page = 0) {
    let e = new Discord.MessageEmbed();
    try {
        let account = await LeagueAPI.getSummonerByName(name);
        e.setTitle(`Match History for ${account.name}`);
        e.setAuthor(account.name, `http://ddragon.leagueoflegends.com/cdn/11.3.1/img/profileicon/${profiles.data[account.profileIconId].image.full}`, `https://op.gg/summoner/userName=${name}`);
        e.setThumbnail(`http://ddragon.leagueoflegends.com/cdn/11.3.1/img/profileicon/${profiles.data[account.profileIconId].image.full}`);
        let MatchList = await LeagueAPI.getMatchList(account.accountId);
        for (let j = 4 * page; j < 4 * page + 4; j++) {
            let match = await LeagueAPI.getMatch(MatchList.matches[j].gameId);
            let team1 = '';
            let team2 = '';
            //Define Type of Queue
            if (match.gameQueueConfigId == 0) {
                e.addField("QUEUE", "Custom Match", true);
            } else if (queues.find(element => element.queueId == match.gameQueueConfigId) == undefined) {
                e.addField("QUEUE", "Special Mode", true);
            } else {
                e.addField("QUEUE", queues.find(element => element.queueId == match.gameQueueConfigId).description, true);
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

String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

/*async function predict(user, summoner, win) {
    if (!bettingRecord.hasOwnProperty(user.id)) {
        init(user);
    }
    try {
        let account = await LeagueAPI.getSummonerByName(summoner);
        let match = await LeagueAPI.getActiveGames(account);
        if (bets.some((element) => element.gameID == match.gameId) && bets.some((element) => element.userID == user.id)) {
            return "User has already placed a bet on this match!";
        }
        bets.push({ "userID": user.id, "username": user.username, "target": account.name, "win": win, "gameID": match.gameId });
        return `${user.username} predicts that ${account.name} will ${win == true ? "win" : "lose"} this game`;
    } catch (error) {
        return "Summoner not found in match. Please Try again Later";
    }

}

async function claim() {
    msg = "";
    for (bet of bets) {
        try {
            let match = await LeagueAPI.getMatch(bet.gameID);
            let ID = match.participantIdentities.find(element => element.player.summonerName == bet.target).participantId;
            if (match.teams[(match.participants[ID - 1].teamId) / 100 - 1].win == "Win") {
                if (bet.win == true) {
                    bettingRecord[bet.userID].wins += 1;
                    msg += `${bet.username} was CORRECT! ${bet.target} WON their match!\n`;
                } else {
                    bettingRecord[bet.userID].losses += 1;
                    msg += `${bet.username} was INCORRECT! ${bet.target} LOST their match!\n`;
                }
            } else {
                if (bet.win == true) {
                    bettingRecord[bet.userID].losses += 1;
                    msg += `${bet.username} was INCORRECT! ${bet.target} WON their match!\n`;

                } else {
                    bettingRecord[bet.userID].wins += 1;
                    msg += `${bet.username} was CORRECT! ${bet.target} LOST their match!\n`;
                }

            }
            
        } catch(error) {
            console.log(error);
        }
    }
    if (bets.length == 0) {
        claimTimer = clearInterval(claimTimer);
    }
    return msg;
}


function init(user) {
    bettingRecord[user.id] = { "user": user.username, "wins": 0, "losses": 0 };
}
*/
bot.login(process.env.DISCORD_KEY);