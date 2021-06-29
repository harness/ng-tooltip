## Tooltip management for NextGen

Contains the dataset & the editor code.

## Get started

[Dev spec](https://harness.atlassian.net/wiki/spaces/CDNG/pages/1578598984/NG+Tooltips+design+spec)

[Self help for devs](https://harness.atlassian.net/wiki/spaces/CDNG/pages/1626800543/NG+Tooltips+-+self+help+for+devs)

[Self help guide for docs](https://harness.atlassian.net/wiki/spaces/CDNG/pages/1626144816/NG+Tooltip+Framework+-+self+help+guide+for+docs)

## Build

`yarn build`

## Publish

As soon as the PR is merged into master, we trigger a Harness CIE pipeline to generate and publish the package to [Harness GitHub Package Registry](https://github.com/orgs/wings-software/packages).

## Publish Version
Publish any major changes manually by upgrading the version number in package.json, For other changes like the changes in Yaml file, a new verision is published automatically when the PR is merged.


this is a test change
