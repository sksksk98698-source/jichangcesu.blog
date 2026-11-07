import fs from 'node:fs';
import path from 'node:path';

const baseDir = 'c:/Users/Pro User/Desktop/机场品牌信息';
const listFile = path.join(baseDir, '42家机场品牌清单.txt');
const clientFile = path.join(baseDir, '第三方代理客户端.txt');
const content = fs.readFileSync(listFile, 'utf8');

// 收集图片列表
const imgDir = path.resolve('template-t001-nova/public/assets/images/reviews');
const availableImages = fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : [];

function findImage(name) {
  const cleanName = name.replace(/（.*）/, '').trim();
  const aliasMap = {
    '微风网络': '微风',
    '暮光加速': '幕光',
    'SOGO 云': 'SOGO云'
  };
  const targetKey = aliasMap[cleanName] || cleanName;
  const match = availableImages.find(img => img.includes(targetKey));
  return match ? `/assets/images/reviews/${match}` : null;
}

const brands = [];

// 解析前部 28 个品牌
const frontParts = content.slice(0, content.indexOf('这14家机场 位置都往后面排'));
const frontBlocks = frontParts.split(/\n(?=(?:主推)?##\s*\d+\.)/m).filter(b => b.trim().length > 0);

for (const block of frontBlocks) {
  const titleMatch = block.match(/(?:主推)?##\s*(\d+)\.\s*([^\n\r]+)/);
  if (!titleMatch) continue;
  const rank = parseInt(titleMatch[1], 10);
  const fullName = titleMatch[2].trim();
  const name = fullName.replace(/（.*）/, '').trim();
  const slug = (fullName.match(/（(.*)）/) || [])[1] || name.toLowerCase();

  const linkMatch = block.match(/\*\*注册链接\*\*[:：]\s*`?([^`\s\n]+)`?/);
  const affUrl = linkMatch ? linkMatch[1] : '';

  const promoMatch = block.match(/优惠码\s*`?([a-zA-Z0-9_-]+)`?/);
  const promoCode = promoMatch ? promoMatch[1] : '';

  const priceMatch = block.match(/(?:最低入门价格约|年付约|月付约|入门价格约|最低约|约)?\s*(\d+(?:\.\d+)?\s*元(?:\/月|\/年)?|\d+元)/);
  const startingPrice = priceMatch ? priceMatch[0] : '¥15/月起';

  const yearMatch = block.match(/(\d{4})年运营/);
  const launchYear = yearMatch ? yearMatch[1] : '稳定运营中';

  const features = [];
  const lines = block.split('\n');
  for (const line of lines) {
    const l = line.trim();
    if (l.startsWith('- ') && !l.includes('注册链接') && !l.includes('测速') && l.length > 3) {
      features.push(l.replace(/^[-\s*]+/, '').replace(/\*\*/g, '').trim());
    }
  }

  const packages = [];
  const pkgTable = block.match(/套餐价格[\s\S]*?(?=\n\s*\n|测速|流媒体|介绍说明|$)/);
  if (pkgTable) {
    const pkgLines = pkgTable[0].split('\n');
    for (const pl of pkgLines) {
      if (pl.includes('¥') || pl.includes('元')) {
        const parts = pl.split('|').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 3) {
          packages.push({
            name: parts[0],
            billing: parts[1],
            price: parts[2],
            traffic: parts[3] || '',
            cycle: parts[4] || ''
          });
        }
      }
    }
  }

  const speedData = [];
  const speedMatch = block.match(/测速[\s\S]*?(?=\n\s*\n|流媒体|介绍说明|$)/);
  if (speedMatch) {
    const spLines = speedMatch[0].split('\n');
    for (const sl of spLines) {
      if (sl.includes('ms') || sl.includes('Mbps') || sl.includes('MB/s')) {
        const parts = sl.split(/[\t|]/).map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          speedData.push({
            region: parts[0],
            latency: parts[1],
            download: parts[2] || ''
          });
        }
      }
    }
  }

  const descMatch = block.match(/介绍说明[：:]?\s*([\s\S]*?)(?=\n\s*\n|待核实|文末引导|$)/);
  const description = descMatch ? descMatch[1].trim() : '';

  const isHero = name === '光速云';
  const isTop10 = rank <= 10;

  brands.push({
    id: brands.length + 1,
    rank,
    name,
    fullName,
    slug: slug.toLowerCase(),
    isHero,
    isTop10,
    affUrl,
    promoCode,
    startingPrice,
    launchYear,
    lineType: block.includes('IEPL') ? 'IEPL企业专线' : block.includes('IPLC') ? 'IPLC专线' : block.includes('BGP') ? 'BGP智能隧道' : '高带宽专线',
    protocols: block.includes('VLESS') ? ['VLESS', 'Trojan', 'SS'] : ['Shadowsocks', 'Trojan', 'Vmess'],
    streamingUnblock: block.includes('Netflix') || block.includes('Disney+') || block.includes('YouTube') || isHero,
    aiUnblock: block.includes('ChatGPT') || block.includes('Claude') || isHero,
    speedtestImage: findImage(name),
    unlockImages: isHero ? [
      '/assets/images/reviews/photo_2026-08-19_12-13-01.jpg',
      '/assets/images/reviews/photo_2026-08-19_12-13-50.jpg'
    ] : [],
    features: features.slice(0, 5),
    packages,
    speedData: speedData.slice(0, 5),
    description,
    tag: isHero ? '榜首力荐 · 永久套餐' : isTop10 ? 'TOP 10 核心梯队' : '精选实测'
  });
}

// 解析后部 14 个品牌
const backParts = content.slice(content.indexOf('这14家机场 位置都往后面排'));
const tailRegex = /([A-Za-z0-9\u4e00-\u9fa5\s]{2,25})\r?\n基础信息[\s\S]*?(?=(?:[A-Za-z0-9\u4e00-\u9fa5\s]{2,25}\r?\n基础信息)|$)/g;
let tm;
while ((tm = tailRegex.exec(backParts)) !== null) {
  const block = tm[0];
  let rawName = tm[1].trim().replace(/^\d+\.\s*/, '').replace(/^-.*$/, '').trim();
  if (rawName.includes('当前协议')) {
    rawName = 'CyberGuard';
  }
  const name = rawName.replace(/（.*）/, '').trim();
  const slug = name.toLowerCase();

  const linkMatch = block.match(/(?:保存的入口或推广链接|推广地址)[：:]\s*(https?:\/\/[^\s\n]+)/);
  const affUrl = linkMatch ? linkMatch[1] : '';

  const promoMatch = block.match(/优惠码[：:]\s*`?([a-zA-Z0-9_-]+)`?/);
  const promoCode = promoMatch ? promoMatch[1] : '';

  const features = [];
  const featMatch = block.match(/核心特色[\s\S]*?(?=\n\s*\n|套餐价格|测速|$)/);
  if (featMatch) {
    const fLines = featMatch[0].split('\n');
    for (const fl of fLines) {
      if (fl.trim().startsWith('- ')) {
        features.push(fl.replace(/^[-\s*]+/, '').trim());
      }
    }
  }

  const descMatch = block.match(/介绍说明[：:]?\s*([\s\S]*?)(?=\n\s*\n|待核实|$)/);
  const description = descMatch ? descMatch[1].trim() : '';

  brands.push({
    id: brands.length + 1,
    rank: brands.length + 1,
    name,
    fullName: rawName,
    slug,
    isHero: false,
    isTop10: false,
    affUrl,
    promoCode,
    startingPrice: '按需选购',
    launchYear: '2020-2024',
    lineType: block.includes('IEPL') ? 'IEPL企业专线' : '高带宽隧道',
    protocols: ['Shadowsocks', 'Trojan'],
    streamingUnblock: block.includes('Netflix') || block.includes('Disney+'),
    aiUnblock: block.includes('ChatGPT') || block.includes('OpenAI'),
    speedtestImage: findImage(name),
    unlockImages: [],
    features: features.slice(0, 4),
    packages: [],
    speedData: [],
    description,
    tag: '长效实测档'
  });
}

console.log('Successfully structured total brands:', brands.length);

// 写入 airports.json
fs.writeFileSync('template-t001-nova/src/data/airports.json', JSON.stringify(brands, null, 2), 'utf8');

// 解析客户端数据
const clientContent = fs.readFileSync(clientFile, 'utf8');
const clientSections = [];

const sections = clientContent.split(/[一二三四五六]、/g).slice(1);
const sectionTitles = ['Windows 电脑客户端', 'Android 安卓客户端', 'iPhone / iPad 客户端', 'macOS 苹果电脑客户端', 'Linux 客户端', 'OpenWrt / 软路由客户端'];

sections.forEach((sec, idx) => {
  const lines = sec.trim().split('\n');
  const items = [];
  for (const line of lines) {
    if (line.includes('GitHub') || line.includes('App Store') || line.includes('官方文档') || line.includes('官网')) {
      const parts = line.split('\t').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        items.push({
          name: parts[0],
          features: parts[1] || '',
          source: parts[2] || '官方推荐'
        });
      }
    }
  }
  clientSections.push({
    platform: sectionTitles[idx],
    description: lines[1] || '',
    items
  });
});

fs.writeFileSync('template-t001-nova/src/data/clients.json', JSON.stringify(clientSections, null, 2), 'utf8');
console.log('Successfully generated clients.json');
