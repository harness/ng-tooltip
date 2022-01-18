This repo contains code used in the [Harness CD Community Edition](https://github.com/harness/harness-cd-community) which is licensed under the [PolyForm Shield License 1.0.0](./licenses/PolyForm-Shield-1.0.0.txt). This repo also contains code belonging to Harness CD Enterprise Plan which is licensed under the [PolyForm Free Trial License 1.0.0](./licenses/PolyForm-Free-Trial-1.0.0.txt). You may obtain a copy of these licenses in the [licenses](./licenses/) directory at the root of this repository.

## Tooltip management for NextGen

Contains the dataset & the editor code.

## Get started

[Dev spec](https://harness.atlassian.net/wiki/spaces/CDNG/pages/1578598984/NG+Tooltips+design+spec)

[Self help for devs](https://harness.atlassian.net/wiki/spaces/CDNG/pages/1626800543/NG+Tooltips+-+self+help+for+devs)

[Self help guide for docs](https://harness.atlassian.net/wiki/spaces/CDNG/pages/1626144816/NG+Tooltip+Framework+-+self+help+guide+for+docs)

## Build

`yarn build`

## Publish

As soon as the PR is merged into master, we trigger a Harness CIE pipeline to generate and publish the package to [Harness GitHub Package Registry](https://github.com/orgs/harness/packages).

## Publish Version
To Publish any major changes manually by upgrading the version number in package.json, For other changes like the changes in Yaml file, a new verision is published automatically when the PR is merged.
