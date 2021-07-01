import { BigNumber, utils } from 'ethers'
import BalanceTree from './balance-tree'
import {
  AirdropMerkle,
  AirdropOldFormat,
  AirdropNewFormat
} from './type-mapping'

const { isAddress, getAddress } = utils

export function parseBalanceMap(balances: AirdropOldFormat | AirdropNewFormat[]): AirdropMerkle {
  // if balances are in an old format, process them
  const balancesInAirdropNewFormat: AirdropNewFormat[] = Array.isArray(balances)
    ? balances
    : Object.keys(balances).map(
        (account): AirdropNewFormat => ({
          address: account,
          earnings: `0x${balances[account].toString(16)}`,
          reasons: '',
        })
      )

  const dataByAddress = balancesInAirdropNewFormat.reduce<{
    [address: string]: { amount: BigNumber; flags?: { [flag: string]: boolean } }
  }>((memo, { address: account, earnings, reasons }) => {
    if (!isAddress(account)) {
      throw new Error(`Found invalid address: ${account}`)
    }
    const parsed = getAddress(account)
    if (memo[parsed]) throw new Error(`Duplicate address: ${parsed}`)
    const parsedNum = BigNumber.from(earnings)
    if (parsedNum.lte(0)) throw new Error(`Invalid amount for account: ${account}`)

    const flags = {
      isUser: reasons.includes('user'),
      isGrants: reasons.includes('grants'),
      isLeptons: reasons.includes('leptons'),
      isProtons: reasons.includes('protons'),
    }

    memo[parsed] = { amount: parsedNum, ...(reasons === '' ? {} : { flags }) }
    return memo
  }, {})

  const sortedAddresses = Object.keys(dataByAddress).sort()

  // construct a tree
  const tree = new BalanceTree(
    sortedAddresses.map((address) => ({ account: address, amount: dataByAddress[address].amount }))
  )

  // generate claims
  const claims = sortedAddresses.reduce<{
    [address: string]: { amount: string; index: number; proof: string[]; flags?: { [flag: string]: boolean } }
  }>((memo, address, index) => {
    const { amount, flags } = dataByAddress[address]
    memo[address] = {
      index,
      amount: amount.toHexString(),
      proof: tree.getProof(index, address, amount),
      ...(flags ? { flags } : {}),
    }
    return memo
  }, {})

  const tokenTotal: BigNumber = sortedAddresses.reduce<BigNumber>(
    (memo, key) => memo.add(dataByAddress[key].amount),
    BigNumber.from(0)
  )

  return {
    merkleRoot: tree.getHexRoot(),
    tokenTotal: tokenTotal.toHexString(),
    claims,
  }
}
