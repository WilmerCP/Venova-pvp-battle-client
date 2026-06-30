const { Dex } = require('pokemon-showdown')

function parsePokemonId(id) {
    if (!id) return null // handles blank target on multi/no-target moves

    const [position, name] = id.split(': ')
    // position is like "p1a" — player is first 2 chars, slot letter is the rest
    const player = position.slice(0, 2)   // 'p1' or 'p2'
    const slot = position.slice(2)        // 'a', 'b', 'c'... blank in some contexts

    return { player, slot, name }
}

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

            case 'move': {
                const source = parsePokemonId(parts[2])
                const target = parsePokemonId(parts[4])
                const move = parts[3]

                const tags = parts.slice(5)
                const missed = tags.includes('[miss]')

                console.log(`${source.player} ${source.name} used ${move}`)

                win.webContents.send('move', { source, target, move, missed })
                break
            }

            case 'split':
                // |split|p2
                console.log(`Next message have secret and public version`)
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

                const hp = parts[4];

                if (hp.endsWith('/100')) {

                    break

                }

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

                const pos = parts[2].split(': ')[0] // 'p1a'
                const pId = pos.slice(0, 2)     // 'p1'

                const specName = parts[2].split(': ')[1] // 'Pikachu'

                win.webContents.send('faint', {
                    player: pId,   // 'p1'
                    name: specName,  // 'Pikachu'
                })

                break

            case 'win':
                console.log(`Winner: ${parts[2]}`)
                break

            case 'turn':
                console.log(`Turn ${parts[2]}`)
                break

            case 'request':
                // parts[2] is a JSON string with available moves/switches

                //console.log('Request received:', line)
                const request = JSON.parse(parts[2])

                if (request.wait) {
                    console.log('Waiting on opponent')
                    win.webContents.send('wait', request)
                    break
                }

                if (request.forceSwitch !== undefined) {
                    console.log('Force switch required')
                    win.webContents.send('forceSwitch', request)

                    break
                }

                if (request.side.id === 'p1') {

                    console.log('player 1 choice: ', request)

                    for (const move of request.active[0].moves) {
                        const moveInfo = Dex.moves.get(move.move)
                        move.type = moveInfo.type
                        move.description = moveInfo.desc
                    }

                    win.webContents.send('team', request)
                }

                break
        }
    }
}

module.exports = { parseUpdate }