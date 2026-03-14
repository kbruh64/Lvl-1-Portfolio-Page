const gameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#f4f6ff',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MainScene, CPSScene, WhackAMoleScene, PuzzleScene, AdminScene]
};

new Phaser.Game(gameConfig);
