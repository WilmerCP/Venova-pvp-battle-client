const { Dex } = require('pokemon-showdown')

function cleanPokemonName(name) {
    // Remove anything if there is - in the name, like "Pikachu-Mega" or "Giratina-Origin"
    if (!name) return null
    return name.split('-')[0]
}

function parseEffect(text) {
    if (!text) return null 

    return text

}

function parsePokemonId(id) {
    if (!id) return null 

    const [position, name] = id.split(': ')
    // position is like "p1a" — player is first 2 chars, slot letter is the rest
    const player = position.slice(0, 2)   // 'p1' or 'p2'
    const slot = position.slice(2)        // 'a', 'b', 'c'... empty string if not in active position

    return { player, slot, name }
}

function parseSideId(id) {
    if (!id) return null 

    const [player, name] = id.split(': ')

    return { player, name }
}


// |-heal|p1a: Pikachu|100/100 brn
//|-heal|p2a: Scizor|17/100|[from] item: Leftovers
//|-heal|p1a: Gurdurr|290/290 tox|[from] drain|[of] p2a: Hitmontop
//|-heal|p2a: Ferrothorn|191/226|[silent]
//|-heal|p1a: Minun|265/265|[from] ability: Volt Absorb|[of] p2a: Zeraora
function parseReason(reasonStr) {
    if (!reasonStr) return undefined

    if(reasonStr.includes('[silent]')) return undefined

    let trimmed = reasonStr.replace('[from]','');

    if(trimmed.includes('item:')){

        return { 

            type: 'item',
            reason: trimmed.replace('item:','').trim()

        }



    }else if(trimmed.includes('ability:')){

        return { 

            type: 'ability',
            reason: trimmed.replace('ability:','').trim()

        }


    }else{

        return { 

            type: 'move',
            reason: trimmed.trim()

        }

    }

}

//Conditions that affect a side of the field, like Tailwind, Stealth Rock, Reflect...
function parseCondition(text) {
    if (!text) return null 

    const [origin, condition] = text.split(': ')

    if(condition !== undefined){

        return { conditionName: condition.trim(), origin: origin.trim() }

    }else{

        return { conditionName: origin.trim(), origin: undefined }

    }

}

//Parces strings with format Sawsbuck, L50, F, shiny
//no L# means level 100, no F/M means genderless, no shiny means not shiny
function parsePokemonDetails(details) {

    const parts = details.split(',').map(part => part.trim());
    const items = parts.length;

    let speciesName = parts[0];
    let gender = 'none';
    let level = 100;
    let shiny = false;

    for (let i = 1; i < items; i++) {

        let first = parts[i].charAt(0);

        switch (first) {

            case 'L':
                let levelString = parts[i].slice(1);
                level = Number(levelString)
                break

            case 'M':
                gender = 'male';
                break

            case 'F':
                gender = 'female';
                break

            case 's':
                if (parts[i] === 'shiny') {
                    shiny = true;
                }
                break

            default:
                console.warn(`Unrecognized part in details: ${parts[i]}`);
                break

        }

    }

    return { speciesName, gender, level, shiny }
}

