const { createCanvas, loadImage } = require('@napi-rs/canvas');

const WIDTH = 800;
const HEIGHT = 300;
const AVATAR_SIZE = 170;
const CONFETTI_COLORS = ['#ffd700', '#ff6b9d', '#7bdff2', '#a29bfe', '#ff9f43', '#55efc4'];

function drawConfetti(ctx, seed) {
  // Deterministic pseudo-random scatter so re-renders look consistent per call.
  let value = seed;
  const next = () => {
    value = (value * 1103515245 + 12345) & 0x7fffffff;
    return value / 0x7fffffff;
  };

  for (let i = 0; i < 45; i++) {
    const x = next() * WIDTH;
    const y = next() * HEIGHT;
    const size = 4 + next() * 8;
    const color = CONFETTI_COLORS[Math.floor(next() * CONFETTI_COLORS.length)];
    const rotation = next() * Math.PI * 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    if (next() > 0.5) {
      ctx.fillRect(-size / 2, -size / 4, size, size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawCake(ctx, x, y) {
  // Base
  ctx.fillStyle = '#f7d9e3';
  ctx.fillRect(x, y + 30, 120, 40);
  // Frosting wave
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x, y + 30);
  for (let i = 0; i <= 6; i++) {
    ctx.quadraticCurveTo(x + i * 20 + 10, y + 15, x + i * 20 + 20, y + 30);
  }
  ctx.lineTo(x + 120, y + 30);
  ctx.lineTo(x, y + 30);
  ctx.fill();
  // Candles
  const candleColors = ['#ff6b9d', '#7bdff2', '#ffd700'];
  for (let i = 0; i < 3; i++) {
    const cx = x + 25 + i * 35;
    ctx.fillStyle = candleColors[i];
    ctx.fillRect(cx, y - 15, 6, 20);
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.ellipse(cx + 3, y - 22, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

async function buildBirthdayCard(user) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#5f27cd');
  gradient.addColorStop(0.5, '#e84393');
  gradient.addColorStop(1, '#fdcb6e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawConfetti(ctx, Number(BigInt(user.id) % 100000n) || 1);

  const avatarResponse = await fetch(user.displayAvatarURL({ extension: 'png', size: 256 }));
  const avatarBuffer = Buffer.from(await avatarResponse.arrayBuffer());
  const avatarImage = await loadImage(avatarBuffer);

  const avatarX = 45;
  const avatarY = (HEIGHT - AVATAR_SIZE) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + AVATAR_SIZE / 2, avatarY + AVATAR_SIZE / 2, AVATAR_SIZE / 2 + 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd700';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + AVATAR_SIZE / 2, avatarY + AVATAR_SIZE / 2, AVATAR_SIZE / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatarImage, avatarX, avatarY, AVATAR_SIZE, AVATAR_SIZE);
  ctx.restore();

  const textX = avatarX + AVATAR_SIZE + 40;

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 46px sans-serif';
  ctx.fillText('HAPPY BIRTHDAY', textX, 110);

  ctx.font = 'bold 32px sans-serif';
  ctx.fillStyle = '#fff9e6';
  ctx.fillText(user.tag, textX, 155);

  drawCake(ctx, textX, 190);

  return canvas.toBuffer('image/png');
}

module.exports = { buildBirthdayCard };
