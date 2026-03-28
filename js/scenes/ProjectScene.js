// ── PROJECT DETAIL PAGE — animated biome background per project ──

class ProjectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ProjectScene' });
        this.particles = [];
    }

    init(data) {
        this.proj  = PROJECTS.find(p => p.id === data.id) || PROJECTS[0];
        this.biome = BIOME_MAP[this.proj.biome] || BIOME_MAP.stone;
        this.particles = [];
    }

    create() {
        const W = this.scale.width, H = this.scale.height;
        slideIn(this);
        this.drawBiomeBg(W, H);
        this.buildUI(W, H);
    }

    // ── ANIMATED BIOME BACKGROUND ──────────────────────────────────

    drawBiomeBg(W, H) {
        const b = this.biome, name = this.proj.biome;
        const g = this.add.graphics();

        // Base fill
        g.fillStyle(b.cardBg); g.fillRect(0, 0, W, H);

        // Biome-specific static scenery
        this['draw_' + name]?.(g, W, H);

        // Voxel dot grid (Stitch)
        g.fillStyle(b.border, 0.1);
        for (let gx = 0; gx <= W; gx += 32)
            for (let gy = 0; gy <= H; gy += 32)
                g.fillRect(gx, gy, 2, 2);

        // Spawn animated particles
        this.pGfx = this.add.graphics().setDepth(1);
        this.spawnParticles(W, H, name);
    }

    // Static biome scenery ────────────────────────────────────────

    draw_forest(g, W, H) {
        // Sky wash
        g.fillStyle(0xb8e87c, 0.3); g.fillRect(0, 0, W, H * 0.55);
        // Ground
        g.fillStyle(0x4a7c0b, 0.25); g.fillRect(0, H * 0.72, W, H * 0.28);
        // Trees
        [80, 220, 430, 660, 880, 1100, 1230].forEach(tx => {
            const th = 80 + Math.floor(tx * 0.13) % 60;
            g.fillStyle(0x5c3a1e); g.fillRect(tx - 10, H * 0.72 - th, 20, th);
            g.fillStyle(0x2d6a00); g.fillRect(tx - 38, H * 0.72 - th - 60, 76, 70);
            g.fillStyle(0x256900); g.fillRect(tx - 28, H * 0.72 - th - 90, 56, 40);
        });
    }

    draw_desert(g, W, H) {
        g.fillStyle(0xf5d98c, 0.5); g.fillRect(0, 0, W, H * 0.55);
        g.fillStyle(0xd4a84b, 0.4); g.fillRect(0, H * 0.55, W, H * 0.45);
        [60, 300, 580, 820, 1100].forEach(cx => {
            g.fillStyle(0x2e7d32);
            g.fillRect(cx - 8, H * 0.55 - 80, 16, 80);
            g.fillRect(cx - 28, H * 0.55 - 55, 20, 12);
            g.fillRect(cx + 8,  H * 0.55 - 42, 20, 12);
        });
        // Sun
        g.fillStyle(0xffee44, 0.8); g.fillRect(W - 100, 80, 50, 50);
    }

    draw_ocean(g, W, H) {
        // Sky
        g.fillStyle(0xb3e5fc, 0.6); g.fillRect(0, 0, W, H * 0.4);
        // Water (static base, animated waves via particles)
        g.fillStyle(0x006668, 0.2); g.fillRect(0, H * 0.4, W, H * 0.6);
        g.fillStyle(0x5dfbfe, 0.15); g.fillRect(0, H * 0.4, W, 20);
        // Seabed blocks
        g.fillStyle(0x004d4e, 0.3);
        for (let bx = 0; bx < W; bx += 48) g.fillRect(bx, H - 48, 44, 44);
    }

    draw_nether(g, W, H) {
        g.fillStyle(0x1a0000); g.fillRect(0, 0, W, H);
        // Netherrack strips
        [0.65, 0.78, 0.9].forEach(p => { g.fillStyle(0x5a1000, 0.6); g.fillRect(0, H * p, W, H * 0.04); });
        // Lava glow at bottom
        g.fillStyle(0xb02500, 0.3); g.fillRect(0, H - 50, W, 50);
        g.fillStyle(0xf95630, 0.2); g.fillRect(0, H - 24, W, 24);
        // Portal shimmer
        g.fillStyle(0x5b0063, 0.06); g.fillRect(0, 0, W, H);
    }

    draw_stone(g, W, H) {
        g.fillStyle(0x555555, 0.1); g.fillRect(0, 0, W, H);
        // Stone block pattern
        for (let gy = 0; gy < H; gy += 40)
            for (let gx = (gy % 80 === 0 ? 0 : 20); gx < W; gx += 40) {
                g.lineStyle(1, 0x444444, 0.3);
                g.strokeRect(gx, gy, 38, 38);
            }
        // Ore veins
        [[200, 300], [600, 200], [900, 450], [400, 550], [1100, 350]].forEach(([px, py]) => {
            g.fillStyle(0x5dfbfe, 0.12); g.fillRect(px, py, 12, 12);
        });
    }

    draw_deep_dark(g, W, H) {
        g.fillStyle(0x050708); g.fillRect(0, 0, W, H);
        // Sculk veins
        g.lineStyle(1, 0x006668, 0.2);
        [100, 280, 450, 650, 820, 1000, 1180].forEach(px => g.lineBetween(px, 0, px, H));
        [120, 250, 380, 510, 620].forEach(py => g.lineBetween(0, py, W, py));
        // Sculk glow patches
        [[200, 300], [600, 200], [900, 500], [400, 580]].forEach(([px, py]) => {
            g.fillStyle(0x006668, 0.15); g.fillRect(px - 50, py - 50, 100, 100);
            g.fillStyle(0x5dfbfe, 0.07); g.fillRect(px - 16, py - 16, 32, 32);
        });
    }

    draw_snowy(g, W, H) {
        // Sky
        g.fillStyle(0xd6eeff, 0.5); g.fillRect(0, 0, W, H * 0.55);
        // Snow ground
        g.fillStyle(0xffffff, 0.7); g.fillRect(0, H * 0.55, W, H * 0.45);
        // Snow bumps
        [100, 300, 540, 760, 980, 1180].forEach(sx => {
            g.fillStyle(0xe8f4ff, 0.6); g.fillEllipse(sx, H * 0.55, 200, 30);
        });
        // Ice blocks
        for (let bx = 0; bx < W; bx += 64) {
            g.fillStyle(0x4fc3f7, 0.2); g.fillRect(bx, H - 44, 60, 40);
            g.lineStyle(1, 0x4fc3f7, 0.3); g.strokeRect(bx, H - 44, 60, 40);
        }
    }

    // ── PARTICLE SYSTEM ───────────────────────────────────────────

    spawnParticles(W, H, biome) {
        const configs = {
            forest:    { n: 22, col: 0x256900, s: [3, 6],  vx: [-0.2, 0.4], vy: [0.4, 1.2], a: 0.55 },
            desert:    { n: 35, col: 0xe8c46a, s: [1, 3],  vx: [0.6, 1.6],  vy: [0.1, 0.4], a: 0.45 },
            ocean:     { n: 18, col: 0x5dfbfe, s: [6, 14], vx: [-0.6, 0.6], vy: [-0.8, -0.2], a: 0.35 },
            nether:    { n: 28, col: 0xf95630, s: [3, 8],  vx: [-0.5, 0.5], vy: [-1.8, -0.6], a: 0.65 },
            stone:     { n: 18, col: 0x888888, s: [2, 4],  vx: [-0.2, 0.2], vy: [0.3, 0.7],  a: 0.28 },
            deep_dark: { n: 14, col: 0x5dfbfe, s: [4, 10], vx: [-0.3, 0.3], vy: [-0.3, 0.3], a: 0.5  },
            snowy:     { n: 40, col: 0xffffff, s: [2, 5],  vx: [-0.4, 0.4], vy: [0.8, 2.0],  a: 0.75 },
        };
        const cfg = configs[biome] || configs.stone;

        for (let i = 0; i < cfg.n; i++) {
            this.particles.push({
                x:     Math.random() * W,
                y:     Math.random() * H,
                size:  cfg.s[0] + Math.random() * (cfg.s[1] - cfg.s[0]),
                vx:    cfg.vx[0] + Math.random() * (cfg.vx[1] - cfg.vx[0]),
                vy:    cfg.vy[0] + Math.random() * (cfg.vy[1] - cfg.vy[0]),
                alpha: cfg.a * (0.5 + Math.random() * 0.5),
                col:   cfg.col,
                pulse: Math.random() * Math.PI * 2,  // for deep_dark glow pulse
            });
        }
        this._W = W; this._H = H; this._biome = biome;
    }

    update(time) {
        if (!this.pGfx || !this.particles.length) return;
        const W = this._W, H = this._H;
        this.pGfx.clear();

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y > H + 10) p.y = -10;
            if (p.y < -10)    p.y = H + 10;
            if (p.x > W + 10) p.x = -10;
            if (p.x < -10)    p.x = W + 10;

            // deep_dark: pulse alpha
            let a = p.alpha;
            if (this._biome === 'deep_dark') {
                p.pulse += 0.04;
                a = p.alpha * (0.4 + 0.6 * Math.abs(Math.sin(p.pulse)));
            }

            this.pGfx.fillStyle(p.col, a);
            this.pGfx.fillRect(p.x, p.y, p.size, p.size);
        });
    }

    // ── UI ────────────────────────────────────────────────────────

    buildUI(W, H) {
        const proj = this.proj, b = this.biome;
        const HEAD = "'Space Grotesk', sans-serif";
        const BODY = "'Work Sans', sans-serif";

        // Dark overlay so text is readable over the biome
        this.add.graphics().fillStyle(0x000000, 0.22).fillRect(0, 0, W, H).setDepth(2);

        // ── Header bar ──────────────────────────────────────────
        const hg = this.add.graphics().setDepth(10);
        hg.fillStyle(b.cardBg, 0.96); hg.fillRect(0, 0, W, 64);
        hg.fillStyle(b.border);       hg.fillRect(0, 60, W, 4);

        // Back
        const back = this.add.text(20, 32, '← BACK', {
            fontFamily: HEAD, fontSize: '14px', fontStyle: 'bold', color: b.nameCol
        }).setOrigin(0, 0.5).setDepth(11).setInteractive({ cursor: 'pointer' });
        back.on('pointerover', () => back.setAlpha(0.6));
        back.on('pointerout',  () => back.setAlpha(1));
        back.on('pointerdown', () => fadeTo(this, 'MainScene'));

        // Biome badge
        const badgeW = b.label.length * 8 + 24;
        const badgeG = this.add.graphics().setDepth(11);
        badgeG.fillStyle(b.border); badgeG.fillRect(W / 2 - badgeW / 2, 14, badgeW, 22);
        this.add.text(W / 2, 25, b.label.toUpperCase(), {
            fontFamily: HEAD, fontSize: '10px', fontStyle: 'bold',
            color: '#ffffff', letterSpacing: 2
        }).setOrigin(0.5).setDepth(12);

        // VISIT link (top right)
        if (proj.url && proj.url !== '#') {
            const visit = this.add.text(W - 20, 32, 'VISIT SITE →', {
                fontFamily: HEAD, fontSize: '13px', fontStyle: 'bold', color: b.nameCol
            }).setOrigin(1, 0.5).setDepth(11).setInteractive({ cursor: 'pointer' });
            visit.on('pointerover', () => visit.setAlpha(0.6));
            visit.on('pointerout',  () => visit.setAlpha(1));
            visit.on('pointerdown', () => window.open(proj.url, '_blank'));
        }

        // ── Left panel — project info ────────────────────────────
        const lx = 48, ly = 84, lw = Math.floor(W * 0.46), lh = H - ly - 48;

        const lg = this.add.graphics().setDepth(3);
        lg.fillStyle(0x000000, 0.35); lg.fillRect(lx + 6, ly + 6, lw, lh);
        lg.fillStyle(b.cardBg, 0.93); lg.fillRect(lx, ly, lw, lh);
        lg.fillStyle(b.border);
        lg.fillRect(lx, ly,          lw, 5);
        lg.fillRect(lx, ly,          10, lh);
        lg.fillRect(lx, ly + lh - 5, lw, 5);

        // Project name
        this.add.text(lx + 22, ly + 18, proj.name, {
            fontFamily: HEAD, fontSize: '32px', fontStyle: 'bold', color: b.nameCol
        }).setDepth(4);

        // Description
        this.add.text(lx + 22, ly + 72, proj.description, {
            fontFamily: BODY, fontSize: '15px', color: b.nameCol,
            wordWrap: { width: lw - 40 }, lineSpacing: 5, alpha: 0.85
        }).setDepth(4);

        // Status chip
        const status = getProjectStatus(proj.id);
        const sInfo = STATUS_TYPES[status];
        const scg = this.add.graphics().setDepth(4);
        scg.fillStyle(sInfo.bg); scg.fillRect(lx + 22, ly + 128, 120, 28);
        scg.fillStyle(0x000000, 0.15); scg.fillRect(lx + 22, ly + 154, 120, 2);
        this.add.text(lx + 82, ly + 142, sInfo.label, {
            fontFamily: HEAD, fontSize: '11px', fontStyle: 'bold', color: sInfo.hex
        }).setOrigin(0.5).setDepth(5);

        // Tech tags
        let tagX = lx + 22, tagY = ly + 170;
        proj.tech.forEach(tag => {
            const tw = tag.length * 7.5 + 18;
            const tg = this.add.graphics().setDepth(4);
            tg.fillStyle(b.tagBg); tg.fillRect(tagX, tagY, tw, 24);
            tg.fillStyle(b.border, 0.3); tg.fillRect(tagX, tagY + 21, tw, 3);
            this.add.text(tagX + tw / 2, tagY + 12, tag, {
                fontFamily: HEAD, fontSize: '10px', fontStyle: 'bold', color: b.tagTx
            }).setOrigin(0.5).setDepth(5);
            tagX += tw + 8;
        });

        // Big VISIT button
        if (proj.url && proj.url !== '#') {
            const bx = lx + 22, by = ly + lh - 64, bw = lw - 44, bh = 48;
            const btnG = this.add.graphics().setDepth(4);
            const drawBtn = (hov) => {
                btnG.clear();
                btnG.fillStyle(b.border, hov ? 1 : 0.9); btnG.fillRect(bx, by, bw, bh);
                btnG.fillStyle(0x000000, 0.25); btnG.fillRect(bx, by + bh - 5, bw, 5); btnG.fillRect(bx + bw - 5, by, 5, bh);
                btnG.fillStyle(0xffffff, 0.15); btnG.fillRect(bx, by, bw, 5); btnG.fillRect(bx, by, 5, bh);
            };
            drawBtn(false);
            const btnTxt = this.add.text(bx + bw / 2, by + bh / 2, 'OPEN PROJECT →', {
                fontFamily: HEAD, fontSize: '15px', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0.5).setDepth(5).setInteractive({ cursor: 'pointer' });
            btnTxt.on('pointerover', () => drawBtn(true));
            btnTxt.on('pointerout',  () => drawBtn(false));
            btnTxt.on('pointerdown', () => window.open(proj.url, '_blank'));
        } else {
            this.add.text(lx + 22, ly + lh - 44, '⚠ Not yet publicly available', {
                fontFamily: BODY, fontSize: '13px', fontStyle: 'italic', color: b.nameCol, alpha: 0.5
            }).setDepth(4);
        }

        // ── Right panel — story ──────────────────────────────────
        const rx = lx + lw + 24, ry = ly, rw = W - rx - 36, rh = lh;

        const rg = this.add.graphics().setDepth(3);
        rg.fillStyle(0x000000, 0.35); rg.fillRect(rx + 6, ry + 6, rw, rh);
        rg.fillStyle(b.cardBg, 0.93); rg.fillRect(rx, ry, rw, rh);
        rg.fillStyle(b.border);
        rg.fillRect(rx, ry,          rw, 5);
        rg.fillRect(rx, ry,          10, rh);
        rg.fillRect(rx, ry + rh - 5, rw, 5);

        this.add.text(rx + 22, ry + 18, 'THE STORY', {
            fontFamily: HEAD, fontSize: '11px', fontStyle: 'bold',
            color: b.nameCol, letterSpacing: 3, alpha: 0.7
        }).setDepth(4);

        const divG = this.add.graphics().setDepth(4);
        divG.fillStyle(b.border, 0.3); divG.fillRect(rx + 22, ry + 38, rw - 44, 2);

        // First paragraph
        const paras = proj.story.split('\n\n');
        const p1 = paras[0].replace(/^Hi, I'm Felix and I built [^.]+\. /, '');
        this.add.text(rx + 22, ry + 52, p1, {
            fontFamily: BODY, fontSize: '13px', color: b.nameCol,
            wordWrap: { width: rw - 44 }, lineSpacing: 5, alpha: 0.88
        }).setDepth(4);

        // "Most proud of" block
        if (paras[1]) {
            const proudY = ry + rh - 130;
            const pg = this.add.graphics().setDepth(4);
            pg.fillStyle(b.border, 0.12); pg.fillRect(rx + 22, proudY, rw - 44, 110);
            pg.fillStyle(b.border);       pg.fillRect(rx + 22, proudY, 8, 110);

            this.add.text(rx + 40, proudY + 10, '⭐  MOST PROUD OF', {
                fontFamily: HEAD, fontSize: '10px', fontStyle: 'bold',
                color: b.nameCol, letterSpacing: 2
            }).setDepth(5);

            this.add.text(rx + 40, proudY + 32, paras[1], {
                fontFamily: BODY, fontSize: '12px', fontStyle: 'italic',
                color: b.nameCol, wordWrap: { width: rw - 70 }, lineSpacing: 4, alpha: 0.8
            }).setDepth(5);
        }
    }
}
