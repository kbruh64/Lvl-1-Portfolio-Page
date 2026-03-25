// ── NETHER BIOME ─ CPS Test ──────────────────────────────────────
// Stitch: error palette, dark obsidian, lava glow, inverse surface

class CPSScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CPSScene' });
        this.DURATION = 10;
    }

    create() {
        const W = this.scale.width, H = this.scale.height;
        this.clicks = 0; this.started = false;
        this.finished = false; this.remaining = this.DURATION;

        this.cameras.main.fadeIn(380, 0, 0, 0);

        this.drawNetherBg(W, H);
        this.buildUI(W, H);
    }

    drawNetherBg(W, H) {
        // Obsidian base
        const g = this.add.graphics();
        g.fillStyle(0x0d0412); g.fillRect(0, 0, W, H);

        // Netherrack floor strips (horizontal lava bands)
        [0.7, 0.82, 0.92].forEach(pct => {
            g.fillStyle(0x5a1000, 0.6);
            g.fillRect(0, H * pct, W, H * 0.04);
        });

        // Lava glow pools at bottom
        const lava = this.add.graphics();
        lava.fillStyle(0xb02500, 0.25);
        lava.fillRect(0, H - 60, W, 60);
        lava.fillStyle(0xf95630, 0.15);
        lava.fillRect(0, H - 30, W, 30);

        // Nether voxel grid — fine dark dots
        g.fillStyle(0x3d0030, 0.5);
        for (let gx = 0; gx <= W; gx += 32)
            for (let gy = 0; gy <= H; gy += 32)
                g.fillRect(gx, gy, 1, 1); // square dots (Stitch voxel)

        // Lava drip particles (static vertical streaks)
        const drips = this.add.graphics();
        drips.fillStyle(0xf95630, 0.35);
        [80, 220, 410, 580, 750, 900, 1100].forEach(px => {
            const h = Phaser.Math.Between(30, 100);
            drips.fillRect(px, H - 60 - h, 4, h);
        });

        // Portal shimmer overlay
        const shimmer = this.add.graphics();
        shimmer.fillStyle(0x5b0063, 0.08);
        shimmer.fillRect(0, 0, W, H);
    }

    buildUI(W, H) {
        // Header — obsidian with lava border
        const hg = this.add.graphics();
        hg.fillStyle(0x1a0a24); hg.fillRect(0, 0, W, 72);
        hg.fillStyle(0xb02500); hg.fillRect(0, 68, W, 4); // 4px lava border

        this.add.text(20, 36, '← BACK', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px', fontStyle: 'bold', color: '#f95630'
        }).setOrigin(0, 0.5).setInteractive({ cursor: 'pointer' })
          .on('pointerover', function() { this.setColor('#ffffff'); })
          .on('pointerout',  function() { this.setColor('#f95630'); })
          .on('pointerdown', () => fadeTo(this, 'MainScene'));

        this.add.text(W / 2, 36, '🔥  CPS TEST  🔥', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '28px', fontStyle: 'bold',
            color: '#f95630', letterSpacing: 3
        }).setOrigin(0.5);

        // Timer — large lava glow number
        this.timerText = this.add.text(W / 2, 170, '10.0', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '80px', fontStyle: 'bold', color: '#f95630'
        }).setOrigin(0.5);

        this.add.text(W / 2, 232, 'SECONDS REMAINING', {
            fontFamily: "'Work Sans', sans-serif",
            fontSize: '12px', color: '#803d0a', letterSpacing: 2
        }).setOrigin(0.5);

        // Stats panel — obsidian carved block
        const sbx = W / 2 - 260, sby = 258, sbw = 520, sbh = 70;
        const sp = this.add.graphics();
        sp.fillStyle(0x1a0a24); sp.fillRect(sbx, sby, sbw, sbh);
        // carved edges
        sp.fillStyle(0x000000, 0.4); sp.fillRect(sbx, sby + sbh - 4, sbw, 4); sp.fillRect(sbx + sbw - 4, sby, 4, sbh);
        sp.fillStyle(0xffffff, 0.08); sp.fillRect(sbx, sby, sbw, 4); sp.fillRect(sbx, sby, 4, sbh);
        // divider
        sp.fillStyle(0xb02500, 0.5); sp.fillRect(W / 2 - 2, sby + 12, 4, sbh - 24);

        this.add.text(W / 2 - 130, sby + 16, 'CLICKS', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '10px', fontStyle: 'bold', color: '#803d0a', letterSpacing: 2
        }).setOrigin(0.5);
        this.clicksVal = this.add.text(W / 2 - 130, sby + 42, '0', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '22px', fontStyle: 'bold', color: '#f95630'
        }).setOrigin(0.5);

        this.add.text(W / 2 + 130, sby + 16, 'CPS', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '10px', fontStyle: 'bold', color: '#803d0a', letterSpacing: 2
        }).setOrigin(0.5);
        this.cpsVal = this.add.text(W / 2 + 130, sby + 42, '0.0', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '22px', fontStyle: 'bold', color: '#ffc5a5'
        }).setOrigin(0.5);

        const hs = parseFloat(localStorage.getItem('cps_highscore') || '0');
        this.bestText = this.add.text(W / 2, 352, 'PERSONAL BEST: ' + hs.toFixed(1) + ' CPS', {
            fontFamily: "'Work Sans', sans-serif",
            fontSize: '13px', color: '#803d0a'
        }).setOrigin(0.5);

        this.buildClickButton(W, H);
    }

    buildClickButton(W, H) {
        const bx = W / 2, by = H / 2 + 95, bw = 460, bh = 110;
        this.btnGfx = this.add.graphics();
        this.btnLabel = this.add.text(bx, by, 'CLICK TO IGNITE!', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '24px', fontStyle: 'bold', color: '#ffffff'
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
        const bx = W / 2, by = H / 2 + 95, bw = 460, bh = 110;
        const lx = bx - bw / 2, ly = by - bh / 2;
        this.btnGfx.clear();
        // Lava carved button (Stitch carved-button on error bg)
        this.btnGfx.fillStyle(active ? 0xf95630 : 0xb02500);
        this.btnGfx.fillRect(lx, ly, bw, bh);
        // Carved effect
        this.btnGfx.fillStyle(0x000000, active ? 0.4 : 0.25);
        this.btnGfx.fillRect(lx, ly + bh - 5, bw, 5);
        this.btnGfx.fillRect(lx + bw - 5, ly, 5, bh);
        this.btnGfx.fillStyle(0xffffff, 0.15);
        this.btnGfx.fillRect(lx, ly, bw, 5);
        this.btnGfx.fillRect(lx, ly, 5, bh);
    }

    handleClick() {
        if (this.finished) { this.resetGame(); return; }
        if (!this.started) {
            this.started = true;
            this.timerEvent = this.time.addEvent({
                delay: 100, repeat: this.DURATION * 10 - 1,
                callback: this.tick, callbackScope: this
            });
            this.btnLabel.setText('CLICKING...');
            this.drawBtn(true);
        }
        this.clicks++;
        this.clicksVal.setText(String(this.clicks));
        const elapsed = this.DURATION - this.remaining;
        if (elapsed > 0) this.cpsVal.setText((this.clicks / elapsed).toFixed(1));

        // Lava ripple
        const W = this.scale.width, H = this.scale.height;
        const c = this.add.rectangle(W / 2, H / 2 + 95, 20, 20, 0xf95630, 0.7);
        this.tweens.add({ targets: c, scaleX: 8, scaleY: 5, alpha: 0, duration: 300, onComplete: () => c.destroy() });
    }

    tick() {
        this.remaining = Math.max(0, this.remaining - 0.1);
        this.timerText.setText(this.remaining.toFixed(1));
        if (this.remaining <= 3)      this.timerText.setColor('#b02500');
        else if (this.remaining <= 6) this.timerText.setColor('#ffc5a5');
        if (this.remaining <= 0) this.endGame();
    }

    endGame() {
        this.finished = true;
        const cps = this.clicks / this.DURATION;
        const hs  = parseFloat(localStorage.getItem('cps_highscore') || '0');
        const isNew = cps > hs;
        if (isNew) localStorage.setItem('cps_highscore', cps.toFixed(2));

        const W = this.scale.width, H = this.scale.height;
        const bx = W / 2, by = H / 2 + 95, bw = 460, bh = 110;
        const lx = bx - bw / 2, ly = by - bh / 2;
        this.btnGfx.clear();
        this.btnGfx.fillStyle(isNew ? 0x256900 : 0x006668);
        this.btnGfx.fillRect(lx, ly, bw, bh);
        this.btnGfx.fillStyle(0x000000, 0.3);
        this.btnGfx.fillRect(lx, ly + bh - 5, bw, 5);
        this.btnGfx.fillRect(lx + bw - 5, ly, 5, bh);

        this.btnLabel.setText(
            isNew ? '★ NEW BEST: ' + cps.toFixed(1) + ' CPS!\nCLICK TO RETRY'
                  : cps.toFixed(1) + ' CPS — CLICK TO RETRY'
        ).setAlign('center');
        this.bestText.setText('PERSONAL BEST: ' + (isNew ? cps : hs).toFixed(1) + ' CPS' + (isNew ? '  ★' : ''));
        this.bestText.setColor(isNew ? '#95f169' : '#803d0a');
    }

    resetGame() {
        this.clicks = 0; this.started = false; this.finished = false;
        this.remaining = this.DURATION;
        if (this.timerEvent) this.timerEvent.remove();
        this.timerText.setText('10.0').setColor('#f95630');
        this.clicksVal.setText('0'); this.cpsVal.setText('0.0');
        this.btnLabel.setText('CLICK TO IGNITE!');
        this.drawBtn(false);
    }
}
