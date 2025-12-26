export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  joinedAt: string;
  users?: {
    userId: string;
    username: string;
    fullname: string;
    email: string;
  };
};

export type ProjectMemberInput = {
  userId: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
};

export type IProject = {
  createdAt: string;
  description: string;
  id: string;
  status: string;
  members: ProjectMember[];
  name: string;
};
