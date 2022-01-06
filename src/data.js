const core = require('@actions/core')

const loadData = async ({ notion }) => {
  const database = core.getInput('database')

  // Get core DB structure
  const dbStructure = await notion.databases.retrieve({
    database_id: database
  })
  const structure = Object.keys(dbStructure.properties).map((property) => {
    return { name: dbStructure.properties[property].name, type: dbStructure.properties[property].type }
  })

  // Get the current resource matrix and hashes in bulk to speed up updates
  const resources = {}
  const getDatabaseRows = async (startCursor) => {
    const pageRows = await notion.databases.query({
      database_id: database,
      start_cursor: startCursor
    })
    pageRows.results.forEach((item) => {
      const pageId = item.id
      const pageHash = item.properties?.Hash?.rich_text[0]?.text?.content
      const resourceId = item.properties?.ID?.rich_text[0]?.text?.content
      resources[resourceId] = { pageId, pageHash }
    })
    if (pageRows.has_more) {
      return await getDatabaseRows(pageRows.next_cursor)
    }
  }
  await getDatabaseRows()

  return {
    structure,
    resources
  }
}

exports.loadData = loadData
