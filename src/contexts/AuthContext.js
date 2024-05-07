"use client"

import React from 'react';
import {
    onAuthStateChanged,
    getAuth,
} from 'firebase/auth';
import { app } from '@/utils/firebase/firebase-config';

const auth = getAuth(app);

export const AuthContext = React.createContext({
    user: null,
    isAuthenticated: false,
});

export const useAuthContext = () => React.useContext(AuthContext);

export const AuthContextProvider = ({
    children,
}) => {
    const [user, setUser] = React.useState(null);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated }}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};