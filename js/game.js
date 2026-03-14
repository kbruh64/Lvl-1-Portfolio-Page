const gameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#0a0a1a',
    dom: { createContainer: true },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MainScene, CPSScene, WhackAMoleScene, PuzzleScene, AdminScene]
};

new Phaser.Game(gameConfig);
