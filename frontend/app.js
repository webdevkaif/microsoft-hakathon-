const state={view:'overview',expenseDelta:15,salesDelta:0, userEntryStep: 1, userData: {company: 'Aster & Co.', notifications: 1}, settingsTab: 'profile', lang: 'en', chatHistory: [{sender: 'bot', message: 'Hi! I am your FinGuard Copilot. How can I help you today?'}], tmResult: null};
const money=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const icons={spark:'✦'};
function viewHeader(eyebrow,title,intro,actions=''){return `<div class="head-row"><div><div class="eyebrow">${eyebrow}</div><h1 class="page-title">${title}</h1><p class="page-intro">${intro}</p></div><div class="head-actions">${actions}</div></div>`}
function chart(){return `<div class="chart-wrap"><svg viewBox="0 0 720 230" preserveAspectRatio="none" role="img" aria-label="Revenue and expenses trend"><line class="chart-grid" x1="0" y1="25" x2="720" y2="25"/><line class="chart-grid" x1="0" y1="82" x2="720" y2="82"/><line class="chart-grid" x1="0" y1="139" x2="720" y2="139"/><line class="chart-grid" x1="0" y1="196" x2="720" y2="196"/><path d="M0 153 C55 147 76 126 120 132 S180 107 240 115 S305 92 360 100 S425 74 480 82 S535 61 600 68 S672 36 720 47" fill="none" stroke="#3d9b75" stroke-width="3" stroke-linecap="round"/><path d="M0 178 C60 170 83 165 120 171 S190 141 240 154 S310 131 360 142 S425 120 480 126 S540 114 600 124 S670 98 720 105" fill="none" stroke="#e1aa5d" stroke-width="2.5" stroke-linecap="round"/><circle cx="720" cy="47" r="4" fill="#3d9b75"/><circle cx="720" cy="105" r="4" fill="#e1aa5d"/><text class="chart-label" x="2" y="219">Apr</text><text class="chart-label" x="140" y="219">May</text><text class="chart-label" x="280" y="219">Jun</text><text class="chart-label" x="420" y="219">Jul</text><text class="chart-label" x="560" y="219">Aug</text><text class="chart-label" x="691" y="219">Sep</text><text class="chart-label" x="0" y="16">₹12L</text><text class="chart-label" x="0" y="73">₹9L</text><text class="chart-label" x="0" y="130">₹6L</text><text class="chart-label" x="0" y="187">₹3L</text></svg><div class="legend"><span><b style="background:#3d9b75"></b>Revenue</span><span><b style="background:#e1aa5d"></b>Expenses</span></div></div>`}

function overview(summary, vendors){
    let vendorRows = vendors.map(v => `<tr><td><div class="vendor"><span class="vendor-dot" style="${v.bg?'background:'+v.bg+';':''}${v.color?'color:'+v.color+';':''}">${v.initials}</span><strong>${v.name}</strong></div></td><td class="amount">${money(v.monthly_spend)}</td><td class="${v.change.includes('↓')?'up':'down'}">${v.change}</td><td><span class="risk ${v.risk}">${v.risk.charAt(0).toUpperCase() + v.risk.slice(1)}</span></td><td>${v.last_payment}</td></tr>`).join('');
    return `${viewHeader('Tuesday, 22 September 2026','Good evening, Mohammad','Here is the pulse of Aster & Co. — 3 signals need your attention today.','<button class="btn ghost" id="exportBtn">↥ Export report</button><button class="btn primary" data-view="simulator">✦ Run a scenario</button>')}<div class="stats"><div class="card stat-card"><div class="stat-top">Cash balance <span class="stat-icon">◉</span></div><div class="stat-value">${money(summary.cash_balance)}</div><div class="stat-foot"><span class="up">↑ 8.4%</span> vs last month</div></div><div class="card stat-card"><div class="stat-top">Monthly revenue <span class="stat-icon">↗</span></div><div class="stat-value">${money(summary.revenue)}</div><div class="stat-foot"><span class="up">↑ 12.8%</span> vs last month</div></div><div class="card stat-card"><div class="stat-top">Monthly expenses <span class="stat-icon">↘</span></div><div class="stat-value">${money(summary.expenses)}</div><div class="stat-foot"><span class="down">↑ 9.2%</span> vs last month</div></div><div class="card stat-card"><div class="stat-top">Overall risk <span class="stat-icon">◈</span></div><div class="stat-value">${summary.overall_risk}<span style="font-size:14px;color:#89938d">/100</span></div><div class="stat-foot"><span class="up">↓ 6 pts</span> from last month</div></div></div><div class="grid-main"><section class="card panel"><div class="panel-head"><div><h2 class="panel-title">Money in vs money out</h2><p class="panel-sub">A healthy gap is forming between revenue and expenses.</p></div><button class="tiny-select">6 months ⌄</button></div>${chart()}</section><section class="card panel"><div class="panel-head"><div><h2 class="panel-title">AI attention queue</h2><p class="panel-sub">Prioritized by potential impact.</p></div><button class="section-link" data-view="anomalies">View all</button></div><div class="alert-list"><div class="alert"><span class="alert-dot red"></span><div><strong>Vendor B spend jumped 65%</strong><p>₹1.84L this month vs ₹1.12L average.</p><div class="alert-meta">High impact · 2h ago</div></div></div><div class="alert"><span class="alert-dot"></span><div><strong>Cash reserve may dip in 6 weeks</strong><p>At the current run rate, buffer falls below ₹3L.</p><div class="alert-meta">Medium impact · Today</div></div></div><div class="alert"><span class="alert-dot green"></span><div><strong>Invoice INV-28491 needs review</strong><p>47% higher than vendor 6-month average.</p><div class="alert-meta">Review suggested · Yesterday</div></div></div></div></section></div><div class="section-row"><h2>Spend signals</h2><button class="section-link" data-view="vendors">Explore vendors →</button></div><section class="card"><table class="table"><thead><tr><th>Vendor</th><th>Monthly spend</th><th>Change</th><th>AI risk</th><th>Last payment</th></tr></thead><tbody>${vendorRows}</tbody></table></section>`
}

