import axios from 'axios'
import React, { useEffect, useState } from 'react'

const POLLING_INTERVAL = 5000; // Poll every 5 seconds

const Table = ({ repo }: { repo: any[] }) => {
    const [repository, setRepository] = useState(repo)

    useEffect(() => {
        setRepository(repo);
    }, [repo]);

    useEffect(() => {
        const fetchUpdatedStatus = async () => {
            const pendingRepos = repository?.filter(item => item.status === 'pending')

            if (!pendingRepos.length) return;

            const updatedRepoStatus = await Promise.all(
                pendingRepos.map(async item => {
                    try {
                        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/status/${item.id}`)
                        return { ...item, status: response?.data?.status || item.status }
                    } catch (error: any) {
                        console.error("Error fetching repo status:", error);
                        return item;
                    }
                })
            )

            setRepository(prev => prev.map(repo =>
                updatedRepoStatus.find(updated => updated.id === repo.id) || repo
            ));
        }

        const interval = setInterval(fetchUpdatedStatus, POLLING_INTERVAL);
        return () => clearInterval(interval); // Cleanup on unmount
    }, [repository]);

    return (
        <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Repository</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Summary</th>
                    </tr>
                </thead>
                <tbody>
                    {repository.length > 0 ? (
                        repository.map((list, index) => (
                            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {list.repository}
                                </th>
                                <td className="px-6 py-4 capitalize">{list.status}</td>
                                <td className="px-2 py-4">
                                    <button>View Summary</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Table
