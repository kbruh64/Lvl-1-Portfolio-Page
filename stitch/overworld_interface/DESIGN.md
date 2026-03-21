```markdown
# Design System Specification: Editorial Voxelism

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Architect."** 

Moving beyond a simple "game-themed" aesthetic, this system treats the interface as a series of high-end, excavated layers. We are not just building buttons; we are carving digital landscapes. By combining the rigid, nostalgic geometry of a 16-bit world with the sophisticated, airy layouts of modern editorial design, we create a "Voxel-Chic" experience. 

The system breaks the "template" look by using **intentional asymmetry** (mimicking natural terrain), **overlapping block modules**, and a **radical rejection of the 1px line**. We rely on "Biomatic Layering" where different functional areas of the application represent distinct biomes—shifting from the airy "Sky" (Surface) to the rich "Forest" (Primary) and the deep "Nether" (Secondary).

## 2. Colors: The Biomatic Palette
The palette is rooted in the natural materials of the digital world, but applied with the restraint of a high-end gallery.

### Core Tonal Roles
- **Primary (Lush Forest):** `#256900` (Grass) to `#95f169` (Sapling). Used for growth, action, and key navigation.
- **Secondary (Desert & Earth):** `#8f4816` (Dirt) to `#ffc5a5` (Sand). Reserved for grounding elements and secondary information.
- **Tertiary (Diamond Pulse):** `#006668` to `#5dfbfe`. Used for high-value interactions, progress indicators, and "enchanted" states.
- **Error (Redstone):** `#b02500`. High-saturation alert states that mimic active redstone circuitry.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited. Boundaries must be defined through:
1. **Background Shifts:** Placing a `surface-container-low` component against a `surface` background.
2. **Hard Inner Shadows:** Emulating the "recessed" look of a stone inventory slot using a 2px offset with 0 blur.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked slabs. 
- Use `surface-container-lowest` for the base "bedrock" of the page.
- Use `surface-container-highest` for active, "hovering" blocks.
- **The Glass & Gradient Rule:** For floating modals or "floating islands," use a backdrop-blur (12px) on a semi-transparent `surface` color to allow the "biome" colors below to bleed through softly.

## 3. Typography: The Block and the Breath
We balance the heavy, pixel-dense nature of the voxel world with the legibility of high-end sans-serifs.

- **Display & Headlines (`spaceGrotesk`):** This is our "Blocky" anchor. Despite being a clean font, its geometric quirks mimic the 90-degree world of our inspiration. Use `display-lg` (3.5rem) for hero sections to establish a bold, monumental presence.
- **Body & Titles (`workSans`):** Our "Breath." These must be used with generous leading (line-height) to provide a counterpoint to the heavy headlines. `workSans` provides the clean, professional clarity needed for complex data or instructions.
- **The Contrast Rule:** Headlines should always be `on-surface` or `primary-fixed`, while body text remains `on-surface-variant` to ensure the hierarchy feels excavated rather than flat.

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to simulate light; we use tonal shifts to simulate depth.

- **The Layering Principle:** Instead of a drop shadow, a "selected" card should simply move from `surface-container` to `surface-bright`.
- **Ambient Shadows:** For floating elements like tooltips or "Inventory" modals, use a shadow with a 24px blur at 6% opacity, tinted with the `secondary` brown tone rather than pure black. This creates a "warm" depth that feels like sunlight hitting the earth.
- **The "Ghost Border":** If a separator is required for accessibility, use the `outline-variant` token at 15% opacity. It should feel like a faint carving in stone, not a drawn line.
- **Glassmorphism:** Use for persistent navigation bars. A `surface` color at 80% opacity with a `backdrop-filter: blur(10px)` allows the vibrant biome colors to scroll behind it, creating a sense of movement and "translucent ice."

## 5. Components: Carved Elements

### Buttons
- **Primary:** High-saturation `primary` background. Style with a "classic stone" feel: a 2px `primary-dim` bottom border and a 2px `primary-fixed` top border to create a "pressed" 3D effect without using gradients.
- **Secondary:** Using the `surface-container-highest` with the same "carved" inner shadow technique.

### Containers & Cards
- **The Inventory Slot:** Small cards or "chips" should use `surface-container-low` with a subtle `inset` shadow.
- **Forbid Dividers:** Never use `<hr>` tags. Separate content using the Spacing Scale (e.g., `12` (2.75rem) or `16` (3.5rem) blocks of vertical space).

### Inputs
- **The Excavated Field:** Text inputs should be `surface-container-highest` with a 2px bottom border of `primary` that only appears on focus. This mimics a "mined" block being filled with energy.

### Biome-Specific Modifiers (Advanced)
- **Nether Mode:** For dark-mode overrides or critical "Warning" sections, shift the surface tokens to `secondary-dim` and use `error-container` as the primary accent.
- **Lush Sections:** Use `primary-container` backgrounds with `on-primary-container` text for positive-reinforcement messaging.

## 6. Do's and Don'ts

### Do:
- **Use Large Spacing:** Embrace the 0.9rem to 2.25rem gaps to let the typography breathe.
- **Embrace the Corner:** All `border-radius` tokens are `0px`. Sharp, 90-degree angles are non-negotiable to maintain the voxel aesthetic.
- **Layer Textures:** Use subtle 4x4px repeating noise patterns on `surface` backgrounds to mimic the grit of stone and dirt.

### Don't:
- **No Rounding:** Never use rounded corners, even for "pill" buttons. Use the `0px` scale exclusively.
- **No Thin Lines:** Avoid 1px borders or dividers. They break the "heavy block" immersion.
- **No Centering Everything:** Use asymmetrical layouts. Place a large headline on the left and a small body paragraph on the far right to mimic the organic, non-linear generation of a biome.

### Accessibility Note
While the aesthetic is vibrant, always ensure that text on `primary` or `secondary` backgrounds meets a 4.5:1 contrast ratio by using the provided `on-` color tokens (e.g., `on-primary`). Use `diamond cyan` (tertiary) sparingly for interactive "enchantment" highlights to ensure they remain distinct from the "grass" and "sky" backgrounds.```