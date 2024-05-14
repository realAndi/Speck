import React from 'react';

interface DynamicPageContextProps {
  uid: string | null;
}

export const DynamicPageContext = React.createContext<DynamicPageContextProps>({
  uid: null,
});

export const useDynamicPageContext = () => React.useContext(DynamicPageContext);

interface DynamicPageProviderProps {
  children: React.ReactNode;
  uid: string | null;
}

export const DynamicPageProvider: React.FC<DynamicPageProviderProps> = ({ children, uid }) => {
  return (
    <DynamicPageContext.Provider value={{ uid }}>
      {children}
    </DynamicPageContext.Provider>
  );
};