import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const DataContext = createContext();

export function DataProvider({ children }) {
  // --- 1. التعامل مع بيانات البحث (sharedData) كما هي ---
  const storedSearch = JSON.parse(localStorage.getItem("sharedData"));
  const [sharedData, setSharedData] = useState(storedSearch);
  useEffect(() => {
    localStorage.setItem("sharedData", JSON.stringify(sharedData));
  }, [sharedData]);

  // --- ✨ 2. إضافة حالة جديدة لتخزين بيانات الرحلة المختارة (flight) ✨ ---
  const storedFlight = JSON.parse(localStorage.getItem("flight"));
  const [flight, setFlight] = useState(storedFlight);
  useEffect(() => {
    localStorage.setItem("flight", JSON.stringify(flight));
  }, [flight]);
  
  // temp flight details
  const [tempFlight,setTempFlight] = useState(null);
  // --- ✨ 3. إضافة flight و setFlight إلى القيمة التي يمررها الـ Provider ✨ ---
  const value = {
    sharedData,
    setSharedData,
    flight,
    setFlight,
    tempFlight,
    setTempFlight
};

// هذا السطر سيخبرنا أن المزود يعمل والبيانات موجودة
console.log("DataProvider is rendering. The flight object is:", flight);

return (
    <DataContext.Provider value={value}>
    {children}
    </DataContext.Provider>
);
}

export const useData = () => useContext(DataContext);

DataProvider.propTypes = {
  children: PropTypes.node.isRequired, 
};