//Parces a health string like  156/320 brn or 0 fnt
function parseHealth(healthStr) {

    let health, total, status;

    if (healthStr === '0 fnt') {
        health = 0;
        total = null; // unknown, Showdown doesn't send max HP on faint
        status = 'fnt';
    } else {
        const data = healthStr.split('/');
        health = data[0];
        [total, status] = data[1].split(' ');
    }


    //console.log(`Health: ${health}, Total: ${total}, Status: ${status}`)

    return { current: Number(health), total: Number(total), status: status == undefined ? 'none' : status }

}
//Parces pokemon ID strings like p1a: Pikachu into an object with player and name properties
function parsePokemonID(pkmString) {

    let playerId, name;

    const [position, speciesName] = pkmString.split(': ')
    playerId = position.slice(0, 2)

    return { playerId, speciesName }
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
                console.log(parts)

                const { speciesName, gender, level, shiny } = parsePokemonDetails(parts[3]);

                const { playerId } = parsePokemonID(parts[2]); // 'p1'

                const species = Dex.species.get(speciesName)
                const num = species.num // 25

                const { current, total, status } = parseHealth(parts[4])

                win.webContents.send('switch', {
                    player: playerId,   // 'p1'
                    name: cleanPokemonName(speciesName),  // 'Pikachu'
                    num,                // 25
                    hp: current,             // '100/100'
                    maxHp: total,      // 100
                    level: level,
                    status: status,  // brn, par
                    shiny: shiny,
                    gender: gender,
                    reason: parts[1] // drag o switch
                })

                break
            }

            case '-damage': {
                // |-damage|p2a: Squirtle|80/100 brn
                //|-damage|p1a: Slaking|341/389|[from] Leech Seed|[of] p2a: Ferrothorn
                //|-damage|p2a: Malamar|238/272|[from] Stealth Rock
                //|-damage|p2a: Ditto|161/215|[from] recoil
                console.log(`${parts[2]} took damage, now at ${parts[3]}`)

                const { player, slot, name } = parsePokemonId(parts[2]);

                const { current, total, status } = parseHealth(parts[3]);
                console.log(`Health: ${current}, Total: ${total}, Status: ${status}`)

                win.webContents.send('damage', {
                    player: player,   // 'p1'
                    hp: current,  // 'hp amount or percentage'
                    maxHp: total,     // 100 or total hp
                    status: status,
                    name: name
                })

                break
            }

            case '-heal': {
                // |-heal|p1a: Pikachu|100/100 brn
                //|-heal|p2a: Scizor|17/100|[from] item: Leftovers
                //|-heal|p1a: Gurdurr|290/290 tox|[from] drain|[of] p2a: Hitmontop
                console.log(`${parts[2]} healed to ${parts[3]}`)

                const { player, slot, name } = parsePokemonId(parts[2]);

                const { current, total, status } = parseHealth(parts[3]);

                let healReason, healType;

                if(parts[4] !== undefined){

  
                    const { type, reason } = parseReason(parts[4]);

                    healReason = reason;
                    healType = type;

                }

                //console.log(`Health: ${current}, Total: ${total}`)

                win.webContents.send('heal', {
                    player: player,   // 'p1'
                    hp: current,  // 'hp amount or percentage'
                    maxHp: total,     // 100 or total hp
                    status: status,
                    name: name,
                    reason: healReason,
                    type: healType
                })
                break
            }

            case '-status': {
                // |-status|p2a: Clefable|brn
                console.log(`${parts[2]} status changed to ${parts[3]}`)

                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('status', {
                    player: player,   // 'p1'
                    status: parts[3],  // 'brn'
                    pkmName: name
                })

                break
            }

            case '-curestatus': {
                // |-curestatus|p2a: Clefable|brn
                console.log(`${parts[2]} recovered from ${parts[3]}`)

                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('statusRecover', {
                    player: player,   // 'p1'
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

            case '-crit':{
                //|-crit|p1a: Zeraora

                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('crit', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                })

                break

            }

            case '-supereffective':{
                //|-crit|p1a: Zeraora

                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('supereffective', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                })

                break

            }

            case '-resisted':{
                //|-resisted|POKEMON

                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('resisted', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                })

                break
            }

            case '-immune':{
                //|-immune|POKEMON

                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('immune', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                })


                break
            }

            //When zoroak's illusion ends
            case 'replace': {
                //|replace|p1a: Zoroark|Zoroark, L84, F

                const { player, slot, name } = parsePokemonId(parts[2]);
                const { speciesName, gender, level, shiny } = parsePokemonDetails(parts[3]);

                const species = Dex.species.get(speciesName)
                const num = species.num // 25

                win.webContents.send('replace', {
                    player: player,   // 'p1'
                    name: cleanPokemonName(speciesName),  // 'Pikachu'
                    gender: gender,
                    level: level,
                    shiny: shiny,
                    num: num

                })

                break
            }

            case '-transform':{
                //|-transform|p2a: Ditto|p1a: Mimikyu|[from] ability: Imposter

                const { player, name } = parsePokemonId(parts[2]);
                const {  name: targetName } = parsePokemonId(parts[3]);

                win.webContents.send('transform', {
                    player: player,   // 'p1'
                    name: name,  // 'Ditto'
                    targetName: cleanPokemonName(targetName),  // 'Mimikyu'
                });

                break
            }

            case '-miss':{
                //|-miss|p1a: Bronzong|p2a: Sceptile
                //|-miss|SOURCE|TARGET

                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('miss', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                })

                break
            }

            case 'cant':{
                //|cant|p2a: Poliwrath|slp
                //|cant|POKEMON|REASON|MOVE (move optional)

                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('cant', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                    reason: parts[3],
                    move: parts[4] || null
                })

                break
            }

            case '-enditem':{
                //|-enditem|POKEMON|ITEM|[from]EFFECT
                //|-enditem|p2a: Lickilicky|Leftovers|[from] move: Knock Off|[of] p1a: Cinccino

                const { player, slot, name } = parsePokemonId(parts[2]);
                const item = parts[3];

                win.webContents.send('enditem', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                    item: item
                })

                break
            }

            //Volatile status effects like confusion, taunt, substitute
            case '-start':{
                //|-start|p1a: Zygarde|confusion|[fatigue]
                //|-start|p2a: Alomomola|confusion
                //|-start|p1a: Slaking|move: Leech Seed
                //|-start|POKEMON|EFFECT

                const { player, slot, name } = parsePokemonId(parts[2]);
                const effect = parts[3];

                win.webContents.send('startVolatile', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                    effect: effect
                })

                break
            }

            //A side condition that affects one side of the field. (Tailwind, Stealth Rock, Reflect...)
            case '-sidestart':{
                //|-sidestart|SIDE|CONDITION
                //|-sidestart|p2: Jugador 2|move: Toxic Spikes

                const { player, name } = parseSideId(parts[2]);

                const { conditionName, origin } = parseCondition(parts[3]);

                win.webContents.send('startSideCondition', {
                    player: player,   // 'p1'
                    condition: conditionName,
                    origin: origin
                })

                break
            }

            //Clears all boosts from all Pokémon on both sides. (Haze)
            case '-clearallboost':{
                //|-clearallboost

                win.webContents.send('clearAllBoost', {
                    
                })

                break
            }

            case '-fail':{
                //|-fail|p1a: Qwilfish
                //|-fail|p2a: Regice|unboost|[from] ability: Clear Body|[of] p2a: Regice
                //|-fail|p2a: Cryogonal|heal
                //|-fail|p1a: Pyroar|tox

                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('fail', {

                    player: player,   // 'p1'
                    name: name,  // 'Pikachu',
                    line: line

                    
                })

                break

            }

            case '-end':{
                //|-end|p1a: Zygarde|confusion
                //|-end|POKEMON|EFFECT

                const { player, slot, name } = parsePokemonId(parts[2]);
                const effect = parts[3];

                win.webContents.send('endVolatile', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                    effect: effect
                })

                break
            }

            case 'win':{
                console.log(`Winner: ${parts[2]}`)
                console.log(line);

                win.webContents.send('battleEnd', {
                    result: 'win',
                    winner: parts[2]
                })

                break
            }

            case 'tie':{
                console.log(`Battle ended in a tie`)
                console.log(line);

                win.webContents.send('battleEnd', {
                    result: 'tie'
                })

                break
            }

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

                        const { speciesName, level, gender, shiny } = parsePokemonDetails(pokemon.details);
                        const speciesInfo = Dex.species.get(speciesName)
                        pokemon.num = speciesInfo.num
                        pokemon.name = cleanPokemonName(speciesInfo.name)
                        pokemon.level = Number(level)
                        pokemon.gender = gender
                        pokemon.shiny = shiny

                        const { current, total, status } = parseHealth(pokemon.condition)
                        pokemon.currentHp = current
                        pokemon.maxHp = total
                        pokemon.status = status
                    }

                    win.webContents.send('team', request)
                }

                break
            }

            case '-ability': {
                // |-ability|p1a: Pikachu|Static
                console.log(`${parts[2]} ability changed to ${parts[3]}`)

                console.log(Dex.abilities.get(parts[3])) // Validate ability exists

                break
            }

            //Single turn effects (already handled by other events)
            case 'singleturn': //Grudge, Destiny Bond
            case 'singlemove': // Protect, Focus Punch, Roost
            {
                //|-singleturn|p2a: Alomomola|Protect
                console.log(line);

            }

            //Miscelaneous effects
            case '-activate': {
                //|-activate|p2a: Alomomola|move: Protect
                //|-activate|p2a: Alomomola|confusion
                //|-activate|p2a: Ditto|move: Struggle
                //|-activate|p1a: Granbull|move: Heal Bell

                const { player, slot, name } = parsePokemonId(parts[2]);

                const effect = parseEffect(parts[3]);

                win.webContents.send('effect', {
                    effect: effect,
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                })

                break
            }

            case '-unboost': 
            case '-boost': {
                //|-boost|POKEMON|STAT|AMOUNT
                //|-boost|p1a: Aegislash|atk|2

                const { player, slot, name } = parsePokemonId(parts[2]);

                const stat = parts[3];
                const amount = parts[4];

                const negative = parts[1] == '-unboost' ? true : false;

                win.webContents.send('boost', {
                    stat,
                    player,   // 'p1'
                    name,  // 'Pikachu'
                    amount,
                    negative
                })

                break
            }

            case '-weather': {
                // |-weather|DesolateLand|[from] ability: Desolate Land|[of] p1a: Groudon
                console.log(`Weather changed to ${parts[2]}`)
                break
            }

            case 'upkeep':
                console.log(`Line: ${line}`)
                break

            case '':
                //Line is empty, ignore
                break

            case 't:':
                //Time information, ignore
                break

            case 'start':
                //Battle starts, ignore
                break

            case 'gametype':
            case 'teamsize':
            case 'tier':
                //Ignore
                break

            case 'gen':
            case 'rule':
                console.log(`Line: ${line}`)
                break

            default:
                console.log(`Unhandled update type: ${type}`)
                console.log(`Line: ${line}`)
                break
        }
    }
}

module.exports = { parseUpdate }