class PuzzleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PuzzleScene' });
        this.GRID = 3;
        this.TILE = 120;
        this.GAP = 6;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.moves = 0;
        this.seconds = 0;
        this.running = false;
        this.solved = false;
        this.tiles = [];            // GameObjects
        this.state = [];            // tile values, 0 = blank

        this.drawBg(W, H);
        this.buildUI(W, H);
        this.initPuzzle(W, H);
    }

    drawBg(W, H) {
        const g = this.add.graphics();
        g.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0a0a2e, 0x0a0a2e, 1);
        g.fillRect(0, 0, W, H);

        g.lineStyle(1, 0x111133, 0.5);
        for (let x = 0; x < W; x += 50) g.lineBetween(x, 0, x, H);
        for (let y = 0; y < H; y += 50) g.lineBetween(0, y, W, y);
    }

    buildUI(W, H) {
        // Back
        const back = this.add.text(20, 20, '[ < BACK ]', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px', color: '#556677'
        }).setInteractive({ cursor: 'pointer' });
        back.on('pointerover', () => back.setColor('#aabbcc'));
        back.on('pointerout',  () => back.setColor('#556677'));
        back.on('pointerdown', () => this.scene.start('MainScene'));

        // Title
        this.add.text(W / 2, 40, 'SLIDING PUZZLE', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '24px', color: '#6699ff',
            stroke: '#001133', strokeThickness: 6
        }).setOrigin(0.5);

        // Stats
        this.movesText = this.add.text(W / 2 - 180, 90, 'MOVES: 0', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px', color: '#6699ff'
        }).setOrigin(0.5);

        this.timeText = this.add.text(W / 2 + 180, 90, 'TIME: 0s', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px', color: '#ffcc44'
        }).setOrigin(0.5);

        this.add.text(W / 2, 90, '|', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px', color: '#334455'
        }).setOrigin(0.5);

        // Hint
        this.hintText = this.add.text(W / 2, H - 90, 'CLICK A TILE NEXT TO THE BLANK TO MOVE IT', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px', color: '#334466'
        }).setOrigin(0.5);

        // Scramble button
        const scrbtn = this.add.text(W / 2 - 100, H - 45, '[ SCRAMBLE ]', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '11px', color: '#6699ff'
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        scrbtn.on('pointerover', () => scrbtn.setColor('#aabbff'));
        scrbtn.on('pointerout',  () => scrbtn.setColor('#6699ff'));
        scrbtn.on('pointerdown', () => this.scramblePuzzle());

        // Best score
        const best = localStorage.getItem('puzzle_best');
        this.bestText = this.add.text(W / 2 + 150, H - 45, best ? 'BEST: ' + best + ' MOVES' : '', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px', color: '#445566'
        }).setOrigin(0.5);
    }

    initPuzzle(W, H) {
        // Solved state
        this.state = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        this.renderTiles(W, H);
    }

    renderTiles(W, H) {
        // Destroy existing tiles
        this.tiles.forEach(t => { if (t) t.destroy(); });
        this.tiles = [];

        const cellSize = this.TILE + this.GAP;
        const gridPx = this.GRID * cellSize - this.GAP;
        const originX = W / 2 - gridPx / 2;
        const originY = H / 2 - gridPx / 2 + 20;

        this.tileOriginX = originX;
        this.tileOriginY = originY;

        this.state.forEach((val, idx) => {
            const col = idx % this.GRID;
            const row = Math.floor(idx / this.GRID);
            const tx = originX + col * cellSize + this.TILE / 2;
            const ty = originY + row * cellSize + this.TILE / 2;

            if (val === 0) {
                this.tiles.push(null); // blank slot
                return;
            }

            const tileContainer = this.createTile(tx, ty, val, idx);
            this.tiles.push(tileContainer);
        });
    }

    createTile(tx, ty, val, stateIdx) {
        const T = this.TILE;

        // Colors per tile for visual variety
        const colors = [
            0x1133aa, 0x2244bb, 0x3355cc,
            0x1144aa, 0x2255bb, 0x3366cc,
            0x1155aa, 0x2266bb, 0x3377cc
        ];
        const col = colors[(val - 1) % colors.length];

        const bg = this.add.graphics();
        bg.fillStyle(col, 1);
        bg.fillRoundedRect(tx - T / 2, ty - T / 2, T, T, 10);
        bg.fillStyle(0xffffff, 0.08);
        bg.fillRoundedRect(tx - T / 2 + 3, ty - T / 2 + 3, T - 6, T / 3, { tl: 8, tr: 8, bl: 0, br: 0 });
        bg.lineStyle(2, 0x6699ff, 0.5);
        bg.strokeRoundedRect(tx - T / 2, ty - T / 2, T, T, 10);

        const numTxt = this.add.text(tx, ty, String(val), {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#001133',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Interactive zone
        const zone = this.add.zone(tx, ty, T, T).setInteractive({ cursor: 'pointer' });

        zone.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(col + 0x222222, 1);
            bg.fillRoundedRect(tx - T / 2, ty - T / 2, T, T, 10);
            bg.lineStyle(2, 0xaabbff, 0.8);
            bg.strokeRoundedRect(tx - T / 2, ty - T / 2, T, T, 10);
        });

        zone.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(col, 1);
            bg.fillRoundedRect(tx - T / 2, ty - T / 2, T, T, 10);
            bg.fillStyle(0xffffff, 0.08);
            bg.fillRoundedRect(tx - T / 2 + 3, ty - T / 2 + 3, T - 6, T / 3, { tl: 8, tr: 8, bl: 0, br: 0 });
            bg.lineStyle(2, 0x6699ff, 0.5);
            bg.strokeRoundedRect(tx - T / 2, ty - T / 2, T, T, 10);
        });

        zone.on('pointerdown', () => this.tryMove(stateIdx));

        // Group them so we can track
        const group = { bg, numTxt, zone, stateIdx };
        return group;
    }

    tryMove(tileIdx) {
        const blankIdx = this.state.indexOf(0);
        const row = Math.floor(tileIdx / this.GRID);
        const col = tileIdx % this.GRID;
        const bRow = Math.floor(blankIdx / this.GRID);
        const bCol = blankIdx % this.GRID;

        const adjacent = (Math.abs(row - bRow) + Math.abs(col - bCol)) === 1;
        if (!adjacent) return;

        // Swap
        [this.state[tileIdx], this.state[blankIdx]] = [this.state[blankIdx], this.state[tileIdx]];

        this.moves++;
        this.movesText.setText('MOVES: ' + this.moves);

        if (!this.running) {
            this.running = true;
            this.ticker = this.time.addEvent({
                delay: 1000, repeat: -1,
                callback: () => {
                    this.seconds++;
                    this.timeText.setText('TIME: ' + this.seconds + 's');
                }
            });
        }

        // Re-render
        const W = this.scale.width, H = this.scale.height;
        this.renderTiles(W, H);

        if (this.isSolved()) this.winGame();
    }

    isSolved() {
        return this.state.every((v, i) => i === 8 ? v === 0 : v === i + 1);
    }

    scramblePuzzle() {
        if (this.ticker) this.ticker.remove();
        this.moves = 0;
        this.seconds = 0;
        this.running = false;
        this.solved = false;
        this.movesText.setText('MOVES: 0');
        this.timeText.setText('TIME: 0s');
        this.hintText.setText('CLICK A TILE NEXT TO THE BLANK TO MOVE IT').setColor('#334466');

        // Start solved and make random valid moves
        let s = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        let lastBlank = -1;
        for (let i = 0; i < 80; i++) {
            const blank = s.indexOf(0);
            const r = Math.floor(blank / 3), c = blank % 3;
            const neighbours = [];
            if (r > 0) neighbours.push(blank - 3);
            if (r < 2) neighbours.push(blank + 3);
            if (c > 0) neighbours.push(blank - 1);
            if (c < 2) neighbours.push(blank + 1);
            const filtered = neighbours.filter(n => n !== lastBlank);
            const pick = filtered.length > 0 ? filtered : neighbours;
            const target = pick[Math.floor(Math.random() * pick.length)];
            [s[blank], s[target]] = [s[target], s[blank]];
            lastBlank = blank;
        }
        this.state = s;
        this.renderTiles(this.scale.width, this.scale.height);
    }

    winGame() {
        this.solved = true;
        this.running = false;
        if (this.ticker) this.ticker.remove();

        const best = parseInt(localStorage.getItem('puzzle_best') || '9999');
        const isNew = this.moves < best;
        if (isNew) localStorage.setItem('puzzle_best', this.moves);
        this.bestText.setText('BEST: ' + (isNew ? this.moves : best) + ' MOVES');

        const W = this.scale.width, H = this.scale.height;
        this.hintText.setText(
            isNew
                ? '★ SOLVED! NEW BEST: ' + this.moves + ' MOVES IN ' + this.seconds + 's! ★'
                : '★ SOLVED IN ' + this.moves + ' MOVES AND ' + this.seconds + 's! ★'
        ).setColor(isNew ? '#ffee00' : '#00ff88');

        // Celebration tweens on tiles
        this.tiles.forEach((t, i) => {
            if (!t) return;
            this.time.delayedCall(i * 60, () => {
                this.tweens.add({
                    targets: [t.bg, t.numTxt],
                    scaleX: 1.12, scaleY: 1.12,
                    duration: 150,
                    yoyo: true
                });
            });
        });
    }
}
