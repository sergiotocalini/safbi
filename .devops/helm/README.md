# safbi

[safbi](https://github.com/sergiotocalini/safbi) identity provider using several backend sources.

This chart bootstraps an safbi deployment on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Get Repo Info

```console
helm repo add sergiotocalini https://sergiotocalini.github.io/helm-charts
helm repo update
```

## Install Chart

```console
helm install [RELEASE_NAME] sergiotocalini/safbi
```

The command deploys ingress-nginx on the Kubernetes cluster in the default configuration.

_See [configuration](#configuration) below._

_See [helm install](https://helm.sh/docs/helm/helm_install/) for command documentation._

## Uninstall Chart

```console
helm uninstall [RELEASE_NAME]
```

This removes all the Kubernetes components associated with the chart and deletes the release.

_See [helm uninstall](https://helm.sh/docs/helm/helm_uninstall/) for command documentation._

## Upgrading Chart

```console
helm upgrade [RELEASE_NAME] [CHART] --install
```

_See [helm upgrade](https://helm.sh/docs/helm/helm_upgrade/) for command documentation._

## Configuration

See [Customizing the Chart Before Installing](https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing). To see all configurable options with detailed comments, visit the chart's [values.yaml](./values.yaml), or run these configuration commands:

```console
helm show values sergiotocalini/safbi
```
