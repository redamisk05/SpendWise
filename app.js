'use strict';
// SpendWise stores all data locally in this browser. No accounts or servers are involved.
const STORAGE_KEY = 'spendwise.transactions.v1';
const CURRENCY_KEY = 'spendwise.currency.v1';
const categories = {
  expense: ['Food & Drinks', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
  income: ['Salary', 'Freelance', 'Gift', 'Refund', 'Other']
};
const palette = ['#628aff', '#36d3a0', '#ffb76a', '#bd91ff', '#ff8095', '#55c8d9', '#e7d277', '#8294b1'];
const $ = (id) => document.getElementById(id);
function readTransactions() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(data)) return [];
    return data.filter(t => t && typeof t.id === 'string' && typeof t.description === 'string' && ['income', 'expense'].includes(t.type) && Number.isFinite(t.amount) && t.amount > 0 && typeof t.category === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date));
  } catch { return []; }
}
let transactions = readTransactions();
let currency = ['CAD', 'USD', 'EUR'].includes(localStorage.getItem(CURRENCY_KEY)) ? localStorage.getItem(CURRENCY_KEY) : 'CAD';
$('currency').value = currency;
const money = value => new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(value);
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); return true; } catch { alert('Your browser could not save the data. Check storage settings.'); return false; } }
function updateCategories() { $('category').replaceChildren(...categories[$('type').value].map(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; return o; })); }
function render() {
  const income = transactions.filter(t => t.type === 'income').reduce((s,t) => s+t.amount,0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount,0);
  $('balance').textContent = money(income-expenses);
  $('income').textContent = money(income);
  $('expenses').textContent = money(expenses);
  $('transactionCount').textContent = transactions.length.toLocaleString();
  const exp = transactions.filter(t => t.type === 'expense');
  const byCategory = new Map();
  exp.forEach(t => byCategory.set(t.category, (byCategory.get(t.category) || 0)+t.amount));
  const entries = [...byCategory.entries()].sort((a,b) => b[1]-a[1]);
  $('categoryCount').textContent = entries.length;
  $('largestExpense').textContent = money(exp.length ? Math.max(...exp.map(t => t.amount)) : 0);
  $('donutTotal').textContent = money(expenses);
  let angle = 0;
  const slices = entries.map(([name,amount],i) => { const start=angle; angle+=amount/expenses*100; return `${palette[i % palette.length]} ${start}% ${angle}%`; });
  $('donut').style.background = slices.length ? `conic-gradient(${slices.join(',')})` : '#293650';
  $('donut').setAttribute('aria-label', slices.length ? 'Expenses: '+entries.map(([name,amount]) => `${name} ${money(amount)}`).join(', ') : 'No expenses yet');
  $('legend').innerHTML = entries.length ? entries.map(([name,amount],i) => `<div class="legend-row"><span class="legend-name"><span class="swatch" style="background:${palette[i % palette.length]}"></span>${escapeHtml(name)}</span><strong>${Math.round(amount/expenses*100)}%</strong></div>`).join('') : '<p class="muted">Add an expense to see your breakdown.</p>';
  const search = $('search').value.trim().toLowerCase();
  const filter = $('typeFilter').value;
  const visible = transactions.filter(t => (filter === 'all' || t.type === filter) && (t.description.toLowerCase().includes(search) || t.category.toLowerCase().includes(search))).sort((a,b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  $('transactionRows').innerHTML = visible.map(t => `<tr><td>${escapeHtml(t.description)}</td><td><span class="category-chip">${escapeHtml(t.category)}</span></td><td>${escapeHtml(t.date)}</td><td class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</td><td><button type="button" class="delete-btn" data-delete="${escapeHtml(t.id)}" aria-label="Delete ${escapeHtml(t.description)}" title="Delete transaction">×</button></td></tr>`).join('');
  $('emptyState').hidden = visible.length > 0;
  $('transactionRows').parentElement.parentElement.hidden = visible.length === 0;
}
function openDialog() { $('transactionForm').reset(); $('date').value = new Date().toLocaleDateString('en-CA'); updateCategories(); $('formError').hidden = true; $('transactionDialog').showModal(); $('description').focus(); }
$('addBtn').addEventListener('click',openDialog);
$('emptyAddBtn').addEventListener('click',openDialog);
$('closeDialog').addEventListener('click',()=> $('transactionDialog').close());
$('cancelDialog').addEventListener('click',()=> $('transactionDialog').close());
$('type').addEventListener('change',updateCategories);
$('currency').addEventListener('change',e => { currency=e.target.value; try { localStorage.setItem(CURRENCY_KEY,currency); } catch {} render(); });
$('search').addEventListener('input',render);
$('typeFilter').addEventListener('change',render);
$('transactionForm').addEventListener('submit',e => {
  e.preventDefault();
  const description=$('description').value.trim(); const amount=Number($('amount').value); const type=$('type').value; const category=$('category').value; const date=$('date').value;
  if (!description || !Number.isFinite(amount) || amount<=0 || amount>999999999 || !categories[type]?.includes(category) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date+'T00:00:00'))) { $('formError').textContent='Please enter valid transaction details.'; $('formError').hidden=false; return; }
  const id=typeof crypto!=='undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const transaction={id,description,type,category,amount:Math.round(amount*100)/100,date,createdAt:new Date().toISOString()};
  transactions.push(transaction);
  if (!save()) { transactions.pop(); return; }
  $('transactionDialog').close(); render();
});
$('transactionRows').addEventListener('click',e => {
  const button=e.target.closest('[data-delete]'); if (!button) return;
  if (!confirm('Delete this transaction?')) return;
  const previous=transactions; transactions=transactions.filter(t=>t.id!==button.dataset.delete);
  if (!save()) transactions=previous;
  render();
});
updateCategories();render();
