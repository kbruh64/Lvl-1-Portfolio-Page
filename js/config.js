// ============================================================
//  YOUR PROJECTS — edit name, description, url, tech as needed
// ============================================================
const PROJECTS = [
    {
        id: 'super-bros',
        name: 'Super Bros',
        description: 'Two-player platform fighter with themes & SFX',
        url: 'https://super-bros-dun.vercel.app/',
        tech: ['HTML', 'CSS', 'JS']
    },
    {
        id: 'snake-io',
        name: 'Snake.io',
        description: 'Multiplayer snake with skins & leaderboard',
        url: 'https://snake-io-iota.vercel.app/',
        tech: ['HTML', 'Canvas', 'JS']
    },
    {
        id: 'image-animator',
        name: 'Image Animator',
        description: 'AI-powered image animator & GIF frame extractor',
        url: 'https://image-animator-gamma.vercel.app/',
        tech: ['TensorFlow.js', 'Canvas']
    },
    {
        id: '2player-shooter',
        name: '2 Player Shooter',
        description: 'Local co-op Phaser shooter with weapons & health',
        url: 'https://2playergameyay.vercel.app/',
        tech: ['Phaser.js', 'JS']
    },
    {
        id: 'nutella-sandwich',
        name: 'Nutella Sandwich',
        description: 'Interactive Phaser tutorial — step by step guide',
        url: 'https://how-to-make-a-nutella-sandwich.vercel.app/',
        tech: ['Phaser.js', 'JS']
    },
    {
        id: 'mace-time',
        name: 'Mace Time',
        description: 'Smash mobs with a Minecraft mace — action game',
        url: '#',
        tech: ['JS']
    },
    {
        id: '2d-minecraft',
        name: '2D Minecraft',
        description: 'Minecraft — but in 2D, fully in the browser',
        url: '#',
        tech: ['Canvas', 'JS']
    },
    {
        id: 'click-it',
        name: 'Click It!',
        description: 'Idle clicker with 40+ skins, dimensions & achievements',
        url: 'https://first-repo-gray.vercel.app/',
        tech: ['HTML', 'CSS', 'JS']
    },
    {
        id: 'voidpet-dungeon',
        name: 'Voidpet Dungeon',
        description: 'Canvas dungeon adventure with void creatures',
        url: 'https://monsterpet-dungeon.vercel.app/',
        tech: ['Canvas', 'JS']
    },
    {
        id: 'value-scanner',
        name: 'Value Scanner',
        description: 'Draw a circle around any item — AI estimates its worth',
        url: 'https://value-scanner-e0p8dxaxt-felix-aos-projects.vercel.app/',
        tech: ['Claude AI', 'JS']
    }
];

// ============================================================
//  ADMIN PASSWORD HASH
//  Default password: "admin"
//  To change: open browser console and run:
//    crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'))
//      .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
//  Paste the result below.
// ============================================================
const ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

// ============================================================
//  STATUS DEFINITIONS
// ============================================================
const STATUS_TYPES = {
    GOOD:        { label: 'GOOD',        color: 0x22cc66, hex: '#22cc66' },
    MAINTENANCE: { label: 'MAINTENANCE', color: 0xff9900, hex: '#ff9900' },
    BROKEN:      { label: 'BROKEN',      color: 0xff3333, hex: '#ff3333' }
};

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
