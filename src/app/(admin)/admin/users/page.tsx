import { UsersAdminClient } from "@/components/admin/users/UsersAdminClient";
import { adminUsers } from "@/components/admin/users/admin-users-data";

export default function AdminUsersPage() {
  return <UsersAdminClient users={adminUsers} />;
}

