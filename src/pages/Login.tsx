import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/AuthService";

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(username, password);
            navigate("/")
        } catch (err) {
            setError("Usuario o password incorrecto")
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="upload-page">
            <div className="upload-card">
                <h2 className="upload-title">Iniciar Sesion</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="upload-button" type="submit">
                        {loading ? "Ingresando..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    )
};