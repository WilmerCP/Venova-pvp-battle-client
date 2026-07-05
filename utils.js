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
            case 'player': {
                // |player|p1|Anonycat|60|1200
                console.log(`Player: ${parts[3]}`)

                win.webContents.send('player', { id: parts[2], name: parts[3] })

                break
            }

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

            case 'drag':
            case 'switch': {
                // |switch|p1a: Pikachu|Pikachu, L59, F|100/100
                console.log(`${parts[2]} switched in`)

                const details = parts[3]
                const speciesName = details.split(',')[0].trim() // 'Pikachu'
                const level = details.split(',')[1].trim().slice(1) // '59'

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
                    hp: parts[4],        // '100/100'
                    level: level
                })

                break
            }

            case '-damage': {
                // |-damage|p2a: Squirtle|80/100 brn
                console.log(`${parts[2]} took damage, now at ${parts[3]}`)

                const position = parts[2].split(': ')[0] // 'p1a'
                const pId = position.slice(0, 2)     // 'p1'

                let health, total, status;

                if (parts[3] === '0 fnt') {
                    health = 0;
                    total = null; // unknown, Showdown doesn't send max HP on faint
                    status = 'fnt';
                } else {
                    const data = parts[3].split('/');
                    health = data[0];
                    [total, status] = data[1].split(' ');
                }

                console.log(`Health: ${health}, Total: ${total}`)

                win.webContents.send('damage', {
                    player: pId,   // 'p1'
                    hp: Number(health),  // 'hp amount or percentage'
                    maxHp: Number(total)     // 100 or total hp
                })

                break
            }

            case '-heal': {
                // |-heal|p1a: Pikachu|100/100 brn
                console.log(`${parts[2]} healed to ${parts[3]}`)

                const position = parts[2].split(': ')[0] // 'p1a'
                const pId = position.slice(0, 2)     // 'p1'

                const data = parts[3].split('/');
                const health = data[0];
                const [total, status] = data[1].split(' ');
                

                console.log(`Health: ${health}, Total: ${total}`)

                win.webContents.send('heal', {
                    player: pId,   // 'p1'
                    hp: Number(health),  // 'hp amount or percentage'
                    maxHp: Number(total)     // 100 or total hp
                })
                break
            }

            case '-status': {
                // |-status|p2a: Clefable|brn
                console.log(`${parts[2]} status changed to ${parts[3]}`)

                const identifier = parts[2].split(': ')
                const position = identifier[0] // 'p1a'
                const pId = position.slice(0, 2)     // 'p1'
                const name = identifier[1] // 'Clefable'

                win.webContents.send('status', {
                    player: pId,   // 'p1'
                    status: parts[3],  // 'brn'
                    pkmName: name
                })

                break
            }

            case 'faint': {
                console.log(`${parts[2]} fainted`)

                const pos = parts[2].split(': ')[0] // 'p1a'
                const pId = pos.slice(0, 2)     // 'p1'

                const specName = parts[2].split(': ')[1] // 'Pikachu'

                win.webContents.send('faint', {
                    player: pId,   // 'p1'
                    name: specName,  // 'Pikachu'
                })

                break
            }

            case 'win':
                console.log(`Winner: ${parts[2]}`)
                break

            case 'turn':
                console.log(`Turn ${parts[2]}`)
                break

            case 'request': {
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

                    for (const pokemon of request.side.pokemon) {

                        const details = pokemon.details.split(',') // "Ampharos, L84, F"
                        const level = details[1].trim().slice(1); 
                        const speciesInfo = Dex.species.get(details[0].trim())
                        pokemon.num = speciesInfo.num
                        pokemon.name = speciesInfo.name
                        pokemon.level = Number(level)

                        const hpValues = pokemon.condition.split('/');
                        pokemon.currentHp = Number(hpValues[0])
                        pokemon.maxHp = Number(hpValues[1])
                    }

                    win.webContents.send('team', request)
                }

                break
            }

            default:
                console.log(`Unhandled update type: ${type}`)
                console.log(`Line: ${line}`)
                break
        }
    }
}

module.exports = { parseUpdate }