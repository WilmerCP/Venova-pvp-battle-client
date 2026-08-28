const Marshal = require('marshal');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { getAbility, getNature, getSpeciesByNum,
   findMoveById, parseStats, getGenderFromPersonalID } = require('./utility.js');

function getDefaultSavePath() {
  const driveLetter = path.parse(__dirname).root;
  const username = os.userInfo().username;
  const saveDir = path.join(driveLetter, 'Users', username, 'Saved Games', 'Venova Adventure ClosedBeta');
  return path.join(saveDir, 'Game.rxdata');
}

function parseTeamFromSave(savePath) {
  const buffer = fs.readFileSync(savePath);
  const data = new Marshal(buffer).parsed;

  return data['@party'].map((pkm) => {
    const species = getSpeciesByNum(pkm['@species'] * -1);

    return {
      name: pkm['@name'],
      species: species.name,
      ivs: parseStats(pkm['@iv']),
      evs: parseStats(pkm['@ev']),
      num: pkm['@species'],
      happiness: pkm['@happiness'],
      moves: pkm['@moves'].map((move) => findMoveById(move['@id']).name),
      level: 100,
      nature: getNature(pkm['@personalID']),
      ability: getAbility(pkm['@personalID'], species),
      gender: getGenderFromPersonalID(pkm['@personalID'],species.genderRatio)
    };
  });
}

function getTeamFromSaveData() {

  try {

    const savePath = getDefaultSavePath();
    const team = parseTeamFromSave(savePath);
    console.log(team);

    return team;

  } catch (e) {

    console.log(e);
    return false;

  }

}

module.exports = getTeamFromSaveData;