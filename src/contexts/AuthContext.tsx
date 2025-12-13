import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import api, { AUTH_TOKEN_KEY } from "@/lib/axiosInstance";

export type User = {
    id?: string;
    username?: string;
    email: string;
    role?: string;
    is_superadmin?: boolean;
} | null;

type AuthContextType = {
    user: User;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth:user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                setUser(JSON.parse(raw));
            }
        } catch {}
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await api.post("/auth/login", { email, password });
        const { access_token, admin } = res.data || {};
        if (!access_token) throw new Error("Login failed: no token");

        try {
            localStorage.setItem(AUTH_TOKEN_KEY, access_token);
        } catch {}

        const u: User = admin?.email ? admin : { email };
        setUser(u);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        } catch {}
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(AUTH_TOKEN_KEY);
        } catch {}
    }, []);

    const value = useMemo(
        () => ({ user, loading, login, logout }),
        [user, loading, login, logout]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
