import { BigNumber, utils } from 'ethers'
import BalanceTree from './balance-tree'
import {
  VestingMerkle,
  VestingDataFlags,
  VestingSourceFormat,
} from './type-mapping'

const { isAddress, getAddress } = utils


export function parseVestingMap(balances: VestingSourceFormat[], currentMonth: number): VestingMerkle {

  const dataByAddress = balances.reduce<{
    [address: string]: { amount: BigNumber; flags?: VestingDataFlags }
  }>((memo, {
      address: account, investorType, isCombined, totalAllocation, perMonth, startMonth, endMonth,
      month1, month2, month3, month4, month5, month6, month7, month8, month9, month10, month11, month12, month13, month14, month15, month16, month17, month18
    }) => {
    if (!isAddress(account)) {
      throw new Error(`Found invalid address: ${account}`)
    }
    const parsed = getAddress(account)
    if (memo[parsed]) throw new Error(`Duplicate address: ${parsed}`)

    const monthAmounts = [month1, month2, month3, month4, month5, month6, month7, month8, month9, month10, month11, month12, month13, month14, month15, month16, month17, month18]
    const parsedNum = BigNumber.from(monthAmounts[currentMonth])
    if (parsedNum.gt(0)) {
      const flags:VestingDataFlags = {}

      flags.isPreSeed = investorType.includes('preSeed')
      flags.isSeed = investorType.includes('seed')
      flags.isCombined = isCombined.includes('TRUE')
      flags.totalAllocation = totalAllocation
      flags.perMonth = perMonth
      flags.startMonth = startMonth
      flags.endMonth = endMonth
      flags.amounts = monthAmounts

      memo[parsed] = { amount: parsedNum, ...{ flags } }
    }

    return memo
  }, {})

  const sortedAddresses = Object.keys(dataByAddress).sort()

  // construct a tree
  const tree = new BalanceTree(
    sortedAddresses.map((address) => ({ account: address, amount: dataByAddress[address].amount }))
  )

  // generate claims
  const claims = sortedAddresses.reduce<{
    [address: string]: { amount: string; index: number; proof: string[]; flags?: VestingDataFlags }
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
