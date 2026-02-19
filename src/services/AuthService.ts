const API_URL = import.meta.env.VITE_API_URL;

export async function login(username: string, password: string ) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({username, password}),
    });

    if(!response.ok){
        throw new Error("Credenciales invalidas");
    }

    const data = await response.json();

    sessionStorage.setItem("token", data.token);

    return data;
}

export function logout(){
    sessionStorage.removeItem("token");
}

export function getToken(){
    return sessionStorage.getItem("token");
}