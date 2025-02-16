"use client"
import React from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signIn } from "next-auth/react";


const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(4),
    githubToken: z.string().min(1, { message: 'Required Github Token' })
})

type SchemaProps = z.infer<typeof formSchema>

const SignIn = () => {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SchemaProps>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            githubToken: "",
        }
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            githubToken: "",
        },
    })

    async function submitForm(data: SchemaProps) {
        // const res = await signIn("credentials", {
        //     email: data.email,
        //     password: data.password,
        //     github_token: data.githubToken,
        //     redirect: true,  // Prevent automatic redirection
        // });

        // console.log("Res:",res);
        
    }

    return (
        <div className='w-full h-screen flex justify-center items-center'>
            {/* <form
                onSubmit={handleSubmit(submitForm)}
                className='w-1/3 flex flex-col justify-center items-center gap-2 h-20'>
                <div className='w-full'>
                    <Input
                        type='email'
                        placeholder='Email'
                        {...register('email', { required: true })}
                    />
                    {errors?.email && <span className='text-red-400 text-sm'>{errors.email.message}</span>}
                </div>
                
                <div className='w-full'>
                    <Input
                        type='password'
                        placeholder='Password'
                        {...register('password', { required: true })}
                    />
                    {errors?.password && <span className='text-red-400 text-sm'>{errors.password.message}</span>}
                </div>
                
                <div className='w-full'>
                    <Input
                        type='text'
                        placeholder='Github Token'
                        {...register('githubToken', { required: true })}
                    />
                    {errors?.githubToken && <span className='text-red-400 text-sm'>{errors.githubToken.message}</span>}
                </div>
                
                <Button type='submit' className='w-2/3'>
                    Submit
                </Button>
            </form> */}
        </div>
    )
}

export default SignIn
