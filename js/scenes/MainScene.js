// Bright rotating palette for card name text
const CARD_COLORS = [
    '#e6004d', '#ff6200', '#00aa44', '#2255ff',
    '#9922cc', '#cc2200', '#0099cc', '#dd8800', '#00997a'
];

// Tag badge colours (bg hex, text hex)
const TAG_PALETTE = [
    { bg: 0xffe0f0, tx: '#cc0055' },
    { bg: 0xfff0d8, tx: '#cc5500' },
    { bg: 0xd8f5e8, tx: '#006633' },
    { bg: 0xd8e8ff, tx: '#1133bb' },
    { bg: 0xf0d8ff, tx: '#7700cc' },
];

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.HEADER_H = 88;
        this.FOOTER_H = 68;
        this.titleClicks = 0;
        this.lastTitleClick = 0;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.isAdmin = isAdminLoggedIn();

        // Light background with coloured dots
        this.add.rectangle(0, 0, W, H, 0xf0f4ff).setOrigin(0, 0);
        const dots = this.add.graphics();
        const dotCols = [0xc0d0ff, 0xffc8d8, 0xc8f0d8, 0xffe8c0];
        for (let x = 28; x < W; x += 38) {
            for (let y = 28; y < H; y += 38) {
                dots.fillStyle(dotCols[(Math.floor(x / 38) + Math.floor(y / 38)) % dotCols.length], 0.55);
                dots.fillCircle(x, y, 2);
            }
        }

        this.buildProjectGrid(W, H);
        this.buildHeader(W, H);
        this.buildFooter(W, H);

        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK)
            .on('down', () => this.scene.start('AdminScene'));
    }

    // ── HEADER ────────────────────────────────────────────────────

    buildHeader(W) {
        const g = this.add.graphics().setDepth(50);
        g.fillStyle(0xffffff);
        g.fillRect(0, 0, W, this.HEADER_H);
        g.lineStyle(3, 0xdde8ff);
        g.lineBetween(0, this.HEADER_H, W, this.HEADER_H);

        // Rainbow accent bar
        const rainbowCols = [0xff2255, 0xff8800, 0xffdd00, 0x22cc55, 0x2266ff, 0x9922ee];
        const segW = W / rainbowCols.length;
        rainbowCols.forEach((c, i) => {
            g.fillStyle(c);
            g.fillRect(i * segW, this.HEADER_H - 4, segW + 1, 4);
        });

        this.add.text(W / 2, this.HEADER_H / 2 - 2, "★  FELIX'S PORTFOLIO  ★", {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '24px',
            color: '#2244ee',
            stroke: '#aabbff',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(51).setInteractive({ cursor: 'pointer' })
          .on('pointerdown', () => {
              const now = this.time.now;
              if (now - this.lastTitleClick > 2500) this.titleClicks = 0;
              this.lastTitleClick = now;
              if (++this.titleClicks >= 5) { this.titleClicks = 0; this.scene.start('AdminScene'); }
          });

        if (this.isAdmin) {
            const badge = this.add.text(W - 14, 18, '[ ADMIN ]', {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '11px',
                color: '#ffffff',
                backgroundColor: '#ff8800',
                padding: { x: 9, y: 6 }
            }).setOrigin(1, 0).setDepth(51).setInteractive({ cursor: 'pointer' });
            badge.on('pointerdown', () => this.scene.start('AdminScene'));
        }
    }

    // ── FOOTER ────────────────────────────────────────────────────

    buildFooter(W, H) {
        const g = this.add.graphics().setDepth(50);
        g.fillStyle(0xffffff);
        g.fillRect(0, H - this.FOOTER_H, W, this.FOOTER_H);
        g.lineStyle(3, 0xdde8ff);
        g.lineBetween(0, H - this.FOOTER_H, W, H - this.FOOTER_H);

        // Bottom rainbow bar
        const rainbowCols = [0x9922ee, 0x2266ff, 0x22cc55, 0xffdd00, 0xff8800, 0xff2255];
        const segW = W / rainbowCols.length;
        rainbowCols.forEach((c, i) => {
            g.fillStyle(c);
            g.fillRect(i * segW, H - this.FOOTER_H, segW + 1, 4);
        });

        const defs = [
            { label: '🖱 CPS TEST',      col: '#dd0044', hcol: 0xdd0044, scene: 'CPSScene' },
            { label: '🔨 WHACK-A-MOLE',  col: '#009933', hcol: 0x009933, scene: 'WhackAMoleScene' },
            { label: '🧩 PUZZLE',         col: '#2244dd', hcol: 0x2244dd, scene: 'PuzzleScene' }
        ];

        const btnW = 230, btnH = 42, gap = 40;
        const totalW = defs.length * btnW + (defs.length - 1) * gap;
        const startX = (W - totalW) / 2;
        const cy = H - this.FOOTER_H / 2 + 2;

        defs.forEach((def, i) => {
            const cx = startX + i * (btnW + gap) + btnW / 2;
            const bgG = this.add.graphics().setDepth(51);

            const draw = (hover) => {
                bgG.clear();
                bgG.fillStyle(def.hcol, hover ? 0.15 : 0.07);
                bgG.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 10);
                bgG.lineStyle(hover ? 3 : 2, def.hcol, hover ? 1 : 0.5);
                bgG.strokeRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 10);
            };
            draw(false);

            const txt = this.add.text(cx, cy, def.label, {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '12px',
                color: def.col
            }).setOrigin(0.5).setDepth(52).setInteractive({ cursor: 'pointer' });

            txt.on('pointerover', () => { draw(true);  txt.setStyle({ color: def.col, fontSize: '13px' }); });
            txt.on('pointerout',  () => { draw(false); txt.setStyle({ color: def.col, fontSize: '12px' }); });
            txt.on('pointerdown', () => this.scene.start(def.scene));
        });
    }

    // ── PROJECT GRID ──────────────────────────────────────────────

    buildProjectGrid(W, H) {
        const COLS  = 3;
        const GAP_X = 20;
        const GAP_Y = 14;

        const rows     = Math.ceil(PROJECTS.length / COLS);
        const contentH = H - this.HEADER_H - this.FOOTER_H;
        const CARD_W   = Math.floor((W - (COLS + 1) * GAP_X) / COLS);
        const CARD_H   = Math.min(178, Math.floor((contentH - (rows - 1) * GAP_Y - 24) / rows));

        const gridW  = COLS * CARD_W + (COLS - 1) * GAP_X;
        const gridH  = rows * CARD_H + (rows - 1) * GAP_Y;
        const startX = (W - gridW) / 2;
        const startY = this.HEADER_H + Math.max(8, (contentH - gridH) / 2);

        PROJECTS.forEach((proj, idx) => {
            const col   = idx % COLS;
            const row   = Math.floor(idx / COLS);
            const nameCol = CARD_COLORS[idx % CARD_COLORS.length];
            this.createCard(
                proj,
                startX + col * (CARD_W + GAP_X),
                startY + row * (CARD_H + GAP_Y),
                CARD_W, CARD_H, nameCol
            );
        });
    }

    createCard(proj, x, y, w, h, nameCol) {
        const status = getProjectStatus(proj.id);
        const sInfo  = STATUS_TYPES[status];

        // Drop shadow
        const shad = this.add.graphics().setDepth(2);
        shad.fillStyle(0xaab8e0);
        shad.fillRoundedRect(x + 5, y + 5, w, h, 12);

        // Card bg
        const bg = this.add.graphics().setDepth(3);
        const drawBg = (hover) => {
            bg.clear();
            bg.fillStyle(hover ? 0xeef2ff : 0xffffff);
            bg.fillRoundedRect(x, y, w, h, 12);
            bg.lineStyle(hover ? 3 : 2, hover ? Phaser.Display.Color.HexStringToColor(nameCol).color : 0xdde8ff);
            bg.strokeRoundedRect(x, y, w, h, 12);
        };
        drawBg(false);

        // Coloured top accent bar
        const accent = this.add.graphics().setDepth(4);
        accent.fillStyle(Phaser.Display.Color.HexStringToColor(nameCol).color);
        accent.fillRoundedRect(x + 1, y + 1, w - 2, 5, { tl: 12, tr: 12, bl: 0, br: 0 });

        // Left status stripe
        const stripe = this.add.graphics().setDepth(4);
        stripe.fillStyle(sInfo.color);
        stripe.fillRoundedRect(x + 1, y + 1, 7, h - 2, { tl: 12, tr: 0, bl: 12, br: 0 });

        // Project name
        this.add.text(x + 22, y + 18, proj.name.toUpperCase(), {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            color: nameCol,
            wordWrap: { width: w - 130 }
        }).setDepth(5);

        // Status badge (top right)
        this.add.text(x + w - 10, y + 18, '● ' + sInfo.label, {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
            color: sInfo.hex
        }).setOrigin(1, 0).setDepth(5);

        // Thin divider
        const div = this.add.graphics().setDepth(4);
        div.lineStyle(1, 0xdde8ff, 0.9);
        div.lineBetween(x + 16, y + 46, x + w - 16, y + 46);

        // Description
        this.add.text(x + 22, y + 54, proj.description, {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
            color: '#445588',
            wordWrap: { width: w - 36 }
        }).setDepth(5);

        // Tech tags (bottom)
        const tagY = y + h - (this.isAdmin ? 56 : 30);
        let tagX = x + 16;
        proj.tech.forEach((tag, ti) => {
            const pal = TAG_PALETTE[ti % TAG_PALETTE.length];
            const tw  = tag.length * 8 + 14;
            if (tagX + tw > x + w - 8) return;
            const tg = this.add.graphics().setDepth(5);
            tg.fillStyle(pal.bg);
            tg.fillRoundedRect(tagX, tagY, tw, 20, 5);
            this.add.text(tagX + tw / 2, tagY + 10, tag, {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '7px',
                color: pal.tx
            }).setOrigin(0.5).setDepth(6);
            tagX += tw + 6;
        });

        // Hit zone
        const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h)
            .setAlpha(0.001).setDepth(6).setInteractive({ cursor: 'pointer' });

        hit.on('pointerover', () => drawBg(true));
        hit.on('pointerout',  () => drawBg(false));
        if (proj.url && proj.url !== '#') {
            hit.on('pointerdown', () => window.open(proj.url, '_blank'));
        }

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

        const bh = 24, gap = 6;
        const bw = (w - 44 - gap * 2) / 3;
        const btnY = y + h - 32;
        const current = getProjectStatus(proj.id);

        btns.forEach((btn, i) => {
            const bx      = x + 22 + i * (bw + gap);
            const isActive = current === btn.key;
            const bgG     = this.add.graphics().setDepth(7);

            const draw = (hov) => {
                bgG.clear();
                bgG.fillStyle(isActive ? btn.info.color : (hov ? 0xeef4ff : 0xf5f7ff));
                bgG.fillRoundedRect(bx, btnY, bw, bh, 5);
                bgG.lineStyle(isActive || hov ? 2 : 1.5, btn.info.color, isActive || hov ? 1 : 0.4);
                bgG.strokeRoundedRect(bx, btnY, bw, bh, 5);
            };
            draw(false);

            const txt = this.add.text(bx + bw / 2, btnY + bh / 2, btn.label, {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '7px',
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
