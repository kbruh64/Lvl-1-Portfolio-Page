class WhackAMoleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WhackAMoleScene' });
    }

    preload() {
        // Generate mole texture
        const mg = this.make.graphics({ add: false });
        // Mole body
        mg.fillStyle(0x6b3a2a); mg.fillCircle(40, 45, 34);
        // Face lighter
        mg.fillStyle(0x8a5040); mg.fillEllipse(40, 50, 40, 32);
        // Eyes
        mg.fillStyle(0x111111); mg.fillCircle(28, 38, 6); mg.fillCircle(52, 38, 6);
        mg.fillStyle(0xffffff); mg.fillCircle(30, 36, 2); mg.fillCircle(54, 36, 2);
        // Nose
        mg.fillStyle(0xee6677); mg.fillEllipse(40, 52, 14, 10);
        // Teeth
        mg.fillStyle(0xffffff);
        mg.fillRect(34, 57, 5, 6);
        mg.fillRect(41, 57, 5, 6);
        mg.generateTexture('mole', 80, 80);
        mg.destroy();

        // Mole hit (stars/yellow flash)
        const hg = this.make.graphics({ add: false });
        hg.fillStyle(0xffee00); hg.fillCircle(40, 40, 38);
        hg.fillStyle(0xffffff); hg.fillCircle(40, 40, 28);
        hg.generateTexture('mole_hit', 80, 80);
        hg.destroy();

        // Hole texture
        const holG = this.make.graphics({ add: false });
        holG.fillStyle(0x1a0f08); holG.fillEllipse(55, 22, 100, 42);
        holG.fillStyle(0x2d1a10); holG.fillEllipse(55, 16, 96, 34);
        holG.generateTexture('hole', 110, 50);
        holG.destroy();
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.score = 0;
        this.gameActive = false;
        this.timeLeft = 30;
        this.reactionTimes = [];
        this.moles = [];
        this.moleTimers = [];
        this.spawnTimer = null;

        this.drawBg(W, H);
        this.buildUI(W, H);
        this.buildGrid(W, H);
        this.buildStartOverlay(W, H);
    }

    drawBg(W, H) {
        const g = this.add.graphics();
        g.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0a1a0a, 0x0a1a0a, 1);
        g.fillRect(0, 0, W, H);
        // Dirt-ish ground texture hints
        g.fillStyle(0x1a1210, 0.3);
        for (let i = 0; i < 60; i++) {
            g.fillCircle(
                Phaser.Math.Between(0, W),
                Phaser.Math.Between(200, H),
                Phaser.Math.Between(3, 12)
            );
        }
    }

    buildUI(W, H) {
        // Back
        const back = this.add.text(20, 20, '[ < BACK ]', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px', color: '#556677'
        }).setInteractive({ cursor: 'pointer' });
        back.on('pointerover', () => back.setColor('#aabbcc'));
        back.on('pointerout',  () => back.setColor('#556677'));
        back.on('pointerdown', () => {
            this.clearAllTimers();
            this.scene.start('MainScene');
        });

        // Title
        this.add.text(W / 2, 38, 'WHACK-A-MOLE', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '24px', color: '#66ff99',
            stroke: '#003311', strokeThickness: 6
        }).setOrigin(0.5);

        // Score
        this.scoreText = this.add.text(W / 2 - 230, 85, 'SCORE: 0', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '13px', color: '#66ff99'
        }).setOrigin(0.5);

        // Timer
        this.timerText = this.add.text(W / 2 + 230, 85, 'TIME: 30', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '13px', color: '#ffcc44'
        }).setOrigin(0.5);

        // Avg reaction
        this.reactionText = this.add.text(W / 2, 85, 'AVG REACTION: --ms', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px', color: '#8899aa'
        }).setOrigin(0.5);
    }

    buildGrid(W, H) {
        const COLS = 3, ROWS = 3;
        const HOLE_W = 130, HOLE_H = 80, GAP_X = 55, GAP_Y = 20;
        const CELL_W = HOLE_W + GAP_X;
        const CELL_H = HOLE_H + GAP_Y;
        const startX = W / 2 - (COLS * CELL_W) / 2 + CELL_W / 2;
        const startY = 200;

        this.moles = [];

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const mx = startX + c * CELL_W;
                const my = startY + r * CELL_H;

                // Hole (dirt background circle)
                const dirtGfx = this.add.graphics();
                dirtGfx.fillStyle(0x2a1810, 1);
                dirtGfx.fillEllipse(mx, my + 10, HOLE_W, HOLE_H * 0.55);
                dirtGfx.fillStyle(0x1a0f08, 1);
                dirtGfx.fillEllipse(mx, my + 6, HOLE_W - 20, HOLE_H * 0.4);

                // Mole image (hidden below hole)
                const moleImg = this.add.image(mx, my + 50, 'mole')
                    .setOrigin(0.5, 1)
                    .setScale(1.1)
                    .setAlpha(0);

                // Hole overlay (covers mole when hidden)
                const holeGfx = this.add.graphics();
                holeGfx.fillStyle(0x1a0f08, 1);
                holeGfx.fillEllipse(mx, my + 28, HOLE_W - 4, HOLE_H * 0.38);

                const moleData = {
                    x: mx, y: my,
                    img: moleImg,
                    active: false,
                    hitTime: 0
                };

                // Click zone for this mole
                const zone = this.add.zone(mx, my + 10, HOLE_W, HOLE_H)
                    .setInteractive({ cursor: 'pointer' });

                zone.on('pointerdown', () => {
                    if (moleData.active && this.gameActive) {
                        this.whackMole(moleData);
                    }
                });

                this.moles.push(moleData);
            }
        }
    }

    buildStartOverlay(W, H) {
        this.overlay = this.add.graphics();
        this.overlay.fillStyle(0x000000, 0.55);
        this.overlay.fillRect(0, 0, W, H);

        this.startText = this.add.text(W / 2, H / 2 - 30, 'CLICK TO START!', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '24px', color: '#66ff99',
            stroke: '#003311', strokeThickness: 5
        }).setOrigin(0.5);

        this.add.text(W / 2, H / 2 + 20, 'WHACK MOLES AS FAST AS POSSIBLE', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px', color: '#557766'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.overlay.destroy();
            this.startText.destroy();
            this.startGame();
        });
    }

    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.reactionTimes = [];
        this.timeLeft = 30;

        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            repeat: 29,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText('TIME: ' + this.timeLeft);
                if (this.timeLeft <= 5) this.timerText.setColor('#ff4444');
                if (this.timeLeft <= 0) this.endGame();
            }
        });

        this.scheduleNextMole();
    }

    scheduleNextMole() {
        if (!this.gameActive) return;
        const delay = Phaser.Math.Between(600, 1600);
        this.spawnTimer = this.time.delayedCall(delay, () => {
            this.spawnMole();
            this.scheduleNextMole();
        });
    }

    spawnMole() {
        // Pick a random inactive mole
        const inactive = this.moles.filter(m => !m.active);
        if (inactive.length === 0) return;
        const mole = Phaser.Utils.Array.GetRandom(inactive);

        mole.active = true;
        mole.hitTime = this.time.now;
        mole.img.setTexture('mole').setAlpha(1);

        // Pop up tween
        this.tweens.add({
            targets: mole.img,
            y: mole.y - 10,
            duration: 180,
            ease: 'Back.easeOut'
        });

        // Auto-hide after visible window
        const hideDelay = Phaser.Math.Between(900, 1500);
        mole.hideTimer = this.time.delayedCall(hideDelay, () => {
            if (mole.active) this.hideMole(mole);
        });
    }

    whackMole(mole) {
        const reaction = this.time.now - mole.hitTime;
        this.reactionTimes.push(reaction);
        this.score += 10;
        this.scoreText.setText('SCORE: ' + this.score);

        const avg = Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length);
        this.reactionText.setText('AVG REACTION: ' + avg + 'ms');

        // Hit flash
        mole.img.setTexture('mole_hit');
        if (mole.hideTimer) mole.hideTimer.remove();

        // Star burst
        for (let i = 0; i < 6; i++) {
            const star = this.add.text(
                mole.x + Phaser.Math.Between(-30, 30),
                mole.y + Phaser.Math.Between(-40, -10),
                '+10', {
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '10px', color: '#ffee00'
                }
            );
            this.tweens.add({
                targets: star,
                y: star.y - 40,
                alpha: 0,
                duration: 500,
                onComplete: () => star.destroy()
            });
        }

        this.time.delayedCall(200, () => this.hideMole(mole));
    }

    hideMole(mole) {
        mole.active = false;
        this.tweens.add({
            targets: mole.img,
            y: mole.y + 50,
            duration: 160,
            onComplete: () => mole.img.setAlpha(0)
        });
    }

    endGame() {
        this.gameActive = false;
        this.clearAllTimers();

        const W = this.scale.width, H = this.scale.height;
        const avg = this.reactionTimes.length
            ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
            : 0;

        // Results overlay
        const ov = this.add.graphics();
        ov.fillStyle(0x000000, 0.75);
        ov.fillRect(0, 0, W, H);

        this.add.text(W / 2, H / 2 - 120, 'GAME OVER!', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '30px', color: '#66ff99',
            stroke: '#003311', strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(W / 2, H / 2 - 55, 'SCORE: ' + this.score, {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(W / 2, H / 2, 'MOLES HIT: ' + this.reactionTimes.length, {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '13px', color: '#aabbcc'
        }).setOrigin(0.5);

        this.add.text(W / 2, H / 2 + 45, 'AVG REACTION: ' + (avg || '--') + 'ms', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '13px', color: '#ffcc44'
        }).setOrigin(0.5);

        // High score
        const prevBest = parseInt(localStorage.getItem('mole_highscore') || '0');
        if (this.score > prevBest) localStorage.setItem('mole_highscore', this.score);
        const best = Math.max(this.score, prevBest);
        this.add.text(W / 2, H / 2 + 90, 'BEST SCORE: ' + best, {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px', color: '#556677'
        }).setOrigin(0.5);

        // Retry / Back buttons
        const retry = this.add.text(W / 2 - 120, H / 2 + 150, '[ RETRY ]', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '13px', color: '#66ff99'
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        retry.on('pointerdown', () => this.scene.restart());

        const backBtn = this.add.text(W / 2 + 120, H / 2 + 150, '[ BACK ]', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '13px', color: '#aabbcc'
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        backBtn.on('pointerdown', () => this.scene.start('MainScene'));
    }

    clearAllTimers() {
        if (this.spawnTimer) this.spawnTimer.remove();
        if (this.countdownTimer) this.countdownTimer.remove();
        this.moles.forEach(m => { if (m.hideTimer) m.hideTimer.remove(); });
    }
}