function anomalies(data){
    let alertHtml = data.map(a => `<div class="alert"><span class="alert-dot ${a.impact_level==='high'?'red':a.impact_level==='low'?'green':''}"></span><div><strong>${a.title}</strong><p>${a.description}</p><div class="alert-meta">${a.detected_time} · Confidence ${a.confidence_score}%</div></div><button class="btn" onclick="toast('Anomaly opened for review')">Review</button></div>`).join('');
    return `${viewHeader('Detection engine','Anomalies','Signals that fall outside your normal financial patterns.','<button class="btn primary" id="runAiScan">✦ Run AI Scan</button>')}<div class="alert-banner"><div class="banner-icon">△</div><div class="banner-text"><strong>${data.length} anomalies detected this week</strong><span>FinGuard compares new activity with your 90-day baseline and explains the deviation.</span></div></div><section class="card panel"><div class="panel-head"><div><h2 class="panel-title">Needs your attention</h2><p class="panel-sub">Sorted by potential cash-flow impact.</p></div><button class="tiny-select">All signals ⌄</button></div><div class="alert-list">${alertHtml}</div></section><div class="section-row"><h2>Risk indicators</h2></div><div class="risk-grid"><div class="card risk-card"><div class="risk-line"><span>Vendor concentration</span><strong>61 / 100</strong></div><div class="progress"><i style="width:61%"></i></div></div><div class="card risk-card"><div class="risk-line"><span>Expense volatility</span><strong>42 / 100</strong></div><div class="progress"><i style="width:42%" class="green"></i></div></div></div>`
}

function forecast(){return `${viewHeader('Forecast engine','Cash forecast','A clear view of what your cash balance could look like over the next 90 days.','<button class="btn ghost">Export forecast</button><button class="btn primary" data-view="simulator">✦ What-if simulator</button>')}<section class="card forecast-card"><div class="panel-head"><div><h2 class="panel-title">Projected cash balance</h2><p class="panel-sub">Baseline forecast · recurring revenue and known commitments</p></div><div class="legend"><span><b style="background:#3d9b75"></b>Actual</span><span><b style="background:#4b82c4"></b>Forecast</span></div></div><div class="chart-wrap"><svg viewBox="0 0 720 230" preserveAspectRatio="none"><line class="chart-grid" x1="0" y1="25" x2="720" y2="25"/><line class="chart-grid" x1="0" y1="82" x2="720" y2="82"/><line class="chart-grid" x1="0" y1="139" x2="720" y2="139"/><line class="chart-grid" x1="0" y1="196" x2="720" y2="196"/><path d="M0 174 C70 162 130 147 190 150 S270 136 330 130" fill="none" stroke="#3d9b75" stroke-width="3"/><path d="M330 130 C390 133 440 149 480 158 S565 177 610 190 S680 199 720 205" fill="none" stroke="#4b82c4" stroke-width="3" stroke-dasharray="6 6"/><line x1="0" y1="196" x2="720" y2="196" stroke="#dfb56f" stroke-dasharray="5 5"/><text class="chart-label" x="2" y="16">₹5L</text><text class="chart-label" x="2" y="73">₹4L</text><text class="chart-label" x="2" y="130">₹3L</text><text class="chart-label" x="2" y="187">₹2L</text><text class="chart-label" x="4" y="219">Now</text><text class="chart-label" x="228" y="219">30 days</text><text class="chart-label" x="452" y="219">60 days</text><text class="chart-label" x="668" y="219">90 days</text><text class="chart-label" x="530" y="191" fill="#bb8437">₹3L safety reserve</text></svg></div><div class="forecast-note"><strong>AI readout:</strong> You have a comfortable 30-day buffer. Without an intervention, cash is likely to approach your reserve threshold in week 6. Consider reviewing Brightline's new invoices and delaying non-critical payments.</div></section><div class="section-row"><h2>Forecast checkpoints</h2></div><div class="stats"><div class="card stat-card"><div class="stat-top">30-day outlook</div><div class="stat-value">₹3.74L</div><div class="stat-foot"><span class="up">Healthy</span> above reserve</div></div><div class="card stat-card"><div class="stat-top">60-day outlook</div><div class="stat-value">₹3.18L</div><div class="stat-foot"><span style="color:#b5772d;font-weight:650">Watch</span> approaching reserve</div></div><div class="card stat-card"><div class="stat-top">90-day outlook</div><div class="stat-value">₹2.76L</div><div class="stat-foot"><span class="down">Action needed</span> below reserve</div></div><div class="card insight"><div class="panel-title">Need more runway?</div><p class="insight-copy">Ask FinGuard to model a plan that protects your reserve.</p><button class="btn" data-view="simulator">Open simulator →</button></div></div>`}

