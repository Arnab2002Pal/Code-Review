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
  const [copied, setCopied] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [userId, setUserId] = useState<string>()
  const [repo, setRepo] = useState<any[]>([])
  const router = useRouter()
  const { data: session, status } = useSession()
  const email = session?.user?.email

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhook)
      setCopied(true)
      setTimeout(() => setCopied(false), 4000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }

  const getUser = async (email: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${email}`)
    try {
      if (!response) {
        return
      }
      console.log(response.data);

      setUserId(response.data.userId)
      setRepo(response.data.repository)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return;
    }
    if (status === 'unauthenticated') {
      router.push('/')
    }
    getUser(email!)
  }, [email])

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
          <Label className='w-40 text-base font-semibold'>
            Webhook URL :
          </Label>
          <div className='h-2/3 flex items-center gap-2'>
            <Input
              value={webhook}
              readOnly
              className='w-full cursor-default caret-transparent'
            />
            <Button
              onClick={handleCopy}
              className={`flex items-center space-x-3 px-3 transition-colors ${copied ? "bg-green-500 text-white" : "bg-black text-white"
                }`}
            >
              <FaCopy size={16} />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          < div className="flex flex-col justify-center items-start space-y-2 mt-3" >
            <h4 className='text-base font-semibold'>Setup Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Copy the URL.</li>
              <li>Go to your repository settings and navigate to <strong>Webhooks</strong>.</li>
              <li>Paste the URL in the <strong>Payload URL</strong> field.</li>
              <li>Set <strong>Content type</strong> as <code>application/json</code>.</li>
              <li>Click on <strong>"Let me select individual events"</strong>.</li>
              <li>Select the following permissions:
                <ul className="list-disc list-inside ml-4">
                  <li><strong>Pull request review comments</strong></li>
                  <li><strong>Pull request</strong></li>
                </ul>
              </li>
              <li>Check <strong>Active</strong> and click <strong>Add Webhook</strong>.</li>
            </ol>
          </div >
        </div>
      </div>
    </div>
  )
}

export default User
