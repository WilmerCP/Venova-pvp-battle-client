//Function to get the path of the icon for a given pokemon number
export function getMiniSrc(number,{ femaleSprite = false } = {} ) {
    const suffix = `${femaleSprite ? 'f' : ''}`;
    const key = `icon${String(number).padStart(3, '0')}${suffix}.png`;
    return `/minis/${key}`;
}

//Function to get the path of the battle sprite for a given pokemon number
export function getBattlerSrc(number, { back = false, shiny = false, femaleSprite = false } = {}) {
    const suffix = `${femaleSprite ? 'f' : ''}${shiny ? 's' : ''}${back ? 'b' : ''}`;
    const key = `${String(number).padStart(3, '0')}${suffix}.png`;
    return `/battlers/${key}`;
}

export function getGenderFromRatio(ratio) {
  if (ratio.F === 0 && ratio.M === 0) return 'N';

  const n = Math.random();
  return n < ratio.F ? 'F' : 'M'; 
}

export function getRandomPin() {
    if (crypto.randomInt) {
        return crypto.randomInt(100000, 1000000).toString();
    }

    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return (100000 + (array[0] % 900000)).toString();
}
