import React, { createContext, useContext, useState } from 'react';

const TabBarContext = createContext({ tabHeight: 0, setTabHeight: (h: number) => {} });

export const TabBarProvider = ({ children }: any) => {
  const [tabHeight, setTabHeight] = useState(0);
  return (
    <TabBarContext.Provider value={{ tabHeight, setTabHeight }}>
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBar = () => useContext(TabBarContext);
