import React, { useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

const TokenForm = () => {
    const { data: session } = useSession();
    const [token, setToken] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const email = session?.user?.email;
    const router = useRouter();

    const steps = [
        { title: 'Log in to your GitHub account', description: 'Ensure you are logged into your GitHub account before proceeding.' },
        { title: 'Go to Settings', description: 'Click on your profile picture in the upper-right corner and select Settings.' },
        { title: 'Navigate to Developer Settings', description: 'In the left sidebar, click on Developer settings.' },
        { title: 'Create a Personal Access Token', description: 'Go to Personal access tokens under Developer settings and select Fine-grained tokens.' },
        { title: 'Add Permissions to the Token', description: 'Ensure to add Read email and Read & write pull requests permissions.' },
        { title: 'Paste the Token', description: 'Copy the token and paste it here.' },
        { title: 'Configure the Webhook', description: 'Copy the provided webhook URL after submitting and paste it into your repository’s webhook settings.' },
    ];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!token.trim()) {
            setError("Token cannot be empty.");
            return;
        }

        setError(null);

        try {
            const gitResponse = await axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });

            if (gitResponse.status === 200 && gitResponse.data.user_view_type === 'public') {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}new-user`, {
                    email,
                    github: {
                        token,
                        username: gitResponse.data.login,
                        id: gitResponse.data.id,
                    },
                });

                if (res.status === 200) {
                    router.push('/user');
                }
            }
        } catch (error) {
            console.error('Error submitting token:', error);
            setError("Invalid token. Please enter a valid GitHub token.");
        }
    };

    return (
        <div className="h-screen flex justify-center items-center px-8">
            {/* Instructions Section */}
            <div className="w-1/2 p-6">
                <h4 className="text-2xl font-semibold mb-6">How to Generate a GitHub Token and Use It</h4>
                <ul className="space-y-4 max-h-80 overflow-y-auto px-7">
                    {steps.map((item, index) => (
                        <li key={index} className="flex flex-col">
                            <h5 className="text-lg font-semibold text-gray-700">- {item.title}</h5>
                            <p className="text-gray-600 text-base">{item.description}</p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Form Section */}
            <div className="w-1/2 flex flex-col justify-center items-center">
                <form onSubmit={handleSubmit} className="w-2/3 flex flex-col items-center gap-4">
                    <Label className='font-semibold text-xl'>Enter your GitHub Token</Label>
                    <div className='w-full flex flex-col justify-center items-center gap-2'>
                        <Input
                            type="text"
                            placeholder=""
                            value={token}
                            onChange={(e) => {
                                setToken(e.target.value);
                                if (e.target.value.trim()) {
                                    setError(null);
                                }
                            }}
                            className="border-stone-400 border-2 w-full"
                        />
                        {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
                    </div>
                    <Button className="w-1/3" type="submit">
                        Submit
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default TokenForm;
