const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();

// --- Scene values (ported from your Java idea) ---
let boyX = 60;
let walkingPhase = 0;
let heartPulse = 1.0;
let blushAlpha = 0.0;
let armReach = 0.0;
let flowerTaken = false;

const girlX = () => Math.min(innerWidth - 180, Math.max(260, innerWidth * 0.62));
const groundY = () => Math.min(innerHeight - 80, innerHeight * 0.72);

const SceneState = {
  WALK: 0,
  BOY_TALK_1: 1,
  GIRL_TALK: 2,
  GIVE_ROSE: 3,
  THE_QUESTION: 4,
  GIRL_YES: 5,
  CELEBRATE: 6,
};

let currentState = SceneState.WALK;
let stateTimer = 0;

// Particles
const floatingHearts = Array.from({ length: 25 }, () => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  s: 6 + Math.random() * 10,
}));

const confetti = [];
const burstSparkles = [];

function miniHeart(x, y, s) {
  ctx.beginPath();
  ctx.ellipse(x - s * 0.5, y - s * 0.25, s * 0.5, s * 0.5, 0, 0, Math.PI * 2);
  ctx.ellipse(x + s * 0.5, y - s * 0.25, s * 0.5, s * 0.5, 0, 0, Math.PI * 2);
  ctx.moveTo(x - s, y);
  ctx.lineTo(x + s, y);
  ctx.lineTo(x, y + s * 1.25);
  ctx.closePath();
  ctx.fill();
}

