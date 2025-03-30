import axios from 'axios';
import React, { useEffect, useState } from 'react';

const POLLING_INTERVAL = 4000; // Poll every 4 seconds

const Table = ({ repo }: { repo: any[] }) => {
    const [repository, setRepository] = useState(repo);

    useEffect(() => {
        if (repository.length === 0) return; // No repos, stop polling

        const fetchUpdatedStatus = async () => {
            const pendingRepos = repository.filter(item => item.status === 'pending' || item.status === 'active');
            if (pendingRepos.length === 0) return; // All complete, stop polling

            const updatedRepos = await Promise.all(
                pendingRepos.map(async item => {
                    try {
                        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/status/${item.id}`);
                        return { ...item, status: data?.status || item.status };
                    } catch {
                        return item;
                    }
                })
            );

            setRepository(prev => prev.map(repo => updatedRepos.find(updated => updated.id === repo.id) || repo));
        };

        const interval = setInterval(fetchUpdatedStatus, POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, [repository]);

    return (
        <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">Repository</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Summary</th>
                    </tr>
                </thead>
                <tbody>
                    {repository.length > 0 ? (
                        repository.map((list, index) => (
                            <tr key={index} className="bg-white border-b">
                                <td className="px-6 py-4">{list.repository}</td>
                                <td className="px-6 py-4 capitalize">{list.status}</td>
                                <td className="px-2 py-4">
                                    <button>View Summary</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
