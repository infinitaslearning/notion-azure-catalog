const core = require('@actions/core')
const { mappingFn } = require('./mappingFnSubscription')
const hash = require('object-hash')

let createdSubscriptions = 0
let updatedSubscriptions = 0
let skippedSubscriptions = 0
let erroredSubscriptions = 0

const updateSubscriptions = async (azureData, { notion, subscriptionDatabase, subscriptionStructure, subscriptions }) => {
  let resourcesToUpdate = 0
  for (const sub of azureData) {
    resourcesToUpdate += sub.resourceGroups.length
    if (subscriptions[sub.id]) {
      const pageId = subscriptions[sub.id].pageId
      const pageHash = subscriptions[sub.id].pageHash
      await updateNotionRow(sub, pageId, pageHash, { notion, subscriptionDatabase, subscriptionStructure })
    } else {
      await createNotionRow(sub, { notion, subscriptionDatabase, subscriptionStructure, subscriptions })
    }
  }
  core.info(`Completed with ${createdSubscriptions} created, ${updatedSubscriptions} updated, ${skippedSubscriptions} unchanged and ${erroredSubscriptions} with errors`)
  return resourcesToUpdate
}

const updateNotionRow = async (sub, pageId, pageHash, { notion, subscriptionDatabase, subscriptionStructure }) => {
  try {
    const { properties, doUpdate } = createProperties(sub, pageHash, { subscriptionStructure })
    if (doUpdate) {
      core.debug(`Updating notion info for ${sub.displayName}`)
      await notion.pages.update({
        page_id: pageId,
        properties
      })
      updatedSubscriptions++
    } else {
      core.debug(`Not updating notion info for ${sub.displayName} as hash unchanged`)
      skippedSubscriptions++
    }
  } catch (ex) {
    erroredSubscriptions++
    core.warning(`Error updating notion document for ${sub.displayName}: ${ex.message} ...`)
  }
}

const createNotionRow = async (sub, { notion, subscriptionDatabase, subscriptionStructure, subscriptions }) => {
  try {
    const { properties } = createProperties(sub, null, { subscriptionStructure })
    core.debug(`Creating notion info for ${sub.displayName}`)
    const page = await notion.pages.create({
      parent: {
        database_id: subscriptionDatabase
      },
      properties
    })
    // We have to add it to our lookup for later use
    subscriptions[sub.id] = { pageId: page.id }
    createdSubscriptions++
  } catch (ex) {
    erroredSubscriptions++
    core.warning(`Error creating notion document for ${sub.displayName}: ${ex.message}`)
  }
}

const createProperties = (sub, pageHash, { subscriptionStructure }) => {
  // This iterates over the structure, executes a mapping function for each based on the data provided
  const properties = {}
  for (const field of subscriptionStructure) {
    if (mappingFn[field.name]) {
      properties[field.name] = mappingFn[field.name](sub)
    }
  }
  // Always have to check the hash afterwards, excluding the hash and the key
  const newPageHash = hash(properties, {
    excludeKeys: (key) => {
      return key === 'Hash' || key === 'Updated'
    }
  })

  const doUpdate = newPageHash && newPageHash !== pageHash
  properties.Hash = {
    rich_text: [
      {
        text: {
          content: newPageHash
        }
      }
    ]
  }

  return { properties, doUpdate }
}

exports.updateSubscriptions = updateSubscriptions
