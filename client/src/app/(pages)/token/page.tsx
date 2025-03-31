"use client"
import TokenForm from '@/components/TokenForm'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useEffect, useState } from 'react'
import {Loading} from '@/components/Loading'

const Token = () => {
    const { data: session, status } = useSession()
    const router = useRouter()
    const email = session?.user?.email

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "loading") return; // Don't do anything while session is loading

        if (status === "unauthenticated") {
            router.push('/');
            return;
        }

        if (!email) return;

        const checkUserToken = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}checkToken?email=${encodeURIComponent(email)}`);

                if (response.status === 200 && response.data.success) {
                    router.push('/user');
                    return;
                }
            } catch (error: any) {
                if (error.response?.status === 404) {
                    console.warn("No token found for this email. User might be new.");
                } else {
                    console.error("Error checking token:", error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        checkUserToken();
    }, [status, email]);

    if (loading) {
        return (
           <Loading/>
        );
    }

    return (
        <>
            {session && <TokenForm />}
        </>
    );
}

export default Token;
