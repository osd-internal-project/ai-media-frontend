# AICave Console Helm Chart

This Helm chart deploys the AICave Console frontend application to Kubernetes with support for multiple environments (SIT, UAT, PROD).

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- kubectl configured to access your cluster

## Chart Structure

```
aicave-console-chart/
├── Chart.yaml                 # Chart metadata
├── values.yaml                # Default values (PROD configuration)
├── values-sit.yaml            # SIT environment overrides
├── values-uat.yaml            # UAT environment overrides
├── values-prod.yaml           # PROD environment overrides
└── templates/
    ├── _helpers.tpl           # Template helpers
    ├── deployment.yaml        # Deployment template
    ├── service.yaml           # Service template
    └── ingress.yaml           # Ingress template
```

## Installation

### 1. Install to SIT Environment

```bash
helm install aicave-console ./aicave-console-chart -f ./aicave-console-chart/values-sit.yaml
```

### 2. Install to UAT Environment

```bash
helm install aicave-console ./aicave-console-chart -f ./aicave-console-chart/values-uat.yaml
```

### 3. Install to PROD Environment

```bash
helm install aicave-console ./aicave-console-chart -f ./aicave-console-chart/values-prod.yaml
```

## Upgrade

To upgrade an existing release:

```bash
# SIT
helm upgrade aicave-console ./aicave-console-chart -f ./aicave-console-chart/values-sit.yaml

# UAT
helm upgrade aicave-console ./aicave-console-chart -f ./aicave-console-chart/values-uat.yaml

# PROD
helm upgrade aicave-console ./aicave-console-chart -f ./aicave-console-chart/values-prod.yaml
```

## Uninstall

```bash
helm uninstall aicave-console
```

## Configuration

### Key Configuration Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `namespace` | Kubernetes namespace | `aicave-prod` |
| `replicaCount` | Number of replicas | `5` |
| `image.repository` | Image repository | `docker.io/library/ai-media-fe` |
| `image.tag` | Image tag | `v1.0.25` |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.hosts[0].host` | Ingress hostname | `www.aicave.ai` |

### Environment-Specific Configurations

**SIT Environment:**
- Namespace: `aicave-sit`
- Replicas: `2`
- Host: `sit.aicave.ai`
- Resources: Lower limits (128Mi memory, 250m CPU)

**UAT Environment:**
- Namespace: `aicave-uat`
- Replicas: `3`
- Host: `uat.aicave.ai`
- Resources: Medium limits (192Mi memory, 350m CPU)

**PROD Environment:**
- Namespace: `aicave-prod`
- Replicas: `5`
- Host: `www.aicave.ai`
- Resources: Higher limits (256Mi memory, 500m CPU)

## Customization

You can override any value by:

1. Editing the environment-specific values file
2. Using `--set` flag during install/upgrade:

```bash
helm install aicave-console ./aicave-console-chart \
  -f ./aicave-console-chart/values-sit.yaml \
  --set replicaCount=3 \
  --set image.tag=v1.0.26
```

3. Creating a custom values file:

```bash
helm install aicave-console ./aicave-console-chart \
  -f ./aicave-console-chart/values-sit.yaml \
  -f custom-values.yaml
```

## Verification

After deployment, verify the installation:

```bash
# Check deployment status
kubectl get deployments -n <namespace>

# Check pods
kubectl get pods -n <namespace>

# Check service
kubectl get svc -n <namespace>

# Check ingress
kubectl get ingress -n <namespace>

# View logs
kubectl logs -n <namespace> -l app=aicave-console
```

## Rollback

If something goes wrong, rollback to a previous release:

```bash
# List releases
helm history aicave-console

# Rollback to specific revision
helm rollback aicave-console <revision-number>
```

## Notes

- Ensure TLS secrets (`aicave-console-tls`, `aicave-console-tls-sit`, `aicave-console-tls-uat`) exist in the respective namespaces before deploying
- Update `KEYCLOAK_CLIENT_SECRET` and `NEXTAUTH_SECRET` with actual values in the values files
- The chart uses NGINX Ingress Controller - ensure it's installed in your cluster
- Make sure the namespaces exist before deployment or add `--create-namespace` flag

## Support

For issues or questions, contact the DevOps team.
