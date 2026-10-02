// 账单预览渲染（canvas）
// 微信/ETC/停车：按原版截图仿制的微信账单模板；支付宝：蓝色模板
const BILL_W = 375;
const PAD_X = 24;
const LABEL_W = 90;
const BLUE = '#576B95';

const IMG_CACHE = {};

function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (IMG_CACHE[src]) return Promise.resolve(IMG_CACHE[src]);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => { IMG_CACHE[src] = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function preloadAvatars() {
  Object.keys(AVATAR_DATA).forEach(k => loadImage(AVATAR_DATA[k]));
}

function fmtAmount(v) {
  let n = parseFloat(String(v).replace(/[^\d.]/g, ''));
  if (isNaN(n)) n = 0;
  return '-' + n.toFixed(2);
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  String(text).split('\n').forEach(seg => {
    let line = '';
    for (const ch of seg) {
      if (ctx.measureText(line + ch).width > maxWidth && line) {
        lines.push(line);
        line = ch;
      } else {
        line += ch;
      }
    }
    lines.push(line);
  });
  return lines;
}

function drawAvatar(ctx, img, cx, cy, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = '#e9eaec';
  ctx.fill();
  ctx.clip();
  if (img) {
    const s = Math.min(img.width, img.height);
    ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, cx - r, cy - r, r * 2, r * 2);
  }
  ctx.restore();
}

function drawCheck(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(2, r * 0.22);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.45, cy + r * 0.02);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.38);
  ctx.lineTo(cx + r * 0.5, cy - r * 0.35);
  ctx.stroke();
  ctx.restore();
}

function buildRows(s, type) {
  if (type === 'alipay') {
    const rows = [
      { label: '交易订单号', value: s.tradeNumber },
      { label: '商品名称', value: s.productName },
    ];
    if (s.productCode && s.showProductCode) rows.push({ label: '订单号', value: s.productCode });
    rows.push(
      { label: '支付方式', value: s.paymentMethod },
      { label: '商户全称', value: s.merchantFullName },
      { label: '收单机构', value: s.acquirer },
      { label: '清算服务', value: s.clearingService },
      { label: '支付时间', value: s.paymentTime }
    );
    return rows;
  }
  const product = s.productCode && s.showProductCode
    ? s.productName.replace(/_+$/, '') + '\n_' + s.productCode
    : s.productName;
  return [
    { label: '当前状态', value: s.paymentStatus || '支付成功' },
    { label: '支付时间', value: s.paymentTime },
    { label: '商品', value: product },
    { label: '商户全称', value: s.merchantFullName },
    { label: '收单机构', value: s.acquirer },
    { label: '支付方式', value: s.paymentMethod },
    { label: '交易单号', value: s.tradeNumber },
    { label: '商户单号', value: '可在支持的商户扫码退款' }
  ];
}

// ---------- 微信模板（按原版截图） ----------
function drawWechat(ctx, s, img) {
  let y = 0;

  // 顶部导航：× + 全部账单
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, BILL_W, 44);
  ctx.strokeStyle = '#191919';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(18, 16); ctx.lineTo(32, 30);
  ctx.moveTo(32, 16); ctx.lineTo(18, 30);
  ctx.stroke();
  ctx.fillStyle = '#191919';
  ctx.font = '17px "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('全部账单', BILL_W - 18, 23);
  ctx.textAlign = 'left';
  y = 44;

  // 头像
  y += 22;
  drawAvatar(ctx, img, BILL_W / 2, y + 21, 21);
  y += 42;

  // 商户名（可换行居中）
  ctx.fillStyle = '#191919';
  ctx.font = '17px "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const nameLines = wrapText(ctx, s.merchantName, BILL_W - PAD_X * 2);
  y += 30;
  nameLines.forEach((ln, i) => {
    ctx.fillText(ln, BILL_W / 2, y + i * 24);
  });
  y += (nameLines.length - 1) * 24;

  // 金额（负号、无千分位）
  y += 50;
  ctx.font = 'bold 30px "Microsoft YaHei", sans-serif';
  ctx.fillText(fmtAmount(s.transferAmount), BILL_W / 2, y);
  y += 30;

  // 分隔线
  y += 26;
  ctx.strokeStyle = '#ededed';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y + 0.5);
  ctx.lineTo(BILL_W, y + 0.5);
  ctx.stroke();

  // 明细（label / value 均左对齐）
  y += 30;
  const valueW = BILL_W - PAD_X - LABEL_W - PAD_X;
  ctx.font = '13px "Microsoft YaHei", sans-serif';
  for (const r of buildRows(s, 'wechat')) {
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#888b90';
    ctx.textAlign = 'left';
    ctx.fillText(r.label, PAD_X, y);
    ctx.fillStyle = '#191919';
    const lines = wrapText(ctx, r.value, valueW);
    lines.forEach((ln, i) => ctx.fillText(ln, PAD_X + LABEL_W, y + i * 20));
    y += (lines.length - 1) * 20 + 31;
  }
  y -= 31 - 26;

  // 条形码（居中，约58%宽）
  const bw = Math.round(BILL_W * 0.58);
  const bx = Math.round((BILL_W - bw) / 2);
  y += 34;
  drawBarcode(ctx, bx, y, bw, 32, s.barcodeNumber || '00000000000000000000');
  y += 32;
  ctx.fillStyle = '#191919';
  ctx.font = '15px Consolas, "Microsoft YaHei", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(s.barcodeNumber || '', BILL_W / 2, y + 26);
  y += 26 + 30;

  // 灰色间隔条
  ctx.fillStyle = '#f2f2f2';
  ctx.fillRect(0, y, BILL_W, 8);
  y += 8;

  // 账单服务区
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, y, BILL_W, 152);
  ctx.fillStyle = '#191919';
  ctx.font = '15px "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('账单服务', PAD_X, y + 32);
  ctx.strokeStyle = '#f0f0f0';
  ctx.beginPath();
  ctx.moveTo(0, y + 52.5);
  ctx.lineTo(BILL_W, y + 52.5);
  ctx.stroke();

  const svc = ['对订单有疑惑', '发起群收款', '在此商户的交易', '申请电子凭证'];
  const xs = [PAD_X, Math.round(BILL_W / 2) + 6];
  const ys = [y + 52 + 34, y + 52 + 34 + 44];
  ctx.font = '14px "Microsoft YaHei", sans-serif';
  svc.forEach((t, i) => {
    const ix = xs[i % 2], iy = ys[Math.floor(i / 2)];
    drawSvcIcon(ctx, i, ix + 9, iy - 5);
    ctx.fillStyle = BLUE;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(t, ix + 26, iy);
  });
  y += 152;

  // 底部“本服务由财付通提供”
  ctx.fillStyle = '#f7f7f7';
  ctx.fillRect(0, y, BILL_W, 66);
  ctx.fillStyle = '#bbbbbb';
  ctx.font = '14px "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('本服务由财付通提供', BILL_W / 2, y + 38);
  y += 66;
  ctx.fillStyle = '#f2f2f2';
  ctx.fillRect(0, y, BILL_W, 24);
  y += 24;

  return y;
}

