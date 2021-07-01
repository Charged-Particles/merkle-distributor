
// This is the blob that gets distributed and pinned to IPFS.
// It is completely sufficient for recreating the entire merkle tree.
// Anyone can verify that all air drops are included in the tree,
// and the tree has no additional distributions.
interface AirdropMerkle {
  merkleRoot: string
  tokenTotal: string
  claims: {
    [account: string]: {
      index: number
      amount: string
      proof: string[]
      flags?: {
        [flag: string]: boolean
      }
    }
  }
}

interface AddressInfo {
  address: string
}

interface AirdropSourceFormat {
  address: string
  earnings: string
  reasons: string
}

type AirdropOldFormat = { [account: string]: number | string }
type AirdropNewFormat = { address: string; earnings: string; reasons: string }






// This is the blob that gets distributed and pinned to IPFS.
// It is completely sufficient for recreating the entire merkle tree.
// Anyone can verify that all air drops are included in the tree,
// and the tree has no additional distributions.
interface VestingMerkle {
  merkleRoot: string
  tokenTotal: string
  claims: {
    [account: string]: {
      index: number
      amount: string
      proof: string[]
      flags?: VestingDataFlags
    }
  }
}

interface VestingDataFlags {
  isPreSeed?: boolean
  isSeed?: boolean
  isCombined?: boolean
  totalAllocation?: string
  perMonth?: string
  startMonth?: string
  endMonth?: string
  amounts?: string[]
}

type VestingSourceFormat = {
  address: string
  investorType: string
  isCombined: string
  totalAllocation: string
  perMonth: string
  startMonth: string
  endMonth: string
  month1: string
  month2: string
  month3: string
  month4: string
  month5: string
  month6: string
  month7: string
  month8: string
  month9: string
  month10: string
  month11: string
  month12: string
  month13: string
  month14: string
  month15: string
  month16: string
  month17: string
  month18: string
}




export {
  AirdropMerkle,
  AddressInfo,
  AirdropOldFormat,
  AirdropNewFormat,
  AirdropSourceFormat,
  VestingMerkle,
  VestingDataFlags,
  VestingSourceFormat,
}
