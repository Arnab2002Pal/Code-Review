"use client"
import TokenForm from '@/components/TokenForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Token = () => {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(true)
    const email = session?.user?.email
    const router = useRouter()

    async function checkUserToken() {
        if (!email) return;
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}checkToken?email=${encodeURIComponent(email)}`);


            if (response.status === 200 && response.data.success) {
                router.push('/user');
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.warn("No token found for this email. User might be new.");
                return;
            }
            console.error("Error checking token:", error.message);

        } finally {
            setLoading(false);
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
            {
                session && (
                    <TokenForm />
                )
            }
        </>
    )
}

export default Token
