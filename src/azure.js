const core = require('@actions/core')
const { DefaultAzureCredential } = require('@azure/identity')
const { SubscriptionClient } = require('@azure/arm-resources-subscriptions')
const { ResourceManagementClient } = require('@azure/arm-resources')
// const { ConsumptionManagementClient } = require('@azure/arm-consumption')

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
      netSavingsPossible: 0.0,
      recommendations: [],
      resourceGroups: []
    }
    if (sub.displayName.match(subscriptionFilterRegex)) {
      // core.debug(`Getting reservation recommendation data for subscription: ${sub.displayName} ...`)
      // const usageClient = new ConsumptionManagementClient(credentials, sub.id)
      // for await (const rec of usageClient.reservationRecommendations.list(sub.subscriptionPath)) {
      //   sub.recommendations.push({
      //     subscription: sub.subscriptionPath,
      //     sku: rec.sku,
      //     ...rec.properties
      //   })
      //   sub.netSavingsPossible += rec.properties.netSavings
      // }
      core.debug(`Getting resource groups for subscription: ${sub.displayName} ...`)
      const rgClient = new ResourceManagementClient(credentials, sub.id)
      for await (const rg of rgClient.resourceGroups.list()) {
        sub.resourceGroups.push(rg)
      }
      subscriptions.push(sub)
    }
  }

  return {
    azureData: subscriptions
  }
}

exports.getAzureData = getAzureData
