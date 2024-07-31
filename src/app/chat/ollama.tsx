"use client";

import { useState } from 'react';
import ollama from 'ollama/browser';
const TAG = ' | ollama | '
const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434/';

let EXAMPLE_WALLET = {
    getAddress: async (coin) => {
        console.log('coin: ', coin);
        if (coin.toUpperCase() === 'BTC') {
            return '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
        } else {
            throw Error("Coin not supported");
        }
    },
    getBalance: async (coin) => {
        console.log('coin: ', coin);
        if (coin.toUpperCase() === 'BTC') {
            return 0.0001;
        } else {
            throw Error("Coin not supported");
        }
    }
};

let PROMPTS_INIT = [
    {
        role: 'system',
        content: 'You are an assistant that can call functions to get information. If you need to get the BTC address, use the getAddress function. If you need to get the BTC balance, use the getBalance function.',
    }
]

let TOOLS = [
    {
        type: 'function',
        function: {
            name: 'getAddress',
            description: 'call the wallet to return the address for a given coin',
            parameters: {
                type: 'object',
                properties: {
                    coin: {
                        type: 'string',
                        description: 'the coins ticker symbol example BTC (only supported) bitcoin BTC',
                    }
                },
                required: ['coin'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'getBalance',
            description: 'call the wallet to return the balance for a given coin',
            parameters: {
                type: 'object',
                properties: {
                    coin: {
                        type: 'string',
                        description: 'the coins ticker symbol example BTC (only supported) bitcoin BTC',
                    }
                },
                required: ['coin'],
            },
        },
    },
]

export const useOllamaChat = (usePioneer, initialModel = 'llama3.1') => {
    const [model, setModel] = useState(initialModel);
    const [messages, setMessages] = useState(PROMPTS_INIT);
    const [input, setInput] = useState('');

    const isOllamaRunning = () => {
        return ollama.isRunning();
    };

    const submitMessage = async (message: string) => {
        const tag = TAG + ' | submitMessage | ';
        try {
            console.log(tag, 'message:', message);

            const newMessages = [...messages, { role: 'user', content: message }];
            setMessages(newMessages);

            const response = await ollama.chat({
                model: model,
                messages: newMessages,
                tools: TOOLS,
            });
            console.log("response: ", response);

            if (!response.message.tool_calls || response.message.tool_calls.length === 0) {
                console.log("The model didn't use the function. Its response was: ", response);
                console.log("The model didn't use the function. Its response was: ", response.message);
                console.log("The model didn't use the function. Its response was: ", response.message.content);

                if (response.message.content) {
                    setMessages([...newMessages, { role: 'bot', content: response.message.content }]);
                } else {
                    console.error("Failed to generate response! ", response);
                }
            } else {
                // Handle tool calls
                for (const tool of response.message.tool_calls) {
                    console.log('tool:', tool);
                    const availableFunctions = EXAMPLE_WALLET;
                    const functionToCall = availableFunctions[tool.function.name];
                    const functionResponse = await functionToCall(tool.function.arguments.coin);
                    console.log('functionResponse:', functionResponse);

                    const toolResponseMessage = {
                        role: 'tool',
                        content: `${tool.function.name} The functionResponse is ${functionResponse}`,
                    };
                    const updatedMessages = [...newMessages, toolResponseMessage];
                    // setMessages(updatedMessages);

                    // Simulate the final response
                    const finalResponse = await ollama.chat({
                        model: model,
                        messages: updatedMessages,
                    });
                    console.log(finalResponse.message.content);
                    setMessages([...updatedMessages, { role: 'bot', content: finalResponse.message.content }]);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };


    // const submitMessage = async (message: string) => {
    //     let tag = TAG + ' | submitMessage | '
    //     try{
    //         console.log(tag, 'message:', message)
    //         setMessages([...messages, { role: 'user', content: message }]);
    //         setInput('');
    //         const response = await ollama.chat({
    //             model: model,
    //             messages: [...messages, { role: 'user', content: message }],
    //         });
    //         setMessages([...messages, { role: 'user', content: message }, { role: 'assistant', content: response.message.content }]);
    //     }catch(e){
    //         console.error(e)
    //     }
    // };

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
