const { spawn } = require('child_process')
const path = require('path')
const process = require('process')

process.env.INPUT_NOTION_TOKEN = process.env.NOTION_TOKEN
process.env.INPUT_DATABASE = '1ee4a9003e4548cda14d1a7e644ce014'
process.env.INPUT_SUBSCRIPTION_FILTER = 'IL External Identity Management' // '.*'

const ip = path.join(__dirname, 'index.js')
const options = {
  env: process.env
}

const ls = spawn('node', [ip], options)

ls.stdout.on('data', (data) => {
  process.stdout.write(`${data}`)
})

ls.stderr.on('data', (data) => {
  process.stdout.write(`${data}`)
})

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})
