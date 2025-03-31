import axios from "axios";
import React, { useEffect, useState } from "react";
import { ModalLoading } from "./Loading";
import { Repo, Summary } from "@/interfaces/interface";

const POLLING_INTERVAL = 4000;

const Table = ({ repo }: { repo: Repo[] }) => {
    const [repository, setRepository] = useState(repo);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleViewSummary = async (id: string) => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}results/${id}`);
            if (data.success && data.summary) {
                setSummary(data.summary);
                setOpen(true);
            }
        } catch (error) {
            console.error("Error fetching summary:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (repository.length === 0) return;

        const fetchUpdatedStatus = async () => {
            const pendingRepos = repository.filter(item => item.status === "pending" || item.status === "active");
            if (pendingRepos.length === 0) return;

            const updatedRepos = await Promise.all(
                pendingRepos.map(async (item) => {
                    try {
                        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/status/${item.id}`);
                        return { ...item, status: data?.status || item.status };
                    } catch {
                        return item;
                    }
                })
            );

            setRepository(prev =>
                prev.map(repo => updatedRepos.find(updated => updated.id === repo.id) || repo)
            );
        };

        const interval = setInterval(fetchUpdatedStatus, POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, [repository]);

    return (
        <div className="relative overflow-x-auto">
            {loading && (
                <ModalLoading/>
            )}

            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">S.NO</th>
                        <th className="px-6 py-3">Repository</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Summary</th>
                    </tr>
                </thead>
                <tbody>
                    {repository.length > 0 ? (
                        repository.map((list, index) => (
                            <tr key={index} className="bg-white border-b">
                                <td className="px-6 py-4">{index + 1}</td>
                                <td className="px-6 py-4">{list.repository}</td>
                                <td className="px-6 py-4 capitalize font-semibold text-black">
                                    {list.status === "completed" ? (
                                        <span className="text-green-700">Completed</span>
                                    ) : (
                                        <span className="text-yellow-700">{list.status}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {list.status === "completed" ? (
                                        <button
                                            onClick={() => handleViewSummary(list.id)}
                                            className="text-blue-600 hover:underline font-medium"
                                        >
                                            View Summary
                                        </button>
                                    ) : (
                                        <button disabled className="text-gray-400 cursor-not-allowed">
                                            No Summary
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Summary Modal */}
            {open && summary && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setOpen(false)} // Close modal when clicking outside
                >
                    <div
                        className="bg-white w-1/2 h-3/4 rounded-lg shadow-lg overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()} // Prevent click inside from closing modal
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 bg-gray-100 border-b">
                            <h2 className="text-xl font-bold">Summary Details</h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-red-500 hover:text-red-700 font-semibold"
                            >
                                ✖
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="px-6 py-4 overflow-y-auto flex-1">
                            <div className="mb-4">
                                <p className="font-semibold">Comment:</p>
                                <p>{summary.summary.comment}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="font-semibold">Critical Issues:</p>
                                    <p>{summary.summary.critical_issues}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Total Files:</p>
                                    <p>{summary.summary.total_files}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Total Issues:</p>
                                    <p>{summary.summary.total_issues}</p>
                                </div>
                            </div>

                            {/* Files List */}
                            <h3 className="text-lg font-semibold mt-4">Files</h3>
                            {summary.files.length > 0 ? (
                                <ul className="border-t mt-2 pt-2 space-y-4">
                                    {summary.files.map((file, index) => (
                                        <li key={index} className="p-4 bg-gray-50 rounded-md">
                                            <p className="font-semibold text-blue-600">File: {file.name}</p>
                                            <ul className="ml-4 text-sm space-y-2">
                                                {file.issues.length > 0 ? (
                                                    file.issues.map((issue, i) => (
                                                        <li key={i} className="border p-3 rounded-md bg-white shadow-sm">
                                                            <p>
                                                                <span className="font-semibold">Issue Type:</span> {issue.type}
                                                            </p>
                                                            <p>
                                                                <span className="font-semibold">Line:</span> {issue.line}
                                                            </p>
                                                            <p>
                                                                <span className="font-semibold">Description:</span> {issue.description}
                                                            </p>
                                                            <p>
                                                                <span className="font-semibold">Suggestion:</span> {issue.suggestion}
                                                            </p>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="border p-3 rounded-md bg-gray-100 text-gray-700 font-semibold">
                                                        No issues found.
                                                    </li>
                                                )}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No files found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Table;
