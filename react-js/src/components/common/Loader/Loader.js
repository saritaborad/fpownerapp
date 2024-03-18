import React, { createContext, useContext, useState } from 'react';
import './Loader.scss';

export const LoaderContext = createContext();

export function useLoader() {
  return useContext(LoaderContext);
}

const LoaderProvider = ({ children }) => {
  const [loaderVisibility, setLoaderVisibility] = useState(false);

  return (
    <LoaderContext.Provider value={{ loaderVisibility, setLoaderVisibility }}>
      {children}

      {loaderVisibility && (
        <div className="loader-overlay">
          <div className="loader" />
        </div>
      )}
    </LoaderContext.Provider>
  );
};

export default LoaderProvider;
