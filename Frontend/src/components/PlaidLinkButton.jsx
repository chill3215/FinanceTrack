import {usePlaidLink} from "react-plaid-link";

function PlaidLinkButton() {
    const token = localStorage.getItem("jwtToken");

    async function createLinkToken() {
        const res = await fetch("http://localhost:3000/plaid/create_link_token", {
            method: "POST",
            headers: {Authorization: `Bearer ${token}`}
        });

        const data = res.json();
        return data.link_token;
    }

    const { open, ready } = usePlaidLink({
        token: createLinkToken(),
        onSuccess: async (public_token) => {
            open();
            await fetch("https://localhost:3000/plaid/exchange_public_token", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`},
                body: JSON.stringify({public_token})
            });
        }
    })
    return (
        <button onClick={open} disabled={!ready}>Connect to banks</button>
    )

}

export default PlaidLinkButton;