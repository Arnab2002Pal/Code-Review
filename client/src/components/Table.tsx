import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Table = ({ repo }: { repo: any[] }) => {
    const [repository, setRepository] = useState(repo)
    
    useEffect(()=> {
        const fetchUpdatedStatus = async() => {
            const pendingRepos = repository?.filter(item => item.status === 'pending')
            
            if(pendingRepos.length == 0) return;
            // contine writing api logic

            const updatedRepoStatus = await Promise.all(
                pendingRepos.map(async item => {
                    try {
                        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}status/${item.id}`)
                        console.log("response",response);
                        return item
                    } catch (error: any) {
                        if(error.status === 404) {
                            console.log(error.response);
                            return item
                        }
                        
                    }                    
                })
            )
        }

        fetchUpdatedStatus()
    }, [repo])
    return (
        <div>
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Repository
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Summary
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            repository && repository.map((list, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {list.repository}
                                        </th>
                                        <td className="px-6 py-4 capitalize">
                                            {list.status}
                                        </td>
                                        <td className="px-2 py-4">
                                            <button>View Summary</button>
                                        </td>
                                </tr>
                            ))
                        }


                    </tbody>
                </table>
            </div>

        </div>
    )
}

export default Table