function speechBubble(x, y, text) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  roundRect(x, y, 210, 50, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(230,40,100,0.9)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "rgb(230,40,100)";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(text, x + 14, y + 32);
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function realisticRose(x, y) {
  // stem
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgb(34,139,34)";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 24);
  ctx.stroke();
  ctx.fillStyle = "rgb(34,139,34)";
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 14, 6, 3, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // petals
  ctx.fillStyle = "rgb(180,0,30)";
  ctx.beginPath();
  ctx.ellipse(x - 6, y - 6, 8, 10, 0.2, 0, Math.PI * 2);
  ctx.ellipse(x + 6, y - 6, 8, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgb(255,40,80)";
  ctx.beginPath();
  ctx.ellipse(x, y - 8, 9, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgb(120,0,10)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - 8, 5, Math.PI, 0, false);
  ctx.stroke();
  ctx.restore();
}

function drawGirl(x, y) {
  const breathing = Math.sin(performance.now() / 400) * 1.5;
  const cy = y + breathing;

  // arm (after GIVE_ROSE)
  if (currentState >= SceneState.GIVE_ROSE) {
    ctx.strokeStyle = "rgb(255,230,210)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 10, cy - 55);
    ctx.lineTo(x - 30 * armReach, cy - 52);
    ctx.stroke();
  }

  // hair
  ctx.fillStyle = "rgb(85,45,25)";
  ctx.beginPath();
  ctx.ellipse(x + 20, cy - 120, 34, 44, 0, 0, Math.PI * 2);
  ctx.fill();

  // dress
  ctx.fillStyle = "rgb(255,120,180)";
  ctx.beginPath();
  ctx.moveTo(x, cy - 80);
  ctx.lineTo(x + 55, cy - 80);
  ctx.lineTo(x + 70, cy);
  ctx.lineTo(x - 15, cy);
  ctx.closePath();
  ctx.fill();

  // face
  ctx.fillStyle = "rgb(255,235,215)";
  ctx.beginPath();
  ctx.ellipse(x + 25, cy - 118, 20, 21, 0, 0, Math.PI * 2);
  ctx.fill();

  // eyes
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.ellipse(x + 17, cy - 124, 4, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 32, cy - 124, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(x + 18, cy - 125, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // blush
  ctx.fillStyle = `rgba(255,150,150,${blushAlpha})`;
  ctx.beginPath();
  ctx.ellipse(x + 12, cy - 112, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 38, cy - 112, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  if (flowerTaken) realisticRose(x - 10, cy - 55);
}

function drawBoy(x, y) {
  const isWalk = currentState === SceneState.WALK;
  const bob = isWalk ? Math.abs(Math.sin(walkingPhase) * 8) : Math.sin(performance.now() / 400) * 1.5;
  const legSwing = isWalk ? Math.sin(walkingPhase) * 16 : 0;
  const cy = y - bob;

  // legs
  ctx.strokeStyle = "rgb(60,60,120)";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + 16, cy - 10);
  ctx.lineTo(x + 16 - legSwing, y + 8);
  ctx.moveTo(x + 34, cy - 10);
  ctx.lineTo(x + 34 + legSwing, y + 8);
  ctx.stroke();

  // shirt
  ctx.fillStyle = "rgb(100,180,255)";
  roundRect(x + 8, cy - 75, 40, 62, 16);
  ctx.fill();

  // face
  ctx.fillStyle = "rgb(255,235,215)";
  ctx.beginPath();
  ctx.ellipse(x + 28, cy - 115, 20, 21, 0, 0, Math.PI * 2);
  ctx.fill();

  // hair
  ctx.fillStyle = "rgb(45,45,45)";
  ctx.beginPath();
  ctx.arc(x + 28, cy - 120, 22, Math.PI, 0);
  ctx.fill();

  // eyes
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.ellipse(x + 20, cy - 121, 4, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 35, cy - 121, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(x + 21, cy - 122, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // blush
  ctx.fillStyle = `rgba(255,150,150,${Math.min(1, blushAlpha * 0.9)})`;
  ctx.beginPath();
  ctx.ellipse(x + 16, cy - 110, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 40, cy - 110, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // arm + rose
  const reachX = x + 52 + 32 * armReach;
  ctx.strokeStyle = "rgb(255,235,215)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x + 44, cy - 55);
  ctx.lineTo(reachX, cy - 52);
  ctx.stroke();

  if (!flowerTaken) realisticRose(reachX + 10, cy - 52);
}

function createBurst(x, y) {
  for (let i = 0; i < 25; i++) {
    burstSparkles.push({
      x: x + (Math.random() * 50 - 25),
      y: y + (Math.random() * 50 - 25),
      life: 1,
    });
  }
}

function addConfetti() {
  const colors = ["pink", "yellow", "cyan", "orange", "white"];
  confetti.push({
    x: Math.random() * innerWidth,
    y: -10,
    c: colors[(Math.random() * colors.length) | 0],
    s: 2 + Math.random() * 4,
  });
}

function update() {
  stateTimer++;

  const gx = girlX();
  const gy = groundY();

  switch (currentState) {
    case SceneState.WALK:
      if (boyX < gx - 140) {
        boyX += 4.5;
        walkingPhase += 0.35;
      } else {
        currentState = SceneState.BOY_TALK_1;
        stateTimer = 0;
      }
      break;

    case SceneState.BOY_TALK_1:
      if (stateTimer > 60) {
        currentState = SceneState.GIRL_TALK;
        stateTimer = 0;
      }
      break;

    case SceneState.GIRL_TALK:
      blushAlpha = Math.min(1, blushAlpha + 0.02);
      if (stateTimer > 60) {
        currentState = SceneState.GIVE_ROSE;
        stateTimer = 0;
      }
      break;

    case SceneState.GIVE_ROSE:
      armReach = Math.min(1, armReach + 0.02);
      if (armReach >= 1) {
        flowerTaken = true;
        createBurst(gx - 20, gy - 50);
        currentState = SceneState.THE_QUESTION;
        stateTimer = 0;
      }
      break;

    case SceneState.THE_QUESTION:
      if (stateTimer > 70) {
        currentState = SceneState.GIRL_YES;
        stateTimer = 0;
      }
      break;

    case SceneState.GIRL_YES:
      if (stateTimer > 50) {
        currentState = SceneState.CELEBRATE;
        stateTimer = 0;
      }
      break;

    case SceneState.CELEBRATE:
      if (confetti.length < 70) addConfetti();
      heartPulse = 1.0 + 0.2 * Math.sin(performance.now() / 130);
      break;
  }

  // floating hearts
  for (const h of floatingHearts) {
    h.y -= 1.5;
    if (h.y < -50) {
      h.y = innerHeight + 50;
      h.x = Math.random() * innerWidth;
    }
  }

  // confetti
  for (const c of confetti) {
    c.y += c.s;
    c.x += Math.sin(c.y / 25);
  }

  // burst sparkles
  for (let i = burstSparkles.length - 1; i >= 0; i--) {
    burstSparkles[i].y -= 1.2;
    burstSparkles[i].life -= 0.03;
    if (burstSparkles[i].life <= 0) burstSparkles.splice(i, 1);
  }
}

function draw() {
  const W = innerWidth, H = innerHeight;
  const gy = groundY();
  const gx = girlX();

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, gy);
  sky.addColorStop(0, "rgb(80,40,100)");
  sky.addColorStop(1, "rgb(255,160,190)");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Ground glow
  const ground = ctx.createLinearGradient(0, gy, 0, H);
  ground.addColorStop(0, "rgb(160,70,130)");
  ground.addColorStop(1, "rgb(100,40,80)");
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.ellipse(W / 2, gy + 90, W * 0.8, 170, 0, 0, Math.PI * 2);
  ctx.fill();

  // floating hearts
  ctx.fillStyle = "rgba(255,210,230,0.55)";
  for (const h of floatingHearts) miniHeart(h.x, h.y, h.s);

  // characters
  drawGirl(gx, gy);
  drawBoy(boyX, gy);

  // speech bubbles
  if (currentState === SceneState.BOY_TALK_1) speechBubble(boyX - 60, gy - 210, "I have something for you...");
  if (currentState === SceneState.GIRL_TALK) speechBubble(gx + 30, gy - 180, "For me?");
  if (currentState === SceneState.THE_QUESTION) speechBubble(boyX - 30, gy - 180, "Will you be mine?");
  if (currentState === SceneState.GIRL_YES || currentState === SceneState.CELEBRATE)
    speechBubble(gx + 30, gy - 180, "Yes! ❤");

  // celebrate
  if (currentState === SceneState.CELEBRATE) {
    ctx.save();
    ctx.translate(W / 2, 160 + Math.sin(performance.now() / 400) * 15);
    ctx.scale(heartPulse, heartPulse);
    ctx.fillStyle = "rgb(255,50,120)";
    miniHeart(0, 0, 55);
    ctx.restore();

    ctx.fillStyle = "white";
    ctx.font = "bold 60px 'cursive'";
    ctx.fillText("Only mine", W / 2 - 150, 90);

    for (const c of confetti) {
      ctx.fillStyle = c.c;
      ctx.fillRect(c.x, c.y, 6, 6);
    }
  }

  // sparkles
  ctx.fillStyle = "rgba(255,255,180,0.95)";
  for (const p of burstSparkles) ctx.fillRect(p.x, p.y, 4, 4);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
