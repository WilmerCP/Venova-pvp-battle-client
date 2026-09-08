const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..', '..');
const itemsPath = path.join(projectRoot, 'data', 'items.json');
const abilitiesPath = path.join(projectRoot, 'data', 'abilities.json');
const movesPath = path.join(projectRoot, 'data', 'moves.json');
const naturesPath = path.join(projectRoot, 'data', 'natures.json');

let movesStr = fs.readFileSync(movesPath);
const MOVES = JSON.parse(movesStr);

let abilitiesStr = fs.readFileSync(abilitiesPath);
const ABILITIES = JSON.parse(abilitiesStr);


let itemsStr = fs.readFileSync(itemsPath);
const ITEMS = JSON.parse(itemsStr);

let naturesStr = fs.readFileSync(naturesPath);
const NATURES = JSON.parse(naturesStr);


module.exports = { MOVES, ABILITIES, ITEMS, NATURES }