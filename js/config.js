// ============================================================
//  EDIT YOUR PROJECTS HERE
// ============================================================
const PROJECTS = [
    {
        id: 'proj1',
        name: 'Project Alpha',
        description: 'A cool web application with modern UI',
        url: '#',
        tech: ['HTML', 'CSS', 'JS']
    },
    {
        id: 'proj2',
        name: 'Project Beta',
        description: 'Python automation and scripting tool',
        url: '#',
        tech: ['Python']
    },
    {
        id: 'proj3',
        name: 'Game Engine',
        description: 'Custom 2D game engine from scratch',
        url: '#',
        tech: ['C++', 'OpenGL']
    },
    {
        id: 'proj4',
        name: 'Discord Bot',
        description: 'Feature-rich Discord bot with commands',
        url: '#',
        tech: ['Node.js']
    },
    {
        id: 'proj5',
        name: 'Portfolio Page',
        description: 'This very page — built with Phaser.js!',
        url: '#',
        tech: ['Phaser.js', 'JS']
    },
    {
        id: 'proj6',
        name: 'API Service',
        description: 'REST API with auth and database',
        url: '#',
        tech: ['Express', 'MongoDB']
    }
];

// ============================================================
//  ADMIN PASSWORD HASH
//  Default password: "admin"
//  To change: open browser console and run:
//    crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'))
//      .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
//  Then paste the result below.
// ============================================================
const ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

// ============================================================
//  STATUS DEFINITIONS  (do not edit unless you want new status types)
// ============================================================
const STATUS_TYPES = {
    GOOD:        { label: 'GOOD',        color: 0x00ff88, hex: '#00ff88' },
    MAINTENANCE: { label: 'MAINTENANCE', color: 0xffaa00, hex: '#ffaa00' },
    BROKEN:      { label: 'BROKEN',      color: 0xff4444, hex: '#ff4444' }
};

// ---- helpers ----

function getProjectStatus(id) {
    return localStorage.getItem('status_' + id) || 'GOOD';
}

function setProjectStatus(id, status) {
    localStorage.setItem('status_' + id, status);
}

function isAdminLoggedIn() {
    return sessionStorage.getItem('admin_auth') === 'true';
}

function setAdminLoggedIn(val) {
    sessionStorage.setItem('admin_auth', val ? 'true' : 'false');
}

async function checkPassword(input) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    const hex = [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
    return hex === ADMIN_PASSWORD_HASH;
}
