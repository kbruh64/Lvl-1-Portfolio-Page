// ── Stitch "Editorial Voxelism" Biomatic Palette ───────────────
// Each card is a different biome — coloured bg, NOT white
const BIOMES = [
    { cardBg: 0xedfbd4, border: 0x256900, shadow: 0x1a4a00, nameCol: '#1e5800', tagBg: 0x95f169, tagTx: '#154300' }, // Lush Forest
    { cardBg: 0xfff0e5, border: 0x8f4816, shadow: 0x5a2e0e, nameCol: '#8f4816', tagBg: 0xffc5a5, tagTx: '#582500' }, // Desert/Earth
    { cardBg: 0xddfefe, border: 0x006668, shadow: 0x003d3e, nameCol: '#005d5f', tagBg: 0x5dfbfe, tagTx: '#004446' }, // Diamond/Ocean
    { cardBg: 0xffe8e0, border: 0xb02500, shadow: 0x7a1a00, nameCol: '#b02500', tagBg: 0xf95630, tagTx: '#520c00' }, // Nether/Error
    { cardBg: 0xeeedec, border: 0x555555, shadow: 0x333333, nameCol: '#3b3b3c', tagBg: 0xdddddd, tagTx: '#2e2f2f' }, // Stone/Cave
];

const FONT_HEAD = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Work Sans', sans-serif";

