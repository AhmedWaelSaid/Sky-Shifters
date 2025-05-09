import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const DataContext = createContext();

export function DataProvider({ children }) {
  const storedSearch = JSON.parse(localStorage.getItem("sharedData"));
  const [sharedData, setSharedData] = useState(storedSearch);
  useEffect(()=>{
    localStorage.setItem("sharedData",JSON.stringify(sharedData))
  },[sharedData])

  return (
    <DataContext.Provider value={{ sharedData, setSharedData }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
DataProvider.propTypes = {
  children: PropTypes.node.isRequired, 
};