const checkRestrictions = (user, txnType = 'any') => {

  if (user.cbnBlacklist) {
    return {
      success: false,
      code: 'CBN_BLACKLISTED',
      message: 'This account has been placed on the CBN sanctions list. All transactions are suspended. Contact your branch compliance officer.'
    };
  }

  if (user.status === 'frozen') {
    if (txnType === 'credit') {
      return null;
    }
    return {
      success: false,
      code: 'ACCOUNT_FROZEN',
      message: `Your account is currently frozen${user.frozenReason ? ': ' + user.frozenReason : ''}. All debit transactions are suspended. Please visit your nearest branch.`
    };
  }

  if (user.pndType === 'Full') {
    return {
      success: false,
      code: 'PND_FULL',
      message: 'A Full Post-No-Debit directive is active on this account per a CBN/court order. All transactions are suspended until the restriction is lifted.'
    };
  }

  if (user.pndType === 'Debit') {
    if (txnType !== 'credit') {
      return {
        success: false,
        code: 'PND_DEBIT',
        message: 'A Post-No-Debit instruction is active on this account. All outgoing transactions are blocked. Please contact your branch for resolution.'
      };
    }
  }

  if (user.dormant) {
    return {
      success: false,
      code: 'ACCOUNT_DORMANT',
      message: 'This account has been marked dormant due to inactivity. Please visit a branch or contact support to reactivate your account before transacting.'
    };
  }

  if (user.amlFlag) {
    return {
      success: false,
      code: 'AML_FLAGGED',
      message: 'This account has been flagged for compliance review. Transactions are temporarily suspended. Please contact your branch compliance team.'
    };
  }

  if (user.unclaimed) {
    return {
      success: false,
      code: 'ACCOUNT_UNCLAIMED',
      message: 'This account has been classified as unclaimed property. Transactions are suspended. Please contact your branch to reclaim ownership.'
    };
  }

  return null;
};

const blockIfRestricted = (user, txnType, res) => {
  const restriction = checkRestrictions(user, txnType);
  if (restriction) {
    res.status(403).json(restriction);
    return true;
  }
  return false;
};

module.exports = { checkRestrictions, blockIfRestricted };