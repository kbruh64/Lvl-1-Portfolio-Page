class PuzzleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PuzzleScene' });
        this.GRID = 3;
        this.TILE = 118;
        this.GAP  = 8;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.moves   = 0;
        this.seconds = 0;
        this.running = false;
        this.solved  = false;
        this.tileObjs = [];
        this.state   = [1, 2, 3, 4, 5, 6, 7, 8, 0];

        this.drawBg(W, H);
        this.buildUI(W, H);
        this.renderGrid(W, H);
    }

    drawBg(W, H) {
        this.add.rectangle(0, 0, W, H, 0xf0f4ff).setOrigin(0, 0);
        const g = this.add.graphics();
        g.fillStyle(0xd0d8ff, 0.4);
        for (let x = 30; x < W; x += 40)
            for (let y = 30; y < H; y += 40)
                g.fillCircle(x, y, 1.5);
    }

    buildUI(W, H) {
        // Header
        const hg = this.add.graphics();
        hg.fillStyle(0xffffff); hg.fillRect(0, 0, W, 72);
        hg.lineStyle(2, 0xdde8ff); hg.lineBetween(0, 72, W, 72);
        hg.fillStyle(0x3355dd); hg.fillRect(0, 69, W, 3);

        // Back
        const back = this.add.text(20, 20, '[ < BACK ]', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px', color: '#99aabb'
        }).setInteractive({ cursor: 'pointer' });
        back.on('pointerover', () => back.setColor('#3355dd'));
        back.on('pointerout',  () => back.setColor('#99aabb'));
        back.on('pointerdown', () => this.scene.start('MainScene'));

        // Title
        this.add.text(W / 2, 36, 'SLIDING PUZZLE', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '22px', color: '#3355dd'
        }).setOrigin(0.5);

        // Stats panel
        const sp = this.add.graphics();
        sp.fillStyle(0xffffff); sp.fillRoundedRect(W / 2 - 280, 85, 560, 58, 10);
        sp.lineStyle(1.5, 0xdde8ff); sp.strokeRoundedRect(W / 2 - 280, 85, 560, 58, 10);

        this.add.text(W / 2 - 200, 100, 'MOVES', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px', color: '#aabbcc'
        }).setOrigin(0.5);
        this.movesVal = this.add.text(W / 2 - 200, 120, '0', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '16px', color: '#3355dd'
        }).setOrigin(0.5);

        const dv = this.add.graphics();
        dv.lineStyle(1, 0xdde8ff); dv.lineBetween(W / 2, 90, W / 2, 138);

        this.add.text(W / 2 + 200, 100, 'TIME', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px', color: '#aabbcc'
        }).setOrigin(0.5);
        this.timeVal = this.add.text(W / 2 + 200, 120, '0s', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '16px', color: '#ff9900'
        }).setOrigin(0.5);

        // Bottom bar
        const bbar = this.add.graphics();
        bbar.fillStyle(0xffffff); bbar.fillRect(0, H - 60, W, 60);
        bbar.lineStyle(2, 0xdde8ff); bbar.lineBetween(0, H - 60, W, H - 60);
        bbar.fillStyle(0x3355dd); bbar.fillRect(0, H - 60, W, 3);

        // Scramble button
        const scr = this.add.text(W / 2 - 130, H - 30, '[ SCRAMBLE ]', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '11px', color: '#3355dd'
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        scr.on('pointerover', () => scr.setColor('#0033bb'));
        scr.on('pointerout',  () => scr.setColor('#3355dd'));
        scr.on('pointerdown', () => this.scramble());

        // Best
        const best = localStorage.getItem('puzzle_best');
        this.bestText = this.add.text(W / 2 + 180, H - 30,
            best ? 'BEST: ' + best + ' MOVES' : 'SCRAMBLE TO START', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px', color: '#aabbcc'
        }).setOrigin(0.5);

        // Status text
        this.statusText = this.add.text(W / 2, H - 30, '', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px', color: '#209950'
        }).setOrigin(0.5);
    }

    renderGrid(W, H) {
        // Destroy old tiles
        this.tileObjs.forEach(o => {
            if (!o) return;
            o.bg.destroy();
            o.num.destroy();
            o.zone.destroy();
        });
        this.tileObjs = [];

        const cell   = this.TILE + this.GAP;
        const gridPx = this.GRID * cell - this.GAP;
        const ox = W / 2 - gridPx / 2;
        const oy = H / 2 - gridPx / 2 + 25;

        // Board bg
        if (this.boardBg) this.boardBg.destroy();
        this.boardBg = this.add.graphics();
        this.boardBg.fillStyle(0xe8ecff);
        this.boardBg.fillRoundedRect(ox - 12, oy - 12, gridPx + 24, gridPx + 24, 14);

        // Tile colours (pastel blues / purples)
        const TILE_COLS = [
            0x4466ff, 0x5577ff, 0x6688ff,
            0x3355ee, 0x4466ff, 0x5577ff,
            0x2244dd, 0x3355ee, 0x4466ff
        ];

        this.state.forEach((val, idx) => {
            const col = idx % this.GRID;
            const row = Math.floor(idx / this.GRID);
            const tx  = ox + col * cell + this.TILE / 2;
            const ty  = oy + row * cell + this.TILE / 2;

            if (val === 0) {
                // Empty slot
                const eg = this.add.graphics();
                eg.fillStyle(0xd0d8ff);
                eg.fillRoundedRect(tx - this.TILE / 2, ty - this.TILE / 2, this.TILE, this.TILE, 10);
                this.tileObjs.push(null);
                return;
            }

            const T = this.TILE;
            const bg = this.add.graphics();
            const drawTile = (hover) => {
                bg.clear();
                bg.fillStyle(hover ? TILE_COLS[(val - 1) % TILE_COLS.length] + 0x222222 : TILE_COLS[(val - 1) % TILE_COLS.length]);
                bg.fillRoundedRect(tx - T / 2, ty - T / 2, T, T, 10);
                bg.fillStyle(0xffffff, 0.18);
                bg.fillRoundedRect(tx - T / 2 + 5, ty - T / 2 + 5, T - 10, T / 4, { tl: 8, tr: 8, bl: 0, br: 0 });
            };
            drawTile(false);

            const num = this.add.text(tx, ty, String(val), {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '32px', color: '#ffffff',
                stroke: '#002299', strokeThickness: 4
            }).setOrigin(0.5).setDepth(2);

            const zone = this.add.zone(tx, ty, this.TILE, this.TILE)
                .setInteractive({ cursor: 'pointer' }).setDepth(3);

            zone.on('pointerover', () => drawTile(true));
            zone.on('pointerout',  () => drawTile(false));
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

    isSolved() {
        return this.state.every((v, i) => i === 8 ? v === 0 : v === i + 1);
    }

    scramble() {
        if (this.ticker) this.ticker.remove();
        this.moves = 0; this.seconds = 0; this.running = false; this.solved = false;
        this.movesVal.setText('0');
        this.timeVal.setText('0s');
        this.statusText.setText('');
        this.bestText.setText(localStorage.getItem('puzzle_best')
            ? 'BEST: ' + localStorage.getItem('puzzle_best') + ' MOVES'
            : 'SOLVE IT!');

        let s = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        let prev = -1;
        for (let i = 0; i < 100; i++) {
            const b = s.indexOf(0);
            const r = Math.floor(b / 3), c = b % 3;
            const nbrs = [];
            if (r > 0) nbrs.push(b - 3);
            if (r < 2) nbrs.push(b + 3);
            if (c > 0) nbrs.push(b - 1);
            if (c < 2) nbrs.push(b + 1);
            const opts = nbrs.filter(n => n !== prev);
            const pick = (opts.length ? opts : nbrs)[Math.floor(Math.random() * (opts.length || nbrs.length))];
            [s[b], s[pick]] = [s[pick], s[b]];
            prev = b;
        }
        this.state = s;
        this.renderGrid(this.scale.width, this.scale.height);
    }

    winGame() {
        this.solved = true;
        if (this.ticker) this.ticker.remove();

        const prev  = parseInt(localStorage.getItem('puzzle_best') || '9999');
        const isNew = this.moves < prev;
        if (isNew) localStorage.setItem('puzzle_best', this.moves);

        this.statusText.setText(
            isNew
                ? '★ NEW BEST: ' + this.moves + ' MOVES IN ' + this.seconds + 's!'
                : 'SOLVED! ' + this.moves + ' MOVES IN ' + this.seconds + 's'
        ).setColor(isNew ? '#e03060' : '#209950');

        this.bestText.setText('BEST: ' + (isNew ? this.moves : prev) + ' MOVES');

        // Bounce all tiles
        this.tileObjs.forEach((t, i) => {
            if (!t) return;
            this.time.delayedCall(i * 55, () => {
                this.tweens.add({
                    targets: t.num, scaleX: 1.25, scaleY: 1.25,
                    duration: 130, yoyo: true
                });
            });
        });
    }
}
