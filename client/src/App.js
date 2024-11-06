// client/src/App.js
import React, { useState } from 'react';
import './App.scss';

function App() {
  const [date, setDate] = useState('');
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [records, setRecords] = useState([]);
  const [monthlyProfit, setMonthlyProfit] = useState(null);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(''); // Seçilen ay ve yıl için

  // Yeni bir gelir-gider kaydı ekleyen fonksiyon
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

    // Form alanlarını sıfırlama
    setDate('');
    setIncome('');
    setExpense('');
  };

  // Aylık kârı hesaplayan fonksiyon
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
    setMonthlyProfit(profit.toFixed(2));
  };

  // Kayıtlı ay ve yılları almak için unique ay-yıl listesi
  const uniqueMonths = Array.from(
    new Set(records.map(record => {
      const recordDate = new Date(record.date);
      return `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
    }))
  );

  // Seçilen ayın kayıtlarını filtreleme
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

      <div className="monthly-profit">
        <label>Aylık Kârı Göster:</label>
        <select onChange={(e) => {setSelectedMonth(e.target.value);
         setMonthlyProfit(null);}} value={selectedMonth}>
          <option value="">Bir ay seçin</option>
          {uniqueMonths.map((month, index) => (
            <option key={index} value={month}>{month}</option>
          ))}
        </select>
        <button onClick={calculateMonthlyProfit}>Hesapla</button>
        {monthlyProfit !== null && <h2>{selectedMonth} Ayında Kâr: {monthlyProfit} TL</h2>}
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