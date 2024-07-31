"use client";

import { useState } from 'react';
import ollama from 'ollama/browser';
import {PROMPTS_INIT, TOOLS} from './chart';
const TAG = ' | ollama | '
const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434/';


export const useOllamaChat = (usePioneer, initialModel = 'llama3.1') => {
    const { state } = usePioneer();
    const { app, balances, pubkeys } = state;
    const [model, setModel] = useState(initialModel);
    const [messages, setMessages] = useState(PROMPTS_INIT);
    const [input, setInput] = useState('');

    const isOllamaRunning = () => {
        return ollama.isRunning();
    };

    let EXAMPLE_WALLET = {
        getAddress: async (network) => {
            console.log('network: ', network);
            let pubkeys = app.pubkeys.filter((e: any) => e.networks.includes(network));
            console.log('pubkeys: ', pubkeys);
            if (pubkeys.length > 0) {
                return pubkeys[0].address || pubkeys[0].master;
            } else {
                throw Error("No pubkey found for "+network);
            }
        },
        getBalance: async (network) => {
            console.log('network: ', network);
            let balance = app.balances.filter((b:any) => b.networkId === network)
            return JSON.stringify(balance)
        }
    };
    const availableFunctions = EXAMPLE_WALLET;

    const submitMessage = async (message: string) => {
        const tag = TAG + ' | submitMessage | ';
        try {
            console.log(tag, 'message:', message);

            const newMessages = [...messages, { role: 'user', content: message }];
            setMessages(newMessages);

            console.log("TOOLS: ", TOOLS);
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

                    const functionToCall = availableFunctions[tool.function.name];
                    const functionResponse = await functionToCall(tool.function.arguments.network);
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
