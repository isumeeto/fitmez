"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface MenuContextType {
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  closeMenu: () => void;
}

export const MenuContext = createContext<MenuContextType>({
  activeMenuId: null,
  setActiveMenuId: () => {},
  closeMenu: () => {},
});

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const closeMenu = useCallback(() => {
    setActiveMenuId(null);
  }, []);

  return (
    <MenuContext.Provider value={{ activeMenuId, setActiveMenuId, closeMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
