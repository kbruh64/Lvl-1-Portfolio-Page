// ============================================================
//  YOUR PROJECTS — edit name, description, url, tech as needed
// ============================================================
const PROJECTS = [
    {
        id: 'super-bros',
        name: '🥊 Super Bros',
        description: 'A 2-player platform brawler with multiple themes and sound effects.',
        url: 'https://super-bros-dun.vercel.app/',
        tech: ['HTML', 'CSS', 'JS']
    },
    {
        id: 'snake-io',
        name: '🐍 Snake.io',
        description: 'Multiplayer snake game with custom skins and a live leaderboard.',
        url: 'https://snake-io-iota.vercel.app/',
        tech: ['Canvas', 'JS']
    },
    {
        id: 'image-animator',
        name: '✨ Image Animator',
        description: 'Upload any image and animate it with AI. Also extracts GIF frames.',
        url: 'https://image-animator-gamma.vercel.app/',
        tech: ['TensorFlow.js', 'Canvas']
    },
    {
        id: '2player-shooter',
        name: '🔫 2 Player Shooter',
        description: 'Local co-op shooter where two players share one keyboard.',
        url: 'https://2playergameyay.vercel.app/',
        tech: ['Phaser.js', 'JS']
    },
    {
        id: 'nutella-sandwich',
        name: '🍞 Nutella Sandwich',
        description: 'An interactive step-by-step guide to making a Nutella sandwich.',
        url: 'https://how-to-make-a-nutella-sandwich.vercel.app/',
        tech: ['Phaser.js', 'JS']
    },
    {
        id: 'mace-time',
        name: '⚒️ Mace Time',
        description: 'Use a Minecraft mace to smash mobs in this fast-paced action game.',
        url: '#',
        tech: ['JS']
    },
    {
        id: '2d-minecraft',
        name: '⛏️ 2D Minecraft',
        description: 'A 2D browser recreation of Minecraft. No download required.',
        url: '#',
        tech: ['Canvas', 'JS']
    },
    {
        id: 'click-it',
        name: '🖱️ Click It!',
        description: 'Idle clicker game with 40+ skins, 20+ dimensions and achievements.',
        url: 'https://first-repo-gray.vercel.app/',
        tech: ['HTML', 'CSS', 'JS']
    },
    {
        id: 'voidpet-dungeon',
        name: '👾 Voidpet Dungeon',
        description: 'A canvas-based dungeon crawler featuring void creatures.',
        url: 'https://monsterpet-dungeon.vercel.app/',
        tech: ['Canvas', 'JS']
    },
    {
        id: 'value-scanner',
        name: '🔍 Value Scanner',
        description: 'Draw a circle around any item and Claude AI estimates its value.',
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
    GOOD:        { label: '✅ works',      color: 0x22cc66, hex: '#22cc66' },
    MAINTENANCE: { label: '🔧 fixing...',  color: 0xff9900, hex: '#ff9900' },
    BROKEN:      { label: '💀 rip',        color: 0xff3333, hex: '#ff3333' }
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
