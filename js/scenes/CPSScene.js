class CPSScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CPSScene' });
        this.DURATION = 10;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.clicks   = 0;
        this.started  = false;
        this.finished = false;
        this.remaining = this.DURATION;

        // Light background
        this.add.rectangle(0, 0, W, H, 0xfff0f4).setOrigin(0, 0);
        const dots = this.add.graphics();
        dots.fillStyle(0xffccdd, 0.5);
        for (let x = 30; x < W; x += 40)
            for (let y = 30; y < H; y += 40)
                dots.fillCircle(x, y, 1.5);

        this.buildUI(W, H);
    }

    buildUI(W, H) {
        // Back
        const back = this.makeBackBtn(20, 20);
        back.on('pointerdown', () => this.scene.start('MainScene'));

        // Title bar
        const hg = this.add.graphics();
        hg.fillStyle(0xffffff);
        hg.fillRect(0, 0, W, 72);
        hg.lineStyle(2, 0xffddee);
        hg.lineBetween(0, 72, W, 72);
        hg.fillStyle(0xe03060);
        hg.fillRect(0, 69, W, 3);

        this.add.text(W / 2, 36, 'CPS TEST', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '24px',
            color: '#e03060'
        }).setOrigin(0.5);

        // Timer display
        this.timerText = this.add.text(W / 2, 155, '10.0', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '64px',
            color: '#1a1a3a'
        }).setOrigin(0.5);

        this.add.text(W / 2, 222, 'SECONDS REMAINING', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
            color: '#99aabb'
        }).setOrigin(0.5);

        // Stats row
        const statBg = this.add.graphics();
        statBg.fillStyle(0xffffff);
        statBg.fillRoundedRect(W / 2 - 260, 255, 520, 70, 12);
        statBg.lineStyle(1.5, 0xffddee);
        statBg.strokeRoundedRect(W / 2 - 260, 255, 520, 70, 12);

        this.add.text(W / 2 - 130, 270, 'CLICKS', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px', color: '#aabbcc'
        }).setOrigin(0.5);
        this.clicksVal = this.add.text(W / 2 - 130, 295, '0', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '18px', color: '#e03060'
        }).setOrigin(0.5);

        // Divider
        const div = this.add.graphics();
        div.lineStyle(1, 0xffddee);
        div.lineBetween(W / 2, 260, W / 2, 320);

        this.add.text(W / 2 + 130, 270, 'CPS', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px', color: '#aabbcc'
        }).setOrigin(0.5);
        this.cpsVal = this.add.text(W / 2 + 130, 295, '0.0', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '18px', color: '#ff9900'
        }).setOrigin(0.5);

        // Best score
        const hs = parseFloat(localStorage.getItem('cps_highscore') || '0');
        this.bestText = this.add.text(W / 2, 350, 'PERSONAL BEST: ' + hs.toFixed(1) + ' CPS', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px', color: '#99aabb'
        }).setOrigin(0.5);

        // Big click button
        this.buildClickButton(W, H);
    }

    buildClickButton(W, H) {
        const bx = W / 2, by = H / 2 + 100, bw = 440, bh = 120;
        this.btnGfx = this.add.graphics();
        this.btnLabel = this.add.text(bx, by, 'CLICK HERE!', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '22px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(2);

        this.btnZone = this.add.zone(bx, by, bw, bh)
            .setInteractive({ cursor: 'pointer' }).setDepth(3);

        this.drawBtn(false);
        this.btnZone.on('pointerover', () => this.drawBtn(true));
        this.btnZone.on('pointerout',  () => this.drawBtn(this.started));
        this.btnZone.on('pointerdown', () => this.handleClick());
    }

    drawBtn(active) {
        const W = this.scale.width, H = this.scale.height;
        const bx = W / 2, by = H / 2 + 100, bw = 440, bh = 120;
        this.btnGfx.clear();
        this.btnGfx.fillStyle(active ? 0xe03060 : 0xff5588, 1);
        this.btnGfx.fillRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 16);
        this.btnGfx.fillStyle(0xffffff, 0.15);
        this.btnGfx.fillRoundedRect(bx - bw / 2 + 8, by - bh / 2 + 8, bw - 16, bh / 3, { tl: 12, tr: 12, bl: 0, br: 0 });
    }

    handleClick() {
        if (this.finished) { this.resetGame(); return; }

        if (!this.started) {
            this.started = true;
            this.timerEvent = this.time.addEvent({
                delay: 100,
                repeat: this.DURATION * 10 - 1,
                callback: this.tick,
                callbackScope: this
            });
            this.btnLabel.setText('CLICKING...');
            this.drawBtn(true);
        }

        this.clicks++;
        this.clicksVal.setText(String(this.clicks));

        const elapsed = this.DURATION - this.remaining;
        if (elapsed > 0) this.cpsVal.setText((this.clicks / elapsed).toFixed(1));

        // Click ripple
        const W = this.scale.width, H = this.scale.height;
        const c = this.add.circle(W / 2, H / 2 + 100, 18, 0xffffff, 0.5);
        this.tweens.add({
            targets: c, scaleX: 6, scaleY: 6, alpha: 0, duration: 280,
            onComplete: () => c.destroy()
        });
    }

    tick() {
        this.remaining = Math.max(0, this.remaining - 0.1);
        this.timerText.setText(this.remaining.toFixed(1));
        if (this.remaining <= 3)      this.timerText.setColor('#e03060');
        else if (this.remaining <= 6) this.timerText.setColor('#ff9900');
        if (this.remaining <= 0) this.endGame();
    }

    endGame() {
        this.finished = true;
        const cps = this.clicks / this.DURATION;
        const hs  = parseFloat(localStorage.getItem('cps_highscore') || '0');
        const isNew = cps > hs;
        if (isNew) localStorage.setItem('cps_highscore', cps.toFixed(2));

        const W = this.scale.width, H = this.scale.height;
        const bx = W / 2, by = H / 2 + 100, bw = 440, bh = 120;
        this.btnGfx.clear();
        this.btnGfx.fillStyle(isNew ? 0x209950 : 0x3355dd, 1);
        this.btnGfx.fillRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 16);

        this.btnLabel.setText(
            isNew
                ? '★ NEW BEST: ' + cps.toFixed(1) + ' CPS!\nCLICK TO RETRY'
                : cps.toFixed(1) + ' CPS\nCLICK TO RETRY'
        ).setAlign('center');

        this.bestText.setText('PERSONAL BEST: ' + (isNew ? cps : hs).toFixed(1) + ' CPS' + (isNew ? '  ★' : ''));
        this.bestText.setColor(isNew ? '#209950' : '#99aabb');
    }

    resetGame() {
        this.clicks = 0; this.started = false; this.finished = false;
        this.remaining = this.DURATION;
        if (this.timerEvent) this.timerEvent.remove();
        this.timerText.setText('10.0').setColor('#1a1a3a');
        this.clicksVal.setText('0');
        this.cpsVal.setText('0.0');
        this.btnLabel.setText('CLICK HERE!');
        this.drawBtn(false);
    }

    makeBackBtn(x, y) {
        const btn = this.add.text(x, y, '[ < BACK ]', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px', color: '#99aabb'
        }).setInteractive({ cursor: 'pointer' }).setDepth(10);
        btn.on('pointerover', () => btn.setColor('#3344dd'));
        btn.on('pointerout',  () => btn.setColor('#99aabb'));
        return btn;
    }
}
