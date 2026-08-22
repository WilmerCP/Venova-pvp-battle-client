const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, 'data', 'items.json');
const abilitiesPath = path.join(__dirname, 'data', 'abilities.json');
const movesPath = path.join(__dirname, 'data', 'moves.json');
const naturesPath = path.join(__dirname, 'data', 'natures.json');

let movesStr = fs.readFileSync(movesPath);
const MOVES = JSON.parse(movesStr);

let abilitiesStr = fs.readFileSync(abilitiesPath);
const ABILITIES = JSON.parse(abilitiesStr);


let itemsStr = fs.readFileSync(itemsPath);
const ITEMS = JSON.parse(itemsStr);

let naturesStr = fs.readFileSync(naturesPath);
const NATURES = JSON.parse(naturesStr);


module.exports = { MOVES, ABILITIES, ITEMS, NATURES }