function drawSvcIcon(ctx, kind, x, cy) {
  ctx.save();
  ctx.strokeStyle = BLUE;
  ctx.fillStyle = BLUE;
  ctx.lineWidth = 1.4;
  if (kind === 0) {
    ctx.beginPath();
    ctx.arc(x, cy, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = '12px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', x, cy + 1);
  } else if (kind === 1) {
    ctx.strokeRect(x - 8, cy - 9, 16, 18);
    ctx.font = '12px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¥', x, cy + 1);
  } else if (kind === 2) {
    ctx.strokeRect(x - 7, cy - 9, 14, 18);
    ctx.beginPath();
    ctx.moveTo(x - 4, cy - 3); ctx.lineTo(x + 4, cy - 3);
    ctx.moveTo(x - 4, cy + 1); ctx.lineTo(x + 4, cy + 1);
    ctx.moveTo(x - 4, cy + 5); ctx.lineTo(x + 1, cy + 5);
    ctx.stroke();
  } else {
    ctx.font = '17px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☆', x, cy + 1);
  }
  ctx.restore();
}

// ---------- 支付宝模板（蓝色头部） ----------
function drawAlipay(ctx, s, img) {
  ctx.fillStyle = '#1677ff';
  ctx.fillRect(0, 0, BILL_W, 168);
  drawCheck(ctx, BILL_W / 2, 34, 13, '#ffffffcc');
  ctx.fillStyle = '#fff';
  ctx.font = '15px "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s.paymentStatus || '支付成功', BILL_W / 2, 72);
  ctx.font = 'bold 34px "Microsoft YaHei", sans-serif';
  ctx.fillText(fmtAmount(s.transferAmount).replace('-', '-'), BILL_W / 2, 120);
  ctx.font = '13px "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#ffffffcc';
  ctx.fillText(s.merchantName, BILL_W / 2, 148);
  ctx.textAlign = 'left';

  let y = 168;
  ctx.fillStyle = '#f2f3f5';
  ctx.fillRect(0, y, BILL_W, 8);
  y += 8 + 16;

  const rows = buildRows(s, 'alipay');
  ctx.font = '13px "Microsoft YaHei", sans-serif';
  const valueW = BILL_W - PAD_X * 2 - 96 - 10;
  for (const r of rows) {
    ctx.fillStyle = '#8a9099';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(r.label, PAD_X, y + 3);
    ctx.fillStyle = '#26282c';
    ctx.textAlign = 'right';
    wrapText(ctx, r.value, valueW).forEach((ln, i) => ctx.fillText(ln, BILL_W - PAD_X, y + i * 19));
    y += Math.max(1, wrapText(ctx, r.value, valueW).length) * 19 + 13;
  }
  ctx.textAlign = 'left';

  ctx.fillStyle = '#f2f3f5';
  ctx.fillRect(0, y, BILL_W, 8);
  y += 8 + 14;

  const bw = BILL_W - PAD_X * 2 - 20;
  drawBarcode(ctx, PAD_X + 10, y, bw, 52, s.barcodeNumber || '00000000000000000000');
  y += 52 + 16;
  ctx.fillStyle = '#4a5058';
  ctx.font = '12px Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(s.barcodeNumber || '', BILL_W / 2, y);
  ctx.textAlign = 'left';
  y += 18;
  return y;
}

function renderBill(canvas, s, type, img) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  // 第一遍：在离屏上下文上试绘，取得精确高度
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = '13px "Microsoft YaHei", sans-serif';
  const probeH = Math.ceil((type === 'alipay' ? drawAlipay(probe, s, null) : drawWechat(probe, s, null)) + 2);

  canvas.width = BILL_W * dpr;
  canvas.height = probeH * dpr;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, BILL_W, probeH);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, BILL_W, probeH);
  ctx.textBaseline = 'alphabetic';

  if (type === 'alipay') drawAlipay(ctx, s, img);
  else drawWechat(ctx, s, img);
}
