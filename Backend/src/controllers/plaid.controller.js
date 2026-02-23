import plaidService from "../services/plaid.service";

const createLinkToken = async (req, res) => {
    try {
        const linkToken = plaidService.createLinkToken();
        res.json(linkToken);
    } catch (error){
        console.log(error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create link token" });
    }
}

const exchangePublicToken = async (req, res) => {
    try {
        const { public_token, bank } = req.body;
        await plaidService.exchangePublicToken(public_token, bank);
        res.json({ success: true});
    }
    catch (error) {
        console.log(error.response?.data || error.message);
        res.status(500).json("Exchange public token for access token failed");
    }
}
export default { createLinkToken, exchangePublicToken };