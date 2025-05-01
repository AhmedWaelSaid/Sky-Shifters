import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [sharedData, setSharedData] = useState(null);

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