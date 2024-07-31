"use client";

import { useState } from 'react';
import ollama from 'ollama/browser';
const TAG = ' | ollama | '
const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434/';

export const useOllamaChat = (usePioneer, initialModel = 'llama3.1') => {
    const [model, setModel] = useState(initialModel);
    const [messages, setMessages] = useState([{ role: 'user', content: 'What is my btc address from my wallet?' }]);
    const [input, setInput] = useState('');

    const isOllamaRunning = () => {
        return ollama.isRunning();
    };

    const submitMessage = async (message: string) => {
        let tag = TAG + ' | submitMessage | '
        try{
            console.log(tag, 'message:', message)
            setMessages([...messages, { role: 'user', content: message }]);
            setInput('');
            const response = await ollama.chat({
                model: model,
                messages: [...messages, { role: 'user', content: message }],
            });
            setMessages([...messages, { role: 'user', content: message }, { role: 'assistant', content: response.message.content }]);
        }catch(e){
            console.error(e)
        }
    };

    return {
        model,
        setModel,
        messages,
        input,
        setInput,
        isOllamaRunning,
        submitMessage,
    };
};
