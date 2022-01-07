const core = require('@actions/core')
const { Client, LogLevel } = require('@notionhq/client')
const { updateResources } = require('./resources')
const { updateSubscriptions } = require('./subscriptions')
const { loadData } = require('./data')
const { getAzureData } = require('./azure')

try {
  const NOTION_TOKEN = core.getInput('notion_token')
  const resourceDatabase = core.getInput('resource_database')
  const subscriptionDatabase = core.getInput('subscription_database')

  core.debug('Creating notion client ...')
  const notion = new Client({
    auth: NOTION_TOKEN,
    logLevel: LogLevel.ERROR
  })

  const refreshData = async () => {
    // console.log(resource_result_list);
    core.startGroup('🗂️  Loading subscriptions and resources ...')
    const { resourceStructure, resources, subscriptionStructure, subscriptions } = await loadData({ notion })
    core.info(`Found ${subscriptionStructure.length} fields in the Subscription database: ${subscriptionStructure.map((item) => item.name)}`)
    core.info(`Loaded ${Object.keys(subscriptions || {}).length} existing subscriptions`)
    core.info(`Found ${resourceStructure.length} fields in the Resource database: ${resourceStructure.map((item) => item.name)}`)
    core.info(`Loaded ${Object.keys(resources || {}).length} existing resources`)
    core.endGroup()

    core.startGroup('🌀 Getting azure subscriptions and resource groups ..')
    const { azureData } = await getAzureData()
    core.endGroup()
    core.startGroup(`✨ Updating notion with ${azureData.length} subscriptions ...`)
    const resourcesToUpdate = await updateSubscriptions(azureData, { core, notion, subscriptionDatabase, subscriptionStructure, subscriptions })
    core.endGroup()
    core.startGroup(`✨ Updating notion with ${resourcesToUpdate} resources ...`)
    await updateResources(azureData, { core, notion, resourceDatabase, resourceStructure, resources, subscriptions })
    core.endGroup()
  }

  refreshData()
} catch (error) {
  core.setFailed(error.message)
}
