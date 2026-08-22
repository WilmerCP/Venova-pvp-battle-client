//Function to get the path of the icon for a given pokemon number
export function getMiniSrc(number) {
    const key = `icon${String(number).padStart(3, '0')}.png`;
    return `/minis/${key}`;
}

//Function to get the path of the battle sprite for a given pokemon number
export function getBattlerSrc(number, { back = false, shiny = false } = {}) {
    const suffix = `${shiny ? 's' : ''}${back ? 'b' : ''}`;
    const key = `${String(number).padStart(3, '0')}${suffix}.png`;
    return `/battlers/${key}`;
}

export function getGenderFromRatio(ratio) {
  if (ratio.F === 0 && ratio.M === 0) return 'N';

  const n = Math.random();
  return n < ratio.F ? 'F' : 'M'; 
}
