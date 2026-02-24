import axios from "axios";
import User from "../models/User";

    const createLinkToken = async () => {
        const createLinkTokenResponse = await axios.post(
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
        return createLinkTokenResponse.data;
    }

const exchangePublicToken = async (public_token, bank, userId) => {

    const exchangeTokenResponse = await axios.post(
        "https://sandbox.plaid.com/item/public_token/exchange",
        {
            "client_id": process.env.PLAID_CLIENT_ID,
            "secret": process.env.PLAID_SECRET,
            "public_token": public_token
        },
        {headers: {'Content-Type': 'application/json'}}
    );

    //accessToken in db speichern
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found")
    }
    user.banks.push({
        name: bank.name || "Unknown bank",
        institutionId: bank.institution_id,
        accessToken: exchangeTokenResponse.data.access_token
    });
    await user.save();
}
export default { createLinkToken, exchangePublicToken };