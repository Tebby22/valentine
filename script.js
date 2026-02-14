/**
 * MAHE & MASHKURA - VALENTINE PROPOSAL SCRIPT
 * Narrative: The Secret Bouquet & The Starlit Promise
 */

const canvas = document.getElementById("valentineCanvas");
const ctx = canvas.getContext("2d");

// --- Configuration ---
const NAMES = { boy: "Mahe", girl: "Mashkura" };
const COLORS = {
    bgInitial: "#1a1a2e",
    boyBody: "#3366ff",
    girlBody: "#ff3366",
    skin: "#ffdbac",
    heart: "#ff416c",
    text: "#ffffff"
};

// --- State Management ---
const State = {
    WALK: 0,
    ARRIVE: 1,
    CLOSE_EYES: 2,
    REVEAL: 3,
    KNEEL: 4,
    WAIT_FOR_YES: 5,
    CELEBRATE: 6
};

let currentState = State.WALK;
let timer = 0;
let w, h, groundY;
let maheX = -100;
let mashkuraX;
let bouquetAngle = Math.PI; // Hidden behind back
let kneelProgress = 0;
let bgHue = 240;
let dialogueText = "";
let yesButtonRect = { x: 0, y: 0, w: 140, h: 50 };

// --- Particle Systems ---
const clickHearts = [];
const fireworks = [];
const sparkles = [];

// --- Initialization ---
function init() {
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", handlePointer);
    requestAnimationFrame(loop);
}

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    groundY = h * 0.75;
    mashkuraX = w * 0.7;
}

// --- Interaction ---
function handlePointer(e) {
    const mx = e.clientX;
    const my = e.clientY;

    // Check YES button click
    if (currentState === State.WAIT_FOR_YES) {
        if (mx > yesButtonRect.x && mx < yesButtonRect.x + yesButtonRect.w &&
            my > yesButtonRect.y && my < yesButtonRect.y + yesButtonRect.h) {
            currentState = State.CELEBRATE;
            timer = 0;
            return;
        }
    }

    // Spawn bonus hearts
    for (let i = 0; i < 8; i++) {
        clickHearts.push({
            x: mx, y: my,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: Math.random() * 15 + 5,
            life: 1
        });
    }
}

