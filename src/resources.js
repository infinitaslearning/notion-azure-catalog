const core = require('@actions/core')
const { mappingFn } = require('./mappingFn')
const hash = require('object-hash')

let createdResources = 0
let updatedResources = 0
let skippedResources = 0
let erroredResources = 0

const updateResources = async (subscriptions, { notion, database, structure, resources }) => {
  for (const sub of subscriptions) {
    for (const rg of sub.resourceGroups) {
      // Lets see if we can find the row
      const resourceId = rg.id
      // Lets look the service up
      if (resources[resourceId]) {
        const pageId = resources[resourceId].pageId
        const pageHash = resources[resourceId].pageHash
        await updateNotionRow(sub, rg, pageId, pageHash, { notion, database, structure })
      } else {
        await createNotionRow(sub, rg, { notion, database, structure })
      }
    }
  }
  core.info(`Completed with ${createdResources} created, ${updatedResources} updated, ${skippedResources} unchanged and ${erroredResources} with errors`)
}

const updateNotionRow = async (sub, rg, pageId, pageHash, { notion, database, structure }) => {
  try {
    const { properties, doUpdate } = createProperties(sub, rg, pageHash, { structure })
    if (doUpdate) {
      core.debug(`Updating notion info for ${rg.name}`)
      await notion.pages.update({
        page_id: pageId,
        properties
      })
      updatedResources++
    } else {
      core.debug(`Not updating notion info for ${rg.name} as hash unchanged`)
      skippedResources++
    }
  } catch (ex) {
    erroredResources++
    core.warning(`Error updating notion document for ${rg.name}: ${ex.message} ...`)
  }
}

const createNotionRow = async (sub, rg, { notion, database, structure }) => {
  try {
    const { properties } = createProperties(sub, rg, null, { structure })
    core.debug(`Creating notion info for ${rg.name}`)
    await notion.pages.create({
      parent: {
        database_id: database
      },
      properties
    })
    createdResources++
  } catch (ex) {
    erroredResources++
    core.warning(`Error creating notion document for ${rg.name}: ${ex.message}`)
  }
}

const createProperties = (sub, rg, pageHash, { structure }) => {
  // This iterates over the structure, executes a mapping function for each based on the data provided
  const properties = {}
  for (const field of structure) {
    if (mappingFn[field.name]) {
      properties[field.name] = mappingFn[field.name](sub, rg)
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

exports.updateResources = updateResources