// Stitch surface hierarchy
const COL = {
    background:              0xf8f6f6,
    surface:                 0xf8f6f6,
    surfaceContainerLowest:  0xffffff,
    surfaceContainerLow:     0xf2f0f0,
    surfaceContainer:        0xe9e8e8,
    surfaceContainerHigh:    0xe3e2e2,
    surfaceContainerHighest: 0xdddddd,
    onSurface:               0x2e2f2f,
    onSurfaceVariant:        0x5b5b5c,
    outline:                 0x777777,
    outlineVariant:          0xadadad,
    primary:                 0x256900,
    primaryFixed:            0x95f169,
    primaryDim:              0x1f5c00,
    secondary:               0x8f4816,
    secondaryContainer:      0xffc5a5,
    tertiary:                0x006668,
    tertiaryFixed:           0x5dfbfe,
    error:                   0xb02500,
    inverseSurface:          0x292524,  // stone-800
    inverseOnSurface:        0xfafaf9,
};

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.HEADER_H       = 80;
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

        // Voxel grid background (from Stitch: radial-gradient dots at 32px)
        const bgG = this.add.graphics();
        bgG.fillStyle(COL.background);
        bgG.fillRect(0, 0, W, H);
        bgG.fillStyle(COL.outlineVariant, 0.5);
        for (let gx = 0; gx <= W; gx += 32)
            for (let gy = 0; gy <= H; gy += 32)
                bgG.fillCircle(gx, gy, 1);

        slideIn(this);

        this.buildProjectGrid(W, H);
        this.buildHeader(W);
        this.buildFooter(W, H);

        // Input blockers — prevent clicks on cards scrolled behind header/footer
        this.add.rectangle(W / 2, this.HEADER_H / 2, W, this.HEADER_H)
            .setAlpha(0.001).setDepth(49).setInteractive();
        this.add.rectangle(W / 2, H - this.FOOTER_H / 2, W, this.FOOTER_H)
            .setAlpha(0.001).setDepth(49).setInteractive();

        this.input.on('wheel', (_p, _g, _dx, dy) => {
            this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.6, 0, this.maxScroll);
            this.scrollItems.forEach(({ obj, baseY }) => { obj.y = baseY - this.scrollY; });
        });

        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK)
            .on('down', () => fadeTo(this, 'AdminScene'));
    }

    // ── HEADER ────────────────────────────────────────────────────
    // Stitch: bg-stone-200 border-b-4 border-stone-400 / text-lime-900 uppercase Space Grotesk

    buildHeader(W) {
        const g = this.add.graphics().setDepth(50);
        // Surface-container bg
        g.fillStyle(COL.surfaceContainerHigh);
        g.fillRect(0, 0, W, this.HEADER_H);
        // 4px primary bottom border (Stitch: border-b-4 border-primary)
        g.fillStyle(COL.primary);
        g.fillRect(0, this.HEADER_H - 4, W, 4);

        this.add.text(W / 2, this.HEADER_H / 2 - 2, "FELIX'S PORTFOLIO", {
            fontFamily: FONT_HEAD,
            fontSize: '32px', fontStyle: 'bold',
            color: '#1a3300',           // lime-900 ≈ primary-dim dark
            letterSpacing: 3
        }).setOrigin(0.5).setDepth(51).setInteractive({ cursor: 'pointer' })
          .on('pointerdown', () => {
              const now = this.time.now;
              if (now - this.lastTitleClick > 2500) this.titleClicks = 0;
              this.lastTitleClick = now;
              if (++this.titleClicks >= 5) { this.titleClicks = 0; fadeTo(this, 'AdminScene'); }
          });

        if (this.isAdmin) {
            // Stitch: carved-button bg-primary text-on-primary
            const bx = W - 120, by = 18, bw = 104, bh = 36;
            const abg = this.add.graphics().setDepth(51);
            abg.fillStyle(COL.primary);
            abg.fillRect(bx, by, bw, bh);
            // carved effect: darker bottom/right, lighter top/left
            abg.fillStyle(0x000000, 0.3);
            abg.fillRect(bx, by + bh - 4, bw, 4);    // bottom
            abg.fillRect(bx + bw - 4, by, 4, bh);    // right
            abg.fillStyle(0xffffff, 0.2);
            abg.fillRect(bx, by, bw, 4);              // top
            abg.fillRect(bx, by, 4, bh);              // left

            this.add.text(bx + bw / 2, by + bh / 2, '⚙ ADMIN', {
                fontFamily: FONT_HEAD, fontSize: '13px', fontStyle: 'bold',
                color: '#d5ffbb'
            }).setOrigin(0.5).setDepth(52).setInteractive({ cursor: 'pointer' })
              .on('pointerdown', () => fadeTo(this, 'AdminScene'));
        }

        if (this.maxScroll > 0) {
            this.add.text(14, this.HEADER_H - 6, '▼ SCROLL FOR MORE', {
                fontFamily: FONT_HEAD, fontSize: '10px',
                color: '#' + COL.outlineVariant.toString(16)
            }).setOrigin(0, 1).setDepth(51);
        }
    }

    // ── FOOTER ────────────────────────────────────────────────────
    // Stitch: inverse surface (dark stone) with carved-button CTA buttons

    buildFooter(W, H) {
        const g = this.add.graphics().setDepth(50);
        // Inverse surface — dark stone bar
        g.fillStyle(COL.inverseSurface);
        g.fillRect(0, H - this.FOOTER_H, W, this.FOOTER_H);
        // 4px tertiary top accent (like enchantment table glow)
        g.fillStyle(COL.primary);
        g.fillRect(0, H - this.FOOTER_H, W, 4);

        const defs = [
            { label: '🖱️  CPS TEST',      bg: COL.primary,   tx: '#d5ffbb',  scene: 'CPSScene' },
            { label: '🔨  WHACK-A-MOLE',  bg: COL.tertiary,  tx: '#befeff',  scene: 'WhackAMoleScene' },
            { label: '🧩  PUZZLE',          bg: COL.secondary, tx: '#fff0e9', scene: 'PuzzleScene' }
        ];

        const btnW = 220, btnH = 42, gap = 30;
        const totalW = defs.length * btnW + (defs.length - 1) * gap;
        const cy = H - this.FOOTER_H / 2 + 2;

        defs.forEach((def, i) => {
            const bx = (W - totalW) / 2 + i * (btnW + gap);
            const by = cy - btnH / 2;
            const bgG = this.add.graphics().setDepth(51);

            const drawBtn = (hover) => {
                bgG.clear();
                bgG.fillStyle(def.bg, hover ? 1 : 0.85);
                bgG.fillRect(bx, by, btnW, btnH);
                // Stitch carved-button: dark bottom/right, light top/left
                bgG.fillStyle(0x000000, hover ? 0.4 : 0.25);
                bgG.fillRect(bx, by + btnH - 4, btnW, 4);
                bgG.fillRect(bx + btnW - 4, by, 4, btnH);
                bgG.fillStyle(0xffffff, 0.2);
                bgG.fillRect(bx, by, btnW, 4);
                bgG.fillRect(bx, by, 4, btnH);
            };
            drawBtn(false);

            this.add.text(bx + btnW / 2, cy, def.label, {
                fontFamily: FONT_HEAD, fontSize: '14px', fontStyle: 'bold',
                color: def.tx
            }).setOrigin(0.5).setDepth(52).setInteractive({ cursor: 'pointer' })
              .on('pointerover', () => drawBtn(true))
              .on('pointerout',  () => drawBtn(false))
              .on('pointerdown', () => fadeTo(this, def.scene));
        });
    }

    // ── PROJECT GRID ──────────────────────────────────────────────

    buildProjectGrid(W, H) {
        const COLS   = 3;
        const GAP_X  = 18;
        const GAP_Y  = 14;
        const CARD_H = 190;
        const CARD_W = Math.floor((W - (COLS + 1) * GAP_X) / COLS);
        const rows   = Math.ceil(PROJECTS.length / COLS);
        const gridW  = COLS * CARD_W + (COLS - 1) * GAP_X;
        const startX = (W - gridW) / 2;
        const startY = this.HEADER_H + 12;
        const gridH  = rows * CARD_H + (rows - 1) * GAP_Y;

        this.maxScroll = Math.max(0, startY + gridH - (H - this.FOOTER_H) + 12);

        PROJECTS.forEach((proj, idx) => {
            const col   = idx % COLS;
            const row   = Math.floor(idx / COLS);
            const biome = BIOME_MAP[proj.biome] || BIOME_MAP.stone;
            this.createCard(
                proj,
                startX + col * (CARD_W + GAP_X),
                startY + row * (CARD_H + GAP_Y),
                CARD_W, CARD_H, biome
            );
        });
    }

    track(obj) {
        this.scrollItems.push({ obj, baseY: obj.y });
        return obj;
    }

    // All graphics use obj.y = absY as transform; draw at local (x, 0)
    gfx(absY, depth) {
        const g = this.add.graphics().setDepth(depth);
        g.y = absY;
        this.scrollItems.push({ obj: g, baseY: absY });
        return g;
    }

    createCard(proj, x, y, w, h, biome) {
        const status = getProjectStatus(proj.id);
        const sInfo  = STATUS_TYPES[status];

        // Hard offset shadow (Stitch: 4px 4px 0px, no blur)
        const shad = this.gfx(y, 2);
        shad.fillStyle(biome.shadow, 0.35);
        shad.fillRect(x + 4, 4, w, h);

        // Card bg — biome coloured, not white
        const bg = this.gfx(y, 3);
        const drawBg = (hover) => {
            bg.clear();
            bg.fillStyle(hover ? biome.cardBg - 0x0a0a00 : biome.cardBg);
            bg.fillRect(x, 0, w, h);
            // 4px biome border (Stitch: border-4 border-primary, no rounding)
            bg.lineStyle(4, biome.border);
            bg.strokeRect(x + 2, 2, w - 4, h - 4); // inset slightly so border is inside
        };
        drawBg(false);

        // Left 16px biome accent bar (Stitch: border-l-[16px] border-primary)
        const bar = this.gfx(y, 4);
        bar.fillStyle(biome.border);
        bar.fillRect(x, 0, 10, h);

        // Status chip (top-right) — Stitch: "inventory slot" chip
        const sChipW = 110, sChipH = 26;
        const chipX  = x + w - sChipW - 10;
        const chipBg = this.gfx(y, 4);
        chipBg.fillStyle(sInfo.bg);
        chipBg.fillRect(chipX, 10, sChipW, sChipH);
        chipBg.fillStyle(0x000000, 0.15);
        chipBg.fillRect(chipX, 10 + sChipH - 2, sChipW, 2);
        chipBg.fillRect(chipX + sChipW - 2, 10, 2, sChipH);

        this.track(this.add.text(chipX + sChipW / 2, y + 10 + sChipH / 2, sInfo.label, {
            fontFamily: FONT_HEAD, fontSize: '11px', fontStyle: 'bold',
            color: sInfo.hex
        }).setOrigin(0.5).setDepth(5));

        // Project name — Space Grotesk bold, uppercase
        this.track(this.add.text(x + 20, y + 16, proj.name, {
            fontFamily: FONT_HEAD, fontSize: '17px', fontStyle: 'bold',
            color: biome.nameCol,
            wordWrap: { width: w - sChipW - 40 }
        }).setDepth(5));

        // Description — Work Sans body text
        this.track(this.add.text(x + 20, y + 58, proj.description, {
            fontFamily: FONT_BODY, fontSize: '13px',
            color: '#5b5b5c',           // on-surface-variant
            wordWrap: { width: w - 32 }, lineSpacing: 3
        }).setDepth(5));

        // Tech tags — square chips (Stitch: px-3 py-1 bg-secondary text-on-secondary, 0px radius)
        const tagAbsY = y + h - (this.isAdmin ? 66 : 34);
        let tagX = x + 20;
        proj.tech.forEach(tag => {
            const tw = tag.length * 7.8 + 18;
            if (tagX + tw > x + w - 8) return;

            const tg = this.gfx(tagAbsY, 5);
            tg.fillStyle(biome.tagBg);
            tg.fillRect(tagX, 0, tw, 22);   // 0px radius — square
            // carved inset shadow on tag
            tg.fillStyle(0x000000, 0.15);
            tg.fillRect(tagX, 20, tw, 2);
            tg.fillRect(tagX + tw - 2, 0, 2, 22);

            this.track(this.add.text(tagX + tw / 2, tagAbsY + 11, tag, {
                fontFamily: FONT_HEAD, fontSize: '10px', fontStyle: 'bold',
                color: biome.tagTx
            }).setOrigin(0.5).setDepth(6));

            tagX += tw + 6;
        });

        // Hit zone
        const hit = this.track(
            this.add.rectangle(x + w / 2, y + h / 2, w, h)
                .setAlpha(0.001).setDepth(6).setInteractive({ cursor: 'pointer' })
        );
        hit.on('pointerover', () => drawBg(true));
        hit.on('pointerout',  () => drawBg(false));
        hit.on('pointerdown', () => fadeTo(this, 'ProjectScene', { id: proj.id }));

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
        const btnAbsY = y + h - 36;
        const current = getProjectStatus(proj.id);

        btns.forEach((btn, i) => {
            const bx       = x + 22 + i * (bw + gap);
            const isActive = current === btn.key;

            const bgG = this.gfx(btnAbsY, 7);
            const redraw = (hov) => {
                bgG.clear();
                bgG.fillStyle(isActive ? btn.info.color : (hov ? COL.surfaceContainerHigh : COL.surfaceContainerHighest));
                bgG.fillRect(bx, 0, bw, bh);
                // carved border
                bgG.fillStyle(0x000000, isActive ? 0.35 : 0.15);
                bgG.fillRect(bx, bh - 3, bw, 3);
                bgG.fillRect(bx + bw - 3, 0, 3, bh);
                bgG.fillStyle(0xffffff, 0.25);
                bgG.fillRect(bx, 0, bw, 3);
                bgG.fillRect(bx, 0, 3, bh);
            };
            redraw(false);

            const txt = this.track(
                this.add.text(bx + bw / 2, btnAbsY + bh / 2, btn.label, {
                    fontFamily: FONT_HEAD, fontSize: '11px', fontStyle: 'bold',
                    color: isActive ? '#ffffff' : btn.info.hex
                }).setOrigin(0.5).setDepth(8).setInteractive({ cursor: 'pointer' })
            );
            txt.on('pointerover', () => redraw(true));
            txt.on('pointerout',  () => redraw(false));
            txt.on('pointerdown', () => { setProjectStatus(proj.id, btn.key); this.scene.restart(); });
        });
    }
}
