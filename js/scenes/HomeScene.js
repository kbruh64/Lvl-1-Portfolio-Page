// ── OVERWORLD HUB ─ Home / Introduction ──────────────────────────
// Stitch: "The Digital Architect" hero section, Lush Forest biome

class HomeScene extends Phaser.Scene {
    constructor() { super({ key: 'HomeScene' }); }

    create() {
        const W = this.scale.width, H = this.scale.height;
        this.drawBg(W, H);
        this.buildHero(W, H);
        this.buildNav(W, H);
    }

    drawBg(W, H) {
        // Surface base
        const g = this.add.graphics();
        g.fillStyle(0xf8f6f6); g.fillRect(0, 0, W, H);

        // Voxel grid (Stitch: radial-gradient 32px)
        g.fillStyle(0xadadad, 0.4);
        for (let gx = 0; gx <= W; gx += 32)
            for (let gy = 0; gy <= H; gy += 32)
                g.fillRect(gx, gy, 1, 1);

        // Hero section tint — primary-container/20 (very light green wash)
        g.fillStyle(0x95f169, 0.08);
        g.fillRect(0, 0, W, H * 0.72);

        // Ground strip — grass blocks at the bottom of hero
        g.fillStyle(0x256900); g.fillRect(0, H * 0.72, W, 8);    // grass top
        g.fillStyle(0x8f4816); g.fillRect(0, H * 0.72 + 8, W, 20); // dirt
        g.fillStyle(0x95f169, 0.3); // grass highlight
        [[60, 0.70], [180, 0.69], [320, 0.71], [500, 0.70], [700, 0.68], [900, 0.71], [1100, 0.70]].forEach(([px, pct]) => {
            g.fillRect(px, H * pct, 24, 8);
        });

        // Floating pixel clouds
        [[160, 80], [420, 55], [700, 90], [980, 62], [1180, 78]].forEach(([cx, cy]) => {
            const cg = this.add.graphics();
            cg.fillStyle(0xffffff, 0.85);
            // Blocky pixel cloud shape (Stitch: 0px radius everything)
            [[0,8,48,16],[8,0,32,10],[8,24,32,10]].forEach(([dx,dy,cw,ch]) => {
                cg.fillRect(cx+dx, cy+dy, cw, ch);
            });
        });
    }

    buildHero(W, H) {
        // Stitch: bg-surface border-4 border-primary shadow-[12px_12px_0px_0px]
        const cardX = 60, cardY = 90, cardW = 680, cardH = 340;

        // Hard shadow (12px offset)
        const shad = this.add.graphics();
        shad.fillStyle(0x256900, 0.3);
        shad.fillRect(cardX + 12, cardY + 12, cardW, cardH);

        // Card bg
        const card = this.add.graphics();
        card.fillStyle(0xffffff); card.fillRect(cardX, cardY, cardW, cardH);
        // 4px primary border
        card.fillStyle(0x256900);
        card.fillRect(cardX, cardY, cardW, 4);
        card.fillRect(cardX, cardY + cardH - 4, cardW, 4);
        card.fillRect(cardX, cardY, 4, cardH);
        card.fillRect(cardX + cardW - 4, cardY, 4, cardH);

        // Display headline — Space Grotesk, massive (Stitch: text-6xl font-headline font-bold)
        this.add.text(cardX + 32, cardY + 28, 'THE\nOVERWORLD\nHUB', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '62px', fontStyle: 'bold',
            color: '#2e2f2f', lineSpacing: -8
        });

        // Body — Work Sans generous line height
        this.add.text(cardX + 32, cardY + 228, "Hi, I'm Felix. I build games and tools in the\nbrowser — one block at a time.", {
            fontFamily: "'Work Sans', sans-serif",
            fontSize: '18px', color: '#5b5b5c', lineSpacing: 6
        });

        // CTA button — Stitch carved-button bg-primary
        const btnX = cardX + 32, btnY = cardY + 290, btnW = 220, btnH = 44;
        const btn = this.add.graphics();
        btn.fillStyle(0x256900); btn.fillRect(btnX, btnY, btnW, btnH);
        btn.fillStyle(0x000000, 0.3); btn.fillRect(btnX, btnY + btnH - 5, btnW, 5); btn.fillRect(btnX + btnW - 5, btnY, 5, btnH);
        btn.fillStyle(0xffffff, 0.15); btn.fillRect(btnX, btnY, btnW, 5); btn.fillRect(btnX, btnY, 5, btnH);

