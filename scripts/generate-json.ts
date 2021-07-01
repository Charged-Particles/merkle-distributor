import { program } from 'commander'
import fs from 'fs'
import { AddressInfo, AirdropSourceFormat, VestingSourceFormat } from '../src/type-mapping'

program
  .version('0.0.0')
  .requiredOption(
    '-t, --type <identifier>',
    'Type identifier for naming the output file'
  )

program.parse(process.argv)


function bnToHex(bn:BigInt) {
  let hex = BigInt(bn).toString(16);
  if (hex.length % 2) {
    hex = '0' + hex;
  }
  return `0x${hex}`;
}

let finalJson;


//
//   AIRDROP
//

if (program.type === 'ionx') {
  const balancesJson = JSON.parse(fs.readFileSync('./scripts/data/balances.json', { encoding: 'utf8' }))
  if (typeof balancesJson !== 'object') throw new Error('Invalid balances JSON')
  // console.log({balancesJson: JSON.stringify(balancesJson)})

  const grantsJson = JSON.parse(fs.readFileSync('./scripts/data/grants.json', { encoding: 'utf8' }))
  if (typeof grantsJson !== 'object') throw new Error('Invalid grants JSON')
  // console.log({grantsJson: JSON.stringify(grantsJson)})

  const leptonsJson = JSON.parse(fs.readFileSync('./scripts/data/leptons.json', { encoding: 'utf8' }))
  if (typeof leptonsJson !== 'object') throw new Error('Invalid leptons JSON')
  // console.log({leptonsJson: JSON.stringify(leptonsJson)})

  const protonsJson = JSON.parse(fs.readFileSync('./scripts/data/protons.json', { encoding: 'utf8' }))
  if (typeof protonsJson !== 'object') throw new Error('Invalid protons JSON')
  // console.log({protonsJson: JSON.stringify(protonsJson)})


  finalJson = balancesJson.map((obj:AirdropSourceFormat, key:number) => {
    const { address, earnings, reasons } = obj
    const earningsBN = BigInt(earnings + '0'.repeat(18))
    const earningsWei = bnToHex(earningsBN)

    const isGrants = !!(grantsJson.find((grant:AddressInfo) => (grant.address.toLowerCase() == address.toLowerCase())) || false)
    const isLeptons = !!(leptonsJson.find((lepton:AddressInfo) => (lepton.address.toLowerCase() == address.toLowerCase())) || false)
    const isProtons = !!(protonsJson.find((proton:AddressInfo) => (proton.address.toLowerCase() == address.toLowerCase())) || false)

    const reasonsArr = ['user'];
    if (isGrants) { reasonsArr.push('grants') }
    if (isLeptons) { reasonsArr.push('leptons') }
    if (isProtons) { reasonsArr.push('protons') }

    return {address, earnings: earningsWei, reasons: reasonsArr.join(',')}
  })
}


//
//   TEAM/INVESTORS
//

if (program.type === 'vesting') {
  throw new Error('Nothing to Generate for Vesting; JSON already in correct format.')
}


// console.log({finalJson})

fs.openSync(`./scripts/data/${program.type}-final.json`, 'w+')
fs.writeFileSync(`./scripts/data/${program.type}-final.json`, JSON.stringify(finalJson, null, '\t'), 'utf8')

console.log('Done!')