import { logger } from './index.js';
import { handlePubSubMessage } from './dispatcher.js';

/**
 * Action registry — maps action names to GCP API calls.
 * In production these use the Google Cloud Node.js client libraries.
 */
const ACTIONS = {
  async block_ip({ resource, params }) {
    logger.info(`[Cloud Armor] Blocking IP ${params.ip} on ${resource}`);
    // Production: compute.v1.SecurityPolicies.addRule(...)
    await simulateDelay(120);
    return `IP ${params.ip} blocked via Cloud Armor`;
  },

  async rotate_ssh_keys({ resource }) {
    logger.info(`[Compute] Rotating SSH keys on ${resource}`);
    // Production: compute.v1.Instances.setMetadata(...)
    await simulateDelay(200);
    return `SSH keys rotated on ${resource}`;
  },

  async revoke_iam_role({ resource, params }) {
    logger.info(`[IAM] Revoking ${params.role} from ${resource}`);
    // Production: cloudresourcemanager.v3.Projects.setIamPolicy(...)
    await simulateDelay(150);
    return `${params.role} revoked from ${resource}`;
  },

  async disable_external_access({ resource }) {
    logger.info(`[GCS] Removing public access from ${resource}`);
    // Production: storage.v1.Buckets.patch({ iamConfiguration: { publicAccessPrevention: 'enforced' } })
    await simulateDelay(100);
    return `Public access disabled on ${resource}`;
  },

  async pause_bq_jobs({ resource }) {
    logger.info(`[BigQuery] Cancelling jobs on ${resource}`);
    await simulateDelay(80);
    return `Active jobs cancelled on ${resource}`;
  },

  async rate_limit({ resource, params }) {
    logger.info(`[API Gateway] Rate limiting ${resource} to ${params.rpm} RPM`);
    await simulateDelay(90);
    return `Rate limit ${params.rpm} RPM applied on ${resource}`;
  },

  async rotate_api_key({ resource }) {
    logger.info(`[IAM] Rotating API key: ${resource}`);
    await simulateDelay(160);
    return `API key rotated: ${resource}`;
  },

  async alert_security_team({ params }) {
    logger.info(`[Notification] Alerting security team via ${params.channel || 'Cloud Monitoring'}`);
    await simulateDelay(50);
    return 'Security team notified';
  },
};

/**
 * Execute each remediation action in the threat spec.
 */
export async function executeRemediation(threat, saveLog) {
  for (const action of threat.remediation_actions || []) {
    const fn = ACTIONS[action.action];
    if (!fn) {
      logger.warn(`[Remediation] Unknown action: ${action.action}`);
      continue;
    }
    const result = await fn(action);
    logger.info(`[Remediation] ✓ ${result}`);
    await saveLog?.({
      type: 'success',
      text: `[REMEDY] ${result}`,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Trigger a simulated attack event into the dispatcher pipeline.
 */
export async function triggerSimulation(type = 'brute_force_ssh') {
  const MOCK_EVENTS = {
    brute_force_ssh: {
      resource: { type: 'gce_instance', labels: { instance_id: 'vm-prod-east-1' } },
      protoPayload: {
        methodName: 'v1.compute.instances.insert',
        authenticationInfo: { principalEmail: 'unknown@203.0.113.45' },
      },
      logName: 'cloudaudit.googleapis.com/activity',
      severity: 'ERROR',
      textPayload: '847 failed SSH authentication attempts from 203.0.113.45 in 60 seconds',
    },
    iam_escalation: {
      resource: { type: 'project', labels: {} },
      protoPayload: {
        methodName: 'google.iam.v1.IAMPolicy.SetIamPolicy',
        authenticationInfo: { principalEmail: 'service-account-prod@myproject.iam.gserviceaccount.com' },
        requestMetadata: { callerIp: '10.0.0.5' },
      },
      severity: 'WARNING',
      textPayload: 'roles/owner granted to service-account-prod@myproject outside change window',
    },
    data_exfiltration: {
      resource: { type: 'gcs_bucket', labels: { bucket_name: 'prod-data-bucket' } },
      protoPayload: {
        methodName: 'storage.objects.list',
        authenticationInfo: { principalEmail: 'anomalous-user@attackdomain.com' },
      },
      severity: 'CRITICAL',
      textPayload: '47GB transferred to external IP 198.51.100.33 in 8 minutes',
    },
  };

  const event = MOCK_EVENTS[type] || MOCK_EVENTS.brute_force_ssh;
  await handlePubSubMessage(event);
  return { type, event };
}

const simulateDelay = (ms) => new Promise((r) => setTimeout(r, ms));
