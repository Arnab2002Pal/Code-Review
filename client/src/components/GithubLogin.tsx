import { signIn } from 'next-auth/react'
import React from 'react'
import { FaGithub } from "react-icons/fa";

const GithubLogin = () => {
    const handleSignIn = async () => {
        await signIn("github", { callbackUrl: '/token'});
    };
    return (
        <div className="w-full  flex justify-center items-center gap-6 mx-20">
            {/* Information Section */}
            <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left gap-6 max-w-xl px-4 md:px-0">
                <h2 className="text-2xl md:text-3xl text-gray-900 font-bold">
                    Enhance Your Pull Request Reviews with AI
                </h2>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    GitHub PR Reviewer is an AI-powered tool that provides smart, contextual comments on relevant file changes. It highlights issues and suggests improvements, helping to enhance code quality and streamline the review process.
                </p>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mt-4">
                    Say goodbye to manual efforts and reduce review times, accelerating your development cycles with smarter, more efficient code reviews.
                </p>
            </div>

            <div className='h-40 w-full p-6 flex flex-col justify-center items-end gap-4'>
                <div className='flex flex-col justify-center items-center gap-2'>
                    <h1 className="text-7xl text-gray-900 font-bold">Auto Reviewer</h1>
                    <p className='text-xl'>Streamline Your Code Reviews with AI-Powered Insights</p>
                </div>
                <button
                    className="flex items-center gap-3 px-6 py-2 text-md font-medium text-white bg-black rounded-lg transition-all duration-300 hover:bg-gray-800 active:scale-95"
                    onClick={handleSignIn}
                    aria-label="Sign in with GitHub"
                >
                    <FaGithub className="text-2xl" />
                    <span>Continue with GitHub</span>
                </button>
            </div>
        </div>
    );
}

export default GithubLogin;
