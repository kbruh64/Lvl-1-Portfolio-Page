class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.HEADER_H = 80;
        this.FOOTER_H = 65;
        this.titleClicks = 0;
        this.lastTitleClick = 0;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.isAdmin = isAdminLoggedIn();

        // Background
        this.add.rectangle(0, 0, W, H, 0xf4f6ff).setOrigin(0, 0);
        const dots = this.add.graphics();
        dots.fillStyle(0xc8d4ff, 0.5);
        for (let x = 30; x < W; x += 40)
            for (let y = 30; y < H; y += 40)
                dots.fillCircle(x, y, 1.5);

        // Cards first (low depth), then UI on top
        this.buildProjectGrid(W, H);
        this.buildHeader(W, H);
        this.buildFooter(W, H);

        // Backtick → admin
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK)
            .on('down', () => this.scene.start('AdminScene'));
    }

    // ── HEADER ────────────────────────────────────────────────────

    buildHeader(W, H) {
        const g = this.add.graphics().setDepth(50);
        g.fillStyle(0xffffff);
        g.fillRect(0, 0, W, this.HEADER_H);
        g.lineStyle(2, 0xdde4ff);
        g.lineBetween(0, this.HEADER_H, W, this.HEADER_H);
        g.fillStyle(0x4466ff);
        g.fillRect(0, this.HEADER_H - 3, W, 3);

        const title = this.add.text(W / 2, this.HEADER_H / 2, "★ FELIX'S PORTFOLIO ★", {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '20px',
            color: '#3344dd'
        }).setOrigin(0.5).setDepth(51);

        // 5 rapid clicks = admin shortcut
        title.setInteractive({ cursor: 'pointer' });
        title.on('pointerdown', () => {
            const now = this.time.now;
            if (now - this.lastTitleClick > 2500) this.titleClicks = 0;
            this.lastTitleClick = now;
            if (++this.titleClicks >= 5) {
                this.titleClicks = 0;
                this.scene.start('AdminScene');
            }
        });

        if (this.isAdmin) {
            const badge = this.add.text(W - 14, 16, '[ ADMIN ]', {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '9px',
                color: '#ffffff',
                backgroundColor: '#ff9900',
                padding: { x: 8, y: 5 }
            }).setOrigin(1, 0).setDepth(51).setInteractive({ cursor: 'pointer' });
            badge.on('pointerdown', () => this.scene.start('AdminScene'));
        }
    }

    // ── FOOTER ────────────────────────────────────────────────────

    buildFooter(W, H) {
        const g = this.add.graphics().setDepth(50);
        g.fillStyle(0xffffff);
        g.fillRect(0, H - this.FOOTER_H, W, this.FOOTER_H);
        g.lineStyle(2, 0xdde4ff);
        g.lineBetween(0, H - this.FOOTER_H, W, H - this.FOOTER_H);
        g.fillStyle(0x4466ff);
        g.fillRect(0, H - this.FOOTER_H, W, 3);

        const defs = [
            { label: 'CPS TEST',     col: '#e03060', hcol: 0xe03060, scene: 'CPSScene' },
            { label: 'WHACK-A-MOLE', col: '#209950', hcol: 0x209950, scene: 'WhackAMoleScene' },
            { label: 'PUZZLE',       col: '#3355dd', hcol: 0x3355dd, scene: 'PuzzleScene' }
        ];

        const btnW = 210, btnH = 38, gap = 50;
        const totalW = defs.length * btnW + (defs.length - 1) * gap;
        const startX = (W - totalW) / 2;
        const cy = H - this.FOOTER_H / 2;

        defs.forEach((def, i) => {
            const cx = startX + i * (btnW + gap) + btnW / 2;
            const bgG = this.add.graphics().setDepth(51);

            const draw = (hover) => {
                bgG.clear();
                bgG.fillStyle(def.hcol, hover ? 0.12 : 0.06);
                bgG.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);
                bgG.lineStyle(2, def.hcol, hover ? 1 : 0.45);
                bgG.strokeRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);
            };
            draw(false);

            const txt = this.add.text(cx, cy, def.label, {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
                color: def.col
            }).setOrigin(0.5).setDepth(52).setInteractive({ cursor: 'pointer' });

            txt.on('pointerover', () => draw(true));
            txt.on('pointerout',  () => draw(false));
            txt.on('pointerdown', () => this.scene.start(def.scene));
        });
    }

    // ── PROJECT GRID ──────────────────────────────────────────────

    buildProjectGrid(W, H) {
        const COLS  = 3;
        const GAP_X = 22;
        const GAP_Y = 16;

        // Dynamically size cards to always fit on screen
        const rows      = Math.ceil(PROJECTS.length / COLS);
        const contentH  = H - this.HEADER_H - this.FOOTER_H;
        const CARD_W    = Math.floor((W - (COLS + 1) * GAP_X) / COLS);   // ~390
        const CARD_H    = Math.min(172, Math.floor((contentH - (rows - 1) * GAP_Y - 32) / rows));

        const gridW  = COLS * CARD_W + (COLS - 1) * GAP_X;
        const gridH  = rows * CARD_H + (rows - 1) * GAP_Y;
        const startX = (W - gridW) / 2;
        const startY = this.HEADER_H + Math.max(10, (contentH - gridH) / 2);

        PROJECTS.forEach((proj, idx) => {
            const col = idx % COLS;
            const row = Math.floor(idx / COLS);
            const cx  = startX + col * (CARD_W + GAP_X);
            const cy  = startY + row * (CARD_H + GAP_Y);
            this.createCard(proj, cx, cy, CARD_W, CARD_H);
        });
    }

    createCard(proj, x, y, w, h) {
        const status = getProjectStatus(proj.id);
        const sInfo  = STATUS_TYPES[status];

        // Drop shadow
        const shad = this.add.graphics().setDepth(2);
        shad.fillStyle(0xbcc8f0);
        shad.fillRoundedRect(x + 4, y + 4, w, h, 10);

        // Card bg
        const bg = this.add.graphics().setDepth(3);
        const drawBg = (hover) => {
            bg.clear();
            bg.fillStyle(hover ? 0xf5f7ff : 0xffffff);
            bg.fillRoundedRect(x, y, w, h, 10);
            bg.lineStyle(hover ? 2 : 1.5, hover ? 0x8899dd : 0xdde4ff);
            bg.strokeRoundedRect(x, y, w, h, 10);
        };
        drawBg(false);

        // Left status stripe
        const stripe = this.add.graphics().setDepth(4);
        stripe.fillStyle(sInfo.color);
        stripe.fillRoundedRect(x + 1, y + 1, 6, h - 2, { tl: 10, tr: 0, bl: 10, br: 0 });

        // Project name
        this.add.text(x + 20, y + 14, proj.name.toUpperCase(), {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px',
            color: '#1a1a3a',
            wordWrap: { width: w - 115 }
        }).setDepth(4);

        // Status badge (top right)
        this.add.text(x + w - 12, y + 14, '● ' + sInfo.label, {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '6px',
            color: sInfo.hex
        }).setOrigin(1, 0).setDepth(4);

        // Description
        this.add.text(x + 20, y + 40, proj.description, {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px',
            color: '#667799',
            wordWrap: { width: w - 32 }
        }).setDepth(4);

        // Tech tags (bottom)
        const tagY = y + h - 28;
        let tagX = x + 20;
        proj.tech.forEach(tag => {
            const tw = tag.length * 7 + 12;
            if (tagX + tw > x + w - 10) return; // don't overflow
            const tg = this.add.graphics().setDepth(4);
            tg.fillStyle(0xedf0ff);
            tg.fillRoundedRect(tagX, tagY, tw, 18, 4);
            this.add.text(tagX + tw / 2, tagY + 9, tag, {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '6px',
                color: '#4455bb'
            }).setOrigin(0.5).setDepth(5);
            tagX += tw + 6;
        });

        // Invisible hit zone — depth 6 (above status buttons at 7 in admin)
        const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h)
            .setAlpha(0.001).setDepth(6).setInteractive({ cursor: 'pointer' });

        hit.on('pointerover', () => drawBg(true));
        hit.on('pointerout',  () => drawBg(false));

        if (proj.url && proj.url !== '#') {
            hit.on('pointerdown', () => window.open(proj.url, '_blank'));
        }

        // Admin: inline status buttons (depth 7, receive input before hit zone)
        if (this.isAdmin) {
            this.addStatusButtons(proj, x, y, w, h);
        }
    }

    addStatusButtons(proj, x, y, w, h) {
        const btns = [
            { key: 'GOOD',        label: 'GOOD',  info: STATUS_TYPES.GOOD },
            { key: 'MAINTENANCE', label: 'MAINT', info: STATUS_TYPES.MAINTENANCE },
            { key: 'BROKEN',      label: 'BRKN',  info: STATUS_TYPES.BROKEN }
        ];

        const bh = 22, gap = 5;
        const bw = (w - 40 - gap * 2) / 3;
        const btnY = y + h - 30;
        const current = getProjectStatus(proj.id);

        btns.forEach((btn, i) => {
            const bx = x + 20 + i * (bw + gap);
            const isActive = current === btn.key;
            const bgG = this.add.graphics().setDepth(7);

            const draw = (hov) => {
                bgG.clear();
                bgG.fillStyle(isActive ? btn.info.color : (hov ? 0xeef2ff : 0xf5f7ff));
                bgG.fillRoundedRect(bx, btnY, bw, bh, 4);
                bgG.lineStyle(1.5, btn.info.color, isActive || hov ? 1 : 0.4);
                bgG.strokeRoundedRect(bx, btnY, bw, bh, 4);
            };
            draw(false);

            const txt = this.add.text(bx + bw / 2, btnY + bh / 2, btn.label, {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '6px',
                color: isActive ? '#ffffff' : btn.info.hex
            }).setOrigin(0.5).setDepth(8).setInteractive({ cursor: 'pointer' });

            txt.on('pointerover', () => draw(true));
            txt.on('pointerout',  () => draw(false));
            txt.on('pointerdown', () => {
                setProjectStatus(proj.id, btn.key);
                this.scene.restart();
            });
        });
    }
}
