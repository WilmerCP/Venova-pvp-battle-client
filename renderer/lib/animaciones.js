// src/lib/animaciones.js


//
const MOVE_ANIMATIONS = {

    default: {
        physical: {
            src: "attack-1.png",
            cols: 5,
            rows: 2
        },
        special: {
            src: "attack-2.png",
            cols: 5,
            rows: 2
        },
        heal: {
            src: "Heal_Default.png",
            cols: 5,
            rows: 3,
            totalFrames: 13

        },
        status_self: {
            src: "attack-1.png",
            cols: 5,
            rows: 2
        },
        status_other: {
            src: "attack-1.png",
            cols: 5,
            rows: 2
        },
    },

    moves: {
        'Tackle': {
            src: "attack-1.png",
            cols: 5,
            rows: 2
        },
        'Crunch': {
            src: "Crunch.png",
            cols: 4,
            rows: 3
        },
        'Dragon Claw': {
            src: "Dragon_Claw.png",
            cols: 4,
            rows: 5
        },
        'Rock Tomb': {
            src: "Rock_Tomb.png",
            cols: 4,
            rows: 2
        },
        'Stone Edge': {
            src: "Rock_Tomb.png",
            cols: 4,
            rows: 2
        },
        'Iron Head': {
            src: "Iron_Head.png",
            cols: 4,
            rows: 1
        },
        'Thunderbolt': {
            src: "electric.png",
            cols: 5,
            rows: 3
        },
        'Ancient Power': {
            src: "Ancient_Power.png",
            cols: 5,
            rows: 3
        },
        'Shadow Ball': {
            src: "Shadow_Ball.png",
            cols: 5,
            rows: 4,
            totalFrames: 18
        },
        'Psycho Cut': {
            src: "Psycho_Cut.png",
            cols: 4,
            rows: 4,
            totalFrames: 13
        },
        'Swift': {
            src: "Swift.png",
            cols: 5,
            rows: 3,
            totalFrames: 11
        },
        'Hurricane': {
            src: "Hurricane.png",
            cols: 5,
            rows: 3,
            totalFrames: 12
        },
        'Toxic': {
            src: "Poison_Special.png",
            cols: 5,
            rows: 3,
            totalFrames: 13
        },
        'Curse': {
            src: "Curse.png",
            cols: 5,
            rows: 3,
            totalFrames: 11
        },
    },

    elemental: {
        Normal: {
            name: "Attack",
            src: "attack-1.png",
            cols: 5,
            rows: 2
        },
        Fire: {
            Special: {
                src: "Fire_Special.png",
                cols: 5,
                rows: 3,
                totalFrames: 14
            },
            Physical: {
                src: "Fire_Physical.png",
                cols: 5,
                rows: 3,
                totalFrames: 12
            },
        },
        Water: {
            name: "Water",
            src: "water-1.png",
            cols: 5,
            rows: 2
        },
        Grass: {
            Physical: {
                src: "Grass_Physical.png",
                cols: 5,
                rows: 3,
                totalFrames: 13
            },
        },
        Electric: {
            Special: {
                src: "electric.png",
                cols: 5,
                rows: 2
            },
        },
        Ice: {
            name: "Ice",
            src: "ice-1.png",
            cols: 5,
            rows: 2
        },
        Fighting: {
            name: "Fighting",
            src: "fighting-1.png",
            cols: 5,
            rows: 2
        },
        Poison: {
            Special: {
                src: "Poison_Special.png",
                cols: 5,
                rows: 3,
                totalFrames: 13
            },
            Physical: {
                src: "Poison_Physical.png",
                cols: 5,
                rows: 2
            },
        },
        Ground: {
            name: "Ground",
            src: "ground-1.png",
            cols: 5,
            rows: 2
        },
        Flying: {
            name: "Flying",
            src: "flying-1.png",
            cols: 5,
            rows: 2
        },
        Psychic: {
            name: "Psychic",
            src: "psychic-1.png",
            cols: 5,
            rows: 2
        },
        Bug: {
            name: "Bug",
            src: "bug-1.png",
            cols: 5,
            rows: 2
        },
        Rock: {
            name: "Rock",
            src: "rock-1.png",
            cols: 5,
            rows: 2
        },
        Ghost: {
            Physical: {
                src: "Ghost_Special.png",
                cols: 5,
                rows: 3,
            },
        },
        Dragon: {
            name: "Dragon",
            src: "dragon-1.png",
            cols: 5,
            rows: 2
        },
        Dark: {
            name: "Dark",
            src: "dark-1.png",
            cols: 5,
            rows: 2
        },
        Steel: {
            Physical: {
                src: "Iron_Head.png",
                cols: 4,
                rows: 1
            },
        },
        Fairy: {
            name: "Fairy",
            src: "fairy-1.png",
            cols: 5,
            rows: 2
        }
    }
};

export default MOVE_ANIMATIONS;