class AdminScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AdminScene' });
        this.typedPw  = '';
        this.cursorOn = true;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.drawBg(W, H);
        this.buildHeader(W, H);

        if (isAdminLoggedIn()) {
            this.showPanel(W, H);
        } else {
            this.showLogin(W, H);
        }
    }

    drawBg(W, H) {
        this.add.rectangle(0, 0, W, H, 0xfff8f0).setOrigin(0, 0);
        const g = this.add.graphics();
        g.fillStyle(0xffcc99, 0.3);
        for (let x = 30; x < W; x += 40)
            for (let y = 30; y < H; y += 40)
                g.fillCircle(x, y, 1.5);
    }

    buildHeader(W, H) {
        const hg = this.add.graphics();
        hg.fillStyle(0xffffff);
        hg.fillRect(0, 0, W, 72);
        hg.lineStyle(2, 0xffddc0);
        hg.lineBetween(0, 72, W, 72);
        hg.fillStyle(0xff9900);
        hg.fillRect(0, 69, W, 3);

        const back = this.add.text(20, 20, '[ < BACK ]', {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '10px', color: '#aabbcc'
        }).setInteractive({ cursor: 'pointer' });
        back.on('pointerover', () => back.setColor('#ff9900'));
        back.on('pointerout',  () => back.setColor('#aabbcc'));
        back.on('pointerdown', () => this.scene.start('MainScene'));

        this.add.text(W / 2, 36, isAdminLoggedIn() ? 'ADMIN PANEL' : 'ADMIN LOGIN', {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '20px', color: '#ff9900'
        }).setOrigin(0.5);
    }

    // ── LOGIN ─────────────────────────────────────────────────────

    showLogin(W, H) {
        this.add.text(W / 2, 108, 'ENTER YOUR PASSWORD TO MANAGE PROJECT STATUSES', {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '7px', color: '#cc8822'
        }).setOrigin(0.5);

        // Input box
        const ibg = this.add.graphics();
        ibg.fillStyle(0xffffff);
        ibg.fillRoundedRect(W / 2 - 190, H / 2 - 38, 380, 76, 12);
        ibg.lineStyle(2, 0xff9900);
        ibg.strokeRoundedRect(W / 2 - 190, H / 2 - 38, 380, 76, 12);

        this.add.text(W / 2, H / 2 - 22, 'PASSWORD', {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '7px', color: '#ccaa66'
        }).setOrigin(0.5);

        this.inputDisplay = this.add.text(W / 2, H / 2 + 10, '|', {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '20px', color: '#1a1a3a'
        }).setOrigin(0.5);

        // Blinking cursor
        this.time.addEvent({
            delay: 500, repeat: -1,
            callback: () => { this.cursorOn = !this.cursorOn; this.refreshInput(); }
        });

        // Keyboard
        this.input.keyboard.on('keydown', (e) => {
            if (e.key === 'Backspace') {
                this.typedPw = this.typedPw.slice(0, -1);
                e.preventDefault();
            } else if (e.key === 'Enter') {
                this.doLogin();
            } else if (e.key.length === 1 && this.typedPw.length < 24) {
                this.typedPw += e.key;
            }
            this.refreshInput();
        });

        this.makeBtn(W / 2, H / 2 + 90, 160, 42, 'LOGIN', '#ff9900', 0xff9900, () => this.doLogin());

        this.errorText = this.add.text(W / 2, H / 2 + 158, '', {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '10px', color: '#ee3333'
        }).setOrigin(0.5);

        this.add.text(W / 2, H - 36, 'DEFAULT PASSWORD: admin   ·   CHANGE HASH IN js/config.js', {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '7px', color: '#ddccbb'
        }).setOrigin(0.5);
    }

    refreshInput() {
        const stars  = '*'.repeat(this.typedPw.length);
        const cursor = this.cursorOn ? '|' : ' ';
        this.inputDisplay.setText(stars + cursor);
    }

    async doLogin() {
        const ok = await checkPassword(this.typedPw);
        if (ok) {
            setAdminLoggedIn(true);
            this.scene.start('MainScene');
        } else {
            this.errorText.setText('WRONG PASSWORD — TRY AGAIN');
            this.cameras.main.shake(180, 0.009);
            this.typedPw = '';
            this.refreshInput();
        }
    }

    // ── ADMIN PANEL ───────────────────────────────────────────────

    showPanel(W, H) {
        this.add.text(W / 2, 105, 'CLICK A STATUS TO CHANGE IT  ·  OTHERS ONLY SEE, NOT CHANGE', {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '7px', color: '#cc8822'
        }).setOrigin(0.5);

        // Dynamic 2-column layout, auto-row
        const COLS  = 2;
        const GAP_X = 14;
        const GAP_Y = 10;
        const ROW_H = Math.min(88, Math.floor((H - 180) / Math.ceil(PROJECTS.length / COLS)) - GAP_Y);
        const ROW_W = Math.floor((W - 60 - GAP_X) / COLS);
        const totalH = Math.ceil(PROJECTS.length / COLS) * (ROW_H + GAP_Y) - GAP_Y;
        const startX = (W - (COLS * ROW_W + GAP_X)) / 2;
        const startY = 128;

        PROJECTS.forEach((proj, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            this.buildRow(proj,
                startX + col * (ROW_W + GAP_X),
                startY + row * (ROW_H + GAP_Y),
                ROW_W, ROW_H);
        });

        // Logout
        this.makeBtn(W / 2, startY + totalH + 30, 180, 38, 'LOGOUT', '#ee4411', 0xee4411, () => {
            setAdminLoggedIn(false);
            this.scene.start('MainScene');
        });
    }

    buildRow(proj, x, y, w, h) {
        const status = getProjectStatus(proj.id);
        const sInfo  = STATUS_TYPES[status];

        // Card
        const bg = this.add.graphics();
        bg.fillStyle(0xffffff);
        bg.fillRoundedRect(x, y, w, h, 8);
        bg.lineStyle(1.5, 0xffddc0);
        bg.strokeRoundedRect(x, y, w, h, 8);
        bg.fillStyle(sInfo.color);
        bg.fillRoundedRect(x + 1, y + 1, 5, h - 2, { tl: 8, tr: 0, bl: 8, br: 0 });

        // Name
        this.add.text(x + 16, y + 10, proj.name.toUpperCase(), {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '8px', color: '#1a1a3a',
            wordWrap: { width: w - 220 }
        });

        // Current status label
        this.add.text(x + 16, y + h - 18, '● ' + status, {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '6px', color: sInfo.hex
        });

        // Status buttons
        const btns = [
            { key: 'GOOD',        label: '✅ works', info: STATUS_TYPES.GOOD },
            { key: 'MAINTENANCE', label: '🔧 fixing', info: STATUS_TYPES.MAINTENANCE },
            { key: 'BROKEN',      label: '💀 rip',   info: STATUS_TYPES.BROKEN }
        ];

        const bw = 60, bh = h - 20, gap = 5;
        const bStartX = x + w - btns.length * (bw + gap) - 6;
        const bStartY = y + 10;

        btns.forEach((btn, i) => {
            const bx      = bStartX + i * (bw + gap);
            const isActive = status === btn.key;
            const bgG     = this.add.graphics();

            const draw = (hov) => {
                bgG.clear();
                bgG.fillStyle(isActive ? btn.info.color : (hov ? 0xfff0e0 : 0xf9f9f9));
                bgG.fillRoundedRect(bx, bStartY, bw, bh, 5);
                bgG.lineStyle(1.5, btn.info.color, isActive || hov ? 1 : 0.45);
                bgG.strokeRoundedRect(bx, bStartY, bw, bh, 5);
            };
            draw(false);

            const txt = this.add.text(bx + bw / 2, bStartY + bh / 2, btn.label, {
                fontFamily: "'Poppins', sans-serif",
                fontSize: '6px',
                color: isActive ? '#ffffff' : btn.info.hex
            }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

            txt.on('pointerover', () => draw(true));
            txt.on('pointerout',  () => draw(false));
            txt.on('pointerdown', () => {
                setProjectStatus(proj.id, btn.key);
                this.scene.restart();
            });
        });
    }

    makeBtn(cx, cy, w, h, label, col, hcol, cb) {
        const bgG = this.add.graphics();
        const draw = (hov) => {
            bgG.clear();
            bgG.fillStyle(hcol, hov ? 0.14 : 0.07);
            bgG.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
            bgG.lineStyle(2, hcol, hov ? 1 : 0.55);
            bgG.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
        };
        draw(false);

        const txt = this.add.text(cx, cy, label, {
            fontFamily: "'Poppins', sans-serif",
            fontSize: '11px', color: col
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

        txt.on('pointerover', () => draw(true));
        txt.on('pointerout',  () => draw(false));
        txt.on('pointerdown', cb);
    }
}
