export enum Permissions {
  READ = "read",
  WRITE = "write",
}

export enum SpecialRoles {
  SUPER_ADMIN = "Super Admin",
}

export enum GeneralRoles {
  CARE_TAKER = "Care Taker",
  THERAPIST = "Therapist",
  HEALTH_PROVIDER = "Health Provider",
  INSURANCE_PROVIDER = "Insurance Provider",
}

export type AllRoles = SpecialRoles | GeneralRoles;

export const AllRoles = {
  ...SpecialRoles,
  ...GeneralRoles,
};

export enum RoleIds {
  CARE_TAKER = "rol_FeiBwezt1aOv0kAD",
  THERAPIST = "rol_Qm91xgC8JwSQBK0P",
  HEALTH_PROVIDER = "rol_FtWkecHJdGOkYrNX",
  INSURANCE_PROVIDER = "rol_sSrpRj39oOd4Le3d",
}

export interface ICreateUser {
  given_name: string;
  family_name: string;
  email: string;
  user_role: AllRoles;
}

export interface ISendPortalInviteRequest {
  email: string;
  client_id: string;
}
