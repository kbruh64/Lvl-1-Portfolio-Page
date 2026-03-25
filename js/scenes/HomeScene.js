// ── OVERWORLD HUB ─ Home / Introduction ──────────────────────────

const H_HEAD = "'Space Grotesk', sans-serif";
const H_BODY = "'Work Sans', sans-serif";

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
    }

    create() {
        const W = this.scale.width, H = this.scale.height;

        this.drawBg(W, H);
        this.buildNav(W, H);
        this.buildHero(W, H);
        this.buildAboutMe(W, H);
        this.buildFeaturedProjects(W, H);
        this.buildFooter(W, H);
    }

    // ── BACKGROUND ────────────────────────────────────────────────

    drawBg(W, H) {
        const g = this.add.graphics();
        g.fillStyle(HC.bg); g.fillRect(0, 0, W, H);
        g.fillStyle(HC.outline, 0.28);
        for (let gx = 0; gx <= W; gx += 32)
            for (let gy = 64; gy <= H; gy += 32)
                g.fillRect(gx, gy, 1, 1);
        g.fillStyle(HC.primaryFix, 0.05); g.fillRect(0, 64, W, H * 0.5);
    }

    // ── NAV ───────────────────────────────────────────────────────

    buildNav(W) {
        const g = this.add.graphics().setDepth(50);
        g.fillStyle(HC.containerHi); g.fillRect(0, 0, W, 60);
        g.fillStyle(HC.primary);     g.fillRect(0, 56, W, 4);

        this.add.text(24, 30, 'FELIX.DEV', {
            fontFamily: H_HEAD, fontSize: '22px', fontStyle: 'bold', color: '#1e5800'
        }).setOrigin(0, 0.5).setDepth(51);

        const links = [
            { label: 'Projects',     scene: 'MainScene' },
            { label: 'CPS Test',     scene: 'CPSScene' },
            { label: 'Whack-a-Mole', scene: 'WhackAMoleScene' },
            { label: 'Puzzle',       scene: 'PuzzleScene' },
        ];

        let nx = W - 24;
        [...links].reverse().forEach(item => {
            const txt = this.add.text(nx, 30, item.label, {
                fontFamily: H_HEAD, fontSize: '15px', fontStyle: 'bold',
                color: '#5b5b5c'
            }).setOrigin(1, 0.5).setDepth(51).setInteractive({ cursor: 'pointer' });
            txt.on('pointerover', () => txt.setStyle({ color: '#256900' }));
            txt.on('pointerout',  () => txt.setStyle({ color: '#5b5b5c' }));
            txt.on('pointerdown', () => this.scene.start(item.scene));
            nx -= txt.width + 36;
        });
    }

    // ── HERO ──────────────────────────────────────────────────────

    buildHero(W, H) {
        const cx = 40, cy = 76, cw = Math.min(520, W * 0.48), ch = 220;

        // Shadow
        const shad = this.add.graphics();
        shad.fillStyle(HC.primary, 0.2);
        shad.fillRect(cx + 8, cy + 8, cw, ch);

        // Card
        const card = this.add.graphics();
        card.fillStyle(0xedfbd4); card.fillRect(cx, cy, cw, ch);
        card.fillStyle(HC.primary);
        card.fillRect(cx, cy, cw, 5);
        card.fillRect(cx, cy, 8, ch);
        card.fillRect(cx, cy + ch - 5, cw, 5);

        // Headline
        this.add.text(cx + 20, cy + 16, "Hi, I'm\nFelix.", {
            fontFamily: H_HEAD, fontSize: '56px', fontStyle: 'bold',
            color: '#1e5800', lineSpacing: 4
        });

        // Bio — kept short and non-overlapping
        this.add.text(cx + 20, cy + 138, [
            "I'm 12 years old. I love coding, gaming and running.",
            "I have a little brother named Issac.",
            "I build browser games and AI tools — mostly",
            "in JavaScript, Canvas and Phaser.js."
        ].join('\n'), {
            fontFamily: H_BODY, fontSize: '14px', color: '#2e2f2f', lineSpacing: 5
        });

        // Buttons — pinned to bottom of card
        const btnY = cy + ch - 48;
        this.carvedBtn(cx + 20,  btnY, 190, 38, 'VIEW ALL PROJECTS', HC.primary,   '#d5ffbb', () => this.scene.start('MainScene'));
        this.carvedBtn(cx + 224, btnY, 148, 38, 'PLAY GAMES',        HC.secondary, '#ffefec', () => this.scene.start('CPSScene'));
    }

    // ── ABOUT ME ──────────────────────────────────────────────────

    buildAboutMe(W, H) {
        const heroRight = 40 + Math.min(520, W * 0.48) + 28;
        const ax = heroRight, ay = 76, aw = W - heroRight - 40, ah = 220;

        // Shadow
        const shad = this.add.graphics();
        shad.fillStyle(HC.secondary, 0.18);
        shad.fillRect(ax + 8, ay + 8, aw, ah);

        // Card
        const card = this.add.graphics();
        card.fillStyle(0xfff0e5); card.fillRect(ax, ay, aw, ah);
        card.fillStyle(HC.secondary);
        card.fillRect(ax, ay, aw, 5);
        card.fillRect(ax, ay, 8, ah);

        // Title
        this.add.text(ax + 18, ay + 14, 'ABOUT ME', {
            fontFamily: H_HEAD, fontSize: '11px', fontStyle: 'bold',
            color: '#8f4816', letterSpacing: 3
        });

        // Fun fact tiles — interactive hover
        const facts = [
            { icon: '🎂', label: 'AGE',      value: '12 years old',    col: HC.primary,   hex: '#256900', bg: 0xedfbd4 },
            { icon: '🎮', label: 'HOBBIES',  value: 'Coding · Gaming · Running', col: HC.tertiary,  hex: '#006668', bg: 0xddfefe },
            { icon: '👦', label: 'FAMILY',   value: 'Little bro Issac', col: HC.secondary, hex: '#8f4816', bg: 0xfff0e5 },
            { icon: '🛠️', label: 'STACK',    value: 'JS · Canvas · Phaser', col: 0x555555, hex: '#444444', bg: 0xeeedec },
        ];

        const tileW = Math.floor((aw - 18 - (facts.length - 1) * 8) / facts.length);
        const tileH = 120;
        const tileY = ay + 40;

        facts.forEach((f, i) => {
            const tx = ax + 18 + i * (tileW + 8);
            const tg = this.add.graphics();

            const draw = (hov) => {
                tg.clear();
                tg.fillStyle(hov ? f.col : f.bg); tg.fillRect(tx, tileY, tileW, tileH);
                tg.fillStyle(f.col); tg.fillRect(tx, tileY + tileH - 4, tileW, 4);
                tg.fillStyle(0x000000, hov ? 0.3 : 0.1);
                tg.fillRect(tx + 4, tileY + 4, tileW, tileH);
                tg.fillStyle(hov ? f.bg : f.bg); tg.fillRect(tx, tileY, tileW, tileH);
                tg.fillStyle(f.col); tg.fillRect(tx, tileY + tileH - 4, tileW, 4);
            };
            draw(false);

            const iconTxt = this.add.text(tx + tileW / 2, tileY + 24, f.icon, {
                fontFamily: H_HEAD, fontSize: '24px'
            }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

            this.add.text(tx + tileW / 2, tileY + 54, f.label, {
                fontFamily: H_HEAD, fontSize: '9px', fontStyle: 'bold',
                color: f.hex, letterSpacing: 2
            }).setOrigin(0.5);

            this.add.text(tx + tileW / 2, tileY + 72, f.value, {
                fontFamily: H_BODY, fontSize: '11px', color: '#2e2f2f',
                wordWrap: { width: tileW - 8 }, align: 'center'
            }).setOrigin(0.5);

            iconTxt.on('pointerover', () => { draw(true); });
            iconTxt.on('pointerout',  () => { draw(false); });
        });

        // Quote strip
        const qy = ay + ah - 48;
        const qg = this.add.graphics();
        qg.fillStyle(HC.secondary, 0.12); qg.fillRect(ax + 18, qy, aw - 18, 36);
        qg.fillStyle(HC.secondary); qg.fillRect(ax + 18, qy, 8, 36);
        this.add.text(ax + 36, qy + 10, '"Build it. Break it. Build it better."', {
            fontFamily: H_BODY, fontSize: '12px', fontStyle: 'italic',
            color: '#8f4816', wordWrap: { width: aw - 50 }
        });
    }

    // ── FEATURED PROJECTS ─────────────────────────────────────────

    buildFeaturedProjects(W, H) {
        const featured = PROJECTS.filter(p => p.featured);
        const secY = 316;

        // Section header
        this.add.text(40, secY, 'FEATURED PROJECTS', {
            fontFamily: H_HEAD, fontSize: '12px', fontStyle: 'bold',
            color: '#256900', letterSpacing: 3
        });

        const hr = this.add.graphics();
        hr.fillStyle(HC.outline, 0.2);
        hr.fillRect(40, secY + 22, W - 80, 2);

        const cardW = Math.floor((W - 80 - 24) / 3);
        const cardH = H - secY - 66;
        const cardY = secY + 32;

        featured.forEach((proj, i) => {
            const cx = 40 + i * (cardW + 12);
            const biomes = [
                { cardBg: 0xedfbd4, border: HC.primary,   nameCol: '#1e5800', textCol: '#2e4a1e' },
                { cardBg: 0xddfefe, border: HC.tertiary,  nameCol: '#005d5f', textCol: '#1a3a3b' },
                { cardBg: 0xfff0e5, border: HC.secondary, nameCol: '#8f4816', textCol: '#3a2010' },
            ];
            const bm = biomes[i];

            // Shadow
            const shad = this.add.graphics();
            shad.fillStyle(bm.border, 0.18); shad.fillRect(cx + 6, cardY + 6, cardW, cardH);

            // Card
            const bg = this.add.graphics();
            bg.fillStyle(bm.cardBg); bg.fillRect(cx, cardY, cardW, cardH);
            bg.fillStyle(bm.border);
            bg.fillRect(cx, cardY, cardW, 5);
            bg.fillRect(cx, cardY, 8, cardH);

            // Name
            this.add.text(cx + 18, cardY + 14, proj.name, {
                fontFamily: H_HEAD, fontSize: '15px', fontStyle: 'bold',
                color: bm.nameCol
            });

            // Description (short)
            this.add.text(cx + 18, cardY + 44, proj.description, {
                fontFamily: H_BODY, fontSize: '12px', color: bm.textCol,
                wordWrap: { width: cardW - 30 }, lineSpacing: 3
            });

            // First para of story
            const firstPara = proj.story.split('\n\n')[0];
            this.add.text(cx + 18, cardY + 90, firstPara, {
                fontFamily: H_BODY, fontSize: '11px', color: '#5b5b5c',
                wordWrap: { width: cardW - 30 }, lineSpacing: 3
            });

            // Tech tags
            const tagY = cardY + cardH - 38;
            let tagX = cx + 18;
            proj.tech.forEach(tag => {
                const tw = tag.length * 7 + 14;
                const tg = this.add.graphics();
                tg.fillStyle(bm.border, 0.15); tg.fillRect(tagX, tagY, tw, 20);
                tg.fillStyle(bm.border); tg.fillRect(tagX, tagY + 17, tw, 3);
                this.add.text(tagX + 7, tagY + 10, tag, {
                    fontFamily: H_HEAD, fontSize: '9px', fontStyle: 'bold',
                    color: bm.nameCol
                }).setOrigin(0, 0.5);
                tagX += tw + 6;
            });

            // Visit link
            if (proj.url && proj.url !== '#') {
                const link = this.add.text(cx + cardW - 14, cardY + cardH - 14, 'VISIT →', {
                    fontFamily: H_HEAD, fontSize: '11px', fontStyle: 'bold',
                    color: bm.nameCol
                }).setOrigin(1, 1).setInteractive({ cursor: 'pointer' });
                link.on('pointerover', () => link.setStyle({ color: '#ffffff', backgroundColor: bm.nameCol }));
                link.on('pointerout',  () => link.setStyle({ color: bm.nameCol }));
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

    // ── HELPER: carved button ─────────────────────────────────────

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
