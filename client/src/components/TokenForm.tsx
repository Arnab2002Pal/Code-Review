import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { Input } from './ui/input';
import { Button } from './ui/button';

const TokenForm = () => {

    const { data: session } = useSession()
    const [token, setToken] = useState("")
    const email = session?.user?.email
    const router = useRouter()

    const lists = [
        {
            title: 'Log in to your GitHub account',
            description: 'Ensure you are logged into your GitHub account before proceeding.'
        },
        {
            title: 'Go to Settings',
            description: 'In the upper-right corner of the GitHub page, click on your profile picture, and then select Settings from the dropdown.'
        },
        {
            title: 'Navigate to Developer Settings',
            description: 'In the left sidebar, click on Developer settings.'
        },
        {
            title: 'Create a Personal Access Token',
            description: 'Under Developer settings, click on Personal access tokens, then select Fine-grained tokens.'
        },
        {
            title: 'Add Permissions to the Token',
            description: 'Ensure to add Read email and Read & write pull requests permissions.'
        },
        {
            title: 'Paste the Token',
            description: 'After copying the token,  paste it here.'
        },
        {
            title: 'Configure the Webhook',
            description: 'Finally, copy the provided webhook URL after submitting and paste it into your repository’s webhook settings.'
        }
    ]

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const gitResponse = await axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            if (gitResponse.status === 200 && gitResponse.data.user_view_type === "public") {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}new-user`, {
                    email,
                    github: {
                        token,
                        username: gitResponse.data.login,
                        id: gitResponse.data.id
                    }
                });

                if (res.status === 200) {
                    router.push('/user');
                }
            }
        } catch (error) {
            console.error("Error submitting token:", error);
        }
    }
    
    return (
        <div className='h-screen flex flex-rol justify-center items-center mx-20'>
            <div className='w-full h-full p-6 flex justify-start items-center'>
                <div className=''>
                    <h4 className='text-2xl font-semibold'>How to Generate a GitHub Token and Use It</h4>
                    <ul className="flex flex-col space-y-4" >
                        {lists.map((item, index) => (
                            <li key={index} className="flex flex-col">
                                <h5 className="text-lg font-semibold text-gray-700">
                                    - {item.title}
                                </h5>
                                <p className="text-gray-600 text-base">{item.description}</p>
                            </li>
                        ))}
                    </ul>

                </div>
            </div>
            <div className='w-full'>
                <div className=' flex flex-col justify-center items-center gap-2'>
                    <form onSubmit={handleSubmit} className='w-full flex justify-center items-center'>
                        <div className='flex flex-col items-center gap-4 w-2/3'>
                            <Input
                                type='text'
                                placeholder='Enter your GitHub token'
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className='border-stone-400 border-2'
                            />
                            <Button className='w-1/3' type='submit'>Submit</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default TokenForm
