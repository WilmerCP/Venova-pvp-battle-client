const { Dex } = require('pokemon-showdown')

const ModdedDex = Dex.mod('venova')

const { MOVES, ABILITIES, ITEMS } = require('./loadDictionaries.js');

const { cleanPokemonName, parseEffect, parsePokemonId, parseSideId,
    parseCondition, parsePokemonDetails, parseHealth, parseTags, parseFailInfo } = require('./utility.js')

async function parseUpdate(content, win) {
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.startsWith('|')) continue

        const parts = line.split('|')
        const type = parts[1]

        //Filter out duplicate lines
        if (type === 'split') {
            i++;
            continue;
        }

        switch (type) {
            case 'player': {
                // |player|p1|Anonycat|60|1200
                console.log(`Player: ${parts[3]}`)

                win.webContents.send('player', { id: parts[2], name: parts[3] })

                break
            }

            //|move|p2a: Togekiss|Roost||[still]
            //|move|p2a: Togekiss|Roost|p2a: Togekiss
            //|move|p1a: Onzanterian|Thunder Wave|p2a: Sazonte|[from] ability: Magic Bounce
            //|-anim|p1a: Truzuhe|Solar Beam|p2a: RaltsV
            case '-anim':
            case 'move': {
                const source = parsePokemonId(parts[2]) //{ player, slot, name }
                const target = parsePokemonId(parts[4]) //{ player, slot, name }
                const move = parts[3]

                const { missed, still, ability, abilityTranslation, ofPokemon } = parseTags(parts.slice(5));

                //console.log(line)

                //console.log(`${source.player} ${source.name} used ${move}`)

                const moveInfo = ModdedDex.moves.get(move)
                //console.log(moveInfo)
                const type = moveInfo.type
                const category = moveInfo.category //Physical, Special, Status
                const targetType = moveInfo.target //normal, self, allAdjacentFoes
                const heal = moveInfo.flags['heal'] !== undefined ? true : false

                const translation = MOVES[move] !== undefined ? MOVES[move].translation : move;
                const description = MOVES[move] !== undefined ? MOVES[move].description : 'Movimiento desconocido';

                win.webContents.send('move',
                    {
                        source, target, move, missed, still, type, targetType, category, heal,
                        translation, description, ability, ofPokemon, abilityTranslation
                    })

                break
            }

            case 'split':
                // |split|p2
                console.log(`Next message have secret and public version`)
                break

            case 'drag':
            case 'switch': {
                // |switch|p1a: Pikachu|Pikachu, L59, F|100/100
                //|switch|p1a: Simobolite|Simobolite|100/100|[from] Baton Pass

                console.log(parts)

                const { speciesName, gender, level, shiny } = parsePokemonDetails(parts[3]);
                console.log(gender)

                const { player } = parsePokemonId(parts[2]); // 'p1'

                const species = ModdedDex.species.get(speciesName)
                const num = species.num // 25

                console.log(`${speciesName} switched in with number ${num}`);
                if (num === 0) {
                    console.log(species);
                }

                const { current, total, status } = parseHealth(parts[4])

                win.webContents.send('switch', {
                    player: player,   // 'p1'
                    name: cleanPokemonName(speciesName),  // 'Pikachu'
                    num: num * -1,                // 25
                    hp: current,             // '100/100'
                    maxHp: total,      // 100
                    level: level,
                    status: status,  // brn, par
                    shiny: shiny,
                    gender: gender,
                    reason: parts[1], // drag o switch
                    batonPass: parts[5] === '[from] Baton Pass' ? true : false
                })

                break
            }

            case '-damage': {
                // |-damage|p2a: Squirtle|80/100 brn
                //|-damage|p1a: Slaking|341/389|[from] Leech Seed|[of] p2a: Ferrothorn
                //|-damage|p2a: Malamar|238/272|[from] Stealth Rock
                //|-damage|p2a: Ditto|161/215|[from] recoil
                //|-damage|p2a: Rockicer|207/272|[from] confusion
                //|-damage|p1a: Bulltauron|310/374|[from] ability: Rough Skin|[of] p2a: Cairoco
                console.log(`${parts[2]} took damage, now at ${parts[3]}`)

                const { player, slot, name } = parsePokemonId(parts[2]);

                const { current, total, status } = parseHealth(parts[3]);
                console.log(`Health: ${current}, Total: ${total}, Status: ${status}`)

                const { fromInfo, ability, abilityTranslation, ofPokemon } = parseTags(parts.slice(4));


                win.webContents.send('damage', {
                    player: player,   // 'p1'
                    hp: current,  // 'hp amount or percentage'
                    maxHp: total,     // 100 or total hp
                    status: status,
                    name: name,
                    from: fromInfo,
                    ofPokemon: ofPokemon,
                    ability,
                    abilityTranslation
                })

                break
            }

            case '-heal': {
                // |-heal|p1a: Pikachu|100/100 brn
                //|-heal|p2a: Scizor|17/100|[from] item: Leftovers
                //|-heal|p1a: Gurdurr|290/290 tox|[from] drain|[of] p2a: Hitmontop
                //|-heal|p2a: Motiti|100/100 slp|[silent]
                //|-heal|p1a: Orquicess|403/403|[from] move: Wish|[wisher] Orquicess

                console.log(`${parts[2]} healed to ${parts[3]}`)

                const { player, slot, name } = parsePokemonId(parts[2]);

                const { current, total, status } = parseHealth(parts[3]);


                const { fromInfo, ability, abilityTranslation,
                     ofPokemon, silent, wisher, reason, type} = parseTags(parts.slice(4));

                win.webContents.send('heal', {
                    player: player,   // 'p1'
                    hp: current,  // 'hp amount or percentage'
                    maxHp: total,     // 100 or total hp
                    status: status,
                    name: name,
                    reason,
                    type,
                    wisher,
                    ofPokemon,
                    from: fromInfo,
                    ability,
                    abilityTranslation
                })
                break
            }

            case '-status': {
                // |-status|p2a: Clefable|brn
                //|-status|p2a: Gigatric|brn|[from] ability: Flame Body|[of] p1a: Fautorn
                //console.log(`${parts[2]} status changed to ${parts[3]}`)

                const { ability, abilityTranslation, ofPokemon } = parseTags(parts.slice(3));


                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('status', {
                    player: player,   // 'p1'
                    status: parts[3],  // 'brn'
                    pkmName: name,
                    ability,
                    abilityTranslation,
                    ofPokemon
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

            case '-crit': {
                //|-crit|p1a: Zeraora

                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('crit', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                })

                break

            }

            case '-supereffective': {
                //|-crit|p1a: Zeraora

                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('supereffective', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                })

                break

            }

            case '-resisted': {
                //|-resisted|POKEMON

                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('resisted', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                })

                break
            }

            case '-immune': {
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

                const species = ModdedDex.species.get(speciesName)
                const num = species.num // 25

                win.webContents.send('replace', {
                    player: player,   // 'p1'
                    name: cleanPokemonName(speciesName),  // 'Pikachu'
                    gender: gender,
                    level: level,
                    shiny: shiny,
                    num: num * -1

                })

                break
            }

            case '-transform': {
                //|-transform|p2a: Ditto|p1a: Mimikyu|[from] ability: Imposter

                const { player, name } = parsePokemonId(parts[2]);
                const { name: targetName } = parsePokemonId(parts[3]);

                win.webContents.send('transform', {
                    player: player,   // 'p1'
                    name: name,  // 'Ditto'
                    targetName: cleanPokemonName(targetName),  // 'Mimikyu'
                });

                break
            }

            case '-miss': {
                //|-miss|p1a: Bronzong|p2a: Sceptile
                //|-miss|SOURCE|TARGET

                const { player, slot, name } = parsePokemonId(parts[2]);

                win.webContents.send('miss', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                })

                break
            }

            case 'cant': {
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

            case '-enditem': {
                //|-enditem|POKEMON|ITEM|[from]EFFECT
                //|-enditem|p2a: Lickilicky|Leftovers|[from] move: Knock Off|[of] p1a: Cinccino
                //|-enditem|p2a: Gorebyss|White Herb

                const { player, slot, name } = parsePokemonId(parts[2]);
                const item = parts[3].trim();

                win.webContents.send('enditem', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                    item: ITEMS[item] ? ITEMS[item].translation : item,
                })

                break
            }

            //Volatile status effects like confusion, taunt, substitute
            case '-start': {
                //|-start|p1a: Zygarde|confusion|[fatigue]
                //|-start|p2a: Alomomola|confusion
                //|-start|p1a: Slaking|move: Leech Seed
                //|-start|POKEMON|EFFECT
                //|-start|p2a: Suicune|Substitute
                //|-start|p2a: Venapivar|Disable|Absorb|[from] ability: Cursed Body|[of] p1a: Sayolda

                const { player, slot, name } = parsePokemonId(parts[2]);
                const effect = parts[3];

                const { fromInfo, ability, abilityTranslation, ofPokemon, extraInfo } =  parseTags(parts.slice(4));

                win.webContents.send('startVolatile', {
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                    effect: effect,
                    extraInfo,
                    fromInfo,
                    ability,
                    abilityTranslation,
                    ofPokemon
                })

                break
            }

            //A side condition that affects one side of the field. (Tailwind, Stealth Rock, Reflect...)
            case '-sidestart': {
                //|-sidestart|SIDE|CONDITION
                //|-sidestart|p2: Jugador 2|move: Toxic Spikes
                //|-sidestart|p2: Jugador 2|Safeguard


                const { player, name } = parseSideId(parts[2]);

                const { conditionName, origin } = parseCondition(parts[3]);

                win.webContents.send('startSideCondition', {
                    player: player,   // 'p1'
                    condition: conditionName,
                    origin: origin
                })

                break
            }

            //A side condition that affects one side of the field. (Tailwind, Stealth Rock, Reflect...)
            case '-sideend': {
                //|-sideend|SIDE|CONDITION
                //|-sideend|p2: Jugador 2|move: Light Screen


                const { player, name } = parseSideId(parts[2]);

                const { conditionName, origin } = parseCondition(parts[3]);

                win.webContents.send('endSideCondition', {
                    player: player,   // 'p1'
                    condition: conditionName,
                    origin: origin
                })

                break
            }

            //Clears all boosts from all Pokémon on both sides. (Haze)
            case '-clearallboost': {
                //|-clearallboost

                win.webContents.send('clearAllBoost', {

                })

                break
            }

            //The specified ACTION has failed against the POKEMON targeted. The ACTION in question should be a move that fails due to its own mechanics. 
            case '-fail': {
                //|-fail|p1a: Qwilfish (mov. tipo sonambulo, sorpresa, ultima baza.)
                //|-fail|p2a: Regice|unboost|[from] ability: Clear Body|[of] p2a: Regice (La bajada de estadisticas no tuvo efecto debido a la habilidad Cuerpo Puro)
                //|-fail|p2a: Cryogonal|heal (no puede curarse, ya tiene la vida completa)
                //|-fail|p1a: Pyroar|tox (ya esta envenenado)
                //|-fail|p2a: Articuno|move: Substitute|[weak] (No puede hacer sustituto)
                //|-fail|p1a: Knoc|slp (ya esta dormido)

                const failInfo = parseFailInfo(parts);

                win.webContents.send('fail', {
                    ...failInfo,
                    line: line
                })

                break

            }

            case '-end': {
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

            case 'win': {
                console.log(`Winner: ${parts[2]}`)
                console.log(line);

                win.webContents.send('battleEnd', {
                    result: 'win',
                    winner: parts[2]
                })

                break
            }

            case 'tie': {
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

                    //console.log('player 1 choice: ', request)

                    for (const move of request.active[0].moves) {
                        const moveInfo = ModdedDex.moves.get(move.move)
                        move.type = moveInfo.type

                        const officialInfo = Dex.moves.get(move.move);

                        if (!officialInfo) {
                            console.log(`Move ${move.move} not found in official Dex`)
                            console.log(moveInfo)
                        }
                        //console.log(`Move: ${move.move}, Type: ${move.type}`)

                        const translation = MOVES[move.move] !== undefined ? MOVES[move.move].translation : move.move;
                        const description = MOVES[move.move] !== undefined ? MOVES[move.move].description : 'Movimiento desconocido';

                        move.translation = translation;
                        move.description = description;
                    }

                    for (const pokemon of request.side.pokemon) {

                        const { speciesName, level, gender, shiny } = parsePokemonDetails(pokemon.details);
                        const speciesInfo = ModdedDex.species.get(speciesName)
                        pokemon.num = speciesInfo.num * -1
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
                //|-ability|p1a: Kartana|Beast Boost|boost
                //|-ability|p2a: Zebstrika|Sap Sipper|boost
                console.log(`${parts[2]} ability changed to ${parts[3]}`)

                //console.log(ModdedDex.abilities.get(parts[3])) // Validate ability exists

                const { player, slot, name } = parsePokemonId(parts[2]);

                const ability = parts[3];

                const translation = ABILITIES[ability] !== undefined ? ABILITIES[ability].translation : ability;

                const description = ABILITIES[ability] !== undefined ? ABILITIES[ability].description : 'Habilidad desconocida';

                win.webContents.send('ability', {
                    ability: parts[3],
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu',
                    translation: translation,
                    description: description
                })

                break
            }

            case '-weather': {
                //|-weather|RainDance|[from] ability: Drizzle|[of] p1a: Kyogre

                //console.log(line);
                const { upkeep, ability, abilityTranslation, ofPokemon } = parseTags(parts.slice(3));

                win.webContents.send('weather', {
                    type: parts[2],
                    upkeep,
                    ability,
                    abilityTranslation,
                    ofPokemon
                })

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
                //|-activate|p2a: Alomomola|confusion -> Only the animation, no damage
                //|-activate|p2a: Ditto|move: Struggle
                //|-activate|p1a: Granbull|move: Heal Bell
                //|-activate|p1a: Rotom|move: Trick|[of] p2a: Hitmonlee
                //|-activate|p1a: Onzanterian|move: Attract|[of] p2a: Sazonte

                const { player, slot, name } = parsePokemonId(parts[2]);

                const effect = parseEffect(parts[3]);

                const { ofPokemon } = parseTags(parts.slice(4));


                win.webContents.send('effect', {
                    effect: effect,
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                    ofPokemon
                })

                break
            }

            //Charge moves
            case '-prepare': {
                //|-prepare|p1a: Dragonite|Fly
                //|-prepare|ATTACKER|MOVE|DEFENDER

                const { player, slot, name } = parsePokemonId(parts[2]);

                const move = parts[3];

                win.webContents.send('prepare', {
                    move: move,
                    player: player,   // 'p1'
                    name: name,  // 'Pikachu'
                })

                break;

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

            case '-item': {
                //|-item|p2a: Hitmonlee|Choice Scarf|[from] move: Trick
                //|-item|p1a: Rotom|White Herb|[from] move: Trick

                console.log(line)



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