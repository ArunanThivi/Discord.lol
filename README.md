Features
- Get Current Game for player
- Get Record for last 10 games played
- Get Champion Mastery for a player
- 
Built using discord.js and LeagueAPIWrapper 
# Workflow
!live ArunanT
    - getSummonerByName("ArunanT")
        - If fail, return "Summoner not found"
    - Get Active Games ()
        - If fail, return "User currently not in match"
    - Return Data
        - gameType (normal, ranked solo/duo, ranked flex) OR gameQueueConfigID (?)
        - gameLength (Time since start)
        - Current Team (Summoner Names, Champions), Bans
        - Enemy Team (Summoner Names, Champions, Bans)
!record ArunanT
    - getSummonerByName("ArunanT")
        - If fail, return "Summoner not found"
    - getMatchList()
        -If fail, return "No games found for Summoner"
        - Filter to 10 most Recent Games
    - getMatch()
    - Return Data
        - User's Team (Summoner Names, Champions, Bans)
        - Enemy Team (Summoner Names, Champions, Bans)
        - WIN / DEFEAT
!recent ArunanT
    - getSummonerByName("ArunanT")
        - If fail, return "Summoner not found"
    - getMatchList()
        -If fail, return "No games found for Summoner"
        - Filter to most Recent Game
    - getMatch()
    - Return Data
        - User's Stats
!masteryScore ArunanT
    - getSummonerByName("ArunanT")
        - If fail, return "Summoner not found"
    - getChampionMasteryTotal()
    -Return Data
        - int
!OP ArunanT
    - Return link to OP.GG page
    