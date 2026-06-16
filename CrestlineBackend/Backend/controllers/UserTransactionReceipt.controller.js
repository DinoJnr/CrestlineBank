const Registeruser = require('../models/Registerusers.model');
const { Transaction } = require('../models/Transactivity');

const getUserLedgerData = async (req, res) => {
  try {
    const userId = req.user._id;

    const userProfile = await Registeruser.findById(userId);
    if (!userProfile) {
      return res.status(404).json({ message: "Account profile context could not be verified." });
    }

    const rawTransactions = await Transaction.find({ userId }).sort({ createdAt: -1 });

    const normalizedTransactions = rawTransactions.map(tx => {
      const numericAmount = parseFloat(tx.amount);
      const isCredit = numericAmount >= 0;

      const dateObject = tx.createdAt ? new Date(tx.createdAt) : new Date();
      const localizedDate = dateObject.toISOString().split('T')[0];
      const localizedTime = dateObject.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const desc = tx.description?.toLowerCase() || '';

      return {
        id: tx._id.toString(),
        reference: tx.reference || `CT-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: Math.abs(numericAmount),
        title: tx.description || 'Crestline Core Ledger Processing',
        category: desc.includes('card') ? 'investment' : desc.includes('transfer') ? 'transfer' : 'deposit',
        type: isCredit ? 'credit' : 'debit',
        date: localizedDate,
        rawTime: localizedTime,
        status: tx.status || 'completed',
        tier: tx.tier || userProfile.tier || 'Standard Blue'
      };
    });

    return res.status(200).json({
      accountHolder: {
        name: userProfile.customerName || `${userProfile.firstName || ''} ${userProfile.lastName || userProfile.name || ''}`.toUpperCase().trim(),
        accountType: `Crestline ${userProfile.tier || 'Black'} Tier Protocol`,
        accountNumber: userProfile.accountNumber || "0994812044"
      },
      transactions: normalizedTransactions
    });

  } catch (error) {
    console.error("Ledger pipeline sync failure sequence:", error);
    return res.status(500).json({ message: "Internal server structural data fault." });
  }
};

module.exports = { getUserLedgerData };