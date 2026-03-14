class AdminScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AdminScene' });
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.drawBg(W, H);

        // Back button
        const back = this.add.text(20, 20, '[ < BACK ]', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px', color: '#556677'
        }).setInteractive({ cursor: 'pointer' });
        back.on('pointerover', () => back.setColor('#aabbcc'));
        back.on('pointerout',  () => back.setColor('#556677'));
        back.on('pointerdown', () => this.scene.start('MainScene'));

        if (isAdminLoggedIn()) {
            this.showAdminPanel(W, H);
        } else {
            this.showLoginForm(W, H);
        }
    }

    drawBg(W, H) {
        const g = this.add.graphics();
        g.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a00, 0x1a0a00, 1);
        g.fillRect(0, 0, W, H);

        g.lineStyle(1, 0x221100, 0.4);
        for (let x = 0; x < W; x += 60) g.lineBetween(x, 0, x, H);
        for (let y = 0; y < H; y += 60) g.lineBetween(0, y, W, y);
    }

    // ─── LOGIN FORM ───────────────────────────────────────────────

    showLoginForm(W, H) {
        this.add.text(W / 2, 80, 'ADMIN LOGIN', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '26px', color: '#ffaa00',
            stroke: '#331100', strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(W / 2, 130, 'ENTER PASSWORD TO MANAGE PROJECT STATUSES', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px', color: '#664422'
        }).setOrigin(0.5);

        // DOM password input
        this.pwForm = this.add.dom(W / 2, H / 2 - 30).createFromHTML(`
            <input id="pw-input" type="password"
                   placeholder="password"
                   autocomplete="current-password"
                   style="
                       background: #0a0808;
                       color: #ffaa00;
                       border: 2px solid #ffaa00;
                       border-radius: 6px;
                       padding: 12px 18px;
                       font-size: 16px;
                       width: 280px;
                       text-align: center;
                       font-family: 'Press Start 2P', monospace;
                       outline: none;
                   ">
        `);

        // Keyboard enter
        this.pwForm.addListener('keydown');
        this.pwForm.on('keydown', (e) => {
            if (e.key === 'Enter') this.doLogin();
        });

        // Login button
        this.buildButton(W / 2 - 80, H / 2 + 55, 160, 44, 'LOGIN', '#ffaa00', 0xffaa00, () => this.doLogin());

        // Error text (hidden)
        this.errorText = this.add.text(W / 2, H / 2 + 135, '', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px', color: '#ff4444'
        }).setOrigin(0.5);

        // Hint
        this.add.text(W / 2, H - 50, 'DEFAULT PASSWORD: admin   |   CHANGE HASH IN js/config.js', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px', color: '#332211'
        }).setOrigin(0.5);
    }

    async doLogin() {
        const el = document.getElementById('pw-input');
        if (!el) return;
        const val = el.value;
        const ok = await checkPassword(val);
        if (ok) {
            setAdminLoggedIn(true);
            this.scene.start('MainScene');
        } else {
            this.errorText.setText('WRONG PASSWORD!');
            this.cameras.main.shake(200, 0.008);
            el.value = '';
        }
    }

    // ─── ADMIN PANEL ─────────────────────────────────────────────

    showAdminPanel(W, H) {
        this.add.text(W / 2, 50, 'ADMIN PANEL', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '22px', color: '#ffaa00',
            stroke: '#331100', strokeThickness: 5
        }).setOrigin(0.5);

        this.add.text(W / 2, 88, 'SET PROJECT STATUSES — ONLY YOU CAN SEE THIS', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px', color: '#664422'
        }).setOrigin(0.5);

        // Project list
        const COLS = 2;
        const ROW_H = 90;
        const COL_W = 570;
        const startX = W / 2 - (COLS * COL_W) / 2 + 10;
        const startY = 130;

        PROJECTS.forEach((proj, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const px = startX + col * COL_W;
            const py = startY + row * ROW_H;
            this.buildProjectRow(proj, px, py, COL_W - 20);
        });

        // Logout
        this.buildButton(W / 2 - 90, H - 55, 180, 38, 'LOGOUT', '#ff6644', 0xff6644, () => {
            setAdminLoggedIn(false);
            this.scene.start('MainScene');
        });
    }

    buildProjectRow(proj, x, y, rowW) {
        const status = getProjectStatus(proj.id);

        // Row bg
        const bg = this.add.graphics();
        bg.fillStyle(0x131318, 0.8);
        bg.fillRoundedRect(x, y, rowW, 76, 8);
        bg.lineStyle(1, 0x222233);
        bg.strokeRoundedRect(x, y, rowW, 76, 8);

        // Status colour accent
        const sInfo = STATUS_TYPES[status];
        bg.fillStyle(sInfo.color);
        bg.fillRoundedRect(x + 2, y + 2, 4, 72, { tl: 8, tr: 0, bl: 8, br: 0 });

        // Project name
        this.add.text(x + 18, y + 14, proj.name.toUpperCase(), {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px', color: '#ddddee',
            wordWrap: { width: rowW - 280 }
        });

        // Status buttons
        const btns = [
            { key: 'GOOD',        label: 'GOOD',  info: STATUS_TYPES.GOOD },
            { key: 'MAINTENANCE', label: 'MAINT', info: STATUS_TYPES.MAINTENANCE },
            { key: 'BROKEN',      label: 'BRKN',  info: STATUS_TYPES.BROKEN }
        ];

        const bw = 72, bh = 26, gap = 5;
        const bStartX = x + rowW - btns.length * (bw + gap) - 5;
        const bStartY = y + 25;

        btns.forEach((btn, i) => {
            const bx = bStartX + i * (bw + gap);
            const isActive = status === btn.key;

            const bgG = this.add.graphics();
            const draw = (hov) => {
                bgG.clear();
                bgG.fillStyle(isActive ? btn.info.color : (hov ? 0x1a1a33 : 0x0a0a18));
                bgG.fillRoundedRect(bx, bStartY, bw, bh, 5);
                bgG.lineStyle(1.5, btn.info.color, hov ? 1 : 0.7);
                bgG.strokeRoundedRect(bx, bStartY, bw, bh, 5);
            };
            draw(false);

            const txt = this.add.text(bx + bw / 2, bStartY + bh / 2, btn.label, {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '6px',
                color: isActive ? '#000000' : btn.info.hex
            }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

            txt.on('pointerover', () => draw(true));
            txt.on('pointerout',  () => draw(isActive));
            txt.on('pointerdown', () => {
                setProjectStatus(proj.id, btn.key);
                this.scene.restart();
            });
        });

        // Current status label
        this.add.text(x + 18, y + 50, '● ' + status, {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px', color: sInfo.hex
        });
    }

    buildButton(x, y, w, h, label, col, hcol, cb) {
        const bgG = this.add.graphics();
        const draw = (hov) => {
            bgG.clear();
            if (hov) {
                bgG.fillStyle(hcol, 0.15);
                bgG.fillRoundedRect(x, y, w, h, 8);
            }
            bgG.lineStyle(2, hcol, hov ? 1 : 0.6);
            bgG.strokeRoundedRect(x, y, w, h, 8);
        };
        draw(false);

        const txt = this.add.text(x + w / 2, y + h / 2, label, {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '11px', color: col
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

        txt.on('pointerover', () => draw(true));
        txt.on('pointerout',  () => draw(false));
        txt.on('pointerdown', cb);
    }
}
