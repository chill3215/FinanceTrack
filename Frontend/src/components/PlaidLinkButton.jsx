import {usePlaidLink} from "react-plaid-link";
import {useEffect, useState} from "react";

function PlaidLinkButton() {
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
        <PlaidLink linkToken={linkToken} token={token}/>
    )

}

function PlaidLink({linkToken, token}) {
    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: async (public_token, metadata) => {
            await fetch("http://localhost:3000/plaid/exchange_public_token", {
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
        }
    })

    return (
        <button onClick={open} disabled={!ready || !linkToken}>
            Connect to banks
        </button>
    )
}

export default PlaidLinkButton;