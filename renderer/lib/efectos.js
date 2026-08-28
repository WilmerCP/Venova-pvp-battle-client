const EFFECTS = {

    'confusion': {
        src: "confused.png",
        cols: 5,
        rows: 4,
        totalFrames: 16,
        fallFrom: -60,
        fallTo: -60,
    },
    'selfHit': {
        src: "Tackle.png",
        cols: 1,
        rows: 1,
        frameDuration: 500,
        totalFrames: 1,
        scaleFrom: 1,
        scaleTo: 1.4
    },
    'move: Fire Spin': {
        src: "Fire_Spin.png",
        cols: 4,
        rows: 1,
        frameDuration: 130,
        fallFrom: 0,
        fallTo: 0
    },
    'par': {
        src: "paralisis.png",
        cols: 4,
        rows: 1,
        frameDuration: 100,
        totalFrames: 8
    },
    'Attract': {
        src: "love.png",
        cols: 4,
        rows: 3,
        frameDuration: 180,
        totalFrames: 9,
        fallFrom: -80,
        fallTo: -120,
        slideFrom: 50,
        slideTo: 80,
        scaleFrom: 0.5,
        scaleTo: 0.5
    },
    'brn': {
        src: "burns.png",
        cols: 4,
        rows: 2,
        frameDuration: 100,
        totalFrames: 6,
        scaleFrom: 0.7,
        scaleTo: 0.7
    },

}

export default EFFECTS;