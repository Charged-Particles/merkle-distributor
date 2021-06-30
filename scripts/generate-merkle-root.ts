import { program } from 'commander'
import fs from 'fs'
import { parseBalanceMap } from '../src/parse-balance-map'

program
  .version('0.0.0')
  .requiredOption(
    '-i, --input <path>',
    'input JSON file location containing a map of account addresses to string balances'
  )
  .requiredOption(
    '-t, --type <identifier>',
    'Type identifier for naming the output file'
  )

program.parse(process.argv)

const json = JSON.parse(fs.readFileSync(program.input, { encoding: 'utf8' }))

if (typeof json !== 'object') throw new Error('Invalid JSON')

// console.log(JSON.stringify(parseBalanceMap(json)))

fs.openSync(`./scripts/${program.type}-merkle-root.json`, 'w+')
fs.writeFileSync(`./scripts/${program.type}-merkle-root.json`, JSON.stringify(parseBalanceMap(json), null, '\t'), 'utf8')

console.log('Done!')
