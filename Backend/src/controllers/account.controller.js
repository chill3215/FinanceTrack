import accountService from "../services/account.service";
import balanceHistoryService from "../services/balanceHistory.service";

const getAllAccountsFromUser = async (req, res) => {
    try{
        return res.json(await accountService.getAllAccountsByUserId(req.userId));
    }
    catch (error){
        console.error(error.response?.data || error.message);
        return res.status(500).json("Fetch Accounts failed")
    }
}

const getAllAccountsOfBankFromUser = async (req, res) => {
    try{
        return res.json(await accountService.getAllAccountsByBankId(req.params.bankId));
    }
    catch (error){
        console.error(error.response?.data || error.message);
        return res.status(500).json("Fetch Accounts failed")
    }
}

const getAccountBalanceHistory = async (req, res) => {
    try {
        return res.json(await balanceHistoryService.getHistory(req.params.accountId));
    } catch (error){
        console.error(error.response?.data || error.message);
        return res.status(500).json("Fetch Account History failed");
    }
}

const getPortfolio = async (req, res) => {
    try {
        return res.json(await accountService.getPortfolio(req.userId));
    } catch (error) {
        console.error(error.response?.data || error.message);
        return res.status(500).json("Fetch asset allocation failed");
    }
}

export default {
    getAllAccountsFromUser,
    getAllAccountsOfBankFromUser,
    getAccountBalanceHistory,
    getPortfolio,
};