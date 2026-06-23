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
  Fuego: {
    name: "Fuego",
    color: "#FF9741",
    image: fuego
  },
  Agua: {
    name: "Agua",
    color: "#4C92DF",
    image: agua
  },
  Planta: {
    name: "Planta",
    color: "#63BC5A",
    image: planta
  },
  Electrico: {
    name: "Eléctrico",
    color: "#F6D030",
    image: electrico
  },
  Hielo: {
    name: "Hielo",
    color: "#65CCBD",
    image: hielo
  },
  Lucha: {
    name: "Lucha",
    color: "#CE4069",
    image: lucha
  },
  Veneno: {
    name: "Veneno",
    color: "#AA66CC",
    image: veneno
  },
  Tierra: {
    name: "Tierra",
    color: "#D97746",
    image: tierra
  },
  Volador: {
    name: "Volador",
    color: "#89AAE3",
    image: volador
  },
  Psiquico: {
    name: "Psíquico",
    color: "#FA6C76",
    image: psiquico
  },
  Bicho: {
    name: "Bicho",
    color: "#91C12F",
    image: bicho
  },
  Roca: {
    name: "Roca",
    color: "#C5B679",
    image: roca
  },
  Fantasma: {
    name: "Fantasma",
    color: "#5269AC",
    image: fantasma
  },
  Dragon: {
    name: "Dragón",
    color: "#4C63B6",
    image: dragon
  },
  Siniestro: {
    name: "Siniestro",
    color: "#5A5366",
    image: siniestro
  },
  Acero: {
    name: "Acero",
    color: "#5A8EA1",
    image: acero
  },
  Hada: {
    name: "Hada",
    color: "#EC8FE6",
    image: hada
  }
};

export default POKEMON_TYPES;