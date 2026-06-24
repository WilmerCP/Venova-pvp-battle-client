const { Dex } = require('pokemon-showdown')

function parseUpdate(content, win) {
    const lines = content.split('\n')

    for (const line of lines) {
        if (!line.startsWith('|')) continue

        const parts = line.split('|')
        const type = parts[1]

        switch (type) {
            case 'player':
                // |player|p1|Anonycat|60|1200
                console.log(`Player: ${parts[3]}`)

                win.webContents.send('player', { id: parts[2], name: parts[3] })

                break

            case 'move':
                // |move|p1a: Pikachu|Thunderbolt|p2a: Squirtle
                console.log(`${parts[2]} used ${parts[3]}`)
                break

            case 'switch':
                // |switch|p1a: Pikachu|Pikachu, L59, F|100/100
                console.log(`${parts[2]} switched in`)

                const details = parts[3]
                const speciesName = details.split(',')[0].trim() // 'Pikachu'

                const position = parts[2].split(': ')[0] // 'p1a'
                const playerId = position.slice(0, 2)     // 'p1'

                const species = Dex.species.get(speciesName)
                const num = species.num // 25

                win.webContents.send('switch', {
                    player: playerId,   // 'p1'
                    name: speciesName,  // 'Pikachu'
                    num,                // 25
                    hp: parts[4]        // '100/100'
                })

                break

            case '-damage':
                // |-damage|p2a: Squirtle|80/100
                console.log(`${parts[2]} took damage, now at ${parts[3]}`)
                break

            case '-heal':
                console.log(`${parts[2]} healed to ${parts[3]}`)
                break

            case 'faint':
                console.log(`${parts[2]} fainted`)
                break

            case 'win':
                console.log(`Winner: ${parts[2]}`)
                break

            case 'turn':
                console.log(`Turn ${parts[2]}`)
                break

            case 'request':
                // parts[2] is a JSON string with available moves/switches
                const request = JSON.parse(parts[2])

                for (const move of request.active[0].moves) {
                    const moveInfo = Dex.moves.get(move.move)
                    move.type = moveInfo.type
                    move.description = moveInfo.desc  
                }
                
                win.webContents.send('team', request)

                break
        }
    }
}

module.exports = { parseUpdate }