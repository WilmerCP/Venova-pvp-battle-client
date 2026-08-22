
const { ABILITIES, ITEMS, NATURES, MOVES } = require('./loadDictionaries.js');
const { Dex, TeamValidator, Teams } = require('pokemon-showdown')
const ModdedDex = Dex.mod('venova')

const validator = new TeamValidator('gen8venovacustombattle');

const spanishOverrides = {
    "Type: Null": "Código Cero",
    "Great Tusk": "Colmilargo",
    "Scream Tail": "Colagrito",
    "Brute Bonnet": "Furioseta",
    "Flutter Mane": "Melenaleteo",
    "Slither Wing": "Reptalada",
    "Sandy Shocks": "Pelarena",
    "Iron Treads": "Ferrodada",
    "Iron Bundle": "Ferrosaco",
    "Iron Hands": "Ferropalmas",
    "Iron Jugulis": "Ferrocuello",
    "Iron Moth": "Ferropolilla",
    "Iron Thorns": "Ferropúas",
    "Roaring Moon": "Bramaluna",
    "Iron Valiant": "Ferropaladín",
    "Walking Wake": "Ondulagua",
    "Iron Leaves": "Ferroverdor",
    "Gouging Fire": "Flamariete",
    "Raging Bolt": "Electrofuria",
    "Iron Boulder": "Ferromole",
    "Iron Crown": "Ferrotesta"
}

function cleanPokemonName(name) {
    // Remove anything if there is - in the name, like "Pikachu-Mega" or "Giratina-Origin"
    if (!name) return null

    let cleanedName = name.split('-')[0]

    return spanishOverrides[cleanedName] || cleanedName
}

function parseEffect(text) {
    if (!text) return null

    return text

}

//Parces pokemon ID strings like p1a: Pikachu into an object with player and name properties
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

    if (reasonStr.includes('[silent]')) return {

        type: undefined,
        reason: undefined

    }

    let trimmed = reasonStr.replace('[from]', '');

    if (trimmed.includes('item:')) {

        let itemName = trimmed.replace('item:', '').trim();

        return {

            type: 'item',
            reason: ITEMS[itemName] ? ITEMS[itemName].translation : itemName,

        }



    } else if (trimmed.includes('ability:')) {

        let abilityName = trimmed.replace('ability:', '').trim();

        return {

            type: 'ability',
            reason: ABILITIES[abilityName] ? ABILITIES[abilityName].translation : abilityName

        }


    } else {

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

    if (condition !== undefined) {

        return { conditionName: condition.trim(), origin: origin.trim() }

    } else {

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

async function getDexData() {

    let species = ModdedDex.species.all()
    species = species.filter((pkm) => pkm.isNonstandard == null)
    let fakemonOnly = species.filter((pkm) => pkm.num < 0)

    /*console.log(ModdedDex.species.get('Bullchub'));
    console.log(ModdedDex.species.get('Arpidor'));
    console.log(ModdedDex.species.get('GardevoirV'));*/

    let dexData = fakemonOnly.map((speciesObj) => {

        return {

            name: speciesObj.name,
            num: speciesObj.num * -1,
            abilities: speciesObj.abilities,
            learnset: ModdedDex.data.Learnsets[speciesObj.id].learnset,
            genderRatio: speciesObj.genderRatio,
            genderFixed: speciesObj.genderRatio.M == 0 || speciesObj.genderRatio.F == 0

        }


    })

    //console.log(ModdedDex.items.get('sitrusberry'))

    const movesById = Object.fromEntries(
        Object.values(MOVES).map((m) => [m.id, m])
    )

    const EXCLUDED_KEYWORDS = ['tera'];

    const filteredItems = Object.fromEntries(
        Object.entries(ITEMS).filter(([name, item]) =>
            item.holdable == true && !EXCLUDED_KEYWORDS.some(keyword => name.includes(keyword))
        )
    );

    return {

        venomon: dexData,
        moves: movesById,
        abilities: ABILITIES,
        items: filteredItems,
        natures: NATURES

    }
}

function teamIsValid(team) {

    const output = validator.validateTeam(team);

    if (output == null) {
        console.log("Team is valid")

        return true;
    } else {

        console.log('Team validation failed:', output);
        return false;
    }

}

module.exports = {
    cleanPokemonName, parseEffect, parsePokemonId, parseSideId, parseReason,
    parseCondition, parsePokemonDetails, parseHealth, getDexData, teamIsValid
}