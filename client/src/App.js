import React, { useState, useEffect } from 'react';
import './App.scss';

function App() {
  const [date, setDate] = useState('');
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [salary, setSalary] = useState({});
  const [records, setRecords] = useState([]);
  const [monthlyProfit, setMonthlyProfit] = useState(null);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [forest, setForest] = useState(0); // Ormandaki ağaç sayısı
  const [showForest, setShowForest] = useState(false); // Orman görünürlüğü
  const [isFirstDay, setIsFirstDay] = useState(false);

  useEffect(() => {
    const today = new Date();
    setIsFirstDay(today.getDate() === 1);
  }, []);

  const addRecord = () => {
    if (!date || !income || !expense) return;

    setRecords([
      ...records,
      {
        date,
        income: parseFloat(income),
        expense: parseFloat(expense),
      },
    ]);

    setDate('');
    setIncome('');
    setExpense('');
  };

  const calculateMonthlyProfit = () => {
    if (!selectedMonth) return;

    const [selectedYear, selectedMonthIndex] = selectedMonth.split('-').map(Number);

    const monthRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getFullYear() === selectedYear &&
        recordDate.getMonth() === selectedMonthIndex - 1
      );
    });

    const profit = monthRecords.reduce(
      (total, record) => total + (record.income - record.expense),
      0
    );

    const fixedSalary = salary[selectedMonth] || 0;
    const totalProfit = profit + fixedSalary;
    setMonthlyProfit(totalProfit.toFixed(2));

    // Her 100 TL kar için bir ağaç ekle
    const newTrees = Math.floor(totalProfit / 100);
    setForest(newTrees);
  };

  const addSalary = () => {
    if (!isFirstDay) {
      alert('Maaş sadece ayın birinci günü girilebilir.');
      return;
    }

    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const newSalary = prompt(`Lütfen ${currentMonth} ayı için maaşınızı girin (TL):`, salary[currentMonth] || 0);

    if (newSalary !== null) {
      setSalary({
        ...salary,
        [currentMonth]: parseFloat(newSalary) || 0,
      });
    }
  };

  const uniqueMonths = Array.from(
    new Set(records.map(record => {
      const recordDate = new Date(record.date);
      return `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
    }))
  );

  const selectedMonthRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    const [selectedYear, selectedMonthIndex] = selectedMonth.split('-').map(Number);
    return (
      recordDate.getFullYear() === selectedYear &&
      recordDate.getMonth() === selectedMonthIndex - 1
    );
  });

  return (
    <div className="App">
      <h1>Finans Takip Sistemi</h1>

      <div className="form">
        <label>Tarih Seç:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>Gelir (TL):</label>
        <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} />

        <label>Gider (TL):</label>
        <input type="number" value={expense} onChange={(e) => setExpense(e.target.value)} />

        <button onClick={addRecord}>Kaydet</button>
        <button onClick={() => setShowDailyReport(!showDailyReport)}>
          Günlük Raporu Göster
        </button>
      </div>

      {isFirstDay && (
        <div className="salary-form">
          <button onClick={addSalary}>Maaş Ekle</button>
        </div>
      )}

      <div className="monthly-profit">
        <label>Aylık Kârı Göster:</label>
        <select onChange={(e) => { setSelectedMonth(e.target.value); setMonthlyProfit(null); }} value={selectedMonth}>
          <option value="">Bir ay seçin</option>
          {uniqueMonths.map((month, index) => (
            <option key={index} value={month}>{month}</option>
          ))}
        </select>
        <button onClick={calculateMonthlyProfit}>Hesapla</button>
        {monthlyProfit !== null && <h2>{selectedMonth} Ayında Kâr: {monthlyProfit} TL</h2>}
      </div>

      <div className="forest">
        <button onClick={() => setShowForest(!showForest)}>
          Ormanım
        </button>
        {showForest && (
          <div className="forest-grid">
            {Array.from({ length: forest }).map((_, index) => (
              <div key={index} className="tree">🌳</div>
            ))}
          </div>
        )}
      </div>

      {showDailyReport && (
        <div>
          <h2>Seçilen Ay Kayıtları</h2>
          <ul className="record-list">
            {selectedMonthRecords.map((record, index) => (
              <li key={index}>
                <strong>{record.date}</strong> - Gelir: {record.income} TL, Gider: {record.expense} TL
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;