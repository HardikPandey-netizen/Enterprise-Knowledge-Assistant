import {createContext,useState,useContext} from "react";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [token,setToken] = useState(localStorage.getItem("token"));
    const [user,setUser] = useState(()=>{
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null
    })
    
    const login = (token, userData) => {
        setToken(token);
        setUser(userData);
        localStorage.setItem("token",token);
        localStorage.setItem("user",JSON.stringify(userData));
    }

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    const isLoggedIn = Boolean(token && user);
    

    return (
        <AuthContext.Provider value={{token,user,login,logout, isLoggedIn}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);