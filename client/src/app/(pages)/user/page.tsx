"use client"
import {Loading} from '@/components/Loading'
import Navbar from '@/components/Navbar'
import Table from '@/components/Table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Repo } from '@/interfaces/interface'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaCopy } from 'react-icons/fa'

const User = () => {
  const webhook = process.env.NEXT_PUBLIC_WEBHOOK_URL as string;
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [repo, setRepo] = useState<Repo[]>([])
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${session.user.email}`)
        if (response?.data) {
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
  }, [status, session?.user?.email, router]);

  if (loading) {
    return <Loading/>
  }

  return (
    <div className='w-full h-full'>
      <Navbar username='Arnab' />
      <div className=' w-[95vw] flex justify-around items-start mx-auto gap-2 mt-12'>
        <div className='bg-white h-full w-2/3 rounded-xl border-2 border-slate-200 p-4 flex flex-col gap-2'>
          <Table repo={repo} />
        </div>
        <div className='bg-white w-2/6 h-full rounded-xl border-2 border-slate-200 px-4 py-2 flex flex-col gap-2'>
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
          <div className="p-1 bg-gray-50 rounded-md shadow-sm">
            <h6 className="font-semibold text-lg text-gray-800">Steps to Follow:</h6>
            <ul className="list-decimal pl-6 space-y-1 text-gray-700">
              <li>Copy the URL.</li>
              <li>Go to the repository settings where you want to generate AI-based summaries.</li>
              <li>
                Navigate to <strong>Webhooks</strong> under <strong>Code and Automation</strong>.
              </li>
              <li>Click on <strong>Add Webhook</strong>.</li>
              <li>
                Paste the copied URL and set the <strong>Content Type</strong> to{" "}
                <code className="bg-gray-200 px-1 py-0.5 rounded-md">application/json</code>.
              </li>
              <li>Enable SSL verification.</li>
              <li>
                Under <strong>Events</strong>, select <strong>Let me select individual events</strong>.
              </li>
              <li>
                Choose <strong>Pull Request Review Comments</strong> and <strong>Pull Requests</strong>.
              </li>
              <li>Check <strong>Active</strong> and click <strong>Add Webhook</strong>.</li>
            </ul>
            <p className="mt-3 text-gray-800">
              Now, whenever a <strong>Pull Request (PR)</strong> is created, it will be added to the table.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default User
