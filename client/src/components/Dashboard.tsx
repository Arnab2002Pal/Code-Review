"use client"
import { signIn, useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios'


const Dashboard = () => {
    const { data: session } = useSession()
    const [token, settoken] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission

        const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}new-user`, {
            email: session?.user?.email,
            githubToken: token,
        })
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
                                placeholder='Enter your github token'
                                value={token}
                                onChange={(e) => settoken(e.target.value)}
                            />
                            <Button className='w-2/3' type='submit'>Submit</Button>
                        </div>
                    </form>
                </div>
            ) : (
                <div>
                    <h1 className='text-2xl font-bold'>SignIn using Github</h1>
                    <button onClick={() => signIn("github")}>Github</button>
                </div>
            )}
        </>
    )
}

export default Dashboard
