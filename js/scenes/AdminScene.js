const ADMIN_COL = {
    bg:        0xfff8f0,
    surface:   0xffffff,
    container: 0xf2f0f0,
    border:    0x8f4816,   // secondary (desert/earth)
    onSurface: 0x2e2f2f,
    variant:   0x5b5b5c,
    primary:   0x256900,
    secondary: 0x8f4816,
    error:     0xb02500,
};

const A_HEAD = "'Space Grotesk', sans-serif";
const A_BODY = "'Work Sans', sans-serif";

class AdminScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AdminScene' });
        this.typedPw  = '';
        this.cursorOn = true;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        slideIn(this);

        this.drawBg(W, H);
        this.buildHeader(W);
        if (isAdminLoggedIn()) {
            this.showPanel(W, H);
        } else {
            this.showLogin(W, H);
        }
    }

    drawBg(W, H) {
        const g = this.add.graphics();
        g.fillStyle(ADMIN_COL.bg);
        g.fillRect(0, 0, W, H);
        // Voxel grid — from Stitch
        g.fillStyle(0xffc5a5, 0.4);
        for (let gx = 0; gx <= W; gx += 32)
            for (let gy = 0; gy <= H; gy += 32)
                g.fillCircle(gx, gy, 1);
    }

    buildHeader(W) {
        const g = this.add.graphics();
        g.fillStyle(0xe9e8e8); // surface-container
        g.fillRect(0, 0, W, 72);
        g.fillStyle(ADMIN_COL.secondary);
        g.fillRect(0, 68, W, 4); // 4px border-b

        this.add.text(20, 36, '← BACK', {
            fontFamily: A_HEAD, fontSize: '14px', fontStyle: 'bold',
            color: '#8f4816'
        }).setOrigin(0, 0.5).setInteractive({ cursor: 'pointer' })
          .on('pointerover', function() { this.setColor('#5a2e0e'); })
          .on('pointerout',  function() { this.setColor('#8f4816'); })
          .on('pointerdown', () => fadeTo(this, 'MainScene'));

        this.add.text(W / 2, 36, isAdminLoggedIn() ? '⚙️  ADMIN PANEL' : '🔒  ADMIN LOGIN', {
            fontFamily: A_HEAD, fontSize: '26px', fontStyle: 'bold',
            color: '#8f4816', letterSpacing: 2
        }).setOrigin(0.5);
    }

    // ── LOGIN ─────────────────────────────────────────────────────

    showLogin(W, H) {
        this.add.text(W / 2, 100, 'ENTER YOUR PASSWORD TO MANAGE PROJECT STATUSES', {
            fontFamily: A_HEAD, fontSize: '10px',
            color: '#5b5b5c', letterSpacing: 1
        }).setOrigin(0.5);

        // Excavated input box (Stitch: surface-container-highest, 4px border bottom on focus)
        const ibx = W / 2 - 200, iby = H / 2 - 50, ibw = 400, ibh = 80;
        const ibg = this.add.graphics();
        ibg.fillStyle(0xffffff);
        ibg.fillRect(ibx, iby, ibw, ibh);
        // 4px bottom border (Stitch: "excavated field")
        ibg.fillStyle(ADMIN_COL.secondary);
        ibg.fillRect(ibx, iby + ibh - 4, ibw, 4);
        // Hard shadow
        ibg.fillStyle(0x000000, 0.12);
        ibg.fillRect(ibx + 4, iby + 4, ibw, ibh);
        // Redraw card on top
        ibg.fillStyle(0xffffff);
        ibg.fillRect(ibx, iby, ibw, ibh);
        ibg.fillStyle(ADMIN_COL.secondary);
        ibg.fillRect(ibx, iby + ibh - 4, ibw, 4);

        this.add.text(W / 2, iby + 20, 'PASSWORD', {
            fontFamily: A_HEAD, fontSize: '10px', fontStyle: 'bold',
            color: '#8f4816', letterSpacing: 2
        }).setOrigin(0.5);

        this.inputDisplay = this.add.text(W / 2, iby + 54, '|', {
            fontFamily: A_BODY, fontSize: '22px', fontStyle: 'bold',
            color: '#2e2f2f'
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 500, repeat: -1,
            callback: () => { this.cursorOn = !this.cursorOn; this.refreshInput(); }
        });

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

        this.makeBtn(W / 2, H / 2 + 80, 180, 44, 'LOGIN', ADMIN_COL.primary, '#d5ffbb', () => this.doLogin());

        this.errorText = this.add.text(W / 2, H / 2 + 148, '', {
            fontFamily: A_HEAD, fontSize: '12px', fontStyle: 'bold',
            color: '#b02500'
        }).setOrigin(0.5);

        this.add.text(W / 2, H - 28, 'Default password: admin   ·   Change hash in js/config.js', {
            fontFamily: A_BODY, fontSize: '11px',
            color: '#adadad'
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
            fadeTo(this, 'MainScene');
        } else {
            this.errorText.setText('WRONG PASSWORD — TRY AGAIN');
            this.cameras.main.shake(180, 0.009);
            this.typedPw = '';
            this.refreshInput();
        }
    }

    // ── ADMIN PANEL ───────────────────────────────────────────────

    showPanel(W, H) {
        this.add.text(W / 2, 96, 'CLICK A STATUS TO CHANGE IT  ·  VISITORS CAN ONLY VIEW', {
            fontFamily: A_HEAD, fontSize: '9px',
            color: '#5b5b5c', letterSpacing: 1
        }).setOrigin(0.5);

        const COLS  = 2;
        const GAP_X = 14;
        const GAP_Y = 10;
        const ROW_H = Math.min(82, Math.floor((H - 190) / Math.ceil(PROJECTS.length / COLS)) - GAP_Y);
        const ROW_W = Math.floor((W - 60 - GAP_X) / COLS);
        const startX = (W - (COLS * ROW_W + GAP_X)) / 2;
        const startY = 120;
        const totalH = Math.ceil(PROJECTS.length / COLS) * (ROW_H + GAP_Y) - GAP_Y;

        PROJECTS.forEach((proj, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            this.buildRow(proj, startX + col * (ROW_W + GAP_X), startY + row * (ROW_H + GAP_Y), ROW_W, ROW_H);
        });

        this.makeBtn(W / 2, startY + totalH + 30, 180, 40, 'LOGOUT', ADMIN_COL.error, '#ffefec', () => {
            setAdminLoggedIn(false);
            fadeTo(this, 'MainScene');
        });
    }

    buildRow(proj, x, y, w, h) {
        const status = getProjectStatus(proj.id);
        const sInfo  = STATUS_TYPES[status];

        // Hard shadow
        const g = this.add.graphics();
        g.fillStyle(0x000000, 0.12);
        g.fillRect(x + 4, y + 4, w, h);
        // Card
        g.fillStyle(0xffffff);
        g.fillRect(x, y, w, h);
        // 4px left bar in status color
        g.fillStyle(sInfo.color);
        g.fillRect(x, y, 8, h);
        // 4px bottom border
        g.fillStyle(0xe9e8e8);
        g.fillRect(x, y + h - 3, w, 3);

        this.add.text(x + 18, y + h / 2 - 8, proj.name, {
            fontFamily: A_HEAD, fontSize: '13px', fontStyle: 'bold',
            color: '#2e2f2f'
        });

        this.add.text(x + 18, y + h / 2 + 10, sInfo.label, {
            fontFamily: A_BODY, fontSize: '11px',
            color: sInfo.hex
        });

        const btns = [
            { key: 'GOOD',        label: '✅ Works',  info: STATUS_TYPES.GOOD },
            { key: 'MAINTENANCE', label: '🔧 Fixing', info: STATUS_TYPES.MAINTENANCE },
            { key: 'BROKEN',      label: '💀 Broken', info: STATUS_TYPES.BROKEN }
        ];

        const bw = 68, bh = h - 16, gap = 5;
        const bStartX = x + w - btns.length * (bw + gap) - 8;
        const bStartY = y + 8;

        btns.forEach((btn, i) => {
            const bx      = bStartX + i * (bw + gap);
            const isActive = status === btn.key;
            const bgG     = this.add.graphics();

            const draw = (hov) => {
                bgG.clear();
                bgG.fillStyle(isActive ? btn.info.color : (hov ? 0xe3e2e2 : 0xf2f0f0));
                bgG.fillRect(bx, bStartY, bw, bh);
                bgG.fillStyle(0x000000, isActive ? 0.3 : 0.12);
                bgG.fillRect(bx, bStartY + bh - 3, bw, 3);
                bgG.fillRect(bx + bw - 3, bStartY, 3, bh);
            };
            draw(false);

            const txt = this.add.text(bx + bw / 2, bStartY + bh / 2, btn.label, {
                fontFamily: A_HEAD, fontSize: '10px', fontStyle: 'bold',
                color: isActive ? '#ffffff' : btn.info.hex
            }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

            txt.on('pointerover', () => draw(true));
            txt.on('pointerout',  () => draw(false));
            txt.on('pointerdown', () => { setProjectStatus(proj.id, btn.key); this.scene.restart(); });
        });
    }

    makeBtn(cx, cy, w, h, label, bgCol, txCol, cb) {
        const bx = cx - w / 2, by = cy - h / 2;
        const bgG = this.add.graphics();

        const draw = (hov) => {
            bgG.clear();
            bgG.fillStyle(bgCol, hov ? 1 : 0.85);
            bgG.fillRect(bx, by, w, h);
            bgG.fillStyle(0x000000, hov ? 0.35 : 0.25);
            bgG.fillRect(bx, by + h - 4, w, 4);
            bgG.fillRect(bx + w - 4, by, 4, h);
            bgG.fillStyle(0xffffff, 0.2);
            bgG.fillRect(bx, by, w, 4);
            bgG.fillRect(bx, by, 4, h);
        };
        draw(false);

        this.add.text(cx, cy, label, {
            fontFamily: A_HEAD, fontSize: '13px', fontStyle: 'bold', color: txCol
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' })
          .on('pointerover', () => draw(true))
          .on('pointerout',  () => draw(false))
          .on('pointerdown', cb);
    }
}
