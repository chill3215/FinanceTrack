import holdingService from "../services/holding.service";
import Bank from "../models/Bank";

const getAllHoldingsFromUser = async (req, res) => {
    try {
        return res.json(await holdingService.getAllHoldingsByUserId(req.userId));
    } catch (error) {
        console.error(error.response?.data || error.message);
        return res.status(500).json("Fetch holdings failed");
    }
}

const importHoldings = async (req, res) => {
    try {
        const { bankId } = req.params;
        const count = await holdingService.importHoldings(bankId);
        return res.json({ message: `Imported ${count} holdings` });
    } catch (error) {
        console.error(error.response?.data || error.message);
        return res.status(500).json("Import holdings failed");
    }
}

const importAllHoldingsForUser = async (req, res) => {
    try {
        const banks = await Bank.find({ user: req.userId }).lean();
        let totalCount = 0;
        
        for (const bank of banks) {
            const count = await holdingService.importHoldings(bank._id);
            totalCount += count;
        }
        
        return res.json({ message: `Imported ${totalCount} holdings from ${banks.length} banks` });
    } catch (error) {
        console.error(error.response?.data || error.message);
        return res.status(500).json("Import all holdings failed");
    }
}

export default {
    getAllHoldingsFromUser,
    importHoldings,
    importAllHoldingsForUser,
};
