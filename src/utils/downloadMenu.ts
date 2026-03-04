import { SIGNATURE_DISHES, CATERING_PACKAGES, MENU_ADDONS } from '../data/constants';

export const downloadMenu = () => {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Perfect Perfections Catering — Menu</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;color:#1a1a1a;max-width:700px;margin:0 auto;padding:60px 40px}
h1{font-size:28px;text-align:center;margin-bottom:6px}h2{font-size:13px;text-align:center;letter-spacing:4px;text-transform:uppercase;color:#888;margin-bottom:40px;font-weight:400}
h3{font-size:20px;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #000}.section{margin-bottom:36px}
.item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dotted #ddd}.item-name{font-weight:bold}.item-desc{color:#666;font-size:13px;margin-top:2px}
.pkg{margin-bottom:20px;padding:16px;border:1px solid #eee}.pkg-title{font-weight:bold;font-size:16px;margin-bottom:4px}.pkg-price{color:#666;font-size:14px}
.footer{margin-top:40px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:20px}
@media print{body{padding:40px 30px}}</style></head><body>
<h1>Perfect Perfections Catering</h1><h2>Menu & Packages</h2>
<div class="section"><h3>Signature Dishes</h3>
${SIGNATURE_DISHES.map(d => `<div class="item"><div><div class="item-name">${d.name}</div><div class="item-desc">${d.description}</div></div></div>`).join('')}
</div>
<div class="section"><h3>Catering Packages</h3>
${CATERING_PACKAGES.map(p => `<div class="pkg"><div class="pkg-title">${p.name}</div><div class="pkg-price">Starting at $${p.pricePerPerson}/person · Min ${p.minGuests} guests</div><div class="item-desc" style="margin-top:8px">${p.includes.join(' · ')}</div></div>`).join('')}
</div>
<div class="section"><h3>Add-Ons</h3>
${MENU_ADDONS.map(a => `<div class="item"><span class="item-name">${a.name}</span><span>$${a.price}${a.per === 'person' ? '/person' : ' flat'}</span></div>`).join('')}
</div>
<div class="footer">Perfect Perfections Catering · Chicago, IL<br>For inquiries and bookings, contact us directly.</div>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'perfect-perfections-menu.html';
  a.click();
  URL.revokeObjectURL(url);
};
