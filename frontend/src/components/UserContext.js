// UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userFullName, setUserFullName] = useState(() => {
        // Retrieve fullname from local storage if available
        const storedFullname = localStorage.getItem('userFullname');
        return storedFullname ? JSON.parse(storedFullname) : '';
    });

    useEffect(() => {
        // Store fullname in local storage whenever it changes
        localStorage.setItem('userFullname', JSON.stringify(userFullName));
    }, [userFullName]);

    return (
        <UserContext.Provider value={{ userFullName, setUserFullName }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);
