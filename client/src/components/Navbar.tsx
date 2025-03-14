import React from 'react'

const Navbar = ({ username }: { username: string }) => {
    return (
        <div className='h-14 w-full px-12 bg-white text-black shadow-md flex items-center justify-between sticky'>
            <div className='font-extrabold text-2xl'>Auto Reviewer</div>
            <div>Hi, {username}</div>
        </div>
    )
}

export default Navbar