function simulator(){const exp=state.expenseDelta;const projected=402000-(71800*(exp/100+0.82));const level=projected<300000?'HIGH':projected<350000?'MEDIUM':'LOW';return `${viewHeader('Decision support','What-if simulator','Test a business decision before it becomes a financial surprise.','<button class="btn ghost" id="resetSim">Reset</button>')}<div class="simulator"><section class="card control-card"><h3>Build a scenario</h3><p>Adjust the levers and see the impact on your cash runway.</p><div class="range-group"><div class="range-head"><span>Monthly expenses</span><span class="range-value">+${exp}%</span></div><input class="range" id="expenseRange" type="range" min="0" max="40" value="${exp}" /><div class="quick-chips"><button class="chip" data-exp="0">Baseline</button><button class="chip" data-exp="15">+15%</button><button class="chip" data-exp="25">+25%</button></div></div><div class="range-group"><div class="range-head"><span>Monthly sales</span><span class="range-value">${state.salesDelta>=0?'+':''}${state.salesDelta}%</span></div><input class="range" id="salesRange" type="range" min="-30" max="30" value="${state.salesDelta}" /><div class="quick-chips"><button class="chip" data-sales="-20">-20%</button><button class="chip" data-sales="0">Baseline</button><button class="chip" data-sales="20">+20%</button></div></div><button class="btn primary" style="width:100%;margin-top:6px" id="applyScenario">Run scenario ✦</button></section><section class="card result-card"><div class="result-head"><div><h3>Scenario outcome</h3><p class="panel-sub">Expenses ${exp>=0?'+':''}${exp}% · Sales ${state.salesDelta>=0?'+':''}${state.salesDelta}%</p></div><span class="risk ${level==='HIGH'?'high':level==='MEDIUM'?'medium':'low'}">${level} RISK</span></div><div class="result-kpi">${money(projected)}</div><div class="result-caption">projected cash after 30 days</div><div class="scenario-flow"><div class="flow-step"><div class="flow-num">₹4.02L</div><div class="flow-label">Current cash</div></div><div class="flow-arrow">→</div><div class="flow-step"><div class="flow-num">+${exp}%</div><div class="flow-label">Expense change</div></div><div class="flow-arrow">→</div><div class="flow-step"><div class="flow-num">${money(projected)}</div><div class="flow-label">Projected cash</div></div></div><div class="recommendation"><strong>✦ FinGuard recommendation</strong>${level==='HIGH'?'Reduce discretionary spending by approximately '+money(Math.max(0,71800*exp/100))+' per month and review your top vendor commitments.':'Maintain a ₹3L minimum reserve. This scenario stays within the healthy zone, but monitor vendor concentration.'}</div></section></div>`}

function timeMachine(vendors, result=null) {
    let vendorOpts = vendors.map(v => `<option value="${v.name}">${v.name}</option>`).join('');
    let content = `${viewHeader('Counterfactual Engine','Time Machine','Ask "What if?" based on historical data. Explore how past decisions affect today cash position.')}
    <div class="simulator"><section class="card control-card"><h3>Run Simulation</h3><p>Select a vendor and see what your cash position would be if you had not approved them.</p>
    <div class="form-row"><label>Vendor</label><select id="tm_vendor">${vendorOpts}</select></div>
    <div class="form-row"><label>Timeframe (Months ago)</label><input type="number" id="tm_months" value="3" min="1" max="24" style="padding:10px; border:1px solid var(--line); border-radius:6px;"/></div>
    <button class="btn primary" style="width:100%;margin-top:16px" id="runTimeMachine">Simulate Past ✦</button>
    </section>
    <section class="card result-card">
    ${result ? `<div class="result-head"><div><h3>Simulated Outcome</h3><p class="panel-sub">Excluded ${result.vendor} for ${result.months} months</p></div></div>
    <div class="result-kpi">${money(result.simulated_cash)}</div><div class="result-caption">Simulated Cash Today</div>
    <div class="scenario-flow"><div class="flow-step"><div class="flow-num">${money(result.current_cash)}</div><div class="flow-label">Actual Cash</div></div><div class="flow-arrow">→</div>
    <div class="flow-step"><div class="flow-num" style="color:var(--green)">+${money(result.recovered_cash)}</div><div class="flow-label">Cash Recovered</div></div><div class="flow-arrow">→</div>
    <div class="flow-step"><div class="flow-num">${money(result.simulated_cash)}</div><div class="flow-label">Simulated Cash</div></div></div>
    <div class="recommendation"><strong>✦ FinGuard AI Insight</strong>${result.insight}</div>` : `<div style="padding:40px;text-align:center;color:var(--muted)">Run a simulation to see counterfactual results.</div>`}
    </section></div>`;
    return content;
}

function renderInvoices(invs){
    let rows = invs.map(i => `<tr><td><strong>${i.invoice_id}</strong></td><td>${i.vendor}</td><td class="amount">${money(i.amount)}</td><td><span class="risk ${i.risk}">${i.risk.charAt(0).toUpperCase() + i.risk.slice(1)}</span></td><td>${i.due_date}</td></tr>`).join('');
    return `${viewHeader('Invoice intelligence','Invoices','Review the documents most likely to affect cash flow or carry an error.','<button class="btn primary" onclick="document.getElementById(\'globalPdfInput\').click()">＋ Upload invoice</button>')}<div class="stats"><div class="card stat-card"><div class="stat-top">Needs review</div><div class="stat-value">4</div><div class="stat-foot"><span class="down">2 high priority</span></div></div><div class="card stat-card"><div class="stat-top">Processed this month</div><div class="stat-value">126</div><div class="stat-foot"><span class="up">↑ 18%</span> vs August</div></div><div class="card stat-card"><div class="stat-top">Duplicate risk</div><div class="stat-value">1</div><div class="stat-foot">Matched against 2,840 records</div></div><div class="card insight"><div class="panel-title">Upload & check</div><p class="insight-copy">Drop a PDF and FinGuard will extract, compare, and explain.</p><button class="btn" onclick="document.getElementById('globalPdfInput').click()">Upload PDF →</button></div></div><section class="card"><table class="table"><thead><tr><th>Invoice</th><th>Vendor</th><th>Amount</th><th>AI check</th><th>Due date</th></tr></thead><tbody>${rows}</tbody></table></section>`
}

