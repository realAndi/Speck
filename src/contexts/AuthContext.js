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
    uid: null,
    isAuthenticated: false,
    isLoading: true,
});

export const useAuthContext = () => React.useContext(AuthContext);

export const AuthContextProvider = ({
    children,
}) => {
    const [user, setUser] = React.useState(null);
    const [uid, setUid] = React.useState(null);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                setUid(user.uid);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setUid(null);
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, uid, isAuthenticated, isLoading }}>
            {isLoading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};