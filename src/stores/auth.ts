import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { defineStore } from "pinia";
import { createUserWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { create_user } from "@/router/statRoutes";

const auth = getAuth();

function toFriendlyAuthError(error: unknown, fallbackMessage: string): Error {
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = String(error.code);
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
            return new Error('Incorrect username or password');
        }
    }

    if (error instanceof Error) {
        return error;
    }

    return new Error(fallbackMessage);
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: Error | null;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        accessToken: null,
        loading: false,
        error: null
    }),
    getters: {
        getEmail(): string {return this.user ? this.user.email! : ''}
    },
    actions: {
        async registerUser(email: string, password: string) {
            this.error = null;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                this.user = userCredential.user;
                await create_user(email);
            } catch (error: unknown) {
                this.error = toFriendlyAuthError(error, 'Unable to create account');
            }
        },
        async login(email: string, password: string) {
            this.error = null;
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                this.user = userCredential.user;
            } catch (error: unknown) {
                this.error = toFriendlyAuthError(error, 'Unable to sign in');
            }
        },
        setUser(user: User | null) {
            this.user = user;
        },
        async signout() {
            try {
                await signOut(auth);
                this.user = null;
                console.log("User signed out")
            } catch (error) {
                console.error("Error signing out user:", error);
            }
        }
    }
});
