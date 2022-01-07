/**
 * For each possible field name in the service catalogue, expose a mapping function
 * If a function is not found the field will be skipped
 */
const mappingFn = {
  Name: (sub) => {
    return {
      title: [
        {
          text: {
            content: sub.displayName
          }
        }
      ]
    }
  },
  Savings: (sub) => {
    return {
      number: sub.netSavingsPossible
    }
  },
  ID: (sub) => {
    return {
      rich_text: [
        {
          text: {
            content: sub.id
          }
        }
      ]
    }
  },
  Link: (sub) => {
    return {
      rich_text: [
        {
          text: {
            content: 'Azure Portal',
            link: {
              url: `https://portal.azure.com/#@infinitaslearning.onmicrosoft.com/resource${sub.subscriptionPath}`
            }
          }
        }
      ]
    }
  },
  URL: (sub) => {
    return {
      url: `https://portal.azure.com/#@infinitaslearning.onmicrosoft.com/resource${sub.subscriptionPath}`
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
