const core = require('@actions/core')
const { Client, LogLevel } = require('@notionhq/client')
const { updateResources } = require('./resources')
const { loadData } = require('./data')
const { getAzureData } = require('./azure')

try {
  const NOTION_TOKEN = core.getInput('notion_token')
  const database = core.getInput('database')

  core.debug('Creating notion client ...')
  const notion = new Client({
    auth: NOTION_TOKEN,
    logLevel: LogLevel.ERROR
  })

  const refreshData = async () => {
    // console.log(resource_result_list);
    core.startGroup('🗂️  Loading services, systems and owners ...')
    const { structure, resources } = await loadData({ notion })
    core.info(`Found ${structure.length} fields in the Resource database: ${structure.map((item) => item.name)}`)
    core.info(`Loaded ${Object.keys(resources || {}).length} existing resources`)
    core.endGroup()
    core.startGroup('🌀 Getting azure subscriptions and resource groups ..')
    const { subscriptions } = await getAzureData()
    core.endGroup()
    core.startGroup(`✨ Updating notion with ${subscriptions.length} services ...`)
    await updateResources(subscriptions, { core, notion, database, structure, resources })
    core.endGroup()
  }

  refreshData()
} catch (error) {
  core.setFailed(error.message)
}
