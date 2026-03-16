"use client";

import React, { createContext, useContext, useState } from "react";

interface NavbarContextType {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen((prev) => !prev);
    const close = () => setIsOpen(false);

    return (
        <NavbarContext.Provider value={{ isOpen, toggle, close }}>
            {children}
        </NavbarContext.Provider>
    );
}

export function useNavbar() {
    const context = useContext(NavbarContext);
    if (context === undefined) {
        throw new Error("useNavbar must be used within a NavbarProvider");
    }
    return context;
}
