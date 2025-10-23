import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminUsuarios() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/auth/staffs', { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
        if (!res.ok) throw new Error('Error fetching staffs');
        const data = await res.json();
        setStaffs(data.staffs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Usuarios (Admin)</h2>
      <div className="p-6 bg-white shadow rounded-lg">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && staffs.length === 0 && <div>No staff users found</div>}
        <ul className="divide-y divide-gray-200">
          {staffs.map(s => (
            <li key={s.id} className="py-3 flex justify-between items-center">
              <div>
                <div className="font-semibold">{s.nombre || s.name || s.email}</div>
                <div className="text-sm text-gray-600">ID: {s.id} • Email: {s.email}</div>
              </div>
              <div>
                <Button className="px-3 py-1">Editar</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
