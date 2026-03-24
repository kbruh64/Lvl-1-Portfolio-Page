// ── OVERWORLD HUB ─ Home / Introduction ──────────────────────────

const H_HEAD = "'Space Grotesk', sans-serif";
const H_BODY = "'Work Sans', sans-serif";

// Stitch surface colours
const HC = {
    bg:          0xf8f6f6,
    container:   0xe9e8e8,
    containerHi: 0xe3e2e2,
    lowest:      0xffffff,
    outline:     0xadadad,
    primary:     0x256900,
    primaryFix:  0x95f169,
    secondary:   0x8f4816,
    tertiary:    0x006668,
    error:       0xb02500,
    onSurface:   0x2e2f2f,
    onVariant:   0x5b5b5c,
    inverseSurf: 0x1e5800,
};

class HomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HomeScene' });
        this.currentStory = 0;
    }

    create() {
        const W = this.scale.width, H = this.scale.height;
        this.currentStory = 0;

        this.drawBg(W, H);
        this.buildNav(W, H);
        this.buildBio(W, H);
        this.buildFeaturedProjects(W, H);
        this.buildFooter(W, H);
    }

    // ── BACKGROUND ────────────────────────────────────────────────

    drawBg(W, H) {
        const g = this.add.graphics();

        // Overworld surface
        g.fillStyle(HC.bg); g.fillRect(0, 0, W, H);

        // Voxel grid — Stitch 32px radial dots
        g.fillStyle(HC.outline, 0.35);
        for (let gx = 0; gx <= W; gx += 32)
            for (let gy = 60; gy <= H; gy += 32)
                g.fillRect(gx, gy, 1, 1);

        // Very light green wash over top half (primary-container/8)
        g.fillStyle(HC.primaryFix, 0.06); g.fillRect(0, 60, W, H * 0.55);
    }

    // ── NAV ───────────────────────────────────────────────────────

    buildNav(W, H) {
        const g = this.add.graphics().setDepth(50);
        g.fillStyle(HC.containerHi); g.fillRect(0, 0, W, 60);
        g.fillStyle(HC.primary);     g.fillRect(0, 56, W, 4);

        // Logo
        this.add.text(24, 30, 'FELIX.DEV', {
            fontFamily: H_HEAD, fontSize: '22px', fontStyle: 'bold', color: '#1e5800'
        }).setOrigin(0, 0.5).setDepth(51);

        // Nav links
        const links = [
            { label: 'Projects',    scene: 'MainScene' },
            { label: 'CPS Test',    scene: 'CPSScene' },
            { label: 'Whack-a-Mole', scene: 'WhackAMoleScene' },
            { label: 'Puzzle',      scene: 'PuzzleScene' },
        ];

        let nx = W - 24;
        [...links].reverse().forEach(item => {
            const txt = this.add.text(nx, 30, item.label, {
                fontFamily: H_HEAD, fontSize: '15px', fontStyle: 'bold',
                color: '#5b5b5c', letterSpacing: 1
            }).setOrigin(1, 0.5).setDepth(51).setInteractive({ cursor: 'pointer' });
            txt.on('pointerover', () => txt.setStyle({ color: '#256900', stroke: '#95f169', strokeThickness: 1 }));
            txt.on('pointerout',  () => txt.setStyle({ color: '#5b5b5c', stroke: undefined, strokeThickness: 0 }));
            txt.on('pointerdown', () => this.scene.start(item.scene));
            nx -= txt.width + 40;
        });
    }

    // ── BIO SECTION ───────────────────────────────────────────────

    buildBio(W, H) {
        const cardX = 48, cardY = 80, cardW = 560, cardH = 300;

        // Hard shadow (Stitch: 12px 12px 0px primary-tint)
        const shad = this.add.graphics();
        shad.fillStyle(HC.primary, 0.25);
        shad.fillRect(cardX + 12, cardY + 12, cardW, cardH);

        // Card — bg-surface border-4 border-primary
        const card = this.add.graphics();
        card.fillStyle(HC.lowest); card.fillRect(cardX, cardY, cardW, cardH);
        card.fillStyle(HC.primary);
        card.fillRect(cardX,           cardY,           cardW, 4);
        card.fillRect(cardX,           cardY + cardH - 4, cardW, 4);
        card.fillRect(cardX,           cardY,           4,     cardH);
        card.fillRect(cardX + cardW - 4, cardY,         4,     cardH);

        // Big headline (Stitch: text-6xl font-headline font-bold)
        this.add.text(cardX + 24, cardY + 20, "Hi, I'm\nFelix.", {
            fontFamily: H_HEAD, fontSize: '64px', fontStyle: 'bold',
            color: '#2e2f2f', lineSpacing: -10
        });

        // Bio body — Work Sans, generous leading
        const bioLines = [
            "I'm 12 years old and I love coding, gaming,",
            "and running. I have a little brother named Issac.",
            "",
            "I build browser games and AI tools — mostly",
            "in JavaScript, Canvas and Phaser.js."
        ];
        this.add.text(cardX + 24, cardY + 186, bioLines.join('\n'), {
            fontFamily: H_BODY, fontSize: '16px', color: '#5b5b5c', lineSpacing: 6
        });

        // CTA — carved-button bg-primary
        this.carvedBtn(cardX + 24, cardY + cardH - 52, 200, 40, 'VIEW ALL PROJECTS', HC.primary, '#d5ffbb',
            () => this.scene.start('MainScene'));
        this.carvedBtn(cardX + 236, cardY + cardH - 52, 160, 40, 'PLAY GAMES', HC.container, '#5b5b5c',
            () => this.scene.start('CPSScene'));

        // ── Stats panel (right of bio) ────────────────────────────
        const sX = cardX + cardW + 40, sY = cardY, sW = W - sX - 48;

        this.add.text(sX, sY + 4, 'CHARACTER STATS', {
            fontFamily: H_HEAD, fontSize: '13px', fontStyle: 'bold',
            color: '#256900', letterSpacing: 3
        });

        const stats = [
            { label: 'Game Dev',    val: 90, col: HC.primary },
            { label: 'JavaScript',  val: 85, col: HC.tertiary },
            { label: 'AI & APIs',   val: 75, col: HC.secondary },
            { label: 'UI Design',   val: 68, col: HC.error },
            { label: 'Creativity',  val: 99, col: HC.primary },
        ];

        stats.forEach((s, i) => {
            const sy = sY + 38 + i * 52;

            this.add.text(sX, sy, s.label.toUpperCase(), {
                fontFamily: H_HEAD, fontSize: '11px', fontStyle: 'bold',
                color: '#' + s.col.toString(16).padStart(6, '0'), letterSpacing: 1
            });
            this.add.text(sX + sW, sy, s.val + '/100', {
                fontFamily: H_HEAD, fontSize: '11px', fontStyle: 'bold',
                color: '#' + s.col.toString(16).padStart(6, '0')
            }).setOrigin(1, 0);

            // Bar track (Stitch: h-6 bg-stone-200 border-2)
            const bg = this.add.graphics();
            bg.fillStyle(HC.container); bg.fillRect(sX, sy + 18, sW, 16);
            bg.fillStyle(HC.outline, 0.4);
            bg.fillRect(sX, sy + 18, sW, 2);
            bg.fillRect(sX, sy + 32, sW, 2);

            // Animated fill
            const fill = this.add.graphics();
            let cur = 0;
            this.time.addEvent({
                delay: 8 + i * 50, repeat: s.val,
                callback: () => {
                    cur++;
                    fill.clear();
                    fill.fillStyle(s.col);
                    fill.fillRect(sX, sy + 18, Math.round(sW * cur / 100), 16);
                }
            });
        });

        // Quote block (Stitch: border-l-[16px] border-primary)
        const qy = sY + cardH - 50;
        const qg = this.add.graphics();
        qg.fillStyle(HC.primary);   qg.fillRect(sX, qy, 10, 42);
        qg.fillStyle(HC.container); qg.fillRect(sX + 10, qy, sW - 10, 42);
        this.add.text(sX + 22, qy + 8, '"Build it. Break it. Build it better."', {
            fontFamily: H_BODY, fontSize: '13px', fontStyle: 'italic',
            color: '#5b5b5c', wordWrap: { width: sW - 28 }
        });
    }

    // ── FEATURED PROJECT STORIES ──────────────────────────────────

    buildFeaturedProjects(W, H) {
        const featured = PROJECTS.filter(p => p.featured);
        const secY = 405;

        // Section header (Stitch: asymmetric layout)
        this.add.text(48, secY, 'FEATURED PROJECTS', {
            fontFamily: H_HEAD, fontSize: '13px', fontStyle: 'bold',
            color: '#256900', letterSpacing: 3
        });

        // Horizontal rule — outline-variant at 15% (Ghost Border)
        const hr = this.add.graphics();
        hr.fillStyle(HC.outline, 0.15);
        hr.fillRect(48, secY + 24, W - 96, 2);

        // Story cards — 3 across
        const cardW = Math.floor((W - 96 - 32) / 3);
        const cardH = 240;
        const cardY = secY + 36;

        featured.forEach((proj, i) => {
            const cx = 48 + i * (cardW + 16);
            const biome = [
                { cardBg: 0xedfbd4, border: HC.primary,   nameCol: '#1e5800' },
                { cardBg: 0xddfefe, border: HC.tertiary,  nameCol: '#005d5f' },
                { cardBg: 0xfff0e5, border: HC.secondary, nameCol: '#8f4816' },
            ][i];

            // Shadow
            const shad = this.add.graphics();
            shad.fillStyle(biome.border, 0.2); shad.fillRect(cx + 5, cardY + 5, cardW, cardH);

            // Card
            const bg = this.add.graphics();
            bg.fillStyle(biome.cardBg); bg.fillRect(cx, cardY, cardW, cardH);
            bg.fillStyle(biome.border);
            bg.fillRect(cx, cardY, cardW, 4);
            bg.fillRect(cx, cardY, 8, cardH);

            // Name
            this.add.text(cx + 18, cardY + 12, proj.name, {
                fontFamily: H_HEAD, fontSize: '16px', fontStyle: 'bold',
                color: biome.nameCol
            });

            // Story text — first 2 sentences of first paragraph
            const firstPara = proj.story.split('\n\n')[0];
            this.add.text(cx + 18, cardY + 44, firstPara, {
                fontFamily: H_BODY, fontSize: '12px', color: '#5b5b5c',
                wordWrap: { width: cardW - 30 }, lineSpacing: 4
            });

            // "Proud of" snippet — second paragraph, first sentence
            const secondPara = proj.story.split('\n\n')[1] || '';
            const proudLine  = secondPara.split('.')[0] + '.';
            this.add.text(cx + 18, cardY + cardH - 46, proudLine, {
                fontFamily: H_BODY, fontSize: '11px', fontStyle: 'italic',
                color: biome.nameCol, wordWrap: { width: cardW - 30 }
            });

            // Visit link
            if (proj.url && proj.url !== '#') {
                const link = this.add.text(cx + cardW - 14, cardY + cardH - 18, 'VISIT →', {
                    fontFamily: H_HEAD, fontSize: '11px', fontStyle: 'bold',
                    color: biome.nameCol
                }).setOrigin(1, 1).setInteractive({ cursor: 'pointer' });
                link.on('pointerdown', () => window.open(proj.url, '_blank'));
            }
        });
    }

    // ── FOOTER ────────────────────────────────────────────────────

    buildFooter(W, H) {
        const fg = this.add.graphics();
        fg.fillStyle(HC.inverseSurf); fg.fillRect(0, H - 40, W, 40);
        fg.fillStyle(HC.primaryFix);  fg.fillRect(0, H - 40, W, 4);
        this.add.text(W / 2, H - 20, '© Felix · Age 12 · Built block by block', {
            fontFamily: H_BODY, fontSize: '12px', color: '#95f169'
        }).setOrigin(0.5);
    }

    // ── HELPER: carved-button (Stitch) ────────────────────────────

    carvedBtn(x, y, w, h, label, bgCol, txCol, cb) {
        const g = this.add.graphics();
        const draw = (hov) => {
            g.clear();
            g.fillStyle(bgCol, hov ? 1 : 0.88); g.fillRect(x, y, w, h);
            g.fillStyle(0x000000, hov ? 0.35 : 0.2);
            g.fillRect(x, y + h - 4, w, 4); g.fillRect(x + w - 4, y, 4, h);
            g.fillStyle(0xffffff, 0.18);
            g.fillRect(x, y, w, 4); g.fillRect(x, y, 4, h);
        };
        draw(false);

        this.add.text(x + w / 2, y + h / 2, label, {
            fontFamily: H_HEAD, fontSize: '12px', fontStyle: 'bold', color: txCol
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' })
          .on('pointerover', () => draw(true))
          .on('pointerout',  () => draw(false))
          .on('pointerdown', cb);
    }
}
