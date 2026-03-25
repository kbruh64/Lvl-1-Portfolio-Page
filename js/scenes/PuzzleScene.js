// ── DEEP DARK BIOME ─ Sliding Puzzle ─────────────────────────────
// Stitch: inverse-surface bg, sculk cyan glow, tertiary palette

class PuzzleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PuzzleScene' });
        this.GRID = 3; this.TILE = 118; this.GAP = 8;
    }

    create() {
        const W = this.scale.width, H = this.scale.height;
        this.moves = 0; this.seconds = 0;
        this.running = false; this.solved = false;
        this.tileObjs = [];
        this.state = [1, 2, 3, 4, 5, 6, 7, 8, 0];

        this.cameras.main.fadeIn(380, 0, 0, 0);

        this.drawDeepDarkBg(W, H);
        this.buildUI(W, H);
        this.renderGrid(W, H);
    }

    drawDeepDarkBg(W, H) {
        // Deep dark base — inverse-surface
        const g = this.add.graphics();
        g.fillStyle(0x0a0b0c); g.fillRect(0, 0, W, H);

        // Sculk voxel grid — fine cyan dots (Stitch: radial-gradient sculk pattern)
        g.fillStyle(0x006668, 0.4);
        for (let gx = 0; gx <= W; gx += 32)
            for (let gy = 0; gy <= H; gy += 32)
                g.fillRect(gx, gy, 1, 1);

        // Sculk veins — random horizontal + vertical cyan lines
        g.lineStyle(1, 0x006668, 0.2);
        [100, 250, 400, 600, 750, 950, 1150].forEach(px => {
            g.lineBetween(px, 0, px, H);
        });
        [150, 280, 420, 560, 650].forEach(py => {
            g.lineBetween(0, py, W, py);
        });

        // Bioluminescent sculk patches (Stitch: sculk-glow)
        const glow = this.add.graphics();
        glow.fillStyle(0x006668, 0.12);
        [[200, 400], [600, 300], [900, 500], [400, 600], [1100, 200]].forEach(([px, py]) => {
            glow.fillRect(px - 60, py - 60, 120, 120);
        });
        // bright glow centers
        glow.fillStyle(0x5dfbfe, 0.06);
        [[200, 400], [600, 300], [900, 500]].forEach(([px, py]) => {
            glow.fillRect(px - 20, py - 20, 40, 40);
        });
    }

    buildUI(W, H) {
        // Header — deep dark with sculk cyan border
        const hg = this.add.graphics();
        hg.fillStyle(0x0d0e0f); hg.fillRect(0, 0, W, 72);
        hg.fillStyle(0x006668); hg.fillRect(0, 68, W, 4); // 4px sculk border

        this.add.text(20, 36, '← BACK', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px', fontStyle: 'bold', color: '#5dfbfe'
        }).setOrigin(0, 0.5).setInteractive({ cursor: 'pointer' })
          .on('pointerover', function() { this.setColor('#ffffff'); })
          .on('pointerout',  function() { this.setColor('#5dfbfe'); })
          .on('pointerdown', () => fadeTo(this, 'MainScene'));

        this.add.text(W / 2, 36, '🔮  SLIDING PUZZLE  🔮', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '26px', fontStyle: 'bold',
            color: '#5dfbfe', letterSpacing: 2
        }).setOrigin(0.5);

        // Stats panel — sculk block carved
        const sbx = W / 2 - 280, sby = 84, sbw = 560, sbh = 58;
        const sp = this.add.graphics();
        sp.fillStyle(0x111314); sp.fillRect(sbx, sby, sbw, sbh);
        sp.fillStyle(0x5dfbfe, 0.3); sp.fillRect(sbx, sby + sbh - 3, sbw, 3); // sculk bottom glow
        sp.fillStyle(0x5dfbfe, 0.15); sp.fillRect(sbx, sby, sbw, 3);
        sp.fillStyle(0x006668, 0.5); sp.fillRect(W / 2 - 2, sby + 10, 4, sbh - 20);

        this.add.text(W / 2 - 200, sby + 14, 'MOVES', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '10px', fontStyle: 'bold', color: '#4aedef', letterSpacing: 2
        }).setOrigin(0.5);
        this.movesVal = this.add.text(W / 2 - 200, sby + 36, '0', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '18px', fontStyle: 'bold', color: '#5dfbfe'
        }).setOrigin(0.5);

        this.add.text(W / 2 + 200, sby + 14, 'TIME', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '10px', fontStyle: 'bold', color: '#4aedef', letterSpacing: 2
        }).setOrigin(0.5);
        this.timeVal = this.add.text(W / 2 + 200, sby + 36, '0s', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '18px', fontStyle: 'bold', color: '#ffc5a5'
        }).setOrigin(0.5);

        // Bottom bar
        const bbar = this.add.graphics();
        bbar.fillStyle(0x0d0e0f); bbar.fillRect(0, H - 60, W, 60);
        bbar.fillStyle(0x006668); bbar.fillRect(0, H - 60, W, 4);

        const scr = this.add.text(W / 2 - 130, H - 30, '⚡ SCRAMBLE', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px', fontStyle: 'bold', color: '#5dfbfe'
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' })
          .on('pointerover', function() { this.setColor('#ffffff'); })
          .on('pointerout',  function() { this.setColor('#5dfbfe'); })
          .on('pointerdown', () => this.scramble());

        const best = localStorage.getItem('puzzle_best');
        this.bestText = this.add.text(W / 2 + 180, H - 30,
            best ? 'BEST: ' + best + ' MOVES' : 'SCRAMBLE TO START', {
            fontFamily: "'Work Sans', sans-serif",
            fontSize: '12px', color: '#4aedef'
        }).setOrigin(0.5);

        this.statusText = this.add.text(W / 2, H - 30, '', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '13px', fontStyle: 'bold', color: '#5dfbfe'
        }).setOrigin(0.5);
    }

    renderGrid(W, H) {
        this.tileObjs.forEach(o => { if (!o) return; o.bg.destroy(); o.num.destroy(); o.zone.destroy(); });
        this.tileObjs = [];

        const cell = this.TILE + this.GAP;
        const gridPx = this.GRID * cell - this.GAP;
        const ox = W / 2 - gridPx / 2;
        const oy = H / 2 - gridPx / 2 + 25;

        if (this.boardBg) this.boardBg.destroy();
        this.boardBg = this.add.graphics();
        // Sculk block board bg
        this.boardBg.fillStyle(0x111314);
        this.boardBg.fillRect(ox - 12, oy - 12, gridPx + 24, gridPx + 24);
        // Sculk glow border
        this.boardBg.fillStyle(0x5dfbfe, 0.25);
        this.boardBg.fillRect(ox - 12, oy - 12, gridPx + 24, 4);
        this.boardBg.fillRect(ox - 12, oy + gridPx + 8, gridPx + 24, 4);
        this.boardBg.fillRect(ox - 12, oy - 12, 4, gridPx + 24);
        this.boardBg.fillRect(ox + gridPx + 8, oy - 12, 4, gridPx + 24);

        // Sculk tile colours — deep dark blue-cyan-teal cycle
        const TILE_COLS = [
            0x00595b, 0x006668, 0x007476,
            0x004d4e, 0x006668, 0x00595b,
            0x003d3e, 0x004d4e, 0x006668
        ];

        this.state.forEach((val, idx) => {
            const col = idx % this.GRID;
            const row = Math.floor(idx / this.GRID);
            const tx = ox + col * cell + this.TILE / 2;
            const ty = oy + row * cell + this.TILE / 2;

            if (val === 0) {
                const eg = this.add.graphics();
                eg.fillStyle(0x0d0e0f); eg.fillRect(tx - this.TILE / 2, ty - this.TILE / 2, this.TILE, this.TILE);
                // Empty sculk slot — faint cyan glow border
                eg.fillStyle(0x5dfbfe, 0.12);
                eg.fillRect(tx - this.TILE / 2, ty - this.TILE / 2, this.TILE, 3);
                eg.fillRect(tx - this.TILE / 2, ty + this.TILE / 2 - 3, this.TILE, 3);
                eg.fillRect(tx - this.TILE / 2, ty - this.TILE / 2, 3, this.TILE);
                eg.fillRect(tx + this.TILE / 2 - 3, ty - this.TILE / 2, 3, this.TILE);
                this.tileObjs.push(null);
                return;
            }

            const T = this.TILE;
            const bg = this.add.graphics();
            const basCol = TILE_COLS[(val - 1) % TILE_COLS.length];
            const drawTile = (hover) => {
                bg.clear();
                bg.fillStyle(hover ? 0x5dfbfe : basCol); bg.fillRect(tx - T / 2, ty - T / 2, T, T);
                // Carved sculk tile effect
                bg.fillStyle(0x000000, 0.35); bg.fillRect(tx - T / 2, ty + T / 2 - 5, T, 5); bg.fillRect(tx + T / 2 - 5, ty - T / 2, 5, T);
                bg.fillStyle(0xffffff, 0.12); bg.fillRect(tx - T / 2, ty - T / 2, T, 5); bg.fillRect(tx - T / 2, ty - T / 2, 5, T);
                // Sculk vein texture
                bg.fillStyle(0x5dfbfe, hover ? 0 : 0.15); bg.fillRect(tx - T / 2 + 10, ty, T - 20, 2);
            };
            drawTile(false);

            const num = this.add.text(tx, ty, String(val), {
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '36px', fontStyle: 'bold',
                color: hover ? '#0a0b0c' : '#5dfbfe',
                stroke: '#003d3e', strokeThickness: 3
            }).setOrigin(0.5).setDepth(2);

            const zone = this.add.zone(tx, ty, this.TILE, this.TILE)
                .setInteractive({ cursor: 'pointer' }).setDepth(3);

            zone.on('pointerover', () => { drawTile(true); num.setColor('#0a0b0c'); });
            zone.on('pointerout',  () => { drawTile(false); num.setColor('#5dfbfe'); });
            zone.on('pointerdown', () => this.tryMove(idx));

            this.tileObjs.push({ bg, num, zone });
        });
    }

    tryMove(tileIdx) {
        if (this.solved) return;
        const blankIdx = this.state.indexOf(0);
        const dr = Math.abs(Math.floor(tileIdx / 3) - Math.floor(blankIdx / 3));
        const dc = Math.abs((tileIdx % 3) - (blankIdx % 3));
        if (dr + dc !== 1) return;
        [this.state[tileIdx], this.state[blankIdx]] = [this.state[blankIdx], this.state[tileIdx]];
        this.moves++;
        this.movesVal.setText(String(this.moves));
        if (!this.running) {
            this.running = true;
            this.ticker = this.time.addEvent({
                delay: 1000, repeat: -1,
                callback: () => { this.seconds++; this.timeVal.setText(this.seconds + 's'); }
            });
        }
        this.renderGrid(this.scale.width, this.scale.height);
        if (this.isSolved()) this.winGame();
    }

    isSolved() { return this.state.every((v, i) => i === 8 ? v === 0 : v === i + 1); }

    scramble() {
        if (this.ticker) this.ticker.remove();
        this.moves = 0; this.seconds = 0; this.running = false; this.solved = false;
        this.movesVal.setText('0'); this.timeVal.setText('0s'); this.statusText.setText('');
        this.bestText.setText(localStorage.getItem('puzzle_best') ? 'BEST: ' + localStorage.getItem('puzzle_best') + ' MOVES' : 'SOLVE IT!');
        let s = [1, 2, 3, 4, 5, 6, 7, 8, 0], prev = -1;
        for (let i = 0; i < 100; i++) {
            const b = s.indexOf(0), r = Math.floor(b / 3), c = b % 3;
            const nbrs = [];
            if (r > 0) nbrs.push(b - 3); if (r < 2) nbrs.push(b + 3);
            if (c > 0) nbrs.push(b - 1); if (c < 2) nbrs.push(b + 1);
            const opts = nbrs.filter(n => n !== prev);
            const pick = (opts.length ? opts : nbrs)[Math.floor(Math.random() * (opts.length || nbrs.length))];
            [s[b], s[pick]] = [s[pick], s[b]]; prev = b;
        }
        this.state = s;
        this.renderGrid(this.scale.width, this.scale.height);
    }

    winGame() {
        this.solved = true;
        if (this.ticker) this.ticker.remove();
        const prev = parseInt(localStorage.getItem('puzzle_best') || '9999');
        const isNew = this.moves < prev;
        if (isNew) localStorage.setItem('puzzle_best', this.moves);
        this.statusText.setText(isNew ? '★ NEW BEST: ' + this.moves + ' MOVES IN ' + this.seconds + 's!' : 'SOLVED! ' + this.moves + ' MOVES IN ' + this.seconds + 's').setColor(isNew ? '#5dfbfe' : '#95f169');
        this.bestText.setText('BEST: ' + (isNew ? this.moves : prev) + ' MOVES');
        this.tileObjs.forEach((t, i) => {
            if (!t) return;
            this.time.delayedCall(i * 55, () => { this.tweens.add({ targets: t.num, scaleX: 1.25, scaleY: 1.25, duration: 130, yoyo: true }); });
        });
    }
}
