import React, { createContext, useContext, ReactNode, FC } from 'react';

interface DynamicPageContextProps {
  uid: string | null;
}

const DynamicPageContext = createContext<DynamicPageContextProps>({
  uid: null,
});

export const useDynamicPageContext = () => useContext(DynamicPageContext);

interface DynamicPageProviderProps {
  children: ReactNode;
  uid: string | null;
}

export const DynamicPageProvider: FC<DynamicPageProviderProps> = ({ children, uid }) => {
  return (
    <DynamicPageContext.Provider value={{ uid }}>
      {children}
    </DynamicPageContext.Provider>
  );
};