// --- Drawing Helpers ---
function drawHeart(x, y, size, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
    ctx.bezierCurveTo(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
    ctx.fill();
    ctx.restore();
}

function drawPerson(x, name, color, isKneeling, isGirl = false) {
    const bodyH = isKneeling ? 45 : 90;
    const y = groundY - bodyH;
    
    // Body
    ctx.fillStyle = color;
    ctx.fillRect(x - 15, y, 30, bodyH);
    
    // Head
    ctx.fillStyle = COLORS.skin;
    ctx.beginPath();
    ctx.arc(x, y - 18, 18, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (Mashkura closes her eyes during that state)
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    if (isGirl && currentState === State.CLOSE_EYES) {
        // Closed eyes 
        ctx.beginPath(); ctx.arc(x - 7, y - 20, 4, 0, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 7, y - 20, 4, 0, Math.PI); ctx.stroke();
    } else {
        ctx.fillStyle = "#000";
        ctx.beginPath(); ctx.arc(x - 7, y - 20, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 7, y - 20, 3, 0, Math.PI * 2); ctx.fill();
    }

    // Name Tag
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(name, x, groundY + 25);
    
    return { handX: x + 15, handY: y + bodyH / 2 };
}

function drawDialogue(text) {
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    const rectW = Math.min(w * 0.8, 500);
    const rectX = (w - rectW) / 2;
    ctx.beginPath();
    ctx.roundRect(rectX, 60, rectW, 80, 20);
    ctx.fill();

    ctx.fillStyle = COLORS.girlBody;
    ctx.font = "italic 600 20px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(text, w / 2, 108);
    ctx.restore();
}

function drawBouquet(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    // Stems
    ctx.strokeStyle = "green";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, 25); ctx.stroke();
    // Flowers
    ctx.fillStyle = "#ff0055";
    for(let i=0; i<5; i++) {
        const ax = Math.cos(i) * 10;
        const ay = Math.sin(i) * 10;
        ctx.beginPath(); ctx.arc(ax, ay, 8, 0, Math.PI*2); ctx.fill();
    }
    // Sparkles
    if (currentState === State.REVEAL) {
        if (Math.random() > 0.8) sparkles.push({x: x, y: y, vx: (Math.random()-0.5)*4, vy:-Math.random()*3, life: 1});
    }
    ctx.restore();
}

// --- Main Loop ---
function loop() {
    timer++;
    
    // Background logic
    if (currentState === State.CELEBRATE) bgHue = (bgHue + 0.5) % 360;
    ctx.fillStyle = `hsl(${bgHue}, 40%, 15%)`;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = `hsl(${bgHue}, 40%, 10%)`;
    ctx.fillRect(0, groundY, w, h - groundY);

    // --- State Logic ---
    switch (currentState) {
        case State.WALK:
            dialogueText = "Mahe is approaching with a secret...";
            maheX += 2.5;
            if (maheX >= mashkuraX - 120) { currentState = State.ARRIVE; timer = 0; }
            break;
        case State.ARRIVE:
            dialogueText = `Hi ${NAMES.girl}. I have a surprise for you...`;
            if (timer > 120) { currentState = State.CLOSE_EYES; timer = 0; }
            break;
        case State.CLOSE_EYES:
            dialogueText = "Close your beautiful eyes for just a second. No peeking!";
            if (timer > 120) { currentState = State.REVEAL; timer = 0; }
            break;
        case State.REVEAL:
            dialogueText = "Okay, open them! ✨";
            bouquetAngle = Math.max(0, bouquetAngle - 0.08);
            if (timer > 120) { currentState = State.KNEEL; timer = 0; }
            break;
        case State.KNEEL:
            dialogueText = `${NAMES.girl}, you make my world complete. Will you be my Valentine?`;
            kneelProgress = Math.min(1, kneelProgress + 0.05);
            if (kneelProgress >= 1) currentState = State.WAIT_FOR_YES;
            break;
        case State.CELEBRATE:
            dialogueText = "SHE SAID YES! Mahe + Mashkura Forever! ❤️";
            if (timer % 30 === 0) {
                fireworks.push({
                    x: Math.random() * w, y: h, targetY: h * 0.2 + Math.random() * h * 0.3,
                    exploded: false, particles: []
                });
            }
            break;
    }

    // --- Drawing ---
    drawDialogue(dialogueText);
    
    const girlPos = drawPerson(mashkuraX, NAMES.girl, COLORS.girlBody, false, true);
    const mahePos = drawPerson(maheX, NAMES.boy, COLORS.boyBody, kneelProgress > 0.5);
    
    // Bouquet Logic
    const bX = mahePos.handX;
    const bY = mahePos.handY + (kneelProgress * 15);
    drawBouquet(bX, bY, bouquetAngle);

    // YES Button
    if (currentState === State.WAIT_FOR_YES) {
        yesButtonRect.x = w / 2 - 70;
        yesButtonRect.y = 160;
        ctx.fillStyle = COLORS.heart;
        ctx.beginPath();
        ctx.roundRect(yesButtonRect.x, yesButtonRect.y, yesButtonRect.w, yesButtonRect.h, 15);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 22px Arial";
        ctx.fillText("YES! ❤️", w/2, 192);
    }

    // --- Particle Updates ---
    // Click Hearts
    clickHearts.forEach((h, i) => {
        h.x += h.vx; h.y += h.vy; h.vy += 0.2; h.life -= 0.02;
        drawHeart(h.x, h.y, h.size, COLORS.heart, h.life);
        if (h.life <= 0) clickHearts.splice(i, 1);
    });

    // Bouquet Sparkles
    sparkles.forEach((s, i) => {
        s.x += s.vx; s.y += s.vy; s.life -= 0.02;
        ctx.fillStyle = `rgba(255, 255, 200, ${s.life})`;
        ctx.fillRect(s.x, s.y, 3, 3);
        if (s.life <= 0) sparkles.splice(i, 1);
    });

    // Fireworks
    fireworks.forEach((f, i) => {
        if (!f.exploded) {
            f.y -= 7;
            ctx.fillStyle = "#fff"; ctx.fillRect(f.x, f.y, 3, 10);
            if (f.y <= f.targetY) {
                f.exploded = true;
                for(let j=0; j<25; j++) {
                    f.particles.push({
                        x: f.x, y: f.y,
                        vx: Math.cos(j) * (Math.random() * 5 + 2),
                        vy: Math.sin(j) * (Math.random() * 5 + 2),
                        life: 1, color: `hsl(${Math.random() * 360}, 100%, 60%)`
                    });
                }
            }
        } else {
            f.particles.forEach((p, pi) => {
                p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.02;
                ctx.fillStyle = p.color; ctx.globalAlpha = p.life;
                ctx.fillRect(p.x, p.y, 4, 4);
                if (p.life <= 0) f.particles.splice(pi, 1);
            });
            if (f.particles.length === 0) fireworks.splice(i, 1);
        }
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
}

init();
