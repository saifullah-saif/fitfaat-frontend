"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Admin() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', {
        admin_id: adminId,
        password: password
      });

      if (res.data.message === 'Login successful') {
        setMessage('Welcome, Admin!');
        router.push('/admin-dashboard');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 text-white rounded-md shadow-md">
      <h2 className="text-3xl font-bold mb-4">Admin Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
        <input
          type="text"
          placeholder="Admin ID"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          className="p-2 border rounded-md bg-gray-800 text-white focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded-md bg-gray-800 text-white focus:outline-none"
        />
        <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">Login</Button>
      </form>
      <p className="mt-4 text-red-400">{message}</p>
    </div>
  );
}
