# Online Chess
## Yermakov Anton, 053502
### Description
Online chess for two players.
### Mock up
Figma project can be found here:  
https://www.figma.com/file/Fx6Jn1DtgQjc8ggFPeRWnU/chess?node-id=0%3A1&t=eruCsbMArYQ5B8qw-1
### Main functions
- Authorization
- Registration
- Creation of a game room, link to which can be used to connect to the room
- The chess game itself
- Statistics of played games for each user
### Data models description
#### User
- id
- username
- password_hash
- avatar
#### Game
- id
- beginning_timestamp
- ending_timestamp
- white_player_id
- black_player_id
- time_limit
- result (white win, black win, draw)
