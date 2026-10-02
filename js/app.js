// 主逻辑：tab 切换 / 表单 / 单号生成 / 预览 / 导出
(function () {
  const $ = id => document.getElementById(id);
  const state = { tab: 'wechat', avatar: null, plateProv: '', plateGenKey: '' };

  const SB_URL = 'https://vayphoxqhdeytdmkkgvj.supabase.co';
  const SB_KEY = 'sb_publishable_-kIspg16W4BT6MAh8nYfQQ_rIKlfp6t';

  function sbRpc(fn, body) {
    return fetch(SB_URL + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(r => r.json());
  }

  function deviceId() {
    let d = '';
    try { d = localStorage.getItem('bill_device') || ''; } catch (e) {}
    if (!d) {
      d = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : 'd-' + Date.now() + '-' + Math.random().toString(36).slice(2, 12);
      try { localStorage.setItem('bill_device', d); } catch (e) {}
    }
    return d;
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem('bill_session') || 'null'); } catch (e) { return null; }
  }
  function setSession(s) {
    try { localStorage.setItem('bill_session', JSON.stringify(s)); } catch (e) {}
  }
  function clearSession() {
    try { localStorage.removeItem('bill_session'); } catch (e) {}
  }

  const KICK_MULTI = '您的兑换码已在其他设备登录，本设备已被踢下线';
  const KICK_EXPIRED = '兑换码已到期，请重新购买';
  let kickWs = null;
  let kickHb = 0;
  let kickRetry = 0;

  function kickReason(res) {
    if (res && res.expired) return KICK_EXPIRED;
    const s = getSession();
    if (s && s.expires_ts && s.expires_ts > Date.now()) return KICK_MULTI;
    return '验证已失效，请重新输入兑换码';
  }

  function stopKickWatch() {
    kickRetry = 0;
    if (kickHb) { clearInterval(kickHb); kickHb = 0; }
    if (kickWs) { try { kickWs.onclose = null; kickWs.close(); } catch (e) {} kickWs = null; }
  }

  // 被顶号监听：常驻 ws 订阅本码，别的设备兑换同一码时立刻收到推送并下线
  function startKickWatch(code) {
    if (!code || !window.WebSocket) return;
    stopKickWatch();
    const topic = 'realtime:redeem:' + code;
    let ref = 0;
    const ws = new WebSocket(SB_URL.replace('https://', 'wss://') + '/realtime/v1/websocket?apikey=' + SB_KEY + '&vsn=1.0.0');
    kickWs = ws;
    const send = (event, payload, tp) => {
      if (ws.readyState === 1) ws.send(JSON.stringify({ topic: tp || topic, event: event, ref: String(++ref), payload: payload || {} }));
    };
    ws.onopen = () => {
      kickRetry = 0;
      send('phx_join', { config: { broadcast: { self: false, ack: false } } });
      kickHb = setInterval(() => {
        if (ws.readyState !== 1) return;
        ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', ref: String(++ref), payload: {} }));
      }, 30000);
    };
    ws.onmessage = e => {
      let m;
      try { m = JSON.parse(e.data); } catch (err) { return; }
      if (m.event === 'phx_reply' && m.payload && m.payload.status === 'error') { stopKickWatch(); return; }
      if (m.topic !== topic || m.event !== 'broadcast' || !m.payload) return;
      const p = m.payload.payload || {};
      if (m.payload.event === 'kick' && p.device !== deviceId()) {
        stopKickWatch();
        kickLogin(KICK_MULTI);
      }
    };
    ws.onclose = () => {
      if (kickHb) { clearInterval(kickHb); kickHb = 0; }
      if (kickWs === ws && kickRetry < 60) {
        kickRetry++;
        setTimeout(() => { if (kickRetry > 0 && kickWs === ws) startKickWatch(code); }, 4000);
      }
    };
    ws.onerror = () => {};
  }

  // 本机成功兑换后，通知已在线的旧设备下线
  function notifyKick(code) {
    if (!code || !window.WebSocket) return;
    const topic = 'realtime:redeem:' + code;
    const ws = new WebSocket(SB_URL.replace('https://', 'wss://') + '/realtime/v1/websocket?apikey=' + SB_KEY + '&vsn=1.0.0');
    let ref = 0;
    const send = (event, payload, tp) => {
      if (ws.readyState === 1) ws.send(JSON.stringify({ topic: tp || topic, event: event, ref: String(++ref), payload: payload || {} }));
    };
    ws.onopen = () => send('phx_join', { config: { broadcast: { self: false, ack: false } } });
    ws.onmessage = e => {
      let m;
      try { m = JSON.parse(e.data); } catch (err) { return; }
      if (m.topic === topic && m.event === 'phx_reply' && m.payload && m.payload.status === 'ok') {
        send('broadcast', { type: 'broadcast', event: 'kick', payload: { device: deviceId() } });
        setTimeout(() => { try { ws.close(); } catch (err) {} }, 600);
      }
    };
    ws.onerror = () => {};
    setTimeout(() => { try { ws.close(); } catch (err) {} }, 6000);
  }

  function configs() {
    return state.tab === 'alipay' ? ZFBregionConfigs : regionConfigs;
  }

  function pad(n, l) {
    return String(n).padStart(l, '0');
  }

  function rnd(len) {
    let s = '';
    for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
    return s;
  }

  function selectedDate() {
    const d = $('datePart').value || '2026-01-01';
    const t = $('timePart').value || '12:00:00';
    const [y, m, day] = d.split('-').map(Number);
    const [hh, mm, ss] = t.split(':').map(Number);
    return { y, m, day, hh, mm, ss };
  }

  function dtDate() {
    const { y, m, day } = selectedDate();
    return `${y}${pad(m, 2)}${pad(day, 2)}`;
  }

  function dtCompact() {
    const { y, m, day, hh, mm, ss } = selectedDate();
    return String(y).slice(-2) + pad(m, 2) + pad(day, 2) + pad(hh, 2) + pad(mm, 2) + pad(ss, 2);
  }

  function dtFull() {
    const { y, m, day, hh, mm, ss } = selectedDate();
    return `${y}年${pad(m, 2)}月${pad(day, 2)}日 ${pad(hh, 2)}:${pad(mm, 2)}:${pad(ss, 2)}`;
  }

  let lastRegionKey = null;

  function currentRegion() {
    const cfgs = configs();
    const v = ($('merchantSel').value || '').trim();
    let key = Object.keys(cfgs).find(k =>
      cfgs[k].merchantName === v || cfgs[k].merchantFullName === v
    );
    if (!key) key = lastRegionKey && cfgs[lastRegionKey] ? lastRegionKey : Object.keys(cfgs)[0];
    lastRegionKey = key;
    return cfgs[key];
  }

  function activeProvince(cfg) {
    if (state.plateProv) return state.plateProv;
    const sel = $('merchantSel');
    const typed = ((sel && sel.value) || '').trim();
    if (state.tab === 'parking') {
      const c = cityIn(typed);
      return c ? CITY_PROVINCE[c] : '';
    }
    return provinceOf(cfg, typed) || '';
  }

  function genTradeNumber() {
    return '420000' + rnd(4) + dtDate() + rnd(10);
  }

  const PROVINCE_KW = ['黑龙江', '内蒙古', '辽宁', '吉林', '河北', '北京', '天津', '山西', '山东', '河南', '江苏', '上海', '浙江', '安徽', '福建', '江西', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆'];

  function provinceOf(cfg, extra) {
    if (!cfg) return '';
    const s = (cfg.merchantName || '') + (cfg.merchantFullName || '') + (extra || '');
    for (const p of PROVINCE_KW) if (s.indexOf(p) >= 0) return p;
    if (s.indexOf('深圳') >= 0) return '广东';
    return '';
  }

  const PLATE_PROVINCE = {
    '京': '北京', '津': '天津', '冀': '河北', '晋': '山西', '蒙': '内蒙古', '辽': '辽宁',
    '吉': '吉林', '黑': '黑龙江', '沪': '上海', '苏': '江苏', '浙': '浙江', '皖': '安徽',
    '闽': '福建', '赣': '江西', '鲁': '山东', '豫': '河南', '鄂': '湖北', '湘': '湖南',
    '粤': '广东', '桂': '广西', '琼': '海南', '渝': '重庆', '川': '四川', '贵': '贵州',
    '云': '云南', '藏': '西藏', '陕': '陕西', '甘': '甘肃', '青': '青海', '宁': '宁夏', '新': '新疆'
  };

  const PLATE_MUNI = { '京': '北京', '津': '天津', '沪': '上海', '渝': '重庆' };

  const PLATE_CITY = {
    '冀A': '石家庄', '冀B': '唐山', '冀C': '秦皇岛', '冀D': '邯郸', '冀E': '邢台', '冀F': '保定',
    '冀G': '张家口', '冀H': '承德', '冀J': '沧州', '冀R': '廊坊', '冀T': '衡水', '冀X': '雄安',
    '豫A': '郑州', '豫B': '开封', '豫C': '洛阳', '豫D': '平顶山', '豫E': '安阳', '豫F': '鹤壁',
    '豫G': '新乡', '豫H': '焦作', '豫J': '濮阳', '豫K': '许昌', '豫L': '漯河', '豫M': '三门峡',
    '豫N': '商丘', '豫P': '周口', '豫Q': '驻马店', '豫R': '南阳', '豫S': '信阳', '豫U': '济源', '豫V': '郑州',
    '云A': '昆明', '云C': '昭通', '云D': '曲靖', '云E': '楚雄', '云F': '玉溪', '云G': '红河',
    '云H': '文山', '云J': '普洱', '云K': '西双版纳', '云L': '大理', '云M': '保山', '云N': '德宏',
    '云P': '丽江', '云Q': '怒江', '云R': '迪庆', '云S': '临沧',
    '辽A': '沈阳', '辽B': '大连', '辽C': '鞍山', '辽D': '抚顺', '辽E': '本溪', '辽F': '丹东',
    '辽G': '锦州', '辽H': '营口', '辽J': '阜新', '辽K': '辽阳', '辽L': '盘锦', '辽M': '铁岭',
    '辽N': '朝阳', '辽P': '葫芦岛',
    '黑A': '哈尔滨', '黑B': '齐齐哈尔', '黑C': '牡丹江', '黑D': '佳木斯', '黑E': '大庆', '黑F': '伊春',
    '黑G': '鸡西', '黑H': '鹤岗', '黑J': '双鸭山', '黑K': '七台河', '黑M': '绥化', '黑N': '黑河', '黑P': '大兴安岭',
    '湘A': '长沙', '湘B': '株洲', '湘C': '湘潭', '湘D': '衡阳', '湘E': '邵阳', '湘F': '岳阳',
    '湘G': '张家界', '湘H': '益阳', '湘J': '常德', '湘K': '娄底', '湘L': '郴州', '湘M': '永州',
    '湘N': '怀化', '湘U': '湘西',
    '皖A': '合肥', '皖B': '芜湖', '皖C': '蚌埠', '皖D': '淮南', '皖E': '马鞍山', '皖F': '淮北',
    '皖G': '铜陵', '皖H': '安庆', '皖J': '黄山', '皖K': '阜阳', '皖L': '宿州', '皖M': '滁州',
    '皖N': '六安', '皖P': '宣城', '皖Q': '巢湖', '皖R': '池州',
    '鲁A': '济南', '鲁B': '青岛', '鲁C': '淄博', '鲁D': '枣庄', '鲁E': '东营', '鲁F': '烟台',
    '鲁G': '潍坊', '鲁H': '济宁', '鲁J': '泰安', '鲁K': '威海', '鲁L': '日照', '鲁M': '莱芜',
    '鲁N': '德州', '鲁P': '聊城', '鲁Q': '临沂', '鲁R': '菏泽',
    '新A': '乌鲁木齐', '新B': '昌吉', '新C': '石河子', '新D': '奎屯', '新E': '博尔塔拉', '新F': '伊犁',
    '新G': '塔城', '新H': '阿勒泰', '新J': '克拉玛依', '新K': '吐鲁番', '新L': '哈密', '新M': '巴音郭楞',
    '新N': '阿克苏', '新P': '克孜勒苏', '新Q': '喀什', '新R': '和田',
    '苏A': '南京', '苏B': '无锡', '苏C': '徐州', '苏D': '常州', '苏E': '苏州', '苏F': '南通',
    '苏G': '连云港', '苏H': '淮安', '苏J': '盐城', '苏K': '扬州', '苏L': '镇江', '苏M': '泰州', '苏N': '宿迁',
    '浙A': '杭州', '浙B': '宁波', '浙C': '温州', '浙D': '绍兴', '浙E': '湖州', '浙F': '嘉兴',
    '浙G': '金华', '浙H': '衢州', '浙J': '台州', '浙K': '丽水', '浙L': '舟山',
    '赣A': '南昌', '赣B': '赣州', '赣C': '宜春', '赣D': '吉安', '赣E': '上饶', '赣F': '抚州',
    '赣G': '九江', '赣H': '景德镇', '赣J': '萍乡', '赣K': '新余', '赣L': '鹰潭',
    '鄂A': '武汉', '鄂B': '黄石', '鄂C': '十堰', '鄂D': '荆州', '鄂E': '宜昌', '鄂F': '襄阳',
    '鄂G': '鄂州', '鄂H': '荆门', '鄂J': '黄冈', '鄂K': '孝感', '鄂L': '咸宁', '鄂M': '恩施',
    '桂A': '南宁', '桂B': '柳州', '桂C': '桂林', '桂D': '梧州', '桂E': '北海', '桂F': '崇左',
    '桂G': '来宾', '桂J': '贺州', '桂K': '玉林', '桂L': '百色', '桂M': '河池', '桂N': '钦州',
    '桂P': '防城港', '桂R': '贵港',
    '甘A': '兰州', '甘B': '嘉峪关', '甘C': '金昌', '甘D': '白银', '甘E': '天水', '甘F': '酒泉',
    '甘G': '张掖', '甘H': '武威', '甘J': '定西', '甘K': '陇南', '甘L': '平凉', '甘M': '庆阳',
    '甘N': '临夏', '甘P': '甘南',
    '晋A': '太原', '晋B': '大同', '晋C': '阳泉', '晋D': '长治', '晋E': '晋城', '晋F': '朔州',
    '晋H': '忻州', '晋J': '吕梁', '晋K': '晋中', '晋L': '临汾', '晋M': '运城',
    '蒙A': '呼和浩特', '蒙B': '包头', '蒙C': '乌海', '蒙D': '赤峰', '蒙E': '呼伦贝尔', '蒙F': '兴安盟',
    '蒙G': '通辽', '蒙H': '锡林郭勒', '蒙J': '乌兰察布', '蒙K': '鄂尔多斯', '蒙L': '巴彦淖尔', '蒙M': '阿拉善',
    '陕A': '西安', '陕B': '铜川', '陕C': '宝鸡', '陕D': '咸阳', '陕E': '渭南', '陕F': '汉中',
    '陕G': '安康', '陕H': '商洛', '陕J': '延安', '陕K': '榆林',
    '吉A': '长春', '吉B': '吉林', '吉C': '四平', '吉D': '辽源', '吉E': '通化', '吉F': '白山',
    '吉G': '白城', '吉H': '延边', '吉J': '松原',
    '闽A': '福州', '闽B': '莆田', '闽C': '泉州', '闽D': '厦门', '闽E': '漳州', '闽F': '龙岩',
    '闽G': '三明', '闽H': '南平', '闽J': '宁德',
    '贵A': '贵阳', '贵B': '六盘水', '贵C': '遵义', '贵D': '铜仁', '贵E': '黔西南', '贵F': '毕节',
    '贵G': '安顺', '贵H': '黔东南', '贵J': '黔南',
    '粤A': '广州', '粤B': '深圳', '粤C': '珠海', '粤D': '汕头', '粤E': '佛山', '粤F': '韶关',
    '粤G': '湛江', '粤H': '肇庆', '粤J': '江门', '粤K': '茂名', '粤L': '惠州', '粤M': '梅州',
    '粤N': '汕尾', '粤P': '河源', '粤Q': '阳江', '粤R': '清远', '粤S': '东莞', '粤T': '中山',
    '粤U': '潮州', '粤V': '揭阳', '粤W': '云浮',
    '青A': '西宁', '青B': '海东', '青C': '海北', '青D': '黄南', '青E': '海南', '青F': '果洛',
    '青G': '玉树', '青H': '海西',
    '藏A': '拉萨', '藏B': '昌都', '藏C': '山南', '藏D': '日喀则', '藏E': '那曲', '藏F': '阿里', '藏G': '林芝',
    '川A': '成都', '川B': '绵阳', '川C': '自贡', '川D': '攀枝花', '川E': '泸州', '川F': '德阳',
    '川H': '广元', '川J': '遂宁', '川K': '内江', '川L': '乐山', '川M': '资阳', '川Q': '宜宾',
    '川R': '南充', '川S': '达州', '川T': '雅安', '川U': '阿坝', '川V': '甘孜', '川W': '凉山',
    '川X': '广安', '川Y': '巴中', '川Z': '眉山',
    '宁A': '银川', '宁B': '石嘴山', '宁C': '吴忠', '宁D': '固原', '宁E': '中卫',
    '琼A': '海口', '琼B': '三亚'
  };

  const PROVINCE_CAPITAL = {
    '北京': '北京', '天津': '天津', '上海': '上海', '重庆': '重庆', '河北': '石家庄', '山西': '太原',
    '内蒙古': '呼和浩特', '辽宁': '沈阳', '吉林': '长春', '黑龙江': '哈尔滨', '江苏': '南京', '浙江': '杭州',
    '安徽': '合肥', '福建': '福州', '江西': '南昌', '山东': '济南', '河南': '郑州', '湖北': '武汉',
    '湖南': '长沙', '广东': '广州', '广西': '南宁', '海南': '海口', '四川': '成都', '贵州': '贵阳',
    '云南': '昆明', '西藏': '拉萨', '陕西': '西安', '甘肃': '兰州', '青海': '西宁', '宁夏': '银川',
    '新疆': '乌鲁木齐'
  };

  const CITY_PROVINCE = {};
  Object.keys(PLATE_CITY).forEach(k => {
    const city = PLATE_CITY[k];
    if (PROVINCE_KW.indexOf(city) < 0) CITY_PROVINCE[city] = PLATE_PROVINCE[k.charAt(0)];
  });
  Object.keys(PROVINCE_CAPITAL).forEach(p => { CITY_PROVINCE[PROVINCE_CAPITAL[p]] = p; });

  function cityIn(name) {
    let best = '';
    Object.keys(CITY_PROVINCE).forEach(c => {
      if (c.length > best.length && name.indexOf(c) >= 0) best = c;
    });
    return best;
  }

  function cityOfPlate(v) {
    const p = v.charAt(0);
    if (PLATE_MUNI[p]) return PLATE_MUNI[p];
    const k = p + (v.charAt(1) || '').toUpperCase();
    if (PLATE_CITY[k]) return PLATE_CITY[k];
    return PROVINCE_CAPITAL[PLATE_PROVINCE[p]] || '';
  }

  function randomCapital() {
    const keys = Object.keys(PROVINCE_CAPITAL);
    return PROVINCE_CAPITAL[keys[Math.floor(Math.random() * keys.length)]];
  }

  const PARKING_SUFFIX = ['花园酒店', '国际酒店', '假日酒店', '大酒店', '停车场', '地下停车场', '中心停车场', '小区', '城市广场', '商贸中心'];

  function genParkingMerchant(city) {
    return city + PARKING_SUFFIX[Math.floor(Math.random() * PARKING_SUFFIX.length)];
  }

  function genBarcode() {
    const cfg = currentRegion();
    const prov = activeProvince(cfg);
    let prefix = cfg && cfg.barcodePrefix ? cfg.barcodePrefix : '0022';
    let suffixLen = 8;
    if (prov === '河南') { prefix = '4100749097'; suffixLen = 6; }
    else if (prov === '广东') { prefix = '0022'; suffixLen = 10; }
    else if (prov === '江苏') { prefix = '20'; suffixLen = 12; }
    return prefix + dtCompact() + rnd(suffixLen);
  }

  function genProductCode() {
    const cfg = currentRegion();
    if (!cfg) return '';
    const p = cfg.productCodePrefix || '';
    switch (cfg.productCodeAlgorithm) {
      case 'date_random':
        return p + dtCompact() + rnd(7);
      case 'datetime_random':
        return (p.substring(0, 5) || p) + rnd(3) + rnd(12) + dtCompact();
      default:
        return '';
    }
  }

  function applyProductFields() {
    const cfg = currentRegion();
    if (!cfg) return;
    const chk = $('randomOrderChk');
    if (chk && chk.checked) {
      const code = genProductCode() || (dtCompact() + rnd(7));
      $('productCode').value = code;
      $('productName').value = '通行费_' + code;
    } else {
      $('productCode').value = '';
      if (state.tab === 'parking') {
        const pm = ($('merchantSel').value || '').trim();
        const pp = ($('plateNumber').value || '').trim();
        $('productName').value = pp ? pm + '-' + pp : pm;
      } else {
        const prov = activeProvince(cfg);
        $('productName').value = prov ? prov + '收费站' : (cfg.productName || '');
      }
    }
  }

  function applyRegion() {
    const cfg = currentRegion();
    if (!cfg) return;
    applyProductFields();
    $('paymentMethod').value = cfg.paymentMethod || '';
    $('acquirer').value = cfg.acquirer || '';
    $('clearingService').value = cfg.clearingService || '';
    const isCustom = customAvatars[state.avatar] || (state.avatar || '').indexOf('data:') === 0;
    if (!isCustom) setAvatar(state.tab === 'parking' ? 'igs/sdd1.jpg' : cfg.avatar);
    $('barcodeNumber').value = genBarcode();
    $('tradeNumber').value = genTradeNumber();
  }

  function applyPlate() {
    const el = $('plateNumber');
    if (!el) return;
    const v = el.value.trim();
    if (!v) {
      state.plateProv = '';
      state.plateGenKey = '';
      if (state.tab === 'parking') applyProductFields();
      return;
    }
    const prov = PLATE_PROVINCE[v.charAt(0)] || '';
    if (!prov) return;
    if (state.tab === 'parking') {
      state.plateProv = prov;
      const city = cityOfPlate(v);
      if (city && state.plateGenKey !== city) {
        state.plateGenKey = city;
        $('merchantSel').value = genParkingMerchant(city);
        saveMerchant();
        applyRegion();
      }
      return;
    }
    const cfgs = configs();
    const key = Object.keys(cfgs).find(k => provinceOf(cfgs[k]) === prov);
    if (!key) return;
    $('merchantSel').value = cfgs[key].merchantName;
    lastRegionKey = key;
    applyRegion();
  }

  const customAvatars = {};

  function loadCustomAvatars() {
    try {
      const arr = JSON.parse(localStorage.getItem('bill_custom_avatars') || '[]');
      arr.forEach((it, i) => { customAvatars['custom_' + i] = it; });
    } catch (e) {}
  }

  function saveCustomAvatars() {
    try {
      localStorage.setItem('bill_custom_avatars', JSON.stringify(
        Object.keys(customAvatars).map(k => customAvatars[k])
      ));
    } catch (e) {}
  }

  function avatarSrc(key) {
    if (!key) return '';
    if (key.indexOf('data:') === 0) return key;
    if (customAvatars[key]) return customAvatars[key].src;
    return AVATAR_DATA[key] || '';
  }

  function setAvatar(key) {
    state.avatar = key;
    const src = avatarSrc(key);
    if (src) $('avatarImg').src = src;
    document.querySelectorAll('.avatar-item').forEach(el => {
      el.classList.toggle('active', el.dataset.key === key);
    });
  }

  function saveMerchant() {
    const v = ($('merchantSel').value || '').trim();
    try { localStorage.setItem('bill_merchant_' + state.tab, v); } catch (e) {}
    if (v && (state.tab === 'wechat' || state.tab === 'alipay')) {
      const cfgs = configs();
      const known = Object.keys(cfgs).some(k => cfgs[k].merchantName === v);
      if (!known) {
        const arr = loadCustomMerchants();
        if (arr.indexOf(v) < 0) { arr.push(v); saveCustomMerchants(arr); }
      }
    } else if (v && state.tab === 'etc') {
      const arr = loadCustomMerchants();
      if (arr.indexOf(v) < 0) { arr.push(v); saveCustomMerchants(arr); }
    }
  }

  function loadCustomMerchants(tab) {
    try { return JSON.parse(localStorage.getItem('bill_custom_merchants_' + (tab || state.tab)) || '[]'); } catch (e) { return []; }
  }

  function saveCustomMerchants(arr) {
    try { localStorage.setItem('bill_custom_merchants_' + state.tab, JSON.stringify(arr)); } catch (e) {}
  }

  function dropMerchantName(nm) {
    if (!nm) return;
    ['wechat', 'alipay', 'etc'].forEach(t => {
      try {
        const arr = JSON.parse(localStorage.getItem('bill_custom_merchants_' + t) || '[]');
        const i = arr.indexOf(nm);
        if (i >= 0) { arr.splice(i, 1); localStorage.setItem('bill_custom_merchants_' + t, JSON.stringify(arr)); }
      } catch (e) {}
    });
    try {
      const k = 'bill_merchant_' + state.tab;
      if ((localStorage.getItem(k) || '') === nm) localStorage.setItem(k, '');
    } catch (e) {}
    if (state.tab !== 'parking') fillMerchantSel();
    applyRegion();
  }

  function removeCustomMerchant(name) {
    const arr = loadCustomMerchants().filter(n => n !== name);
    saveCustomMerchants(arr);
    Object.keys(customAvatars).forEach(k => {
      if (customAvatars[k] && customAvatars[k].name === name) delete customAvatars[k];
    });
    saveCustomAvatars();
    if (state.avatar && !customAvatars[state.avatar]) {
      const cfg = currentRegion();
      setAvatar(state.tab === 'parking' ? 'igs/sdd1.jpg' : (cfg && cfg.avatar));
    }
    dropMerchantName(name);
    renderAvatarGrid();
  }

  function loadMerchant() {
    try { return localStorage.getItem('bill_merchant_' + state.tab) || ''; } catch (e) { return ''; }
  }

  function makeMrow(name) {
    const input = $('merchantSel');
    const drop = $('merchantDrop');
    const row = document.createElement('div');
    row.className = 'mrow';
    row.dataset.name = name;
    const sp = document.createElement('span');
    sp.textContent = name;
    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'mrow-x';
    x.textContent = '×';
    x.onmousedown = e => { e.preventDefault(); e.stopPropagation(); };
    x.onclick = e => { e.stopPropagation(); removeCustomMerchant(name); };
    row.appendChild(sp);
    row.appendChild(x);
    row.onmousedown = e => {
      e.preventDefault();
      input.value = name;
      drop.hidden = true;
      saveMerchant();
      applyRegion();
    };
    return row;
  }

  function syncCustomRows() {
    const drop = $('merchantDrop');
    if (drop.dataset.mode !== 'list') return;
    const seen = {};
    Array.from(drop.children).forEach(d => { seen[d.dataset.name] = 1; });
    loadCustomMerchants().forEach(name => {
      if (seen[name]) return;
      seen[name] = 1;
      drop.appendChild(makeMrow(name));
    });
  }

  function fillMerchantSel() {
    const input = $('merchantSel');
    const drop = $('merchantDrop');
    drop.innerHTML = '';
    const saved = loadMerchant();
    if (state.tab === 'parking') {
      input.value = saved || genParkingMerchant(randomCapital());
      input.placeholder = '选择或直接修改商户名称';
      drop.dataset.mode = 'none';
    } else if (state.tab === 'etc') {
      input.value = saved || '';
      input.placeholder = '请输入充电站或商户名称';
      loadCustomMerchants().forEach(name => {
        drop.appendChild(makeMrow(name));
      });
      drop.dataset.mode = 'list';
    } else {
      input.placeholder = '选择或直接修改商户名称';
      const cfgs = configs();
      const seen = {};
      Object.keys(cfgs).forEach(k => {
        const name = cfgs[k].merchantName;
        if (seen[name]) return;
        seen[name] = 1;
        const d = document.createElement('div');
        d.textContent = name;
        d.dataset.name = name;
        d.onmousedown = e => {
          e.preventDefault();
          input.value = d.textContent;
          drop.hidden = true;
          saveMerchant();
          applyRegion();
        };
        drop.appendChild(d);
      });
      loadCustomMerchants().forEach(name => {
        if (seen[name]) return;
        seen[name] = 1;
        drop.appendChild(makeMrow(name));
      });
      drop.dataset.mode = 'list';
      input.value = saved || Object.values(cfgs)[0].merchantName;
    }
    lastRegionKey = null;
  }

  function filterDrop() {
    const drop = $('merchantDrop');
    const v = ($('merchantSel').value || '').trim();
    let shown = 0;
    Array.from(drop.children).forEach(d => {
      const hit = !v || (d.dataset.name || d.textContent).indexOf(v) >= 0;
      d.hidden = !hit;
      if (hit) shown++;
    });
    drop.hidden = shown === 0;
  }

  function switchTab(tab) {
    state.tab = tab;
    state.plateProv = '';
    state.plateGenKey = '';
    document.querySelectorAll('.tab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    const plateField = $('plateField');
    if (plateField) plateField.hidden = tab !== 'parking';
    fillMerchantSel();
    renderAvatarGrid();
    applyRegion();
  }

  function tplKey() {
    if (state.tab === 'alipay') return 'alipay';
    if (state.tab === 'etc' || state.tab === 'parking') return 'etc';
    return 'wechat';
  }

  function genMerchantCode() {
    const { y, m, day, hh, mm, ss } = selectedDate();
    return String(y).slice(-2) + pad(m, 2) + pad(day, 2) + pad(hh, 2) + pad(mm, 2) + pad(ss, 2) + '1069123110288' + rnd(7);
  }

  function collectSettings() {
    const cfg = currentRegion() || {};
    const typed = ($('merchantSel').value || '').trim();
    const name = typed || cfg.merchantName || '';
    return {
      merchantName: name,
      merchantFullName: (typed && typed !== cfg.merchantName) ? typed : (cfg.merchantFullName || cfg.merchantName || ''),
      transferAmount: $('amount').value,
      paymentStatus: state.tab === 'alipay' ? '交易成功' : '支付成功',
      paymentTime: dtFull(),
      productName: $('productName').value,
      productCode: $('productCode').value,
      paymentMethod: $('paymentMethod').value,
      tradeNumber: $('tradeNumber').value,
      merchantCode: genMerchantCode(),
      acquirer: $('acquirer').value,
      clearingService: $('clearingService').value,
      barcodeNumber: $('barcodeNumber').value,
      avatar: avatarSrc(state.avatar),
      showProductCode: !!cfg.showProductCode
    };
  }

  function tplSet(stage, id, val) {
    const el = stage.querySelector('[id="' + id + '"]');
    if (el) el.textContent = val;
    return el;
  }

  function tplSetLines(stage, id, text) {
    const el = tplSet(stage, id, '');
    if (!el) return;
    el.innerHTML = String(text).split('\n').map(l =>
      '<span class="line">' + l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>'
    ).join('');
  }

  function fillTpl(stage, s, key) {
    if (s.avatar) {
      const av = stage.querySelector('#previewAvatar img');
      if (av) av.src = s.avatar;
    }
    tplSet(stage, 'previewMerchantName', s.merchantName);
    tplSet(stage, 'previewAmount', fmtAmount(s.transferAmount));
    tplSet(stage, 'previewPaymentStatus', s.paymentStatus);
    tplSet(stage, 'previewPaymentTime', s.paymentTime);
    tplSet(stage, 'previewPaymentMethod', s.paymentMethod);

    let product = s.productName;
    if (key !== 'alipay' && s.showProductCode && s.productCode && product.indexOf(s.productCode) < 0) product = s.productName + s.productCode;
    tplSetLines(stage, 'previewProductInfo', product);

    tplSet(stage, 'previewMerchantFullName', s.merchantFullName);
    tplSet(stage, 'previewAcquirer', s.acquirer);
    tplSet(stage, 'previewClearingService', s.clearingService);
    tplSet(stage, 'previewTradeNumber', s.tradeNumber);

    if (key === 'wechat') tplSet(stage, 'previewMerchantCode', s.merchantCode);
    if (key === 'wechat' || key === 'etc') tplSet(stage, 'previewBarcodeNumber', s.barcodeNumber);
  }

  function ensureTplStyle() {
    let st = document.getElementById('tplStyle');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tplStyle';
      document.head.appendChild(st);
    }
    return st;
  }

  function cleanupTpl() {
    const st = document.getElementById('tplStyle');
    if (st) st.textContent = '';
    const stage = $('renderStage');
    stage.innerHTML = '';
    stage.hidden = true;
  }

  async function waitTpl(stage) {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await Promise.all(Array.from(stage.querySelectorAll('img')).map(im =>
      im.decode ? im.decode().catch(() => {}) : Promise.resolve()
    ));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  }

  async function generate() {
    if (!$('amount').value.trim()) { alert('请填写金额'); return; }
    if (state.tab === 'parking' && !($('plateNumber').value || '').trim()) { alert('请输入车牌号'); return; }
    if (state.tab === 'parking') applyProductFields();

    let vr;
    try { vr = await sbRpc('img_redeem_session', { p_device: deviceId() }); }
    catch (e) { kickLogin('网络异常，请联网后重新验证'); return; }
    if (!(vr && vr.valid)) { kickLogin(kickReason(vr)); return; }
    setSession(vr); renderCdk(vr);

    if (!$('tradeNumber').value.trim()) $('tradeNumber').value = genTradeNumber();
    if (!$('barcodeNumber').value.trim()) $('barcodeNumber').value = genBarcode();

    const s = collectSettings();
    const key = tplKey();
    const t = window.TPL && TPL[key];
    if (!t) { alert('模板数据缺失'); return; }

    $('formPanel').hidden = true;
    $('previewPanel').hidden = false;
    window.scrollTo(0, 0);

    const stage = $('renderStage');
    const out = $('previewImg');
    out.hidden = true;
    out.removeAttribute('src');
    const st = ensureTplStyle();
    st.textContent = t.css;
    stage.innerHTML = t.body;
    stage.hidden = false;

    try {
      fillTpl(stage, s, key);
      await waitTpl(stage);
      const canvas = await html2canvas(stage, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: 375
      });
      state.lastCanvas = canvas;
      out.src = canvas.toDataURL('image/png');
      cleanupTpl();
      out.hidden = false;
    } catch (e) {
      cleanupTpl();
      alert('生成失败：' + e.message);
      $('previewPanel').hidden = true;
      $('formPanel').hidden = false;
    }
  }

  function download() {
    const canvas = state.lastCanvas;
    if (!canvas) { alert('请先生成预览'); return; }
    const name = `滴滴答滴答v1.0_${state.tab}_${$('amount').value}.png`;
    try {
      canvas.toBlob(blob => {
        if (!blob) { alert('导出失败，请右键图片另存'); return; }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      }, 'image/png');
    } catch (e) {
      alert('导出失败，请右键图片另存');
    }
  }

  function avatarNameMap() {
    const map = {};
    [regionConfigs, ZFBregionConfigs].forEach(cfg => {
      Object.keys(cfg).forEach(k => {
        const a = cfg[k].avatar;
        if (a && !map[a]) map[a] = cfg[k].merchantName;
      });
    });
    map['igs/ttc4353_056.jpg'] = '默认头像';
    map['igs/zfb.png'] = '支付宝';
    map['igs/sdd1.jpg'] = '停车场(道闸)';
    Object.keys(customAvatars).forEach(k => { map[k] = customAvatars[k].name || '自定义头像'; });
    return map;
  }

  const TAB_AVATARS = {
    parking: ['igs/sdd1.jpg', 'igs/ttc4353_056.jpg'],
    alipay: ['igs/zfb.png']
  };

  function avatarVisible(k) {
    if (k.indexOf('custom_') === 0) return true;
    const list = TAB_AVATARS[state.tab];
    return !list || list.indexOf(k) >= 0;
  }

  function renderAvatarGrid() {
    const grid = $('avatarGrid');
    grid.innerHTML = '';
    const names = avatarNameMap();
    Object.keys(customAvatars).concat(Object.keys(AVATAR_DATA))
      .filter(avatarVisible)
      .forEach(k => {
        const item = document.createElement('div');
        item.className = 'avatar-item';
        item.dataset.key = k;
        const img = document.createElement('img');
        img.src = avatarSrc(k);
        const name = document.createElement('span');
        name.textContent = names[k] || k.replace('igs/', '').replace(/\.[^.]+$/, '');
        item.appendChild(img);
        item.appendChild(name);
        item.onclick = () => {
          setAvatar(k);
          $('avatarModal').hidden = true;
        };
        if (k.indexOf('custom_') === 0) {
          const del = document.createElement('button');
          del.type = 'button';
          del.className = 'avatar-del';
          del.textContent = '×';
          del.onclick = e => {
            e.stopPropagation();
            const nm = (customAvatars[k] && customAvatars[k].name) || '';
            delete customAvatars[k];
            saveCustomAvatars();
            if (state.avatar === k) {
              const cfg = currentRegion();
              setAvatar(state.tab === 'parking' ? 'igs/sdd1.jpg' : (cfg && cfg.avatar));
            }
            if (nm) dropMerchantName(nm);
            renderAvatarGrid();
          };
          item.appendChild(del);
        }
        grid.appendChild(item);
      });
    document.querySelectorAll('.avatar-item').forEach(el => {
      el.classList.toggle('active', el.dataset.key === state.avatar);
    });
  }

  const crop = { x: 0, y: 0, iw: 0, ih: 0, nw: 0, nh: 0, scale: 1, min: 1, pts: {}, pinch: null, drag: null };

  function openCrop(src) {
    const stage = $('cropStage');
    const img = $('cropImg');
    $('cropCompanyName').value = '';
    $('cropModal').hidden = false;
    crop.pts = {};
    crop.pinch = null;
    crop.drag = null;
    img.onload = () => {
      const sw = stage.clientWidth || 220, sh = stage.clientHeight || 220;
      crop.nw = img.naturalWidth;
      crop.nh = img.naturalHeight;
      crop.min = Math.max(sw / crop.nw, sh / crop.nh);
      crop.scale = Math.max(1, crop.min);
      crop.iw = crop.nw * crop.scale;
      crop.ih = crop.nh * crop.scale;
      img.style.width = crop.iw + 'px';
      img.style.height = crop.ih + 'px';
      crop.x = (sw - crop.iw) / 2;
      crop.y = (sh - crop.ih) / 2;
      moveCrop();
    };
    img.src = src;
  }

  function zoomCrop(factor, px, py) {
    let s = crop.scale * factor;
    const max = Math.max(crop.min * 8, 8);
    s = Math.min(Math.max(s, crop.min), max);
    if (s === crop.scale) return;
    const k = s / crop.scale;
    crop.x = px - (px - crop.x) * k;
    crop.y = py - (py - crop.y) * k;
    crop.scale = s;
    crop.iw = crop.nw * s;
    crop.ih = crop.nh * s;
    $('cropImg').style.width = crop.iw + 'px';
    $('cropImg').style.height = crop.ih + 'px';
    moveCrop();
  }

  function pinchState() {
    const ids = Object.keys(crop.pts);
    if (ids.length < 2) return null;
    const a = crop.pts[ids[0]], b = crop.pts[ids[1]];
    return { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  }

  function moveCrop() {
    const stage = $('cropStage');
    const sw = stage.clientWidth, sh = stage.clientHeight;
    crop.x = Math.min(0, Math.max(sw - crop.iw, crop.x));
    crop.y = Math.min(0, Math.max(sh - crop.ih, crop.y));
    $('cropImg').style.transform = 'translate(' + crop.x + 'px,' + crop.y + 'px)';
  }

  function confirmCrop() {
    const stage = $('cropStage');
    const img = $('cropImg');
    const size = 256;
    const cv = document.createElement('canvas');
    cv.width = size;
    cv.height = size;
    const ctx = cv.getContext('2d');
    const k = size / stage.clientWidth;
    ctx.drawImage(img, crop.x * k, crop.y * k, crop.iw * k, crop.ih * k);
    const src = cv.toDataURL('image/jpeg', 0.9);
    const name = ($('cropCompanyName').value || '').trim();
    let n = 0;
    while (customAvatars['custom_' + n]) n++;
    const key = 'custom_' + n;
    customAvatars[key] = { src: src, name: name };
    saveCustomAvatars();
    $('cropModal').hidden = true;
    if (name) { $('merchantSel').value = name; saveMerchant(); applyRegion(); }
    renderAvatarGrid();
    setAvatar(key);
  }

  function initAvatarModal() {
    $('pickAvatarBtn').onclick = () => { renderAvatarGrid(); $('avatarModal').hidden = false; };
    $('closeModal').onclick = () => { $('avatarModal').hidden = true; };
    $('avatarModal').onclick = e => { if (e.target === $('avatarModal')) $('avatarModal').hidden = true; };
    $('uploadAvatarBtn').onclick = () => $('fileInput').click();
    $('fileInput').onchange = e => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => openCrop(r.result);
      r.readAsDataURL(f);
      e.target.value = '';
    };

    const stage = $('cropStage');
    stage.addEventListener('pointerdown', e => {
      crop.pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      try { stage.setPointerCapture(e.pointerId); } catch (ex) {}
      const n = Object.keys(crop.pts).length;
      if (n === 1) {
        crop.drag = { sx: e.clientX, sy: e.clientY, ox: crop.x, oy: crop.y };
        crop.pinch = null;
      } else {
        crop.drag = null;
        crop.pinch = pinchState();
      }
    });
    stage.addEventListener('pointermove', e => {
      if (!(e.pointerId in crop.pts)) return;
      crop.pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (crop.pinch) {
        const now = pinchState();
        if (now && crop.pinch.d > 0 && now.d > 0) {
          const r = stage.getBoundingClientRect();
          zoomCrop(now.d / crop.pinch.d, now.mx - r.left, now.my - r.top);
        }
        if (now) crop.pinch.d = now.d;
        return;
      }
      if (crop.drag) {
        crop.x = crop.drag.ox + (e.clientX - crop.drag.sx);
        crop.y = crop.drag.oy + (e.clientY - crop.drag.sy);
        moveCrop();
      }
    });
    const endPointer = e => {
      delete crop.pts[e.pointerId];
      crop.pinch = null;
      const ids = Object.keys(crop.pts);
      if (ids.length === 1) {
        const p = crop.pts[ids[0]];
        crop.drag = { sx: p.x, sy: p.y, ox: crop.x, oy: crop.y };
      } else {
        crop.drag = null;
      }
    };
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);
    stage.addEventListener('wheel', e => {
      e.preventDefault();
      const r = stage.getBoundingClientRect();
      zoomCrop(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    $('cropCancel').onclick = () => { $('cropModal').hidden = true; };
    $('cropClose').onclick = () => { $('cropModal').hidden = true; };
    $('cropOk').onclick = confirmCrop;
  }

  function renderCdk(sess) {
    if (sess && sess.code && sess.expires_at) {
      $('cdkCode').textContent = sess.code;
      $('cdkTime').textContent = '到期 ' + sess.expires_at;
    } else {
      $('cdkCode').textContent = '--';
      $('cdkTime').textContent = '到期 --';
    }
  }

  function kickLogin(m) {
    stopKickWatch();
    clearSession();
    renderCdk(null);
    const s = $('loginScreen');
    if (s) s.hidden = false;
    const msg = $('loginMsg');
    if (msg) { msg.textContent = m || ''; msg.hidden = !m; }
    const k = $('cardKey');
    if (k) k.value = '';
    window.scrollTo(0, 0);
  }

  function initLogin() {
    const screen = $('loginScreen');
    if (!screen) return;
    const msg = $('loginMsg');
    const btn = $('loginBtn');
    const enter = () => { screen.hidden = true; };

    const sess = getSession();
    if (sess) {
      sbRpc('img_redeem_session', { p_device: deviceId() })
        .then(res => {
          if (res && res.valid) { setSession(res); renderCdk(res); startKickWatch(res.code || sess.code); enter(); }
          else kickLogin(kickReason(res));
        })
        .catch(() => kickLogin('网络异常，请联网后重新验证'));
      return;
    }

    const doLogin = () => {
      const raw = ($('cardKey').value || '').toUpperCase().replace(/\s+/g, '');
      if (!/^[A-Z0-9]{18}$/.test(raw)) {
        msg.textContent = '请输入18位兑换码';
        msg.hidden = false;
        return;
      }
      btn.disabled = true;
      btn.textContent = '验证中…';
      sbRpc('img_redeem_redeem', { p_code: raw, p_device: deviceId() })
        .then(res => {
          btn.disabled = false;
          btn.textContent = '立即验证';
          if (res && res.ok === true) {
            msg.hidden = true;
            setSession(res);
            renderCdk(res);
            startKickWatch(res.code);
            notifyKick(res.code);
            enter();
          } else {
            msg.textContent = (res && res.msg) || '验证失败，请重试';
            msg.hidden = false;
          }
        })
        .catch(() => {
          btn.disabled = false;
          btn.textContent = '立即验证';
          msg.textContent = '网络异常，请检查网络后重试';
          msg.hidden = false;
        });
    };
    btn.onclick = doLogin;
    $('cardKey').onkeydown = e => { if (e.key === 'Enter') doLogin(); };
    const ub = $('usageBtn');
    if (ub) ub.onclick = () => alert('使用说明：\n1. 一个兑换码绑定一台设备，验证通过后开始计时；\n2. 换新设备登录会自动顶掉旧设备，旧设备自动退出；\n3. 软件需联网使用，断网会退出登录；\n4. 到期后购买新兑换码重新验证即可继续使用。');
    const bb = $('buyBtn');
    const bp = $('buyPop');
    const selectBuyTab = k => {
      const btn = document.querySelector('.buy-pop-tab[data-k="' + k + '"]');
      if (!btn || !window.BUY_QR || !BUY_QR[k]) return;
      $('buyPopTitle').textContent = btn.textContent.trim();
      $('buyPopQrImg').src = BUY_QR[k];
      document.querySelectorAll('.buy-pop-tab').forEach(b => b.classList.toggle('active', b.dataset.k === k));
    };
    if (bb) bb.onclick = () => { selectBuyTab('week'); bp.hidden = false; };
    const bpc = $('buyPopClose');
    if (bpc) bpc.onclick = () => { bp.hidden = true; };
    if (bp) bp.onclick = e => {
      if (e.target === bp) { bp.hidden = true; return; }
      const tab = e.target.closest && e.target.closest('.buy-pop-tab');
      if (tab) selectBuyTab(tab.dataset.k);
    };
  }

  function initCdk() {
    renderCdk(getSession());
    const verify = () => {
      if (!screenVisible()) return;
      if (!getSession()) return;
      sbRpc('img_redeem_session', { p_device: deviceId() })
        .then(res => {
          if (res && res.valid) { setSession(res); renderCdk(res); }
          else kickLogin(kickReason(res));
        })
        .catch(() => kickLogin('网络异常，请联网后重新验证'));
    };
    setInterval(verify, 600000);
    window.addEventListener('offline', () => {
      if (screenVisible()) kickLogin('网络已断开，请联网后重新验证');
    });
    function screenVisible() {
      const s = $('loginScreen');
      return s && s.hidden === true;
    }
  }

  function initFolds() {
    let st = {};
    try { st = JSON.parse(localStorage.getItem('bill_folds') || '{}'); } catch (e) {}
    document.querySelectorAll('.field.foldable').forEach(f => {
      const id = f.dataset.fold;
      const open = !!st[id];
      f.classList.toggle('open', open);
      f.querySelector('label').onclick = () => {
        const now = !f.classList.contains('open');
        f.classList.toggle('open', now);
        st[id] = now;
        try { localStorage.setItem('bill_folds', JSON.stringify(st)); } catch (e) {}
      };
    });
  }

  function init() {
    preloadAvatars();
    initLogin();
    loadCustomAvatars();
    initCdk();
    initFolds();

    document.querySelectorAll('.tab').forEach(b => {
      b.onclick = () => switchTab(b.dataset.tab);
    });

    const now = new Date();
    $('datePart').value = `${now.getFullYear()}-${pad(now.getMonth() + 1, 2)}-${pad(now.getDate(), 2)}`;
    $('timePart').value = `${pad(now.getHours(), 2)}:${pad(now.getMinutes(), 2)}:${pad(now.getSeconds(), 2)}`;

    $('merchantSel').onchange = () => { saveMerchant(); applyRegion(); };
    $('merchantSel').oninput = filterDrop;
    $('merchantSel').onblur = () => { $('merchantDrop').hidden = true; };
    $('merchantArrow').onmousedown = e => {
      e.preventDefault();
      const drop = $('merchantDrop');
      if (drop.dataset.mode !== 'list') return;
      syncCustomRows();
      if (drop.hidden) {
        if (!drop.children.length) return;
        Array.from(drop.children).forEach(d => { d.hidden = false; });
        drop.hidden = false;
      } else {
        drop.hidden = true;
      }
    };
    document.addEventListener('click', e => {
      const drop = $('merchantDrop');
      if (drop && !drop.contains(e.target) && e.target !== $('merchantSel') && e.target.id !== 'merchantArrow') drop.hidden = true;
    });
    const plateEl = $('plateNumber');
    if (plateEl) plateEl.oninput = applyPlate;
    const rp = $('randPlate');
    if (rp) rp.onclick = () => {
      const cur = ($('plateNumber').value || '').trim();
      const keys = Object.keys(PLATE_PROVINCE);
      const head = cur.charAt(0) && PLATE_PROVINCE[cur.charAt(0)] ? cur.charAt(0) : keys[Math.floor(Math.random() * keys.length)];
      let letter = cur.length >= 2 && /[A-Za-z]/.test(cur.charAt(1)) ? cur.charAt(1).toUpperCase() : '';
      if (!letter) letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const cs = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      let tail = '';
      for (let i = 0; i < 5; i++) tail += cs.charAt(Math.floor(Math.random() * cs.length));
      plateEl.value = head + letter + tail;
      applyPlate();
    };
    $('genTradeNumber').onclick = () => { $('tradeNumber').value = genTradeNumber(); };
    $('genBarcode').onclick = () => { $('barcodeNumber').value = genBarcode(); };
    const orderChk = $('randomOrderChk');
    if (orderChk) orderChk.onchange = applyProductFields;

    $('generateBtn').onclick = generate;
    $('downloadBtn').onclick = download;
    $('backBtn').onclick = () => {
      $('previewPanel').hidden = true;
      $('formPanel').hidden = false;
    };

    initAvatarModal();
    switchTab('wechat');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
