'use strict';
const $ = (id) => document.getElementById(id);
const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');
const api = async (url, opt) => {
  const r = await fetch(url, opt && { ...opt, headers: { 'Content-Type': 'application/json' } });
  if (!r.ok) { alert('Lỗi: ' + ((await r.json().catch(() => ({}))).error || r.status)); return null; }
  return r.status === 204 ? true : r.json();
};
const td = (text) => { const e = document.createElement('td'); e.textContent = text; return e; };

async function load() {
  const cats = await api('/api/categories') || [];
  $('txCategory').replaceChildren(...cats.map((c) => new Option(`${c.name} (${c.type})`, c.id)));
  $('catList').replaceChildren(...cats.map((c) => {
    const s = document.createElement('span'); s.textContent = c.name;
    const x = document.createElement('a'); x.textContent = ' ×'; x.href = '#';
    x.onclick = async (e) => { e.preventDefault(); if (await api('/api/categories/' + c.id, { method: 'DELETE' })) load(); };
    s.append(x); return s;
  }));

  const rep = await api('/api/reports/summary');
  if (rep) {
    const inc = Number(rep.totals.income), exp = Number(rep.totals.expense);
    $('income').textContent = fmt(inc); $('expense').textContent = fmt(exp); $('balance').textContent = fmt(inc - exp);
    const max = Math.max(1, ...rep.byCategory.map((c) => Number(c.total)));
    $('byCategory').replaceChildren(...rep.byCategory.map((c) => {
      const d = document.createElement('div'); d.className = 'bar';
      const l = document.createElement('span'); l.textContent = `${c.name}: ${fmt(c.total)}`; l.style.minWidth = '200px';
      const b = document.createElement('i'); b.className = c.type; b.style.width = (Number(c.total) / max * 300) + 'px';
      d.append(l, b); return d;
    }));
    $('byMonth').replaceChildren(...rep.byMonth.map((m) => {
      const tr = document.createElement('tr'); tr.append(td(m.month), td(fmt(m.income)), td(fmt(m.expense))); return tr;
    }));
  }

  const txs = await api('/api/transactions') || [];
  $('txList').replaceChildren(...txs.map((t) => {
    const tr = document.createElement('tr');
    const b = document.createElement('button'); b.className = 'del'; b.textContent = 'Xóa';
    b.onclick = async () => { if (await api('/api/transactions/' + t.id, { method: 'DELETE' })) load(); };
    const last = document.createElement('td'); last.append(b);
    tr.append(td(String(t.occurred_on).slice(0, 10)), td(t.category), td(t.note || ''),
      td((t.type === 'expense' ? '-' : '+') + fmt(t.amount)), last);
    return tr;
  }));
}

$('txForm').onsubmit = async (e) => {
  e.preventDefault();
  const ok = await api('/api/transactions', { method: 'POST', body: JSON.stringify({
    category_id: parseInt($('txCategory').value, 10), amount: Number($('txAmount').value),
    note: $('txNote').value, occurred_on: $('txDate').value }) });
  if (ok) { e.target.reset(); $('txDate').valueAsDate = new Date(); load(); }
};
$('catForm').onsubmit = async (e) => {
  e.preventDefault();
  if (await api('/api/categories', { method: 'POST', body: JSON.stringify({ name: $('catName').value, type: $('catType').value }) })) { e.target.reset(); load(); }
};
$('txDate').valueAsDate = new Date();
load();
