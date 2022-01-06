/**
 * For each possible field name in the service catalogue, expose a mapping function
 * If a function is not found the field will be skipped
 */
const mappingFn = {
  Name: (sub, rg) => {
    return {
      title: [
        {
          text: {
            content: rg.name
          }
        }
      ]
    }
  },
  ID: (sub, rg) => {
    return {
      rich_text: [
        {
          text: {
            content: rg.id
          }
        }
      ]
    }
  },
  Type: (sub, rg) => {
    return {
      select: {
        name: rg.type
      }
    }
  },
  Location: (sub, rg) => {
    return {
      select: {
        name: rg.location
      }
    }
  },
  Subscription: (sub, rg) => {
    return {
      select: {
        name: sub.displayName
      }
    }
  },
  Environment: (sub, rg) => {
    return {
      select: {
        name: rg.tags?.environment || 'Unknown'
      }
    }
  },
  Deployment: (sub, rg) => {
    return {
      select: {
        name: rg.tags?.deployment || 'Unknown'
      }
    }
  },
  Source: (sub, rg) => {
    return {
      select: {
        name: rg.tags?.source || 'Unknown'
      }
    }
  },
  URL: (sub, rg) => {
    return {
      url: `https://portal.azure.com/#@infinitaslearning.onmicrosoft.com/resource${rg.id}`
    }
  },
  Updated: () => {
    return {
      date: {
        start: new Date().toISOString()
      }
    }
  }
}

exports.mappingFn = mappingFn
