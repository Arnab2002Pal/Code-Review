"use client"
import Navbar from '@/components/Navbar'
import Table from '@/components/Table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaCopy } from 'react-icons/fa'

const User = () => {
  const webhook = "https://code-review.arnab-personal.tech/webhook/v1/analyzePR";
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true) // Start as loading
  const [userId, setUserId] = useState<string | null>(null)
  const [repo, setRepo] = useState<any[]>([])
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${session.user.email}`)
        if (response?.data) {
          setUserId(response.data.userId)
          setRepo(response.data.repository || [])
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false) // Stop loading after API call
      }
    }

    if (status === 'loading') {
      setLoading(true);
    } else if (status === 'authenticated') {
      fetchUser();
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, session?.user?.email]);

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className='w-full h-full'>
      <Navbar username='Arnab' />
      <div className=' w-[95vw] flex justify-around items-start mx-auto gap-2 mt-12'>
        <div className='bg-white h-full w-2/3 rounded-xl border-2 border-slate-200 p-4 flex flex-col gap-2'>
          <Table repo={repo} />
        </div>
        <div className='bg-white h-full rounded-xl border-2 border-slate-200 px-4 py-2 flex flex-col gap-2'>
          <Label className='w-40 text-base font-semibold'>Webhook URL :</Label>
          <div className='h-2/3 flex items-center gap-2'>
            <Input value={webhook} readOnly className='w-full cursor-default caret-transparent' />
            <Button onClick={() => {
              navigator.clipboard.writeText(webhook);
              setCopied(true);
              setTimeout(() => setCopied(false), 4000);
            }} className={`flex items-center space-x-3 px-3 transition-colors ${copied ? "bg-green-500 text-white" : "bg-black text-white"}`}>
              <FaCopy size={16} />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default User
