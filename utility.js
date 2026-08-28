
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
    let gender = 'N';
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
                gender = 'M';
                break

            case 'F':
                gender = 'F';
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

//Obtain venomon only filtered dex data
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

//Validates a team using the pokemon-showdown TeamValidator
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

//Converts ordered list of 6 stats (evs,ivs) into an object with keys (Showdown format)
function parseStats(list) {

    if (!list || list.length != 6) return

    return { hp: list[0], atk: list[1], def: list[2], spe: list[3], spa: list[4], spd: list[5] }

}


//Finds the move object matching by the venova adventures internal numerical id
function findMoveById(targetId) {
    return Object.values(MOVES).find((move) => move.gameId === targetId);
}

//Finds the venomon from the pokedex index number
function getSpeciesByNum(num) {
    return ModdedDex.species.all().find(sp => sp.num === num);
}

const natures_array = [
    'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
    'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
    'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
    'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
    'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'
];

//Same calculation as venova adventures internal scripts
function getNature(personalID) {
    const id = typeof personalID === 'string' ? parseInt(personalID, 10) : personalID;
    return natures_array[id % 25];
}

//Same calculation as venova adventures internal scripts
function getAbility(personalID, name) {
    const id = typeof personalID === 'string' ? parseInt(personalID, 10) : personalID;
    const abilityId = id % 2;

    const ability1 = ModdedDex.species.get(name).abilities[String(abilityId)];

    return ability1 !== undefined ? ability1 : ModdedDex.species.get(name).abilities['0'];
}

function getGenderFromPersonalID(personalID, genderRatio) {
    if (!genderRatio) return 'N';

    const { M, F } = genderRatio;

    // Géneros fijos
    if (F === 1 && M === 0) return 'F';
    if (M === 1 && F === 0) return 'M';
    if (M === 0 && F === 0) return 'N'; // genderless

    // Reconstruye el byte de threshold original (genderRatio de la dex, 0-255)
    // La fórmula inversa de: F = (255 - genderbyte + 1) / 256
    const genderByte = Math.round(255 - F * 256 + 1);

    const lowByte = personalID & 0xFF;

    return lowByte < genderByte ? 'M' : 'F';
}

//|-status|p2a: Gigatric|brn|[from] ability: Flame Body|[of] p1a: Fautorn
//|-weather|RainDance|[from] ability: Drizzle|[of] p1a: Kyogre
function parseTags(tags) {

    const upkeep = tags.includes('[upkeep]');
    const missed = tags.includes('[miss]');
    const still = tags.includes('[still]');

    const fromTag = tags.find(t => t.startsWith('[from]'))

    const fromInfo = fromTag ? fromTag.replace('[from]', '').trim() : null;

    const ability = fromInfo && fromInfo.includes('ability: ') ? fromInfo.replace('ability: ', '').trim() : null
    const abilityTranslation = ability ? ABILITIES[ability] !== undefined ? ABILITIES[ability].translation : ability : null;

    const ofTag = tags.find(t => t.startsWith('[of]'));

    let ofPokemon = ofTag ? ofTag.replace('[of] ', '') : null; // "p2a: Sazonte"

    ofPokemon = ofPokemon ? parsePokemonId(ofPokemon) : null;

    const extraInfo = tags.find(t => !t.includes('['));

    return { upkeep, missed, still, fromInfo, ability, abilityTranslation, ofPokemon, extraInfo }


}

function parseFailInfo(parts) {
    // parts viene de line.split('|')
    // Ej: ["", "-fail", "p2a: Regice", "unboost", "[from] ability: Clear Body", "[of] p2a: Regice"]

    const { player, slot, name } = parsePokemonId(parts[2]);

    // parts[3] puede ser: 'move: Substitute', 'unboost', 'heal', 'tox', 'slp', etc. o undefined
    const action = parts[3] || null;

    let effectFrom = null; // ej: 'ability: Clear Body'
    let effectOf = null;   // ej: { player, slot, name } del pokemon origen del efecto
    let isWeak = false;    // true cuando aparece [weak]

    for (let i = 4; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;

        if (part.startsWith('[from]')) {
            effectFrom = part.replace('[from]', '').trim();
        } else if (part.startsWith('[of]')) {
            const ofRaw = part.replace('[of]', '').trim();
            effectOf = parsePokemonId(ofRaw);
        } else if (part.startsWith('[weak]')) {
            isWeak = true;
        }
    }

    return { player, slot, name, action, effectFrom, effectOf, isWeak };
}

module.exports = {
    cleanPokemonName, parseEffect, parsePokemonId, parseSideId, parseReason,
    parseCondition, parsePokemonDetails, parseHealth, getDexData, teamIsValid,
    getAbility, getNature, getSpeciesByNum, findMoveById, parseStats, getGenderFromPersonalID,
    parseFailInfo, parseTags
}