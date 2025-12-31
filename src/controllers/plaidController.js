import axios from "axios";

const createLinkToken = async (req, res) => {
    try {
        const response = await axios.post(
            "https://sandbox.plaid.com/link/token/create",
            {
                "client_id": process.env.PLAID_CLIENT_ID,
                "secret": process.env.PLAID_SECRET,
                "client_name": "Insert Client name here",
                "country_codes": ["US"],
                "language": "en",
                "user": {
                    "client_user_id": "user_good"
                },
                "products": ["transactions"],
                "additional_consented_products": ["auth"]
            },
            { headers: { 'Content-Type': 'application/json' } }
        )
        res.json(response.data);
    } catch (error){
        console.log(error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create link token" });
    }
}

const exchangePublicToken = async (req, res) => {
    try {
        const { public_token } = req.body;
        const response = await axios.post(
            "https://sandbox.plaid.com/item/public_token/exchange",
            {
                "client_id": process.env.PLAID_CLIENT_ID,
                "secret": process.env.PLAID_SECRET,
                "public_token": process.env.PLAID_TEMP_PUBLIC_TOKEN
            },
            {headers: {'Content-Type': 'application/json'}}
        );
        res.json(response.data);
    }
    catch (error) {
        console.log(error.response?.data || error.message);
        res.status(500).json("Exchange public token for access token failed")
    }
}
export default { createLinkToken, exchangePublicToken };