const core = require('@actions/core')
const { DefaultAzureCredential } = require('@azure/identity')
const { SubscriptionClient } = require('@azure/arm-resources-subscriptions')
const { ResourceManagementClient } = require('@azure/arm-resources')

const getAzureData = async () => {
  // Azure SDK clients accept the credential as a parameter
  const credentials = new DefaultAzureCredential()
  const subsClient = new SubscriptionClient(credentials)
  const subscriptionFilter = core.getInput('subscription_filter') || '.*'
  const subscriptionFilterRegex = new RegExp(subscriptionFilter)

  const subscriptions = []
  for await (const item of subsClient.subscriptions.list()) {
    const sub = {
      id: item.subscriptionId,
      subscriptionPath: item.id,
      displayName: item.displayName,
      state: item.state,
      resourceGroups: []
    }
    if (sub.displayName.match(subscriptionFilterRegex)) {
      core.debug(`Getting resource groups for subscription: ${sub.displayName} ...`)
      const rgClient = new ResourceManagementClient(credentials, sub.id)
      for await (const item of rgClient.resourceGroups.list()) {
        sub.resourceGroups.push(item)
      }
      subscriptions.push(sub)
    }
  }

  return {
    subscriptions
  }
}

exports.getAzureData = getAzureData
