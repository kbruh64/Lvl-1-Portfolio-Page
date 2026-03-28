class WhackAMoleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WhackAMoleScene' });
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.score = 0;
        this.gameActive = false;
        this.timeLeft = 30;
        this.reactionTimes = [];
        this.moles = [];
        this.spawnTimer = null;
        this.countdownTimer = null;

        slideIn(this);

        this.drawBg(W, H);
        this.buildUI(W, H);
        this.buildGrid(W, H);
        this.buildStartOverlay(W, H);
    }

    drawBg(W, H) {
        const g = this.add.graphics();

        // Desert sky — warm haze gradient (two bands)
        g.fillStyle(0xf5d98c); g.fillRect(0, 0, W, H * 0.5);
        g.fillStyle(0xe8c46a, 0.5); g.fillRect(0, H * 0.25, W, H * 0.25);

        // Sand ground
        g.fillStyle(0xd4a84b); g.fillRect(0, H * 0.5, W, H * 0.5);

        // Sand dune bumps
        g.fillStyle(0xbf923a, 0.5);
        [100, 320, 580, 820, 1050].forEach(dx => {
            g.fillEllipse(dx, H * 0.5, 220, 40);
        });

        // Sandstone block strips on ground
        g.fillStyle(0xc49a30, 0.35);
        for (let bx = 0; bx < W; bx += 64)
            g.fillRect(bx, H * 0.5 + 10, 60, 28);
        for (let bx = 32; bx < W; bx += 64)
            g.fillRect(bx, H * 0.5 + 42, 60, 28);

        // Cacti (simple pixel shapes)
        [180, 500, 850, 1150].forEach(cx => {
            const cy = H * 0.5;
            g.fillStyle(0x2e7d32);
            g.fillRect(cx - 8, cy - 90, 16, 90);   // trunk
            g.fillRect(cx - 30, cy - 66, 22, 12);   // left arm
            g.fillRect(cx - 30, cy - 80, 12, 16);
            g.fillRect(cx + 8,  cy - 52, 22, 12);   // right arm
            g.fillRect(cx + 18, cy - 66, 12, 16);
        });

        // Voxel dots overlay (Stitch pattern)
        g.fillStyle(0x8f4816, 0.12);
        for (let gx = 0; gx <= W; gx += 32)
            for (let gy = 68; gy <= H; gy += 32)
                g.fillRect(gx, gy, 2, 2);

        // Sun
        g.fillStyle(0xffee44, 0.9);
        g.fillRect(W - 120, 80, 56, 56);
        g.fillStyle(0xffdd00, 0.5);
        g.fillRect(W - 128, 88, 8, 40);
        g.fillRect(W - 56,  88, 8, 40);
        g.fillRect(W - 108, 72, 40, 8);
        g.fillRect(W - 108, 136, 40, 8);
    }

    buildUI(W, H) {
        // Desert biome header — sandstone, 4px secondary border
        const hg = this.add.graphics().setDepth(10);
        hg.fillStyle(0x3d2000); hg.fillRect(0, 0, W, 68);
        hg.fillStyle(0x8f4816); hg.fillRect(0, 64, W, 4);

        const back = this.add.text(20, 34, '← BACK', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px', fontStyle: 'bold', color: '#ffc5a5'
        }).setOrigin(0, 0.5).setDepth(11).setInteractive({ cursor: 'pointer' });
        back.on('pointerover', () => back.setColor('#ffffff'));
        back.on('pointerout',  () => back.setColor('#ffc5a5'));
        back.on('pointerdown', () => { this.clearTimers(); fadeTo(this, 'MainScene'); });

        this.add.text(W / 2, 34, '🏜️  WHACK-A-MOLE  🏜️', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '26px', fontStyle: 'bold', color: '#ffc5a5'
        }).setOrigin(0.5).setDepth(11);

        // Score + time chips — carved inventory slots (Stitch)
        const chipDraw = (cx) => {
            const cw = 160, ch = 36, bx = cx - cw / 2, by = 75;
            const cg = this.add.graphics().setDepth(10);
            cg.fillStyle(0x5a3000); cg.fillRect(bx, by, cw, ch);
            cg.fillStyle(0x8f4816); cg.fillRect(bx, by + ch - 3, cw, 3);
            cg.fillStyle(0xffffff, 0.08); cg.fillRect(bx, by, cw, 3);
        };
        chipDraw(W / 2 - 200);
        chipDraw(W / 2 + 200);

        this.scoreText = this.add.text(W / 2 - 200, 93, 'SCORE: 0', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '16px', fontStyle: 'bold', color: '#ffc5a5'
        }).setOrigin(0.5).setDepth(11);

        this.timerText = this.add.text(W / 2 + 200, 93, 'TIME: 30', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '16px', fontStyle: 'bold', color: '#ffee44'
        }).setOrigin(0.5).setDepth(11);

        // Bottom bar — desert dark
        const bg2 = this.add.graphics().setDepth(10);
        bg2.fillStyle(0x3d2000); bg2.fillRect(0, H - 46, W, 46);
        bg2.fillStyle(0x8f4816); bg2.fillRect(0, H - 46, W, 4);

        this.reactionText = this.add.text(W / 2, H - 23, 'HIT A MOLE TO SEE YOUR REACTION TIME!', {
            fontFamily: "'Work Sans', sans-serif",
            fontSize: '12px', color: '#ffc5a5'
        }).setOrigin(0.5).setDepth(11);
    }

    buildGrid(W, H) {
        const COLS = 3, ROWS = 3;
        const HOLE_W = 120, HOLE_H = 50;
        const GAP_X = 60, GAP_Y = 35;
        const CELL_W = HOLE_W + GAP_X;
        const CELL_H = HOLE_H + GAP_Y + 60;

        const gridW = COLS * CELL_W - GAP_X;
        const gridH = ROWS * CELL_H - GAP_Y;
        const startX = W / 2 - gridW / 2 + HOLE_W / 2;
        const startY = 120;

        this.moles = [];

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const mx = startX + c * CELL_W;
                const my = startY + r * CELL_H;

                // Hole mound (dirt)
                const dg = this.add.graphics();
                dg.fillStyle(0xb8860b, 0.5);
                dg.fillEllipse(mx, my + 28, HOLE_W + 20, 30);
                dg.fillStyle(0x8B6914, 0.8);
                dg.fillEllipse(mx, my + 22, HOLE_W, 24);

                // Mole body (drawn as circle + features, clipped behind hole)
                const moleGfx = this.add.graphics().setDepth(2);
                moleGfx.fillStyle(0x8B5A2B);
                moleGfx.fillCircle(mx, my - 10, 34);
                moleGfx.fillStyle(0xd4956a);
                moleGfx.fillEllipse(mx, my, 28, 22);
                // Eyes
                moleGfx.fillStyle(0x222222);
                moleGfx.fillCircle(mx - 10, my - 18, 5);
                moleGfx.fillCircle(mx + 10, my - 18, 5);
                moleGfx.fillStyle(0xffffff);
                moleGfx.fillCircle(mx - 8, my - 20, 2);
                moleGfx.fillCircle(mx + 12, my - 20, 2);
                // Nose
                moleGfx.fillStyle(0xff7799);
                moleGfx.fillEllipse(mx, my - 8, 10, 7);
                moleGfx.setAlpha(0);

                // Hole cover (drawn on top to hide mole when down)
                const holeCover = this.add.graphics().setDepth(4);
                holeCover.fillStyle(0x8B6914);
                holeCover.fillEllipse(mx, my + 22, HOLE_W, 24);

                // Click zone
                const zone = this.add.zone(mx, my, HOLE_W + 10, HOLE_H + 60)
                    .setInteractive({ cursor: 'pointer' }).setDepth(5);

                const moleData = { x: mx, y: my, gfx: moleGfx, active: false, hitTime: 0, hideTimer: null };

                zone.on('pointerdown', () => {
                    if (moleData.active && this.gameActive) this.whackMole(moleData);
                });

                this.moles.push(moleData);
            }
        }
    }

    buildStartOverlay(W, H) {
        this.overlay = this.add.graphics().setDepth(20);
        this.overlay.fillStyle(0xedfbd4, 0.85);
        this.overlay.fillRect(0, 0, W, H);

        const panel = this.add.graphics().setDepth(21);
        panel.fillStyle(0x1a4a00, 0.3); panel.fillRect(W / 2 - 276, H / 2 - 76, 560, 160); // shadow
        panel.fillStyle(0x256900); panel.fillRect(W / 2 - 280, H / 2 - 80, 560, 160);

        this.add.text(W / 2, H / 2 - 30, 'CLICK TO START!', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '22px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(22);

        this.add.text(W / 2, H / 2 + 20, 'WHACK MOLES AS FAST AS POSSIBLE  ·  30 SECONDS', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '8px', color: '#aaffcc'
        }).setOrigin(0.5).setDepth(22);

        this.input.once('pointerdown', () => {
            this.overlay.destroy();
            this.children.list
                .filter(c => c.depth === 21 || c.depth === 22)
                .forEach(c => c.destroy());
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
                if (this.timeLeft <= 5) this.timerText.setColor('#cc0000');
                if (this.timeLeft <= 0) this.endGame();
            }
        });

        this.scheduleMole();
    }

    scheduleMole() {
        if (!this.gameActive) return;
        this.spawnTimer = this.time.delayedCall(
            Phaser.Math.Between(600, 1400),
            () => { this.spawnMole(); this.scheduleMole(); }
        );
    }

    spawnMole() {
        const inactive = this.moles.filter(m => !m.active);
        if (!inactive.length) return;
        const mole = Phaser.Utils.Array.GetRandom(inactive);

        mole.active = true;
        mole.hitTime = this.time.now;
        mole.gfx.setAlpha(1);

        this.tweens.add({ targets: mole.gfx, y: mole.y - 38, duration: 160, ease: 'Back.Out' });

        mole.hideTimer = this.time.delayedCall(
            Phaser.Math.Between(900, 1600),
            () => { if (mole.active) this.hideMole(mole); }
        );
    }

    whackMole(mole) {
        const rt = this.time.now - mole.hitTime;
        this.reactionTimes.push(rt);
        this.score += 10;
        this.scoreText.setText('SCORE: ' + this.score);

        const avg = Math.round(this.reactionTimes.reduce((a, b) => a + b) / this.reactionTimes.length);
        this.reactionText.setText('AVG REACTION: ' + avg + 'ms   ·   BEST: ' + Math.min(...this.reactionTimes) + 'ms');

        if (mole.hideTimer) mole.hideTimer.remove();

        // Flash mole yellow
        mole.gfx.clear();
        mole.gfx.fillStyle(0xffee00); mole.gfx.fillCircle(mole.x, mole.y - 48, 34);
        mole.gfx.fillStyle(0xffffff); mole.gfx.fillCircle(mole.x, mole.y - 48, 22);

        // Score pop
        const pop = this.add.text(mole.x, mole.y - 60, '+10', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px', color: '#209950'
        }).setOrigin(0.5).setDepth(15);
        this.tweens.add({ targets: pop, y: pop.y - 50, alpha: 0, duration: 500, onComplete: () => pop.destroy() });

        this.time.delayedCall(200, () => this.hideMole(mole));
    }

    hideMole(mole) {
        mole.active = false;
        this.tweens.add({
            targets: mole.gfx,
            y: mole.y,
            duration: 140,
            onComplete: () => { mole.gfx.setAlpha(0); this.resetMoleGfx(mole); }
        });
    }

    resetMoleGfx(mole) {
        const mx = mole.x, my = mole.y;
        mole.gfx.clear();
        mole.gfx.fillStyle(0x8B5A2B); mole.gfx.fillCircle(mx, my - 10, 34);
        mole.gfx.fillStyle(0xd4956a); mole.gfx.fillEllipse(mx, my, 28, 22);
        mole.gfx.fillStyle(0x222222);
        mole.gfx.fillCircle(mx - 10, my - 18, 5); mole.gfx.fillCircle(mx + 10, my - 18, 5);
        mole.gfx.fillStyle(0xffffff);
        mole.gfx.fillCircle(mx - 8, my - 20, 2); mole.gfx.fillCircle(mx + 12, my - 20, 2);
        mole.gfx.fillStyle(0xff7799); mole.gfx.fillEllipse(mx, my - 8, 10, 7);
    }

    endGame() {
        this.gameActive = false;
        this.clearTimers();

        const W = this.scale.width, H = this.scale.height;
        const avg  = this.reactionTimes.length
            ? Math.round(this.reactionTimes.reduce((a, b) => a + b) / this.reactionTimes.length) : 0;
        const best = this.reactionTimes.length ? Math.min(...this.reactionTimes) : 0;

        // Results panel
        const ov = this.add.graphics().setDepth(30);
        ov.fillStyle(0xf8f6f6, 0.9); ov.fillRect(0, 0, W, H);

        // Stitch: hard-shadow carved panel, 0px radius
        const panel = this.add.graphics().setDepth(31);
        panel.fillStyle(0x1a4a00, 0.3); panel.fillRect(W / 2 - 326, H / 2 - 166, 660, 340); // shadow
        panel.fillStyle(0x256900); panel.fillRect(W / 2 - 330, H / 2 - 170, 660, 340);

        this.add.text(W / 2, H / 2 - 130, 'TIME\'S UP!', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '28px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(32);

        [
            ['SCORE',         this.score + ' PTS'],
            ['MOLES HIT',     this.reactionTimes.length],
            ['AVG REACTION',  avg ? avg + 'ms' : '--'],
            ['BEST REACTION', best ? best + 'ms' : '--']
        ].forEach(([label, val], i) => {
            this.add.text(W / 2 - 180, H / 2 - 70 + i * 48, label + ':', {
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '10px', color: '#aaffcc'
            }).setDepth(32);
            this.add.text(W / 2 + 180, H / 2 - 70 + i * 48, String(val), {
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '10px', color: '#ffffff'
            }).setOrigin(1, 0).setDepth(32);
        });

        const prevBest = parseInt(localStorage.getItem('mole_highscore') || '0');
        if (this.score > prevBest) localStorage.setItem('mole_highscore', this.score);

        // Buttons
        const retryBtn = this.add.text(W / 2 - 100, H / 2 + 140, '[ RETRY ]', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '12px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(32).setInteractive({ cursor: 'pointer' });
        retryBtn.on('pointerdown', () => this.scene.restart());

        const backBtn = this.add.text(W / 2 + 100, H / 2 + 140, '[ BACK ]', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '12px', color: '#aaffcc'
        }).setOrigin(0.5).setDepth(32).setInteractive({ cursor: 'pointer' });
        backBtn.on('pointerdown', () => fadeTo(this, 'MainScene'));
    }

    clearTimers() {
        if (this.spawnTimer) this.spawnTimer.remove();
        if (this.countdownTimer) this.countdownTimer.remove();
        this.moles.forEach(m => { if (m.hideTimer) m.hideTimer.remove(); });
    }
}
