import { formatDate, initials } from './formatters.js';
import type { User } from './types.js';

export function UserTable({
  users,
  onSelect,
}: {
  users: User[];
  onSelect: (userId: number) => void;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Status</th>
            <th>Roles</th>
            <th>Created</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>
                <div className="user-cell">
                  <span className="avatar">{initials(user.name)}</span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>
                      {user.email} - #{user.id}
                    </small>
                  </span>
                </div>
              </td>
              <td>
                <span className={`status ${user.status}`}>{user.status}</span>
              </td>
              <td>
                <div className="roles">
                  {user.roles.map(role => (
                    <span key={role}>{role}</span>
                  ))}
                </div>
              </td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                <button className="row-action" onClick={() => onSelect(user.id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
