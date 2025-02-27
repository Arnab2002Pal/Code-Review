"use client"
import { signIn, useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const TokenInput = () => {
    const { data: session } = useSession()
    const [token, setToken] = useState("")
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const email = session?.user?.email

    async function checkUserToken() {
        if (!email) return;

        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}checkToken?email=${encodeURIComponent(email)}`);            

            if (response.status === 200 && response.data.success) {
                router.push('/user');
            } else if (response.status === 404){
                router.push('/')
            }
        } catch (error: any) {
                if (error.response?.status === 404) {
                    console.warn("No token found for this email. User might be new.");
                    return; // Don't log this as an error, just exit.
                }
                console.error("Error checking token:", error.message);
            
        } finally {
            setLoading(false);
        }
    }


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

    useEffect(() => {
        checkUserToken();
    }, [email]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {session ? (
                <div className='w-1/3 flex flex-col justify-center items-center gap-2'>
                    <h2 className='text-xl font-semibold'>Welcome to your Dashboard</h2>
                    <form onSubmit={handleSubmit} className='w-full'>
                        <div className='flex flex-col items-center gap-4'>
                            <Input
                                type='text'
                                placeholder='Enter your GitHub token'
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                            />
                            <Button className='w-2/3' type='submit'>Submit</Button>
                        </div>
                    </form>
                </div>
            ) : (
                <div>
                    <h1 className='text-2xl font-bold'>Sign in using GitHub</h1>
                    <button onClick={() => signIn("github")}>GitHub</button>
                </div>
            )}
        </>
    )
}

export default TokenInput
