# Notion Azure Catalog

This action will scan all of the Azure subscritpions available to the provided token and update their information in the specified Notion database.


## Notion integration and token

First, you need to have an integration access token - which you can get from https://www.notion.so/my-integrations after creating an integration.  Give the integration a friendly name like 'Github Actions'.

By default integrations cant access any content so you you *must* share your database (or the parent page / tree it is contained within) with the integration you created earlier to be able to access it.

## Notion Databases

This action expects a Notion database with the following properties, this will become the 

  - Name: text
  - URL: url
  - Type: select
  - ID: text
  - Location: select
  - Subscription: select
  - Updated: date
  - Hash: text

## Usage

This is typically deployed as a scheduled action:

```yaml
name: AzureCatalog
on:
  schedule:
    - cron:  '30 5 * * *'
  workflow_dispatch:
jobs:
  catalog:
    runs-on: ubuntu-latest
    steps:
     - name: Notion azure catalog     
       uses: infinitaslearning/notion-azure-catalog@main        
       with:          
         notion_token: ${{ secrets.NOTION_TOKEN }}
         database: 2b26b4290cc84d95ad3e93c3255277a1    
         subscription_filter: .*
      env:
        AZURE_CLIENT_ID: '${{ secrets.AZURE_CLIENT_ID }}'
        AZURE_TENANT_ID: '${{ secrets.AZURE_TENANT_ID }}'
        AZURE_CLIENT_SECRET: '${{ secrets.AZURE_CLIENT_SECRET }}'
         

```

To get the database ID, simply browse to it, click on the '...' in Notion, and get a 'Copy link'.  The GUID at the end of the URL (but before the `?v=`) is the id, this works on both embedded and full page databases.


## Azure Credentials

This expects a set of Azure environment credentials, easiest to get via: https://docs.microsoft.com/en-us/cli/azure/ad/sp?view=azure-cli-latest

```
AZURE_CLIENT_ID=...
AZURE_TENANT_ID=...
AZURE_CLIENT_SECRET=...
```

## Development

Assumes you have `@vercel/ncc` installed globally.
After changes ensure you `npm run build`, commit and then submit a PR.

For the tests to run you need to have the environment variables set for GITHUB_TOKEN, NOTION_TOKEN and NOTION_DATABASE.
