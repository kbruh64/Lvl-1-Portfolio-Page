class CPSScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CPSScene' });
        this.DURATION = 10; // seconds
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.clicks = 0;
        this.started = false;
        this.finished = false;
        this.remaining = this.DURATION;

        this.drawBg(W, H);
        this.buildUI(W, H);
    }

    drawBg(W, H) {
        const g = this.add.graphics();
        g.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2a, 0x1a0a2a, 1);
        g.fillRect(0, 0, W, H);

        // Grid lines
        g.lineStyle(1, 0x220033, 0.4);
        for (let x = 0; x < W; x += 60) g.lineBetween(x, 0, x, H);
        for (let y = 0; y < H; y += 60) g.lineBetween(0, y, W, y);
    }

    buildUI(W, H) {
        // Back button
        const back = this.add.text(20, 20, '[ < BACK ]', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px',
            color: '#556677'
        }).setInteractive({ cursor: 'pointer' });
        back.on('pointerover', () => back.setColor('#aabbcc'));
        back.on('pointerout',  () => back.setColor('#556677'));
        back.on('pointerdown', () => this.scene.start('MainScene'));

        // Title
        this.add.text(W / 2, 60, 'CPS TEST', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '28px',
            color: '#ff6699',
            stroke: '#330011',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(W / 2, 105, 'CLICK AS FAST AS YOU CAN FOR 10 SECONDS', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
            color: '#885566'
        }).setOrigin(0.5);

        // Timer arc / ring display
        this.timerText = this.add.text(W / 2, 195, '10.0', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '52px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(W / 2, 255, 'SECONDS', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px',
            color: '#554455'
        }).setOrigin(0.5);

        // Click counter
        this.clicksText = this.add.text(W / 2 - 160, 310, 'CLICKS\n0', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '14px',
            color: '#ff6699',
            align: 'center'
        }).setOrigin(0.5);

        // CPS display
        this.cpsText = this.add.text(W / 2 + 160, 310, 'CPS\n0.0', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '14px',
            color: '#ffcc44',
            align: 'center'
        }).setOrigin(0.5);

        // High score
        const hs = parseFloat(localStorage.getItem('cps_highscore') || '0');
        this.highText = this.add.text(W / 2, 365, 'BEST: ' + hs.toFixed(1) + ' CPS', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px',
            color: '#556677'
        }).setOrigin(0.5);

        // Big click button
        this.buildClickButton(W, H);
    }

    buildClickButton(W, H) {
        const bx = W / 2, by = H / 2 + 85, bw = 420, bh = 110;

        this.btnGfx = this.add.graphics();
        this.btnZone = this.add.zone(bx, by, bw, bh).setInteractive({ cursor: 'pointer' });

        this.drawBtn(false);

        this.btnZone.on('pointerover', () => this.drawBtn(true));
        this.btnZone.on('pointerout',  () => this.drawBtn(false));
        this.btnZone.on('pointerdown', () => this.handleClick());

        this.btnLabel = this.add.text(bx, by, 'CLICK HERE!', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    drawBtn(hover) {
        const bx = this.scale.width / 2, by = this.scale.height / 2 + 85;
        const bw = 420, bh = 110;
        this.btnGfx.clear();
        if (hover || this.started) {
            this.btnGfx.fillStyle(0x550033, 0.9);
            this.btnGfx.fillRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 14);
        }
        this.btnGfx.lineStyle(3, 0xff6699, this.started ? 1 : 0.6);
        this.btnGfx.strokeRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 14);
    }

    handleClick() {
        if (this.finished) {
            this.resetGame();
            return;
        }

        if (!this.started) {
            this.started = true;
            this.timerEvent = this.time.addEvent({
                delay: 100,
                repeat: this.DURATION * 10 - 1,
                callback: this.tick,
                callbackScope: this
            });
            this.btnLabel.setText('CLICKING...');
            this.drawBtn(false);
        }

        this.clicks++;
        this.clicksText.setText('CLICKS\n' + this.clicks);

        const elapsed = this.DURATION - this.remaining;
        if (elapsed > 0) {
            this.cpsText.setText('CPS\n' + (this.clicks / elapsed).toFixed(1));
        }

        // Ripple feedback
        const bx = this.scale.width / 2, by = this.scale.height / 2 + 85;
        const circle = this.add.circle(bx, by, 20, 0xff6699, 0.6);
        this.tweens.add({
            targets: circle,
            scaleX: 5, scaleY: 5,
            alpha: 0,
            duration: 300,
            onComplete: () => circle.destroy()
        });
    }

    tick() {
        this.remaining -= 0.1;
        this.remaining = Math.max(0, this.remaining);
        this.timerText.setText(this.remaining.toFixed(1));

        // Colour shifts as time runs low
        if (this.remaining <= 3) {
            this.timerText.setColor('#ff4444');
        } else if (this.remaining <= 6) {
            this.timerText.setColor('#ffaa00');
        }

        if (this.remaining <= 0) {
            this.endGame();
        }
    }

    endGame() {
        this.finished = true;
        const cps = this.clicks / this.DURATION;

        const hs = parseFloat(localStorage.getItem('cps_highscore') || '0');
        const isNewBest = cps > hs;
        if (isNewBest) localStorage.setItem('cps_highscore', cps.toFixed(2));

        this.btnLabel.setText(isNewBest ? 'NEW BEST!\n' + cps.toFixed(1) + ' CPS' : cps.toFixed(1) + ' CPS\nCLICK TO RETRY');
        this.btnGfx.clear();
        this.btnGfx.fillStyle(isNewBest ? 0x004422 : 0x222244, 0.9);
        this.btnGfx.fillRoundedRect(
            this.scale.width / 2 - 210,
            this.scale.height / 2 + 85 - 55,
            420, 110, 14
        );
        this.btnGfx.lineStyle(3, isNewBest ? 0x00ff88 : 0x6699ff);
        this.btnGfx.strokeRoundedRect(
            this.scale.width / 2 - 210,
            this.scale.height / 2 + 85 - 55,
            420, 110, 14
        );

        this.highText.setText('BEST: ' + (isNewBest ? cps : hs).toFixed(1) + ' CPS' + (isNewBest ? '  ★ NEW!' : ''));
        this.highText.setColor(isNewBest ? '#00ff88' : '#556677');
    }

    resetGame() {
        this.clicks = 0;
        this.started = false;
        this.finished = false;
        this.remaining = this.DURATION;
        if (this.timerEvent) this.timerEvent.remove();
        this.timerText.setText('10.0').setColor('#ffffff');
        this.clicksText.setText('CLICKS\n0');
        this.cpsText.setText('CPS\n0.0');
        this.btnLabel.setText('CLICK HERE!');
        this.drawBtn(false);
    }
}
