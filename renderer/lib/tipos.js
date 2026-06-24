// src/components/tipos.js
import acero from '../assets/icons/steel.svg';
import agua from '../assets/icons/water.svg';
import bicho from '../assets/icons/bug.svg';
import dragon from '../assets/icons/dragon.svg';
import electrico from '../assets/icons/electric.svg';
import fantasma from '../assets/icons/ghost.svg';
import fuego from '../assets/icons/fire.svg';
import hada from '../assets/icons/fairy.svg';
import hielo from '../assets/icons/ice.svg';
import lucha from '../assets/icons/fighting.svg'
import normal from '../assets/icons/normal.svg';
import planta from '../assets/icons/grass.svg';
import psiquico from '../assets/icons/psychic.svg';
import roca from '../assets/icons/rock.svg';
import siniestro from '../assets/icons/dark.svg';
import tierra from '../assets/icons/ground.svg';
import veneno from '../assets/icons/poison.svg';
import volador from '../assets/icons/flying.svg';

// 2. Diccionario de tipos con su name, color hexadecimal (estilo GBA/DS) e image asociada
const POKEMON_TYPES = {
  Normal: {
    name: "Normal",
    color: "#919AA2",
    image: normal
  },
  Fire: {
    name: "Fire",
    color: "#FF9741",
    image: fuego
  },
  Water: {
    name: "Water",
    color: "#4C92DF",
    image: agua
  },
  Grass: {
    name: "Grass",
    color: "#63BC5A",
    image: planta
  },
  Electric: {
    name: "Electric",
    color: "#F6D030",
    image: electrico
  },
  Ice: {
    name: "Ice",
    color: "#65CCBD",
    image: hielo
  },
  Fighting: {
    name: "Fighting",
    color: "#CE4069",
    image: lucha
  },
  Poison: {
    name: "Poison",
    color: "#AA66CC",
    image: veneno
  },
  Ground: {
    name: "Ground",
    color: "#D97746",
    image: tierra
  },
  Flying: {
    name: "Flying",
    color: "#89AAE3",
    image: volador
  },
  Psychic: {
    name: "Psychic",
    color: "#FA6C76",
    image: psiquico
  },
  Bug: {
    name: "Bug",
    color: "#91C12F",
    image: bicho
  },
  Rock: {
    name: "Rock",
    color: "#C5B679",
    image: roca
  },
  Ghost: {
    name: "Ghost",
    color: "#5269AC",
    image: fantasma
  },
  Dragon: {
    name: "Dragon",
    color: "#4C63B6",
    image: dragon
  },
  Dark: {
    name: "Dark",
    color: "#5A5366",
    image: siniestro
  },
  Steel: {
    name: "Steel",
    color: "#5A8EA1",
    image: acero
  },
  Fairy: {
    name: "Fairy",
    color: "#EC8FE6",
    image: hada
  }
};

export default POKEMON_TYPES;