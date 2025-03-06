"use client"
import { signIn, useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import GithubLogin from './GithubLogin'

const Hero = () => {
    const { data: session } = useSession()
  
    const router = useRouter()

    
    return (
        <>
            <GithubLogin />
        </>
    )
}

export default Hero
