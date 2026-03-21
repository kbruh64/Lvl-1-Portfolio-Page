const CARD_COLORS = [
    '#e6004d', '#ff6200', '#00aa44', '#2255ff',
    '#9922cc', '#cc2200', '#0099cc', '#dd8800', '#00997a', '#cc44aa'
];

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
        this.HEADER_H       = 88;
        this.FOOTER_H       = 72;
        this.titleClicks    = 0;
        this.lastTitleClick = 0;
        this.scrollY        = 0;
        this.maxScroll      = 0;
        this.scrollItems    = [];
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.isAdmin     = isAdminLoggedIn();
        this.scrollItems = [];
        this.scrollY     = 0;

        this.add.rectangle(0, 0, W, H, 0xf0f4ff).setOrigin(0, 0);
        const dots = this.add.graphics();
        const dotCols = [0xc0d0ff, 0xffc8d8, 0xc8f0d8, 0xffe8c0];
        for (let dx = 28; dx < W; dx += 38)
            for (let dy = 28; dy < H; dy += 38) {
                dots.fillStyle(dotCols[(Math.floor(dx / 38) + Math.floor(dy / 38)) % dotCols.length], 0.45);
                dots.fillCircle(dx, dy, 2);
            }

        this.buildProjectGrid(W, H);
        this.buildHeader(W);
        this.buildFooter(W, H);

        // Invisible blockers — stop clicks hitting scrolled cards behind header/footer
        this.add.rectangle(W / 2, this.HEADER_H / 2, W, this.HEADER_H)
            .setAlpha(0.001).setDepth(49).setInteractive();
        this.add.rectangle(W / 2, H - this.FOOTER_H / 2, W, this.FOOTER_H)
            .setAlpha(0.001).setDepth(49).setInteractive();

        this.input.on('wheel', (_p, _g, _dx, dy) => {
            this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.6, 0, this.maxScroll);
            this.scrollItems.forEach(({ obj, baseY }) => { obj.y = baseY - this.scrollY; });
        });

        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK)
            .on('down', () => this.scene.start('AdminScene'));
    }

    // ── HEADER ────────────────────────────────────────────────────

    buildHeader(W) {
        const g = this.add.graphics().setDepth(50);
        g.fillStyle(0xffffff);
        g.fillRect(0, 0, W, this.HEADER_H);
        g.lineStyle(2, 0xdde8ff);
        g.lineBetween(0, this.HEADER_H, W, this.HEADER_H);

        [0xff2255, 0xff8800, 0xffdd00, 0x22cc55, 0x2266ff, 0x9922ee].forEach((c, i, arr) => {
            g.fillStyle(c);
            g.fillRect(i * (W / arr.length), this.HEADER_H - 5, W / arr.length + 1, 5);
        });

        this.add.text(W / 2, this.HEADER_H / 2 - 2, "Felix's Portfolio", {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '34px', fontStyle: 'bold',
            color: '#2233cc',
            stroke: '#c8d4ff', strokeThickness: 6
        }).setOrigin(0.5).setDepth(51).setInteractive({ cursor: 'pointer' })
          .on('pointerdown', () => {
              const now = this.time.now;
              if (now - this.lastTitleClick > 2500) this.titleClicks = 0;
              this.lastTitleClick = now;
              if (++this.titleClicks >= 5) { this.titleClicks = 0; this.scene.start('AdminScene'); }
          });

        if (this.isAdmin) {
            this.add.text(W - 14, 16, '⚙ Admin', {
                fontFamily: "'Poppins', sans-serif",
                fontSize: '13px', fontStyle: 'bold',
                color: '#ffffff', backgroundColor: '#ff8800',
                padding: { x: 10, y: 6 }
            }).setOrigin(1, 0).setDepth(51).setInteractive({ cursor: 'pointer' })
              .on('pointerdown', () => this.scene.start('AdminScene'));
        }

        if (this.maxScroll > 0) {
            this.add.text(W / 2, this.HEADER_H - 8, '👇 Scroll for more projects', {
                fontFamily: "'Poppins', sans-serif",
                fontSize: '11px', color: '#8899cc'
            }).setOrigin(0.5, 1).setDepth(51);
        }
    }

    // ── FOOTER ────────────────────────────────────────────────────

    buildFooter(W, H) {
        const g = this.add.graphics().setDepth(50);
        g.fillStyle(0xffffff);
        g.fillRect(0, H - this.FOOTER_H, W, this.FOOTER_H);
        g.lineStyle(2, 0xdde8ff);
        g.lineBetween(0, H - this.FOOTER_H, W, H - this.FOOTER_H);

        [0x9922ee, 0x2266ff, 0x22cc55, 0xffdd00, 0xff8800, 0xff2255].forEach((c, i, arr) => {
            g.fillStyle(c);
            g.fillRect(i * (W / arr.length), H - this.FOOTER_H, W / arr.length + 1, 5);
        });

        const defs = [
            { label: '🖱️  CPS Test',      col: '#cc0033', hcol: 0xcc0033, scene: 'CPSScene' },
            { label: '🔨  Whack-a-Mole',  col: '#007722', hcol: 0x007722, scene: 'WhackAMoleScene' },
            { label: '🧩  Puzzle',          col: '#1133cc', hcol: 0x1133cc, scene: 'PuzzleScene' }
        ];

        const btnW = 230, btnH = 44, gap = 36;
        const totalW = defs.length * btnW + (defs.length - 1) * gap;
        const cy = H - this.FOOTER_H / 2 + 3;

        defs.forEach((def, i) => {
            const cx = (W - totalW) / 2 + i * (btnW + gap) + btnW / 2;
            const bgG = this.add.graphics().setDepth(51);

            const draw = (hover) => {
                bgG.clear();
                bgG.fillStyle(def.hcol, hover ? 0.14 : 0.07);
                bgG.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 10);
                bgG.lineStyle(hover ? 3 : 2, def.hcol, hover ? 1 : 0.45);
                bgG.strokeRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 10);
            };
            draw(false);

            this.add.text(cx, cy, def.label, {
                fontFamily: "'Poppins', sans-serif",
                fontSize: '16px', fontStyle: 'bold', color: def.col
            }).setOrigin(0.5).setDepth(52).setInteractive({ cursor: 'pointer' })
              .on('pointerover', () => draw(true))
              .on('pointerout',  () => draw(false))
              .on('pointerdown', () => this.scene.start(def.scene));
        });
    }

    // ── PROJECT GRID ──────────────────────────────────────────────

    buildProjectGrid(W, H) {
        const COLS   = 3;
        const GAP_X  = 20;
        const GAP_Y  = 16;
        const CARD_H = 195;
        const CARD_W = Math.floor((W - (COLS + 1) * GAP_X) / COLS);
        const rows   = Math.ceil(PROJECTS.length / COLS);
        const gridW  = COLS * CARD_W + (COLS - 1) * GAP_X;
        const startX = (W - gridW) / 2;
        const startY = this.HEADER_H + 14;
        const gridH  = rows * CARD_H + (rows - 1) * GAP_Y;

        this.maxScroll = Math.max(0, startY + gridH - (H - this.FOOTER_H) + 14);

        PROJECTS.forEach((proj, idx) => {
            const col = idx % COLS;
            const row = Math.floor(idx / COLS);
            this.createCard(
                proj,
                startX + col * (CARD_W + GAP_X),
                startY + row * (CARD_H + GAP_Y),
                CARD_W, CARD_H,
                CARD_COLORS[idx % CARD_COLORS.length]
            );
        });
    }

    track(obj) {
        this.scrollItems.push({ obj, baseY: obj.y });
        return obj;
    }

    gfx(absY, depth) {
        const g = this.add.graphics().setDepth(depth);
        g.y = absY;
        this.scrollItems.push({ obj: g, baseY: absY });
        return g;
    }

    createCard(proj, x, y, w, h, nameCol) {
        const status    = getProjectStatus(proj.id);
        const sInfo     = STATUS_TYPES[status];
        const accentHex = Phaser.Display.Color.HexStringToColor(nameCol).color;

        // Shadow
        const shad = this.gfx(y, 2);
        shad.fillStyle(0xaab8e0);
        shad.fillRoundedRect(x + 5, 5, w, h, 12);

        // Card bg
        const bg = this.gfx(y, 3);
        const rebuildBg = (hover) => {
            bg.clear();
            bg.fillStyle(hover ? 0xeef2ff : 0xffffff);
            bg.fillRoundedRect(x, 0, w, h, 12);
            bg.lineStyle(hover ? 3 : 2, hover ? accentHex : 0xdde8ff);
            bg.strokeRoundedRect(x, 0, w, h, 12);
        };
        rebuildBg(false);

        // Top accent bar
        const accent = this.gfx(y, 4);
        accent.fillStyle(accentHex);
        accent.fillRoundedRect(x + 1, 1, w - 2, 7, { tl: 12, tr: 12, bl: 0, br: 0 });

        // Left status stripe
        const stripe = this.gfx(y, 4);
        stripe.fillStyle(sInfo.color);
        stripe.fillRoundedRect(x + 1, 1, 7, h - 2, { tl: 12, tr: 0, bl: 12, br: 0 });

        // Project name (no toUpperCase — breaks emojis)
        this.track(this.add.text(x + 22, y + 18, proj.name, {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '18px', fontStyle: 'bold',
            color: nameCol,
            wordWrap: { width: w - 160 }
        }).setDepth(5));

        // Status badge
        this.track(this.add.text(x + w - 12, y + 20, sInfo.label, {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '13px', fontStyle: 'bold',
            color: sInfo.hex
        }).setOrigin(1, 0).setDepth(5));

        // Divider
        const div = this.gfx(y, 4);
        div.lineStyle(1.5, 0xdde8ff, 0.9);
        div.lineBetween(x + 16, 55, x + w - 16, 55);

        // Description
        this.track(this.add.text(x + 22, y + 66, proj.description, {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '13px', color: '#334488',
            wordWrap: { width: w - 36 }, lineSpacing: 4
        }).setDepth(5));

        // Tech tags
        const tagAbsY = y + h - (this.isAdmin ? 66 : 34);
        let tagX = x + 16;
        proj.tech.forEach((tag, ti) => {
            const pal = TAG_PALETTE[ti % TAG_PALETTE.length];
            const tw  = tag.length * 7.5 + 20;
            if (tagX + tw > x + w - 8) return;

            const tg = this.gfx(tagAbsY, 5);
            tg.fillStyle(pal.bg);
            tg.fillRoundedRect(tagX, 0, tw, 24, 6);

            this.track(this.add.text(tagX + tw / 2, tagAbsY + 12, tag, {
                fontFamily: "'Poppins', sans-serif",
                fontSize: '11px', fontStyle: 'bold', color: pal.tx
            }).setOrigin(0.5).setDepth(6));

            tagX += tw + 7;
        });

        // Hit zone
        const hit = this.track(
            this.add.rectangle(x + w / 2, y + h / 2, w, h)
                .setAlpha(0.001).setDepth(6).setInteractive({ cursor: 'pointer' })
        );
        hit.on('pointerover', () => rebuildBg(true));
        hit.on('pointerout',  () => rebuildBg(false));
        if (proj.url && proj.url !== '#') {
            hit.on('pointerdown', () => window.open(proj.url, '_blank'));
        }

        if (this.isAdmin) this.addStatusButtons(proj, x, y, w, h);
    }

    addStatusButtons(proj, x, y, w, h) {
        const btns = [
            { key: 'GOOD',        label: '✅ Works',  info: STATUS_TYPES.GOOD },
            { key: 'MAINTENANCE', label: '🔧 Fixing', info: STATUS_TYPES.MAINTENANCE },
            { key: 'BROKEN',      label: '💀 Broken', info: STATUS_TYPES.BROKEN }
        ];

        const bh      = 28, gap = 6;
        const bw      = (w - 44 - gap * 2) / 3;
        const btnAbsY = y + h - 38;
        const current = getProjectStatus(proj.id);

        btns.forEach((btn, i) => {
            const bx       = x + 22 + i * (bw + gap);
            const isActive = current === btn.key;

            const bgG = this.gfx(btnAbsY, 7);
            const redraw = (hov) => {
                bgG.clear();
                bgG.fillStyle(isActive ? btn.info.color : (hov ? 0xeef4ff : 0xf5f7ff));
                bgG.fillRoundedRect(bx, 0, bw, bh, 6);
                bgG.lineStyle(isActive || hov ? 2 : 1.5, btn.info.color, isActive || hov ? 1 : 0.4);
                bgG.strokeRoundedRect(bx, 0, bw, bh, 6);
            };
            redraw(false);

            const txt = this.track(
                this.add.text(bx + bw / 2, btnAbsY + bh / 2, btn.label, {
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px', fontStyle: 'bold',
                    color: isActive ? '#ffffff' : btn.info.hex
                }).setOrigin(0.5).setDepth(8).setInteractive({ cursor: 'pointer' })
            );
            txt.on('pointerover', () => redraw(true));
            txt.on('pointerout',  () => redraw(false));
            txt.on('pointerdown', () => { setProjectStatus(proj.id, btn.key); this.scene.restart(); });
        });
    }
}
