import balanceHistoryService from "../services/balanceHistory.service";

const getMonthlyBalanceOfUser = async (req, res) => {
    try {
        const chartData = await balanceHistoryService.getMonthlyBalanceOfUser(req.userId);
        return res.json(chartData);
    } catch (error){
        console.log(error.response?.data || error.message);
        return res.status(500).json("Fetch Monthly Balance of User failed");
    }
}

export default {
    getMonthlyBalanceOfUser
}