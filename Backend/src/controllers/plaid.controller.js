import plaidService from "../services/plaid.service";
import accountService from "../services/account.service";
import bankService from "../services/bank.service";
import transactionService from "../services/transaction.service";

const createLinkToken = async (req, res) => {
    try {
    const linkToken = await plaidService.createLinkToken();
        res.json(linkToken);
    } catch (error){
        console.log(error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create link token" });
    }
}

const handleBankConnection = async (req, res) => {
    try {
        const bank = req.body.bank;
        const publicToken = req.body.public_token;
        const { accessToken, itemId } = await plaidService.exchangePublicToken(publicToken);
        const addedBank = await bankService.addBank(bank, req.userId, accessToken, itemId);
        await accountService.importAccounts(addedBank._id);
        await transactionService.importTransactions(addedBank._id);
        res.json({ success: true});
    }
    catch (error) {
        console.log(error.response?.data || error.message);
        res.status(500).json("Exchange public token for access token failed");
    }
}
export default { createLinkToken, handleBankConnection };