import { Navigate } from "react-router-dom";
import { getToken } from "../services/AuthService";
import type { JSX } from "react";
 
export function PrivateRoute({ children }: { children: JSX.Element}){
    const token = getToken();   

    if(!token){
        return <Navigate to="/login"/>
    }

    return children;
}