// ===== TRANSACTIONS DASHBOARD =====
function renderTransactions(txs) {
    let totalIncome = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
    let totalExpense = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
    let rows = txs.map(t => `<tr>
        <td>${t.date}</td>
        <td>${t.description}</td>
        <td><span class="risk ${t.type==='income'?'low':'high'}" style="font-size:11px">${t.type.toUpperCase()}</span></td>
        <td><span style="font-size:13px;padding:2px 8px;background:#f0f5f2;border-radius:4px;">${t.category}</span></td>
        <td class="amount" style="color:${t.type==='income'?'#3d9b75':'#d9534f'}">${t.type==='income'?'+':'−'}${money(t.amount)}</td>
    </tr>`).join('');
    return `${viewHeader('Data layer','Transactions','All financial movements fetched from your connected database.')}
    <div class="stats">
        <div class="card stat-card"><div class="stat-top">Total Income</div><div class="stat-value" style="color:#3d9b75">${money(totalIncome)}</div><div class="stat-foot">${txs.filter(t=>t.type==='income').length} transactions</div></div>
        <div class="card stat-card"><div class="stat-top">Total Expenses</div><div class="stat-value" style="color:#d9534f">${money(totalExpense)}</div><div class="stat-foot">${txs.filter(t=>t.type==='expense').length} transactions</div></div>
        <div class="card stat-card"><div class="stat-top">Net Flow</div><div class="stat-value" style="color:${totalIncome-totalExpense>=0?'#3d9b75':'#d9534f'}">${money(totalIncome - totalExpense)}</div><div class="stat-foot">${totalIncome-totalExpense>=0?'Positive':'Negative'} cash flow</div></div>
        <div class="card stat-card"><div class="stat-top">Records</div><div class="stat-value">${txs.length}</div><div class="stat-foot">From SQLite database</div></div>
    </div>
    <section class="card"><table class="table"><thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Category</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}

// ===== VENDORS DASHBOARD =====
function renderVendors(vendors) {
    let totalSpend = vendors.reduce((s,v)=>s+v.monthly_spend,0);
    let highRisk = vendors.filter(v=>v.risk==='high').length;
    let rows = vendors.map(v => `<tr>
        <td><div class="vendor"><span class="vendor-dot" style="${v.bg?'background:'+v.bg+';':''}${v.color?'color:'+v.color+';':''}">${v.initials}</span><strong>${v.name}</strong></div></td>
        <td class="amount">${money(v.monthly_spend)}</td>
        <td class="${v.change.includes('↓')?'up':'down'}">${v.change}</td>
        <td><span class="risk ${v.risk}">${v.risk.charAt(0).toUpperCase() + v.risk.slice(1)}</span></td>
        <td>${v.last_payment}</td>
        <td>${Math.round(v.monthly_spend / totalSpend * 100)}%</td>
    </tr>`).join('');
    return `${viewHeader('Vendor intelligence','Vendors','All vendor data fetched from the SQLite database. Click to explore.')}
    <div class="stats">
        <div class="card stat-card"><div class="stat-top">Total Vendors</div><div class="stat-value">${vendors.length}</div><div class="stat-foot">Active vendors</div></div>
        <div class="card stat-card"><div class="stat-top">Total Monthly Spend</div><div class="stat-value">${money(totalSpend)}</div><div class="stat-foot">Across all vendors</div></div>
        <div class="card stat-card"><div class="stat-top">High Risk</div><div class="stat-value" style="color:#d9534f">${highRisk}</div><div class="stat-foot">Vendors flagged</div></div>
        <div class="card stat-card"><div class="stat-top">Top Vendor</div><div class="stat-value" style="font-size:20px">${vendors[0]?.name||'N/A'}</div><div class="stat-foot">${money(vendors[0]?.monthly_spend||0)}/mo</div></div>
    </div>
    <section class="card"><table class="table"><thead><tr><th>Vendor</th><th>Monthly spend</th><th>Change</th><th>AI risk</th><th>Last payment</th><th>Share</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}

// ===== CRISIS REPLAY (ANIMATED, DB-DRIVEN) =====
function crisisReplay(crisisData){
    if(!crisisData) return `${viewHeader('🚨 Future Crisis Replay','Crisis Simulation','Loading crisis data...')}<div class="card" style="padding:40px;text-align:center;color:#6b7280;">Loading...</div>`;
    let eventsHtml = crisisData.events.map((e,i) => `
        <div class="timeline-event" id="crisis-${i}" style="opacity:0.15; transform:translateX(-30px); transition: all 0.6s ease ${i*0.1}s; padding:16px 20px; border-radius:10px; background:${e.severity==='critical'?'#fff5f5':e.severity==='danger'?'#fffbeb':'#f0faf5'}; border-left:4px solid ${e.severity==='critical'?'#8b0000':e.severity==='danger'?'#d9534f':'#b5772d'};">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                <span style="background:${e.severity==='critical'?'#8b0000':e.severity==='danger'?'#d9534f':'#b5772d'}; color:white; padding:2px 10px; border-radius:12px; font-size:12px; font-weight:700;">Day ${e.day}</span>
                <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">${e.severity}</span>
            </div>
            <div style="font-weight:700; font-size:${e.severity==='critical'?'18':'16'}px; color:${e.severity==='critical'?'#8b0000':'#1a1a1a'};">${e.title}</div>
            <div style="font-size:14px; color:#555; margin-top:4px;">${e.desc}</div>
        </div>
    `).join('');
    return `${viewHeader('🚨 Future Crisis Replay','Crisis Simulation','AI-detected future cash-flow cascade based on current data.')}
    <div class="stats">
        <div class="card stat-card"><div class="stat-top">Current Cash</div><div class="stat-value">${money(crisisData.current_cash)}</div><div class="stat-foot">Starting position</div></div>
        <div class="card stat-card"><div class="stat-top">Monthly Burn</div><div class="stat-value" style="color:#d9534f">${money(crisisData.monthly_burn)}</div><div class="stat-foot">Current run rate</div></div>
        <div class="card stat-card"><div class="stat-top">Crisis Events</div><div class="stat-value">${crisisData.events.length}</div><div class="stat-foot">Detected in pipeline</div></div>
        <div class="card stat-card"><div class="stat-top">Time to Breach</div><div class="stat-value" style="color:#8b0000">46 days</div><div class="stat-foot">At current trajectory</div></div>
    </div>
    <div class="card panel">
        <div class="panel-head">
            <div><h2 class="panel-title">Cascade Timeline</h2><p class="panel-sub">Click play to animate the crisis sequence detected from your live data.</p></div>
            <button class="btn primary" id="startCrisisBtn" style="font-size:14px;">▶ Play Simulation</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:14px; margin-top:20px; padding:10px 0;">
            ${eventsHtml}
        </div>
    </div>`;
}

