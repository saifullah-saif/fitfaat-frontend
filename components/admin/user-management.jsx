import React, { useEffect, useState } from 'react';
import axios from 'axios';

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);

  // Fetch users on mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  const handleRoleChange = (e) => {
    setEditing({ ...editing, role: e.target.value });
  };

  const saveRole = (id) => {
    axios.put(`http://localhost:5000/api/admin/users/${id}`, { role: editing.role })
      .then(() => {
        setUsers(users.map(u => u.user_id === id ? { ...u, role: editing.role } : u));
        setEditing(null);
      })
      .catch(err => console.error('Error updating role:', err));
  };

  const deleteUser = (id) => {
    axios.delete(`http://localhost:5000/api/admin/users/${id}`)
      .then(() => {
        setUsers(users.filter(u => u.user_id !== id));
      })
      .catch(err => console.error('Error deleting user:', err));
  };

  return (
    <div className="admin-user-management" style={{ padding: '20px' }}>
      <h2>User Management</h2>

      <div style={{
        maxHeight: '450px', // ensures the table doesn't overflow
        overflowY: 'auto',
        border: '1px solid #ccc',
        borderRadius: '2px',
        marginBottom: '100px'
      }}>
        <table style={{
          width: '100%',
          fontSize: '14px',
          borderCollapse: 'collapse'
        }} border="1" cellPadding="8">
          <thead style={{ backgroundColor: '#f8f8f8' }}>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Quiz Status</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.gender}</td>
                <td>{user.quiz_status}</td>
                <td>
                  {editing?.user_id === user.user_id ? (
                    <select value={editing.role} onChange={handleRoleChange}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editing?.user_id === user.user_id ? (
                    <button onClick={() => saveRole(user.user_id)}>Save</button>
                  ) : (
                    <button onClick={() => setEditing(user)}>Edit</button>
                  )}
                  <button
                    onClick={() => deleteUser(user.user_id)}
                    style={{ marginLeft: '8px', color: 'red' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
