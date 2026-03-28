const gameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: 'rgba(0,0,0,0)',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [HomeScene, MainScene, ProjectScene, CPSScene, WhackAMoleScene, PuzzleScene, AdminScene]
};

new Phaser.Game(gameConfig);
