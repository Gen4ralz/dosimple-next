import React, { useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import Layout from '../components/Layout'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { getError } from '../utils/error'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'

export default function LoginScreen() {
    const router = useRouter();
    const { redirect } = router.query;
    const { data: session } = useSession();
    useEffect(() => {
        if(session?.user) {
            router.push(redirect || '/');
        }
    },[redirect, router, session])
    const { handleSubmit, register, formState:{errors}} = useForm();
    const submitHandler = async ({email, password}) => {
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            })
            if (result.error) {
                toast.error(result.error);
            }
        } catch(err) {
            toast.error(getError(err));
        }
    }
  return (
    <Layout title="Login">
        <form className='mx-auto max-w-screen-md' onSubmit={handleSubmit(submitHandler)}>
            <h1 className='text-xl mb-4 font-bold'>Login</h1>
            <div className='mb-4'>
                <label htmlFor='email'>Email</label>
                <input type='email'
                    {...register('email', {required: 'Please enter email', pattern:{value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,message: "invalid email address"}})}
                    className='w-full' id='email' autoFocus></input>
                    {errors.email && <div className='text-red-500'>{errors.email.message}</div>}
            </div>
            <div className='mb-4'>
                <label htmlFor='password'>Password</label>
                <input type='password' 
                    {...register('password', {required: 'Please enter password', minLength:{value: 6, message: 'password is more than 5 chars'}})}
                    className='w-full' id='password' autoFocus></input>
                    {errors.password && <div className='text-red-500'>{errors.password.message}</div>}
            </div>
            <div className='mb-4'>
                <button className='bg-indigo-700 text-white rounded w-full p-2'>Login</button>
            </div>
            <div className='mb-4'>
                Don&apos;t have an account? &nbsp;
                <Link href={`/register?redirect=${redirect || '/'}`}><button className='bg-green-200 rounded px-2'>Register</button></Link>
            </div>
        </form>
        <div className='mt-8'>
                <button className='bg-green-500 rounded px-2 text-white w-full py-4' onClick={() => signIn('line')}>LINE Login</button>
            </div>
    </Layout>
  )
}
