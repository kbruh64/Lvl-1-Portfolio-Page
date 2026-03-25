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

    preload() {
        this.load.image('mc-bg', 'assets/mc-bg.jpg');
    }

    create() {
        const W = this.scale.width, H = this.scale.height;

        slideIn(this);

        // Fallback bg
        this.add.graphics().fillStyle(HC.bg).fillRect(0, 0, W, H);

        // Wallpaper — always add, Phaser will use __MISSING if load failed
        try {
            const img = this.add.image(W / 2, H / 2, 'mc-bg');
            const scale = Math.max(W / img.width, H / img.height);
            img.setScale(scale).setAlpha(0.42);
        } catch(e) {}

        // Voxel dot overlay
        const dots = this.add.graphics();
        dots.fillStyle(0x000000, 0.05);
        for (let gx = 0; gx <= W; gx += 32)
            for (let gy = 64; gy <= H; gy += 32)
                dots.fillRect(gx, gy, 2, 2);

        this.buildNav(W, H);
        this.buildHero(W, H);
        this.buildAboutMe(W, H);
        this.buildFeaturedProjects(W, H);
        this.buildFooter(W, H);
    }

    // ── NAV ───────────────────────────────────────────────────────

    buildNav(W) {
        const g = this.add.graphics().setDepth(50);
        g.fillStyle(0xe3e2e2, 0.95); g.fillRect(0, 0, W, 60);
        g.fillStyle(HC.primary); g.fillRect(0, 56, W, 4);

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
                fontFamily: H_HEAD, fontSize: '15px', fontStyle: 'bold', color: '#2e2f2f'
            }).setOrigin(1, 0.5).setDepth(51).setInteractive({ cursor: 'pointer' });
            txt.on('pointerover', () => txt.setStyle({ color: '#256900' }));
            txt.on('pointerout',  () => txt.setStyle({ color: '#2e2f2f' }));
            txt.on('pointerdown', () => fadeTo(this, item.scene));
            nx -= txt.width + 36;
        });
    }

    // ── HERO ──────────────────────────────────────────────────────

    buildHero(W) {
        const cx = 36, cy = 72;
        const cw = Math.min(500, Math.floor(W * 0.44));
        const ch = 276;

        // Shadow
        this.add.graphics().fillStyle(0x000000, 0.4).fillRect(cx + 6, cy + 6, cw, ch);

        // Card
        const card = this.add.graphics();
        card.fillStyle(0xedfbd4, 0.94); card.fillRect(cx, cy, cw, ch);
        card.fillStyle(HC.primary);
        card.fillRect(cx, cy,          cw, 5);
        card.fillRect(cx, cy,          8,  ch);
        card.fillRect(cx, cy + ch - 5, cw, 5);

        // Headline
        this.add.text(cx + 20, cy + 14, "Hi, I'm\nFelix.", {
            fontFamily: H_HEAD, fontSize: '48px', fontStyle: 'bold',
            color: '#1e5800', lineSpacing: 8
        });

        // Bio — personal info + one paragraph naming all games
        this.add.text(cx + 20, cy + 130, "I'm 12 years old. I love coding, gaming and running.\nI have a little brother named Issac.", {
            fontFamily: H_BODY, fontSize: '13px', color: '#2e2f2f', lineSpacing: 5
        });

        this.add.text(cx + 20, cy + 176, "I've built 10+ browser games and tools — Super Bros,\nSnake.io, Image Animator, 2 Player Shooter, Voidpet\nDungeon, Click It!, Value Scanner and more.", {
            fontFamily: H_BODY, fontSize: '12px', color: '#3a5c1a', lineSpacing: 4
        });

        // Buttons — below all text
        this.carvedBtn(cx + 20,  cy + 226, 188, 38, 'VIEW ALL PROJECTS', HC.primary,   '#d5ffbb', () => fadeTo(this, 'MainScene'));
        this.carvedBtn(cx + 220, cy + 226, 148, 38, 'PLAY GAMES',        HC.secondary, '#ffefec', () => fadeTo(this, 'CPSScene'));
    }

    // ── ABOUT ME ──────────────────────────────────────────────────

    buildAboutMe(W) {
        const heroRight = 36 + Math.min(500, Math.floor(W * 0.44)) + 20;
        const ax = heroRight, ay = 72;
        const aw = W - heroRight - 36, ah = 276;

        this.add.graphics().fillStyle(0x000000, 0.4).fillRect(ax + 6, ay + 6, aw, ah);

        const card = this.add.graphics();
        card.fillStyle(0xfff0e5, 0.94); card.fillRect(ax, ay, aw, ah);
        card.fillStyle(HC.secondary);
        card.fillRect(ax, ay,          aw, 5);
        card.fillRect(ax, ay,          8,  ah);
        card.fillRect(ax, ay + ah - 5, aw, 5);

        this.add.text(ax + 18, ay + 14, 'ABOUT ME', {
            fontFamily: H_HEAD, fontSize: '11px', fontStyle: 'bold',
            color: '#8f4816', letterSpacing: 3
        });

        const facts = [
            { icon: '🎂', label: 'AGE',     value: '12 years old',          col: HC.primary,   hex: '#256900', bg: 0xedfbd4 },
            { icon: '🎮', label: 'HOBBIES', value: 'Coding · Gaming\n· Running', col: HC.tertiary, hex: '#006668', bg: 0xddfefe },
            { icon: '👦', label: 'FAMILY',  value: 'Little bro\nIssac',     col: HC.secondary, hex: '#8f4816', bg: 0xfff0e5 },
            { icon: '🛠️', label: 'STACK',   value: 'JS · Canvas\n· Phaser', col: 0x555555,    hex: '#444444', bg: 0xeeedec },
        ];

        const tileW = Math.floor((aw - 18 - (facts.length - 1) * 8) / facts.length);
        const tileH = 168;
        const tileY = ay + 40;

        facts.forEach((f, i) => {
            const tx = ax + 18 + i * (tileW + 8);
            const tg = this.add.graphics();

            const draw = (hov) => {
                tg.clear();
                tg.fillStyle(0x000000, 0.08);
                tg.fillRect(tx + 4, tileY + 4, tileW, tileH);
                tg.fillStyle(hov ? f.col : f.bg);
                tg.fillRect(tx, tileY, tileW, tileH);
                tg.fillStyle(f.col);
                tg.fillRect(tx, tileY + tileH - 4, tileW, 4);
            };
            draw(false);

            const hit = this.add.rectangle(tx + tileW / 2, tileY + tileH / 2, tileW, tileH)
                .setAlpha(0.001).setInteractive({ cursor: 'pointer' });
            hit.on('pointerover', () => draw(true));
            hit.on('pointerout',  () => draw(false));

            this.add.text(tx + tileW / 2, tileY + 26, f.icon, { fontSize: '24px' }).setOrigin(0.5);
            this.add.text(tx + tileW / 2, tileY + 62, f.label, {
                fontFamily: H_HEAD, fontSize: '9px', fontStyle: 'bold',
                color: f.hex, letterSpacing: 2
            }).setOrigin(0.5);
            this.add.text(tx + tileW / 2, tileY + 80, f.value, {
                fontFamily: H_BODY, fontSize: '11px', color: '#2e2f2f',
                wordWrap: { width: tileW - 8 }, align: 'center', lineSpacing: 3
            }).setOrigin(0.5, 0);
        });

        // Quote
        const qy = ay + ah - 44;
        const qg = this.add.graphics();
        qg.fillStyle(HC.secondary, 0.1); qg.fillRect(ax + 18, qy, aw - 26, 34);
        qg.fillStyle(HC.secondary); qg.fillRect(ax + 18, qy, 8, 34);
        this.add.text(ax + 36, qy + 9, '"Build it. Break it. Build it better."', {
            fontFamily: H_BODY, fontSize: '12px', fontStyle: 'italic',
            color: '#8f4816', wordWrap: { width: aw - 54 }
        });
    }

    // ── FEATURED PROJECTS ─────────────────────────────────────────
    // Cards show description + "most proud of" snippet — NOT the intro paragraph

    buildFeaturedProjects(W, H) {
        const featured = PROJECTS.filter(p => p.featured);
        const secY = 362;

        this.add.text(36, secY, 'FEATURED PROJECTS', {
            fontFamily: H_HEAD, fontSize: '12px', fontStyle: 'bold',
            color: '#1e5800', letterSpacing: 3
        });

        const hr = this.add.graphics();
        hr.fillStyle(HC.outline, 0.3); hr.fillRect(36, secY + 22, W - 72, 2);

        const cardW = Math.floor((W - 72 - 24) / 3);
        const cardH = H - secY - 64;
        const cardY = secY + 32;

        featured.forEach((proj, i) => {
            const cx = 36 + i * (cardW + 12);
            const biomes = [
                { cardBg: 0xedfbd4, border: HC.primary,   nameCol: '#1e5800', descCol: '#2e4a1e', proudCol: '#3a7a00' },
                { cardBg: 0xddfefe, border: HC.tertiary,  nameCol: '#005d5f', descCol: '#1a3a3b', proudCol: '#007a7c' },
                { cardBg: 0xfff0e5, border: HC.secondary, nameCol: '#8f4816', descCol: '#3a2010', proudCol: '#b05820' },
            ];
            const bm = biomes[i];

            // Shadow
            this.add.graphics().fillStyle(0x000000, 0.3).fillRect(cx + 6, cardY + 6, cardW, cardH);

            // Card
            const bg = this.add.graphics();
            bg.fillStyle(bm.cardBg, 0.96); bg.fillRect(cx, cardY, cardW, cardH);
            bg.fillStyle(bm.border);
            bg.fillRect(cx, cardY,             cardW, 5);
            bg.fillRect(cx, cardY,             8, cardH);
            bg.fillRect(cx, cardY + cardH - 5, cardW, 5);

            // Name
            this.add.text(cx + 18, cardY + 14, proj.name, {
                fontFamily: H_HEAD, fontSize: '16px', fontStyle: 'bold', color: bm.nameCol
            });

            // Description — the short one-liner (this IS the description, not the intro)
            this.add.text(cx + 18, cardY + 46, proj.description, {
                fontFamily: H_BODY, fontSize: '13px', color: bm.descCol,
                wordWrap: { width: cardW - 30 }, lineSpacing: 4
            });

            // Divider
            const div = this.add.graphics();
            div.fillStyle(bm.border, 0.2); div.fillRect(cx + 18, cardY + 90, cardW - 36, 2);

            // "Most proud of" from second paragraph — this gives real detail
            const secondPara = proj.story.split('\n\n')[1] || '';
            const proudSentence = secondPara.split('.')[0] + '.';
            this.add.text(cx + 18, cardY + 102, '⭐ ' + proudSentence, {
                fontFamily: H_BODY, fontSize: '11px', fontStyle: 'italic',
                color: bm.proudCol, wordWrap: { width: cardW - 30 }, lineSpacing: 3
            });

            // Tech tags
            const tagY = cardY + cardH - 38;
            let tagX = cx + 18;
            proj.tech.forEach(tag => {
                const tw = tag.length * 7 + 16;
                const tg = this.add.graphics();
                tg.fillStyle(bm.border, 0.14); tg.fillRect(tagX, tagY, tw, 20);
                tg.fillStyle(bm.border); tg.fillRect(tagX, tagY + 17, tw, 3);
                this.add.text(tagX + 8, tagY + 10, tag, {
                    fontFamily: H_HEAD, fontSize: '9px', fontStyle: 'bold', color: bm.nameCol
                }).setOrigin(0, 0.5);
                tagX += tw + 6;
            });

            // VISIT
            if (proj.url && proj.url !== '#') {
                const link = this.add.text(cx + cardW - 14, cardY + cardH - 14, 'VISIT →', {
                    fontFamily: H_HEAD, fontSize: '11px', fontStyle: 'bold', color: bm.nameCol
                }).setOrigin(1, 1).setInteractive({ cursor: 'pointer' });
                link.on('pointerover', () => link.setAlpha(0.6));
                link.on('pointerout',  () => link.setAlpha(1));
                link.on('pointerdown', () => window.open(proj.url, '_blank'));
            }
        });
    }

    // ── FOOTER ────────────────────────────────────────────────────

    buildFooter(W, H) {
        const fg = this.add.graphics();
        fg.fillStyle(HC.inverseSurf, 0.96); fg.fillRect(0, H - 40, W, 40);
        fg.fillStyle(HC.primaryFix); fg.fillRect(0, H - 40, W, 4);
        this.add.text(W / 2, H - 20, '© Felix · Age 12 · Built block by block', {
            fontFamily: H_BODY, fontSize: '12px', color: '#95f169'
        }).setOrigin(0.5);
    }

    // ── HELPER: carved button ─────────────────────────────────────

    carvedBtn(x, y, w, h, label, bgCol, txCol, cb) {
        const g = this.add.graphics();
        const draw = (hov) => {
            g.clear();
            g.fillStyle(bgCol, hov ? 1 : 0.92); g.fillRect(x, y, w, h);
            g.fillStyle(0x000000, hov ? 0.35 : 0.2);
            g.fillRect(x, y + h - 4, w, 4); g.fillRect(x + w - 4, y, 4, h);
            g.fillStyle(0xffffff, 0.2);
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
