'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const clock = 1;

const NotesPage = () => {
    const [topic, setTopic] = useState('');
    const [viewpoint1, setViewpoint1] = useState('');
    const [viewpoint2, setViewpoint2] = useState('');
    const [prepTime, setPrepTime] = useState(0);
    const [notes, setNotes] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Initialize Gemini API client
    const genAI = new GoogleGenerativeAI('AIzaSyC1TqhOqsiYuMLilytOF7cBGgh8NEiPtRQ');

    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro-latest',
        generationConfig: {
            responseSchema: {
                type: 'object',
                properties: { text: { type: 'string', maxLength: 64 } },
            },
            temperature: 2,
        },
    });

    useEffect(() => {
        setTopic(localStorage.getItem('topic'));
        setViewpoint1(localStorage.getItem('viewpoint1'));
        setViewpoint2(localStorage.getItem('viewpoint2'));
        const prepTimeValue = localStorage.getItem('prepTime');
        setPrepTime(prepTimeValue);
        setTimeLeft(prepTimeValue ? prepTimeValue * 60 : 0); // Initialize timer with prep time in seconds
    }, []);

    // Timer logic
    useEffect(() => {
        let timer;
        if (timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000 / clock);
        } else if (timeLeft === 0 && prepTime > 0) {
            clearInterval(timer);
            localStorage.setItem('notes', notes);
            localStorage.setItem('geminiSuggestions', JSON.stringify(suggestions));
            router.push('/judge'); // Redirect to /judge route when timer reaches 0
        }
        return () => clearInterval(timer);
    }, [timeLeft, router]);

    // Function to get suggestions from Gemini
    const getSuggestions = async () => {
        try {
            setIsLoading(true);
            console.log('Generating suggestion...');

            // Generate prompt for Gemini
            const prompt = `Here is a debate topic: "${topic}".
Viewpoint 1: ${viewpoint1}
Viewpoint 2: ${viewpoint2}
User Notes: ${notes}

In a single sentence, provide a concise, thought-provoking question or refutation to challenge the user's current arguments. Do not label your response with a header. If the user notes are empty, return an empty string.`;

            // Call Gemini API to generate suggestion
            const result = await model.generateContent(prompt);
            const suggestion = result.response.text().trim();

            // Add generated suggestion to list
            if (suggestion) {
                setSuggestions((prevSuggestions) => {
                    const updatedSuggestions = [...prevSuggestions, suggestion];
                    localStorage.setItem('geminiSuggestions', JSON.stringify(updatedSuggestions));
                    return updatedSuggestions;
                });
            }
        } catch (error) {
            console.error('Error generating suggestion:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Format time in mm:ss
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
        <div className={`min-h-screen bg-gray-100 p-8 flex flex-col items-center ${inter.className}`}>
            {/* Timer in the upper right corner */}
            <div className='w-full flex justify-end mb-4'>
                <div className='text-lg font-semibold text-white bg-red-400 px-4 py-2 rounded-full'>
                    Timer: {formatTime(timeLeft)} ⏱️
                </div>
            </div>

            {/* Topic and Viewpoints Section */}
            <div className='bg-white p-6 mb-6 rounded-lg shadow-md w-full max-w-6xl'>
                <p className='text-3xl font-bold text-left mb-4'>{topic}</p>
                <div className='flex flex-col md:flex-row gap-4'>
                    {viewpoint1 && (
                        <div className='flex-1 bg-gray-100 p-4 rounded-lg'>
                            <h3 className='text-xl font-semibold mb-2'>Viewpoint 1</h3>
                            <p className='text-lg'>{viewpoint1}</p>
                        </div>
                    )}
                    {viewpoint2 && (
                        <div className='flex-1 bg-gray-100 p-4 rounded-lg'>
                            <h3 className='text-xl font-semibold mb-2'>Viewpoint 2</h3>
                            <p className='text-lg'>{viewpoint2}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Section */}
            <div className='w-full flex gap-4 max-w-6xl'>
                {/* Suggestions Section */}
                <div className='w-2/5 p-4 bg-white shadow-md rounded-lg flex flex-col'>
                    <h2 className='text-2xl font-bold mb-4'>Gemini Suggestions 💡</h2>
                    <ul className='list-disc list-inside flex-grow'>
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className='text-lg mb-2'>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                    <div className='flex justify-center mt-4'>
                        <button
                            onClick={getSuggestions}
                            disabled={isLoading}
                            className={`bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="inline-block animate-spin mr-2">🧠</span>
                                    Thinking...
                                </>
                            ) : (
                                'Prompt My Thinking 🧠'
                            )}
                        </button>
                    </div>
                </div>

                {/* Notes Section */}
                <div className='w-3/5 p-4 bg-white shadow-md rounded-lg flex flex-col'>
                    <h2 className='text-2xl font-bold mb-4'>Your Notes 📝</h2>
                    <textarea
                        className='w-full p-4 h-96 border border-gray-300 rounded-md bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder='Type your notes here...'
                    />
                </div>
            </div>
        </div>
    );
};

export default NotesPage;
