const core = require('@actions/core')

const loadData = async ({ notion }) => {
  const resourceDatabase = core.getInput('resource_database')
  const subscriptionDatabase = core.getInput('subscription_database')

  // Get subscription DB structure
  const subscriptionDbStructure = await notion.databases.retrieve({
    database_id: subscriptionDatabase
  })
  const subscriptionStructure = Object.keys(subscriptionDbStructure.properties).map((property) => {
    return { name: subscriptionDbStructure.properties[property].name, type: subscriptionDbStructure.properties[property].type }
  })

  // Get resource DB structure
  const resourceDbStructure = await notion.databases.retrieve({
    database_id: resourceDatabase
  })
  const resourceStructure = Object.keys(resourceDbStructure.properties).map((property) => {
    return { name: resourceDbStructure.properties[property].name, type: resourceDbStructure.properties[property].type }
  })

  // Get the current subscription matrix and hashes in bulk to speed up updates
  const subscriptions = {}
  const getSubscriptionDatabaseRows = async (startCursor) => {
    const pageRows = await notion.databases.query({
      database_id: subscriptionDatabase,
      start_cursor: startCursor
    })
    pageRows.results.forEach((item) => {
      const pageId = item.id
      const pageHash = item.properties?.Hash?.rich_text[0]?.text?.content
      const subscriptionId = item.properties?.ID?.rich_text[0]?.text?.content
      subscriptions[subscriptionId] = { pageId, pageHash }
    })
    if (pageRows.has_more) {
      return await getSubscriptionDatabaseRows(pageRows.next_cursor)
    }
  }
  await getSubscriptionDatabaseRows()

  // Get the current resource matrix and hashes in bulk to speed up updates
  const resources = {}
  const getResourceDatabaseRows = async (startCursor) => {
    const pageRows = await notion.databases.query({
      database_id: resourceDatabase,
      start_cursor: startCursor
    })
    pageRows.results.forEach((item) => {
      const pageId = item.id
      const pageHash = item.properties?.Hash?.rich_text[0]?.text?.content
      const resourceId = item.properties?.ID?.rich_text[0]?.text?.content
      resources[resourceId] = { pageId, pageHash }
    })
    if (pageRows.has_more) {
      return await getResourceDatabaseRows(pageRows.next_cursor)
    }
  }
  await getResourceDatabaseRows()

  return {
    subscriptionStructure,
    subscriptions,
    resourceStructure,
    resources
  }
}

exports.loadData = loadData
