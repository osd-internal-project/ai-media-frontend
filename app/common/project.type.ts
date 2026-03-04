export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "USER" | "VIEWER";
  joinedAt: string;
  users?: {
    userId: string;
    username: string;
    fullname: string;
    email: string;
  };

  //new value
  limitImageAllowance: number;
  limitCreditAllowance: number;
  // ยอดใช้ของ ProjectMember
  usedImageAllowance: number;
  usedCreditAllowance: number;
  // ยอดจัดเก็บของ ProjectMember
  holdImageAllowance: number;
  holdCreditAllowance: number;
};

export type ProjectMemberInput = {
  userId: string;
  role: "OWNER" | "ADMIN" | "USER" | "VIEWER";
};

export type IProject = {
  createdAt: string;
  description: string;
  id: string;
  status: string;
  members: ProjectMember[];
  name: string;

  //new value
  limitImageAllowance: number;
  limitCreditAllowance: number;
  // ยอดใช้ของ ProjectMember
  usedImageAllowance: number;
  usedCreditAllowance: number;
  // ยอดจัดเก็บของ ProjectMember
  holdImageAllowance: number;
  holdCreditAllowance: number;

  //old value
  accessImageAmount: number;
  remainImageAmount: number;
  accessTokenAmount: number;
  remainTokenAmount: number;
};
