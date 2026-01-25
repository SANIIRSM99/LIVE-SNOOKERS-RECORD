// … firebase initialize اور db کا کوڈ وہی رہے گا …

const TOTAL_TABLES = 15; // یہاں تم اپنا ٹوٹل نمبر لکھ سکتے ہو

db.ref("tables").on("value", (snapshot) => {
  freeGrid.innerHTML = "";
  busyGrid.innerHTML = "";

  let freeCount = 0;
  let busyCount = 0;
  let knownTables = new Set();

  // جو ٹیبلز ڈیٹابیس میں ہیں
  snapshot.forEach((child) => {
    const tableNum = parseInt(child.key);
    knownTables.add(tableNum);
    const data = child.val() || {};

    const card = createTableCard(tableNum, data); // نیچے فنکشن دیا ہے

    if (data.status === "busy") {
      busyGrid.appendChild(card);
      busyCount++;
    } else {
      freeGrid.appendChild(card);
      freeCount++;
    }
  });

  // باقی ٹیبلز جو ڈیٹابیس میں نہیں ہیں → free سمجھو
  for (let i = 1; i <= TOTAL_TABLES; i++) {
    if (!knownTables.has(i)) {
      const card = createTableCard(i, { status: "free", gamesPlayed: 0 });
      freeGrid.appendChild(card);
      freeCount++;
    }
  }

  // خالی سیکشنز کے پیغام
  if (freeCount === 0) {
    freeGrid.innerHTML = '<div class="empty-message">فی الحال کوئی خالی ٹیبل نہیں ہے</div>';
  }
  if (busyCount === 0) {
    busyGrid.innerHTML = '<div class="empty-message">ابھی کوئی مصروف ٹیبل نہیں ہے</div>';
  }
});

// کارڈ بنانے کا فنکشن (الگ سے رکھو تاکہ کوڈ صاف رہے)
function createTableCard(num, data) {
  const card = document.createElement("div");
  card.className = `card ${data.status === "busy" ? "busy" : "free"}`;

  let html = `
    <h2>ٹیبل ${num}</h2>
    <div class="status">${data.status === "busy" ? "مصروف" : "خالی"}</div>
    <div class="info-line">کل گیمز: <strong>${data.gamesPlayed || 0}</strong></div>
  `;

  if (data.totalPlayerWins && Object.keys(data.totalPlayerWins).length > 0) {
    html += `<div class="info-line">ٹاپ ونرز:</div><ul style="margin:8px 0 12px 24px; padding:0; color:#ddd;">`;
    Object.entries(data.totalPlayerWins)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([name, wins]) => {
        html += `<li>${name} — ${wins} جیت</li>`;
      });
    html += `</ul>`;
  }

  if (data.currentGame) {
    const g = data.currentGame;
    html += `
      <hr>
      <div style="font-size:1.2rem; margin:12px 0 8px; color:#ffd700;">موجودہ میچ</div>
      <div class="player-line"><strong>${g.player1?.name || "؟؟؟"}</strong> (${g.player1?.score || 0})</div>
      <div class="vs">VS</div>
      <div class="player-line"><strong>${g.player2?.name || "؟؟؟"}</strong> (${g.player2?.score || 0})</div>
      <div class="info-line">باقی ریڈز: <strong>${g.redsRemaining ?? "?"}</strong></div>
      <div class="info-line">فیز: <strong>${g.isRedPhase ? "ریڈز" : "کلرز"}</strong></div>
      <div class="time">شروع: ${g.startTime ? new Date(g.startTime).toLocaleString("ur-PK", {dateStyle: "medium", timeStyle: "short"}) : "—"}</div>
    `;
  }

  card.innerHTML = html;
  return card;
}