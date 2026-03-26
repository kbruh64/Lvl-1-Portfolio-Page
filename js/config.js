// ============================================================
//  YOUR PROJECTS — edit name, description, url, tech as needed
// ============================================================
const PROJECTS = [
    {
        id: 'super-bros',
        name: '🥊 Super Bros',
        description: 'A 2-player platform brawler with multiple themes and sound effects.',
        url: 'https://super-bros-dun.vercel.app/',
        tech: ['HTML', 'CSS', 'JS'],
        story: "Hi, I'm Felix and I built Super Bros. It's a fighting game that lets two friends battle each other right in the browser — no download needed. I built this because I wanted something my friends and I could play together on one computer.\n\nThe feature I'm most proud of is the theme system, because it completely changes the look and feel of the game depending on which one you pick. This was challenging because every colour in the UI had to adapt to the theme, and I solved it by storing all colours in a single theme object so I only had to swap one thing.",
        featured: true
    },
    {
        id: 'snake-io',
        name: '🐍 Snake.io',
        description: 'Multiplayer snake game with custom skins and a live leaderboard.',
        url: 'https://snake-io-iota.vercel.app/',
        tech: ['Canvas', 'JS'],
        story: "Hi, I'm Felix and I built Snake.io. It's a multiplayer snake game that adds custom skins and a live leaderboard to the classic formula. I built this because Snake is one of my all-time favourite games and I wanted to make my own version with more personality.\n\nThe feature I'm most proud of is the skin system, because you can pick from Galaxy, Lava, Ice and more — each one looks totally different. This was challenging because each skin had to render correctly at every frame on the canvas, and I solved it by pre-computing each skin as a colour palette that gets applied at draw time.",
        featured: true
    },
    {
        id: 'image-animator',
        name: '✨ Image Animator',
        description: 'Upload any image and animate it with AI. Also extracts GIF frames.',
        url: 'https://image-animator-gamma.vercel.app/',
        tech: ['TensorFlow.js', 'Canvas'],
        story: "Hi, I'm Felix and I built Image Animator. It's an AI tool that takes any still image and brings it to life with animations like Breathe, Glitch, and Ripple. I built this because I thought it would be really cool to make photos move without needing any video editing software.\n\nThe feature I'm most proud of is the AI object detection, because it uses TensorFlow.js to find objects in your image before animating them. This was challenging because machine learning in the browser is really complex, and I solved it by reading through the COCO-SSD documentation and experimenting until it worked.",
        featured: true
    },
    {
        id: '2player-shooter',
        name: '🔫 2 Player Shooter',
        description: 'Local co-op shooter where two players share one keyboard.',
        url: 'https://2playergameyay.vercel.app/',
        tech: ['Phaser.js', 'JS'],
        story: "Hi, I'm Felix and I built 2 Player Shooter. It's a local multiplayer game where two players fight on the same keyboard — one using WASD and the other using arrow keys. I built this because I wanted to play something with my little brother Issac without needing two devices.\n\nThe feature I'm most proud of is the weapon variety, because each gun feels different and changes how you play. This was challenging because both players sharing one keyboard can cause key conflicts, and I solved it by carefully choosing key mappings that don't interfere with each other.",
    },
    {
        id: 'nutella-sandwich',
        name: '🍞 Nutella Sandwich',
        description: 'An interactive step-by-step guide to making a Nutella sandwich.',
        url: 'https://how-to-make-a-nutella-sandwich.vercel.app/',
        tech: ['Phaser.js', 'JS'],
        story: "Hi, I'm Felix and I built Nutella Sandwich. It's an interactive game that walks you through every step of making a Nutella sandwich — clicking to advance each stage. I built this as a fun first Phaser.js project to learn the framework in a low-pressure way.\n\nThe feature I'm most proud of is that it actually works as a real recipe guide, which makes people laugh. This was challenging because I was learning Phaser.js at the same time as building it, and I solved it by starting with a simple click-to-advance mechanic and building from there.",
    },
    {
        id: 'mace-time',
        name: '⚒️ Mace Time',
        description: 'Use a Minecraft mace to smash mobs in this fast-paced action game.',
        url: '#',
        tech: ['JS'],
        story: "Hi, I'm Felix and I built Mace Time. It's an action game inspired by Minecraft where you swing a mace to smash mobs as fast as possible. I built this because the Minecraft mace update was huge and I wanted to make a game around it.\n\nThe feature I'm most proud of is the mob AI, because the enemies move in ways that feel unpredictable. This was challenging because pathfinding is really hard to code, and I solved it by using a simplified chase algorithm that still feels fun.",
    },
    {
        id: '2d-minecraft',
        name: '⛏️ 2D Minecraft',
        description: 'A 2D browser recreation of Minecraft. No download required.',
        url: '#',
        tech: ['Canvas', 'JS'],
        story: "Hi, I'm Felix and I built 2D Minecraft. It's a browser-based recreation of Minecraft from a side-on 2D view — mine blocks, place them, explore. I built this because Minecraft is my favourite game ever and I wanted to understand how it works under the hood.\n\nThe feature I'm most proud of is the procedural world generation, because every world is different. This was challenging because generating terrain that looks natural is genuinely complex maths, and I solved it by using a simple noise function to create smooth hills.",
    },
    {
        id: 'click-it',
        name: '🖱️ Click It!',
        description: 'Idle clicker game with 40+ skins, 20+ dimensions and achievements.',
        url: 'https://first-repo-gray.vercel.app/',
        tech: ['HTML', 'CSS', 'JS'],
        story: "Hi, I'm Felix and I built Click It! It's an idle clicker game with over 40 button skins, 20+ unlockable dimensions and a full achievement system. I built this as my very first real project — it was how I learned JavaScript properly.\n\nThe feature I'm most proud of is the dimension system, because each one completely changes the visual style of the whole page. This was challenging because managing that many CSS states is messy, and I solved it by creating a dimension object that stores every style property and applying it all at once on switch.",
    },
    {
        id: 'voidpet-dungeon',
        name: '👾 Voidpet Dungeon',
        description: 'A canvas-based dungeon crawler featuring void creatures.',
        url: 'https://monsterpet-dungeon.vercel.app/',
        tech: ['Canvas', 'JS'],
        story: "Hi, I'm Felix and I built Voidpet Dungeon. It's a dungeon crawler where you fight strange void creatures using a canvas-rendered engine. I built this because I wanted to make something with a dark, eerie atmosphere that felt different from my other projects.\n\nThe feature I'm most proud of is the creature design, because the void monsters look genuinely unsettling. This was challenging because drawing expressive characters with just canvas shapes requires a lot of iteration, and I solved it by sketching ideas on paper first.",
    },
    {
        id: 'value-scanner',
        name: '🔍 Value Scanner',
        description: 'Draw a circle around any item and Claude AI estimates its value.',
        url: 'https://value-scanner-e0p8dxaxt-felix-aos-projects.vercel.app/',
        tech: ['Claude AI', 'JS'],
        story: "Hi, I'm Felix and I built Value Scanner. It's an AI tool where you draw a circle around any item in a photo and Claude AI tells you roughly what it's worth. I built this because I was curious whether AI could actually guess prices just from an image.\n\nThe feature I'm most proud of is the drawing tool, because it lets you precisely select exactly what you want to value. This was challenging because mapping the drawn circle back to the image coordinates was tricky, and I solved it by normalising the coordinates before sending them to the API.",
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
// Stitch "Editorial Voxelism" status palette
const STATUS_TYPES = {
    GOOD:        { label: '✅ Works',   color: 0x256900, hex: '#256900', bg: 0x95f169 },
    MAINTENANCE: { label: '🔧 Fixing', color: 0x8f4816, hex: '#8f4816', bg: 0xffc5a5 },
    BROKEN:      { label: '💀 Broken', color: 0xb02500, hex: '#b02500', bg: 0xf95630 }
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

// ── SCENE TRANSITIONS — fast black-screen fade ────────────────────────────────
function fadeTo(scene, key) {
    if (scene._fading) return;
    scene._fading = true;
    scene.cameras.main.fadeOut(120, 0, 0, 0);
    scene.cameras.main.once('camerafadeoutcomplete', () => scene.scene.start(key));
}

function slideIn(scene) {
    scene.cameras.main.fadeIn(160, 0, 0, 0);
}
