export type PlanCode = "free" | "active";

export type PlanAccessStatus = "active" | "inactive";

export type PlanCapability =
  | "dashboard:read"
  | "scenario:write"
  | "journal:write"
  | "performance:write";

export type PlanCapabilityMap = Record<PlanCapability, boolean>;

export type UserPlanAccess = {
  planCode: PlanCode;
  status: PlanAccessStatus;
  capabilities: PlanCapabilityMap;
};
