class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.HEADER_H = 90;
        this.FOOTER_H = 68;
        this.titleClicks = 0;
        this.lastTitleClick = 0;
        this.maxScroll = 0;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.isAdmin = isAdminLoggedIn();

        this.drawBackground(W, H);

        // Scrollable container — positioned just below header
        this.scrollCont = this.add.container(0, this.HEADER_H);

        this.buildProjectGrid(W, H);

        // Clip content to the area between header and footer
        const clipGfx = this.make.graphics({ add: false });
        clipGfx.fillRect(0, this.HEADER_H, W, H - this.HEADER_H - this.FOOTER_H);
        this.scrollCont.setMask(clipGfx.createGeometryMask());

        // Header and footer rendered on top
        this.buildHeader(W, H);
        this.buildFooter(W, H);

        // Mouse wheel scroll
        this.input.on('wheel', (_p, _g, _dx, dy) => {
            const newY = Phaser.Math.Clamp(
                this.scrollCont.y - dy * 0.5,
                this.HEADER_H - this.maxScroll,
                this.HEADER_H
            );
            this.scrollCont.y = newY;
        });

        // Secret: press ` (backtick) to open admin
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK)
            .on('down', () => this.scene.start('AdminScene'));
    }

    drawBackground(W, H) {
        const g = this.add.graphics();
        g.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0d1a3a, 0x0d1a3a, 1);
        g.fillRect(0, 0, W, H);

        // Static star field
        const sg = this.add.graphics();
        for (let i = 0; i < 200; i++) {
            const alpha = Phaser.Math.FloatBetween(0.15, 0.75);
            sg.fillStyle(0xffffff, alpha);
            sg.fillCircle(
                Phaser.Math.Between(0, W),
                Phaser.Math.Between(0, H),
                Phaser.Math.FloatBetween(0.5, 2)
            );
        }

        // Twinkling stars
        for (let i = 0; i < 18; i++) {
            const s = this.add.circle(
                Phaser.Math.Between(0, W),
                Phaser.Math.Between(0, H),
                Phaser.Math.FloatBetween(1.5, 3),
                0xffffff
            );
            this.tweens.add({
                targets: s,
                alpha: { from: 0.1, to: 0.9 },
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true, repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }

    buildHeader(W, H) {
        const g = this.add.graphics().setDepth(20);
        g.fillStyle(0x080818, 0.96);
        g.fillRect(0, 0, W, this.HEADER_H);
        g.lineStyle(2, 0x00d4ff, 0.8);
        g.lineBetween(0, this.HEADER_H, W, this.HEADER_H);

        const title = this.add.text(W / 2, 34, "★  FELIX'S PORTFOLIO  ★", {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '22px',
            color: '#00d4ff',
            stroke: '#003355',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(21);

        this.add.text(W / 2, 64, 'DEVELOPER  ·  CREATOR  ·  GAMER', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
            color: '#335566'
        }).setOrigin(0.5).setDepth(21);

        // 5 quick clicks on title → admin
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
            const badge = this.add.text(W - 14, 18, '[ ADMIN MODE ]', {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '8px',
                color: '#000',
                backgroundColor: '#ffaa00',
                padding: { x: 8, y: 5 }
            }).setOrigin(1, 0).setDepth(21).setInteractive({ cursor: 'pointer' });
            badge.on('pointerdown', () => this.scene.start('AdminScene'));
        }
    }

    buildFooter(W, H) {
        const g = this.add.graphics().setDepth(20);
        g.fillStyle(0x080818, 0.96);
        g.fillRect(0, H - this.FOOTER_H, W, this.FOOTER_H);
        g.lineStyle(2, 0x00d4ff, 0.8);
        g.lineBetween(0, H - this.FOOTER_H, W, H - this.FOOTER_H);

        const defs = [
            { label: 'CPS TEST',      col: '#ff6699', hcol: 0xff6699, scene: 'CPSScene' },
            { label: 'WHACK-A-MOLE',  col: '#66ff99', hcol: 0x66ff99, scene: 'WhackAMoleScene' },
            { label: 'PUZZLE',        col: '#6699ff', hcol: 0x6699ff, scene: 'PuzzleScene' }
        ];

        const btnW = 230, btnH = 40, gap = 40;
        const totalW = defs.length * btnW + (defs.length - 1) * gap;
        const startX = (W - totalW) / 2;
        const cy = H - this.FOOTER_H / 2;

        defs.forEach((def, i) => {
            const cx = startX + i * (btnW + gap) + btnW / 2;
            const bgGfx = this.add.graphics().setDepth(21);

            const draw = (hover) => {
                bgGfx.clear();
                if (hover) {
                    bgGfx.fillStyle(0x111133, 0.9);
                    bgGfx.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);
                }
                bgGfx.lineStyle(2, def.hcol, hover ? 1 : 0.55);
                bgGfx.strokeRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);
            };
            draw(false);

            const txt = this.add.text(cx, cy, def.label, {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
                color: def.col
            }).setOrigin(0.5).setDepth(22).setInteractive({ cursor: 'pointer' });

            txt.on('pointerover', () => { draw(true); txt.setAlpha(1); });
            txt.on('pointerout',  () => { draw(false); txt.setAlpha(0.85); });
            txt.on('pointerdown', () => this.scene.start(def.scene));
        });
    }

    buildProjectGrid(W, H) {
        const COLS   = 3;
        const CARD_W = 370;
        const CARD_H = this.isAdmin ? 220 : 185;
        const GAP_X  = 25;
        const GAP_Y  = 18;
        const PAD_T  = 22;

        const gridW = COLS * CARD_W + (COLS - 1) * GAP_X;
        const startX = (W - gridW) / 2;

        PROJECTS.forEach((proj, idx) => {
            const col = idx % COLS;
            const row = Math.floor(idx / COLS);
            const cx = startX + col * (CARD_W + GAP_X);
            const cy = PAD_T + row * (CARD_H + GAP_Y);
            this.createCard(proj, cx, cy, CARD_W, CARD_H);
        });

        const rows = Math.ceil(PROJECTS.length / COLS);
        const totalH = PAD_T + rows * CARD_H + (rows - 1) * GAP_Y + 20;
        const visibleH = H - this.HEADER_H - this.FOOTER_H;
        this.maxScroll = Math.max(0, totalH - visibleH);
    }

    createCard(proj, x, y, w, h) {
        const sc = this.scrollCont;
        const status = getProjectStatus(proj.id);
        const sInfo = STATUS_TYPES[status];

        // Shadow
        const shad = this.add.graphics();
        shad.fillStyle(0x000000, 0.35);
        shad.fillRoundedRect(x + 5, y + 5, w, h, 10);
        sc.add(shad);

        // Card background
        const bg = this.add.graphics();
        const drawBg = (hover) => {
            bg.clear();
            bg.fillStyle(hover ? 0x1e1e42 : 0x131328, 0.97);
            bg.fillRoundedRect(x, y, w, h, 10);
            bg.lineStyle(2, hover ? 0x5555cc : 0x252550);
            bg.strokeRoundedRect(x, y, w, h, 10);
        };
        drawBg(false);
        sc.add(bg);

        // Status colour bar
        const sBar = this.add.graphics();
        sBar.fillStyle(sInfo.color);
        sBar.fillRoundedRect(x + 2, y + 2, w - 4, 5, { tl: 10, tr: 10, bl: 0, br: 0 });
        sc.add(sBar);

        // Name
        sc.add(this.add.text(x + 15, y + 22, proj.name.toUpperCase(), {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px',
            color: '#e0e0ff',
            wordWrap: { width: w - 120 }
        }));

        // Status label top-right
        sc.add(this.add.text(x + w - 12, y + 22, '● ' + sInfo.label, {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px',
            color: sInfo.hex
        }).setOrigin(1, 0));

        // Description
        sc.add(this.add.text(x + 15, y + 48, proj.description, {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px',
            color: '#778899',
            wordWrap: { width: w - 30 }
        }));

        // Tech tags
        const tagY = y + h - (this.isAdmin ? 80 : 40);
        let tagX = x + 15;
        proj.tech.forEach(tag => {
            const tw = tag.length * 7 + 14;
            const tg = this.add.graphics();
            tg.fillStyle(0x1e1e50);
            tg.fillRoundedRect(tagX, tagY, tw, 18, 4);
            sc.add(tg);
            sc.add(this.add.text(tagX + tw / 2, tagY + 9, tag, {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '6px',
                color: '#7788ff'
            }).setOrigin(0.5));
            tagX += tw + 7;
        });

        // Hover zone (invisible rectangle over card)
        const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h)
            .setAlpha(0.001).setInteractive({ cursor: 'pointer' });
        sc.add(hit);

        hit.on('pointerover', () => drawBg(true));
        hit.on('pointerout',  () => drawBg(false));

        if (!this.isAdmin && proj.url && proj.url !== '#') {
            hit.on('pointerdown', () => window.open(proj.url, '_blank'));
        }

        // Admin: status buttons (added AFTER hit rect so they sit on top and get input first)
        if (this.isAdmin) {
            this.addStatusButtons(proj, x, y, w, h, sc, sBar);
        }
    }

    addStatusButtons(proj, x, y, w, h, sc, sBar) {
        const current = getProjectStatus(proj.id);
        const btns = [
            { key: 'GOOD',        label: 'GOOD',  info: STATUS_TYPES.GOOD },
            { key: 'MAINTENANCE', label: 'MAINT', info: STATUS_TYPES.MAINTENANCE },
            { key: 'BROKEN',      label: 'BRKN',  info: STATUS_TYPES.BROKEN }
        ];

        const bh = 26, gap = 6;
        const bw = (w - 30 - gap * 2) / 3;
        const btnY = y + h - 36;

        sc.add(this.add.text(x + 15, btnY - 15, 'SET STATUS:', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '6px',
            color: '#44446688'
        }));

        btns.forEach((btn, i) => {
            const bx = x + 15 + i * (bw + gap);
            const isActive = current === btn.key;

            const bg2 = this.add.graphics();
            bg2.fillStyle(isActive ? btn.info.color : 0x0d0d22);
            bg2.fillRoundedRect(bx, btnY, bw, bh, 5);
            bg2.lineStyle(1.5, btn.info.color);
            bg2.strokeRoundedRect(bx, btnY, bw, bh, 5);
            sc.add(bg2);

            const txt = this.add.text(bx + bw / 2, btnY + bh / 2, btn.label, {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '6px',
                color: isActive ? '#000000' : btn.info.hex
            }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
            sc.add(txt);

            txt.on('pointerdown', (_p, _lx, _ly, e) => {
                e.stopPropagation();
                setProjectStatus(proj.id, btn.key);
                this.scene.restart();
            });
        });
    }
}
