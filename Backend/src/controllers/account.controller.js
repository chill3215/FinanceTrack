import accountService from "../services/account.service";
import balanceHistoryService from "../services/balanceHistory.service";


const getAllAccounts = async (req, res) => {
    try{
        return res.json(await accountService.getAllAccountsByBankId(req.params.bankId));
    }
    catch (error){
        console.log(error.response?.data || error.message);
        return res.status(500).json("Fetch Accounts failed")
    }
}

const getAccountBalanceHistory = async (req, res) => {
    try {
        return res.json(await balanceHistoryService.getHistory(req.params.accountId));
    } catch (error){
        console.log(error.response?.data || error.message);
        return res.status(500).json("Fetch Account History failed");
    }
}

export default {
    getAllAccounts,
    getAccountBalanceHistory
};