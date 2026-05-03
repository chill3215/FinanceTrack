import {usePlaidLink} from "react-plaid-link";
import {useEffect, useState} from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function PlaidLinkButton({ onImportSuccess, onConnecting, onConnected, onError }) {
    const token = localStorage.getItem("jwtToken");
    const [linkToken, setLinkToken] = useState(null);

    useEffect(() => {
        if (!token) return;
        async function createLinkToken() {
            try {
                const res = await fetch(`${BACKEND_URL}/plaid/create_link_token`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) return;
                const data = await res.json();
                if (!data?.link_token) return;
                setLinkToken(data.link_token);
                localStorage.setItem("linkToken", data.link_token);
            } catch (e) {
                console.error("Plaid link init failed:", e);
            }
        }
        createLinkToken();
    }, [token]);

    if (!linkToken) return <button disabled>Loading...</button>;
    return (
        <PlaidLink
            linkToken={linkToken}
            token={token}
            onImportSuccess={onImportSuccess}
            onConnecting={onConnecting}
            onConnected={onConnected}
            onError={onError}
        />
    );
}

function PlaidLink({ linkToken, token, onImportSuccess, onConnecting, onConnected, onError }) {
    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: async (public_token, metadata) => {
            onConnecting?.();
            try {
                const res = await fetch(`${BACKEND_URL}/plaid/handle_bank_connection`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        public_token,
                        bank: {
                            name: metadata.institution.name,
                            institution_id: metadata.institution.institution_id
                        }
                    })
                });
                if (!res.ok) throw new Error("Bank connection failed");
                onConnected?.();
                onImportSuccess?.();
            } catch (e) {
                onError?.("Bank connection failed. Please try again.");
            }
        }
    });

    return (
        <button onClick={open} disabled={!ready || !linkToken}>
            Connect to banks
        </button>
    );
}

export default PlaidLinkButton;