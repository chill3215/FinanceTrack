import {usePlaidLink} from "react-plaid-link";
import {useEffect, useState} from "react";

function PlaidLinkButton({ onImportSuccess }) {
    const token = localStorage.getItem("jwtToken");
    const [linkToken, setLinkToken] = useState(null);
    useEffect(() => {
        async function createLinkToken() {
            const res = await fetch("http://localhost:3000/plaid/create_link_token", {
                method: "POST",
                headers: {Authorization: `Bearer ${token}`}
            });

            const data = await res.json();
            setLinkToken(data.link_token);
            localStorage.setItem("linkToken", data.link_token);
        }
        createLinkToken();
    }, [token]);

    if (!linkToken) return <button disabled>Loading...</button>
    return (
        <PlaidLink
            linkToken={linkToken}
            token={token}
            onImportSuccess={onImportSuccess}
        />
    )

}

function PlaidLink({linkToken, token, onImportSuccess}) {
    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: async (public_token, metadata) => {
            await fetch("http://localhost:3000/plaid/handle_bank_connection", {
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
            alert("Connected to bank!");
            onImportSuccess();
        }
    })

    return (
        <button onClick={open} disabled={!ready || !linkToken}>
            Connect to banks
        </button>
    )
}

export default PlaidLinkButton;