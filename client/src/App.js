import React, { useState, useEffect } from 'react';
import './App.scss';
import Forest from './forest';
import LoginForm from "./LoginForm";

function App() {
  const [date, setDate] = useState('');
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [salary, setSalary] = useState({});
  const [records, setRecords] = useState([]);
  const [monthlyProfit, setMonthlyProfit] = useState(null);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [forest, setForest] = useState(0); // Toplam ağaç sayısı
  const [showForest, setShowForest] = useState(false); // Orman görünürlüğü
  const [isFirstDay, setIsFirstDay] = useState(false);
  const [user, setUser] = useState(null);
  const [isUserPage, setIsUserPage] = useState(false); // Kullanıcı sayfası açık mı?

  const toggleUserPage = () => {
    if (showForest) {
      // Eğer orman görünüyorsa, kullanıcı sayfasını değiştirme
      return;
    }
    setIsUserPage(!isUserPage);
  };

  const toggleForest = () => {
    setShowForest(!showForest); // Orman görünürlüğünü aç/kapat
    if (!showForest) {
      // Orman görünürlüğü açıldığında diğer içerikleri gizle
      setIsUserPage(false); // Kullanıcı sayfası kapalı
      setShowDailyReport(false); // Günlük rapor kapalı
    }
  };

  const handleLogin = (username) => {
    setUser(username); // Kullanıcı giriş yaparsa, kullanıcı adı kaydedilir
  };

  const handleLogout = () => {
    setUser(null); // Kullanıcı çıkış yaparsa oturumu kapat
  };

  useEffect(() => {
    const today = new Date();
    setIsFirstDay(today.getDate() === 1);
  }, []);

  const addRecord = () => {
    // Eğer tarih seçilmemişse kaydetme işlemini durdur
    if (!date) {
      alert("Lütfen bir tarih seçin.");
      return;
    }
  
    // Gelir veya gider boş bırakılırsa 0 olarak kabul et
    const sanitizedIncome = parseFloat(income) || 0;
    const sanitizedExpense = parseFloat(expense) || 0;
  
    // Eğer hem gelir hem de gider 0 ise kaydetme işlemini durdur
    if (sanitizedIncome === 0 && sanitizedExpense === 0) {
      alert("Gelir ve giderin her ikisi de sıfır olamaz.");
      return;
    }
  
    // Kaydı ekle
    setRecords([
      ...records,
      {
        date,
        income: sanitizedIncome,
        expense: sanitizedExpense,
      },
    ]);
  
    // Formu sıfırla
    setDate('');
    setIncome('');
    setExpense('');
  };
  

  // Tüm ayların toplam kârını hesapla ve ağaç sayısını güncelle
  const calculateTotalProfitAndTrees = () => {
    // Gelir ve giderleri tüm kayıtlardan hesapla
    const totalProfit = records.reduce((total, record) => {
      return total + (record.income - record.expense);
    }, 0);

    // Maaşları ekle
    const totalSalary = Object.values(salary).reduce((total, sal) => total + sal, 0);

    // Toplam kâr
    const grandTotalProfit = totalProfit + totalSalary;

    // Her 100 TL kâr için ağaç sayısını hesapla
    const newTreeCount = Math.floor(grandTotalProfit / 1000);
    setForest(newTreeCount); // Yeni toplam ağaç sayısını güncelle
  };

  // Belirli bir ayın kârını hesapla
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
  };

  // Her kayıt veya maaş değiştiğinde toplam kârı ve ağaç sayısını güncelle
  useEffect(() => {
    calculateTotalProfitAndTrees();
  }, [records, salary]);

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
      {isUserPage ? (
        <>
          {/* Kullanıcı Giriş Sayfası */}
          <LoginForm />
          <button className="back-button" onClick={toggleUserPage}>
            Geri Dön
          </button>
          <button className="back-button" onClick={toggleUserPage}>
            Kaydol
          </button>
        </>
      ) : (
        <>
        {showForest ? (
  <>
  <Forest treeCount={forest} />
  <button 
    onClick={() => setShowForest(false)} 
    className="back-button"
  >
    Ana Sayfaya Dön
  </button>
</>) : (
  <>
    {/* Ana Sayfa */} 
    <header>
      <h1>Finans Takip Sistemi</h1>
    </header>
    <div className="main-content">
      {/* Diğer içerikler */}
    </div>
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
            <button onClick={toggleForest} className="forest-button">Ormanım</button>

    </div>
  </>
)}
  
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
        </>
      )}
    </div>
  );  
}

export default App;