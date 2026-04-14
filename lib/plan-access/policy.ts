import { type PlanCapability, type PlanCapabilityMap, type PlanCode } from "@/types/plan-access";

const baseCapabilities: PlanCapabilityMap = {
  "dashboard:read": true,
  "scenario:write": false,
  "journal:write": false,
  "performance:write": false,
};

const activeCapabilities: PlanCapabilityMap = {
  "dashboard:read": true,
  "scenario:write": true,
  "journal:write": true,
  "performance:write": true,
};

const PLAN_CAPABILITY_POLICY: Record<PlanCode, PlanCapabilityMap> = {
  free: baseCapabilities,
  active: activeCapabilities,
};

export function getPlanCapabilities(planCode: PlanCode): PlanCapabilityMap {
  return PLAN_CAPABILITY_POLICY[planCode];
}

export function hasPlanCapability(planCode: PlanCode, capability: PlanCapability) {
  return getPlanCapabilities(planCode)[capability];
}