// ===== LAST 6 MONTHS =====
function renderMonthlyHistory(months) {
    let rows = months.map(m => `<tr>
        <td><strong>${m.month}</strong></td>
        <td class="amount" style="color:#3d9b75">${money(m.revenue)}</td>
        <td class="amount" style="color:#d9534f">${money(m.expenses)}</td>
        <td class="amount">${money(m.cash_balance)}</td>
        <td class="amount" style="color:${m.profit>=0?'#3d9b75':'#d9534f'}">${money(m.profit)}</td>
    </tr>`).join('');
    let avgRevenue = months.reduce((s,m)=>s+m.revenue,0)/months.length;
    let avgExpense = months.reduce((s,m)=>s+m.expenses,0)/months.length;
    return `${viewHeader('Historical data','Last 6 Months','Financial history fetched from the database for trend analysis.')}
    <div class="stats">
        <div class="card stat-card"><div class="stat-top">Avg Revenue</div><div class="stat-value" style="color:#3d9b75">${money(avgRevenue)}</div><div class="stat-foot">Monthly average</div></div>
        <div class="card stat-card"><div class="stat-top">Avg Expenses</div><div class="stat-value" style="color:#d9534f">${money(avgExpense)}</div><div class="stat-foot">Monthly average</div></div>
        <div class="card stat-card"><div class="stat-top">Growth</div><div class="stat-value" style="color:#3d9b75">↑ 24.9%</div><div class="stat-foot">Revenue Apr→Sep</div></div>
        <div class="card stat-card"><div class="stat-top">Best Month</div><div class="stat-value" style="font-size:20px">Sep 2026</div><div class="stat-foot">${money(1024000)} revenue</div></div>
    </div>
    ${chart()}
    <section class="card" style="margin-top:20px;"><table class="table"><thead><tr><th>Month</th><th>Revenue</th><th>Expenses</th><th>Cash Balance</th><th>Profit</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}

function simple(view,title){return `${viewHeader(view==='transactions'?'Data layer':'Workspace',title,'This section is connected to the same financial intelligence layer.')}<section class="card empty"><div style="font-size:30px;color:#6dab8d;margin-bottom:8px">✦</div><strong>More signal is coming here</strong><p>Use the overview and simulator for the active demo flow.</p></section>`}

function settings(){
    const tab = state.settingsTab;
    let nav = `<nav class="settings-nav"><button class="${tab==='profile'?'active':''}" onclick="state.settingsTab='profile';render()">General Profile</button><button class="${tab==='notifications'?'active':''}" onclick="state.settingsTab='notifications';render()">Notifications</button><button class="${tab==='integrations'?'active':''}" onclick="state.settingsTab='integrations';render()">Data Integrations</button><button class="${tab==='billing'?'active':''}" onclick="state.settingsTab='billing';render()">Billing & Plans</button><button class="${tab==='ai'?'active':''}" onclick="state.settingsTab='ai';render()">AI Model Tuning</button></nav>`;
    let content = '';
    if(tab === 'profile'){
        content = `<div class="settings-group"><h3>Profile Information</h3><p>Update your personal and company details.</p><div class="form-row"><label>Full Name</label><input type="text" id="set_name" value="${state.userData.name||'Mohammad Kaif'}" /></div><div class="form-row"><label>Email Address</label><input type="email" id="set_email" value="${state.userData.email||'admin@asterco.in'}" /></div><div class="form-row"><label>Company Name</label><input type="text" id="set_company" value="${state.userData.company||''}" /></div><button class="btn primary" style="margin-top: 10px;" id="saveProfileBtn">Save Profile</button></div>`;
    } else if(tab === 'notifications') {
        content = `<div class="settings-group"><h3>Notification Preferences</h3><p>Manage how we contact you.</p><div class="toggle-row"><div class="toggle-info"><strong>Weekly Digest Emails</strong><span>Receive a summary of anomalies and cash forecasts every Monday.</span></div><div class="toggle-switch ${state.userData.notifications ? 'on' : ''}" id="saveNotifBtn"></div></div></div>`;
    } else if(tab === 'ai') {
        content = `<div class="settings-group"><h3>Feature Toggles</h3><p>Control what FinGuard features are active for your workspace.</p><div class="toggle-row"><div class="toggle-info"><strong>AI Expense Categorization</strong><span>Automatically tag and categorize new bank transactions.</span></div><div class="toggle-switch on" onclick="this.classList.toggle('on');toast('AI model updated')"></div></div><div class="toggle-row"><div class="toggle-info"><strong>Strict Vendor Rules</strong><span>Flag any invoice that deviates more than 5% from historical averages.</span></div><div class="toggle-switch" onclick="this.classList.toggle('on');toast('Rules saved')"></div></div></div>`;
    } else {
        content = `<div class="settings-group"><h3>${tab.charAt(0).toUpperCase() + tab.slice(1)}</h3><p>This module is currently disconnected in the prototype.</p></div>`;
    }
    return `${viewHeader('Configuration','Settings','Manage your workspace preferences, notifications, and AI features.')}<div class="settings-grid">${nav}<div class="settings-section">${content}</div></div>`;
}

function userEntry() {
  const step = state.userEntryStep;
  if (step === 1) {
    return `${viewHeader('Onboarding', 'Step 1: Company Details', 'Tell us about your company.')}<div class="card control-card"><div class="range-group"><div class="range-head"><span>Company Name</span></div><input class="input-text" type="text" id="ue_company" value="${state.userData.company||''}"></div><div class="range-group"><div class="range-head"><span>Industry</span></div><input class="input-text" type="text" id="ue_industry" value="${state.userData.industry||''}"></div><button class="btn primary ue-next" data-step="2" style="margin-top:16px">Next →</button></div>`;
  } else if (step === 2) {
    return `${viewHeader('Onboarding', 'Step 2: Financials', 'Enter your current financials.')}<div class="card control-card"><div class="range-group"><div class="range-head"><span>Monthly Revenue (₹)</span></div><input class="input-text" type="number" id="ue_revenue" value="${state.userData.revenue||''}"></div><div class="range-group"><div class="range-head"><span>Monthly Expenses (₹)</span></div><input class="input-text" type="number" id="ue_expenses" value="${state.userData.expenses||''}"></div><div style="display:flex;gap:8px;margin-top:16px"><button class="btn ghost ue-prev" data-step="1">← Back</button><button class="btn primary ue-next" data-step="3">Next →</button></div></div>`;
  } else if (step === 3) {
    return `${viewHeader('Onboarding', 'Step 3: Goals', 'What is your priority?')}<div class="card control-card"><div class="range-group"><div class="range-head"><span>Primary Financial Goal</span></div><input class="input-text" type="text" id="ue_goal" value="${state.userData.goal||''}"></div><div style="display:flex;gap:8px;margin-top:16px"><button class="btn ghost ue-prev" data-step="2">← Back</button><button class="btn primary ue-submit">Submit ✦</button></div></div>`;
  } else {
    return `${viewHeader('Workspace', 'User Dashboard', 'Overview of your entered information.', '<button class="btn ghost ue-reset">Reset form</button>')}<div class="stats"><div class="card stat-card"><div class="stat-top">Company</div><div class="stat-value" style="font-size:24px">${state.userData.company||'N/A'}</div><div class="stat-foot">${state.userData.industry||'N/A'}</div></div><div class="card stat-card"><div class="stat-top">Revenue</div><div class="stat-value">${state.userData.revenue?money(state.userData.revenue):'N/A'}</div><div class="stat-foot">Monthly</div></div><div class="card stat-card"><div class="stat-top">Expenses</div><div class="stat-value">${state.userData.expenses?money(state.userData.expenses):'N/A'}</div><div class="stat-foot">Monthly</div></div><div class="card stat-card"><div class="stat-top">Goal</div><div class="stat-value" style="font-size:18px;line-height:1.2;margin-top:8px;color:#28322c">${state.userData.goal||'N/A'}</div></div></div><section class="card panel"><div class="panel-head"><div><h2 class="panel-title">Dashboard Ready</h2><p class="panel-sub">Your information has been successfully processed.</p></div></div><div style="padding: 24px; color: #5a6b61; font-size: 15px">Welcome to FinGuard. Based on your entry, we can now track your anomalies and forecast cash flows more accurately.</div></section>`;
  }
}

function copilot(){
    let msgs = state.chatHistory.map(m => `<div class="chat-msg ${m.sender}" style="padding:10px 14px;border-radius:12px;margin-bottom:8px;max-width:80%;${m.sender==='user'?'align-self:flex-end;background:#e8f5e9;margin-left:auto;':'background:#f5f5f5;'}">${m.message}</div>`).join('');
    return `${viewHeader('AI assistant','FinGuard Copilot','Ask questions, request analysis, or instruct the AI to build a scenario.')}
    <div class="simulator" style="display:flex;gap:24px;">
        <section class="card control-card" style="flex:1;display:flex;flex-direction:column;gap:16px;">
            <h3>Document Analysis</h3>
            <p style="font-size:14px;color:#5a6b61;">Upload a PDF document, invoice, or contract to get an AI-powered financial summary.</p>
            <div class="dropzone" id="pdfDropzone" style="cursor:pointer;border:2px dashed #c2d1c9;border-radius:12px;padding:24px;text-align:center;transition:border-color 0.3s;">
                <input type="file" id="pdfInput" accept=".pdf" style="display:none;">
                <span style="font-size:32px;margin-bottom:8px;display:block;">📄</span>
                <strong>Click to upload or drag PDF here</strong>
            </div>
            <div id="pdfResult" style="display:none;margin-top:16px;background:#f1f8f4;padding:14px;border-radius:8px;border:1px solid #dfeee5;">
                <strong style="color:#205f49;">✦ Analysis Complete</strong>
                <p id="pdfSuggestion" style="margin-top:8px;font-size:12px;color:#547064;line-height:1.4;"></p>
            </div>
            <hr style="border:0;border-top:1px solid var(--line);margin:16px 0;">
            <h3>Ask FinGuard</h3>
            <div style="display:flex;flex-direction:column;flex:1;gap:8px;">
                <div id="chatArea" style="flex:1;display:flex;flex-direction:column;background:#fafcfb;border-radius:10px;padding:14px;min-height:220px;max-height:300px;overflow-y:auto;border:1px solid #e8ede9;">${msgs}</div>
                <div style="display:flex;gap:8px;">
                    <input type="text" id="chatInput" placeholder="Type or hold 🎤 to speak..." style="flex:1;border:1px solid #c2d1c9;border-radius:8px;padding:10px 14px;font-size:14px;" />
                    <button class="btn primary" id="sendChat" style="white-space:nowrap;">Send</button>
                    <button class="btn" id="voiceChat" title="Hold to Speak" style="font-size:20px;padding:8px 14px;border-radius:8px;cursor:pointer;transition:background 0.2s;">🎤</button>
                </div>
            </div>
        </section>
        <section class="card result-card" style="flex:1;padding:0;overflow:hidden;display:flex;flex-direction:column;">
            <div style="padding:22px;border-bottom:1px solid var(--line);">
                <h3>Financial Intelligence</h3>
                <p class="panel-sub">Powered by advanced models</p>
            </div>
            <img src="/finance_illustration.jpg" alt="Finance AI" style="width:100%;height:100%;object-fit:cover;">
        </section>
    </div>`;
}

// ===== VOICE FUNCTIONS =====
function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}

function initVoice() {
    const voiceBtn = document.getElementById('voiceChat');
    const input = document.getElementById('chatInput');
    if (!voiceBtn || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    voiceBtn.onmousedown = () => { recognition.start(); voiceBtn.style.background = '#d9534f'; voiceBtn.style.color = 'white'; };
    voiceBtn.onmouseup = () => { recognition.stop(); voiceBtn.style.background = ''; voiceBtn.style.color = ''; };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        document.getElementById('sendChat').click();
    };
}

// ===== RENDER =====
async function render(){
    const c=document.getElementById('content'); 
    const v=state.view; 
    document.getElementById('breadcrumb').textContent=v==='overview'?'Overview':v==='simulator'?'What-if simulator':v==='userEntry'?'User Entry':v==='copilot'?'AI Copilot':v==='crisisReplay'?'Crisis Replay':v==='monthlyHistory'?'Last 6 Months':v[0].toUpperCase()+v.slice(1); 
    
    c.innerHTML = '<div style="padding:40px;text-align:center;color:#6b7280;">Loading data...</div>';

    let html = '';
    
    if(!state.userData.name && v === 'overview') {
        try {
            const setRes = await fetch('/api/settings');
            if(setRes.ok) {
                const settings = await setRes.json();
                if(settings.name) state.userData = settings;
            }
        } catch(e) {}
    }

    if (v === 'overview') {
        const [sumRes, venRes] = await Promise.all([fetch('/api/summary'), fetch('/api/vendors')]);
        const summary = await sumRes.json();
        const vendors = await venRes.json();
        html = overview(summary, vendors);
    } else if (v === 'invoices') {
        const invRes = await fetch('/api/invoices');
        const invs = await invRes.json();
        html = renderInvoices(invs);
    } else if (v === 'anomalies') {
        const anomRes = await fetch('/api/anomalies');
        const anoms = await anomRes.json();
        html = anomalies(anoms);
    } else if (v === 'forecast') {
        html = forecast();
    } else if (v === 'simulator') {
        html = simulator();
    } else if (v === 'timemachine') {
        const venRes = await fetch('/api/vendors');
        const vendors = await venRes.json();
        html = timeMachine(vendors, state.tmResult);
    } else if (v === 'transactions') {
        const txRes = await fetch('/api/transactions');
        const txs = await txRes.json();
        html = renderTransactions(txs);
    } else if (v === 'vendors') {
        const venRes = await fetch('/api/vendors');
        const vendors = await venRes.json();
        html = renderVendors(vendors);
    } else if (v === 'crisisReplay') {
        const crRes = await fetch('/api/crisis-detect');
        const crisisData = await crRes.json();
        html = crisisReplay(crisisData);
    } else if (v === 'monthlyHistory') {
        const mhRes = await fetch('/api/monthly-history');
        const months = await mhRes.json();
        html = renderMonthlyHistory(months);
    } else if (v === 'userEntry') {
        html = userEntry();
    } else if (v === 'copilot') {
        html = copilot();
    } else if (v === 'settings') {
        html = settings();
    } else {
        html = simple(v, v[0].toUpperCase()+v.slice(1));
    }
    
    c.innerHTML = `<div class="view active">${html}</div>`;
    bind();
}

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}

async function translateUI() {
    if(state.lang === 'en') return;
    toast('Translating...');
    const elements = document.querySelectorAll('.page-title, .page-intro, .panel-title');
    for(let el of elements) {
        if(!el.dataset.orig) el.dataset.orig = el.textContent.trim();
        const text = el.dataset.orig;
        if(!text || text.length < 2) continue;
        try {
            const res = await fetch('/api/translate', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text:text, target_lang:state.lang})});
            if(res.ok) {
                const data = await res.json();
                el.textContent = data.translatedText;
            }
        } catch(e){}
    }
}

function bind(){
    // Navigation
    document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===state.view));render();}));
    
    // Simulator controls
    const er=document.getElementById('expenseRange'); if(er)er.addEventListener('input',e=>{state.expenseDelta=+e.target.value;render()});
    const sr=document.getElementById('salesRange');if(sr)sr.addEventListener('input',e=>{state.salesDelta=+e.target.value;render()});
    document.querySelectorAll('[data-exp]').forEach(b=>b.onclick=()=>{state.expenseDelta=+b.dataset.exp;render()});
    document.querySelectorAll('[data-sales]').forEach(b=>b.onclick=()=>{state.salesDelta=+b.dataset.sales;render()});
    const reset=document.getElementById('resetSim');if(reset)reset.onclick=()=>{state.expenseDelta=15;state.salesDelta=0;render()};
    document.getElementById('exportBtn')?.addEventListener('click',()=>toast('Report prepared — ready to download'));
    document.getElementById('applyScenario')?.addEventListener('click',()=>toast('Scenario analyzed with 90 days of history'));
    
    // AI Scan
    const scanBtn=document.getElementById('runAiScan'); if(scanBtn)scanBtn.addEventListener('click',async()=>{toast('Scanning transactions...');await fetch('/api/anomalies/detect',{method:'POST'});render();});
    
    // User Entry
    document.querySelectorAll('.ue-next').forEach(b=>b.onclick=()=>{if(document.getElementById('ue_company'))state.userData.company=document.getElementById('ue_company').value;if(document.getElementById('ue_industry'))state.userData.industry=document.getElementById('ue_industry').value;if(document.getElementById('ue_revenue'))state.userData.revenue=Number(document.getElementById('ue_revenue').value);if(document.getElementById('ue_expenses'))state.userData.expenses=Number(document.getElementById('ue_expenses').value);state.userEntryStep=+b.dataset.step;render();});
    document.querySelectorAll('.ue-prev').forEach(b=>b.onclick=()=>{state.userEntryStep=+b.dataset.step;render();});
    document.querySelector('.ue-submit')?.addEventListener('click',()=>{if(document.getElementById('ue_goal'))state.userData.goal=document.getElementById('ue_goal').value;state.userEntryStep=4;render();toast('Dashboard created!');});
    document.querySelector('.ue-reset')?.addEventListener('click',()=>{state.userEntryStep=1;state.userData={};render();});
    
    // PDF Upload
    const pd=document.getElementById('pdfDropzone');const pi=document.getElementById('pdfInput');
    if(pd&&pi){pd.onclick=()=>pi.click();pi.onchange=async(e)=>{const file=e.target.files[0];if(!file)return;toast('Uploading PDF...');const fd=new FormData();fd.append('file',file);try{const r=await fetch('/api/analyze-pdf',{method:'POST',body:fd});if(!r.ok){toast('Error uploading PDF');return;}const d=await r.json();document.getElementById('pdfResult').style.display='block';document.getElementById('pdfSuggestion').textContent=d.suggestion;toast('Analysis complete!');}catch(err){toast('Error analyzing PDF')}};}
    const gpi=document.getElementById('globalPdfInput');
    if(gpi){gpi.onchange=async(e)=>{const file=e.target.files[0];if(!file)return;toast('Uploading PDF...');const fd=new FormData();fd.append('file',file);try{const r=await fetch('/api/analyze-pdf',{method:'POST',body:fd});if(!r.ok){toast('Error uploading PDF');return;}const d=await r.json();toast('Analysis complete: ' + d.suggestion.substring(0, 50) + '...');}catch(err){toast('Error analyzing PDF')}};}
    
    // Language selector
    const langSelect=document.getElementById('langSelect');
    if(langSelect){
        langSelect.value=state.lang;
        langSelect.onchange=(e)=>{state.lang=e.target.value;translateUI();};
    }
    
    // Theme toggle
    const themeBtn=document.getElementById('themeToggle'); if(themeBtn)themeBtn.onclick=()=>{document.documentElement.classList.toggle('dark-theme');localStorage.setItem('theme', document.documentElement.classList.contains('dark-theme')?'dark':'light');};
    
    // Settings
    const sp=document.getElementById('saveProfileBtn'); if(sp)sp.onclick=async()=>{state.userData.name=document.getElementById('set_name').value;state.userData.email=document.getElementById('set_email').value;state.userData.company=document.getElementById('set_company').value;await fetch('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(state.userData)});toast('Profile updated and saved!');};
    const sn=document.getElementById('saveNotifBtn'); if(sn)sn.onclick=async()=>{sn.classList.toggle('on');state.userData.notifications=sn.classList.contains('on')?1:0;await fetch('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(state.userData)});toast('Preferences saved');};
    
    // Time Machine
    const rtm=document.getElementById('runTimeMachine'); if(rtm)rtm.onclick=async()=>{const vn=document.getElementById('tm_vendor').value;const mo=+document.getElementById('tm_months').value; toast('Running simulation...'); const res=await fetch('/api/time-machine',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vendor_name:vn,months_ago:mo})}); if(res.ok){state.tmResult=await res.json();render();}};
    
    // Chatbot (Text + Voice)
    const sendBtn = document.getElementById('sendChat');
    const chatIn = document.getElementById('chatInput');
    if(sendBtn && chatIn) {
        initVoice();
        const doSend = async () => {
            const msg = chatIn.value;
            if(!msg) return;
            state.chatHistory.push({sender: 'user', message: msg});
            chatIn.value = '';
            render();
            try {
                const res = await fetch('/api/chat', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({message: msg})});
                if(res.ok) {
                    const data = await res.json();
                    state.chatHistory.push({sender: 'ai', message: data.reply});
                    speak(data.reply);
                    render();
                }
            } catch(e) { toast('Error sending message'); }
        };
        sendBtn.onclick = doSend;
        chatIn.onkeydown = (e) => { if(e.key === 'Enter') doSend(); };
    }
    
    // Crisis Replay Animation
    const playBtn = document.getElementById('startCrisisBtn');
    if(playBtn) {
        playBtn.onclick = () => {
            playBtn.disabled = true;
            playBtn.textContent = '⏳ Simulating...';
            const events = document.querySelectorAll('.timeline-event');
            events.forEach(el => { el.style.opacity = '0.15'; el.style.transform = 'translateX(-30px)'; });
            
            events.forEach((el, index) => {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateX(0)';
                    if(index === events.length - 1) {
                        setTimeout(() => {
                            playBtn.textContent = '▶ Replay Simulation';
                            playBtn.disabled = false;
                        }, 500);
                    }
                }, index * 1200);
            });
        };
    }
    
    // Translate on initial load if language != en
    if(state.lang !== 'en') translateUI();
}

render();