        const btnTxt = this.add.text(btnX + btnW / 2, btnY + btnH / 2, 'VIEW PROJECTS →', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px', fontStyle: 'bold', color: '#d5ffbb'
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        btnTxt.on('pointerdown', () => this.scene.start('MainScene'));

        // Secondary button
        const btn2X = btnX + btnW + 16, btn2W = 200;
        const btn2 = this.add.graphics();
        btn2.fillStyle(0xe9e8e8); btn2.fillRect(btn2X, btnY, btn2W, btnH);
        btn2.fillStyle(0x000000, 0.15); btn2.fillRect(btn2X, btnY + btnH - 5, btn2W, 5); btn2.fillRect(btn2X + btn2W - 5, btnY, 5, btnH);
        btn2.fillStyle(0xffffff, 0.3); btn2.fillRect(btn2X, btnY, btn2W, 5); btn2.fillRect(btn2X, btnY, 5, btnH);

        const btn2Txt = this.add.text(btn2X + btn2W / 2, btnY + btnH / 2, 'PLAY MINIGAMES →', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '12px', fontStyle: 'bold', color: '#5b5b5c'
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        btn2Txt.on('pointerdown', () => this.scene.start('MainScene'));

        // Right side — character stat bars (Stitch: CHARACTER STATS section)
        const statX = cardX + cardW + 40, statY = cardY;
        const statW = W - statX - 60;

        this.add.text(statX, statY + 10, 'CHARACTER STATS', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px', fontStyle: 'bold',
            color: '#256900', letterSpacing: 2
        });

        const stats = [
            { label: 'Game Dev',    val: 90, col: 0x256900, txCol: '#1e5800' },
            { label: 'JS / Canvas', val: 85, col: 0x006668, txCol: '#005d5f' },
            { label: 'AI Tools',    val: 75, col: 0x8f4816, txCol: '#8f4816' },
            { label: 'UI Design',   val: 70, col: 0xb02500, txCol: '#b02500' },
            { label: 'Creativity',  val: 99, col: 0x226300, txCol: '#226300' },
        ];

        stats.forEach((s, i) => {
            const sy = statY + 50 + i * 54;
            this.add.text(statX, sy, s.label.toUpperCase(), {
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '11px', fontStyle: 'bold', color: s.txCol, letterSpacing: 1
            });
            this.add.text(statX + statW, sy, s.val + '/100', {
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '11px', fontStyle: 'bold', color: s.txCol
            }).setOrigin(1, 0);

            // Bar track (Stitch: h-6 bg-stone-200 border-2 border-stone-400)
            const bg = this.add.graphics();
            bg.fillStyle(0xe9e8e8); bg.fillRect(statX, sy + 18, statW, 18);
            bg.fillStyle(0xadadad, 0.5); bg.fillRect(statX, sy + 18, statW, 2); // top border
            bg.fillRect(statX, sy + 34, statW, 2); // bottom border

            // Bar fill — animated
            const fill = this.add.graphics();
            fill.fillStyle(s.col); fill.fillRect(statX, sy + 18, (statW * s.val / 100), 18);

            // Animate bar
            let cur = 0;
            const target = s.val;
            this.time.addEvent({
                delay: 12 + i * 60, repeat: target,
                callback: () => {
                    cur++;
                    fill.clear();
                    fill.fillStyle(s.col);
                    fill.fillRect(statX, sy + 18, (statW * cur / 100), 18);
                }
            });
        });

        // Quote block (Stitch: border-l-[16px] border-primary italic)
        const qx = statX, qy = statY + 330, qw = statW;
        const qg = this.add.graphics();
        qg.fillStyle(0x256900); qg.fillRect(qx, qy, 12, 48);
        qg.fillStyle(0xf2f0f0); qg.fillRect(qx + 12, qy, qw - 12, 48);
        this.add.text(qx + 24, qy + 10, '"Build it. Break it. Build it better."', {
            fontFamily: "'Work Sans', sans-serif",
            fontSize: '13px', color: '#5b5b5c',
            fontStyle: 'italic', wordWrap: { width: qw - 36 }
        });
    }

    buildNav(W, H) {
        // Stitch: sticky header — surface-container/80 backdrop-blur border-b-4 border-stone-400
        const ng = this.add.graphics().setDepth(50);
        ng.fillStyle(0xe3e2e2); ng.fillRect(0, 0, W, 60);
        ng.fillStyle(0xadadad); ng.fillRect(0, 56, W, 4); // 4px border

        this.add.text(24, 30, 'FELIX.DEV', {
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '18px', fontStyle: 'bold', color: '#1e5800'
        }).setOrigin(0, 0.5).setDepth(51);

        const navItems = [
            { label: 'Projects', scene: 'MainScene' },
            { label: 'CPS Test', scene: 'CPSScene' },
            { label: 'Whack-a-Mole', scene: 'WhackAMoleScene' },
            { label: 'Puzzle', scene: 'PuzzleScene' },
        ];
        const totalNavW = navItems.reduce((acc, n) => acc + n.label.length * 9 + 36, 0);
        let nx = W - totalNavW - 20;
        navItems.forEach(item => {
            const iw = item.label.length * 9 + 36;
            const txt = this.add.text(nx + iw / 2, 30, item.label.toUpperCase(), {
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '12px', fontStyle: 'bold', color: '#5b5b5c', letterSpacing: 1
            }).setOrigin(0.5).setDepth(51).setInteractive({ cursor: 'pointer' });
            txt.on('pointerover', () => txt.setColor('#256900'));
            txt.on('pointerout',  () => txt.setColor('#5b5b5c'));
            txt.on('pointerdown', () => this.scene.start(item.scene));
            nx += iw;
        });

        // Footer band
        const fg = this.add.graphics();
        fg.fillStyle(0x1e5800); fg.fillRect(0, H - 44, W, 44);
        fg.fillStyle(0x95f169); fg.fillRect(0, H - 44, W, 4);
        this.add.text(W / 2, H - 22, '© Felix · Built block by block · Click title 5× for admin', {
            fontFamily: "'Work Sans', sans-serif",
            fontSize: '11px', color: '#95f169', alpha: 0.7
        }).setOrigin(0.5);
    }
}
