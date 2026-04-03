import Bank from "../models/Bank";

const addBank = async ( bank, userId, accessToken, itemId) =>  {
    return await Bank.create({
        user: userId,
        name: bank.name || "Unknown bank",
        institutionId: bank.institution_id,
        accessToken,
        itemId
    });
}

export default {
    addBank
}