"use client";

import { useState } from 'react';
import ollama from 'ollama/browser';
import { PROMPTS_INIT, TOOLS } from './chart';
const TAG = ' | ollama | ';
const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434/';

export const useOllamaChat = (usePioneer, initialModel = 'llama3.1') => {
    const { state } = usePioneer();
    const { app, balances, pubkeys } = state;
    const [model, setModel] = useState(initialModel);
    const [messages, setMessages] = useState(PROMPTS_INIT);
    const [input, setInput] = useState('');
    const [dashboardComponents, setDashboardComponents] = useState([]);

    const isOllamaRunning = () => {
        return ollama.isRunning();
    };

    let EXAMPLE_WALLET = {
        getAddress: async (network) => {
            let pubkeys = app.pubkeys.filter((e) => e.networks.includes(network));
            if (pubkeys.length > 0) {
                return pubkeys[0].address || pubkeys[0].master;
            } else {
                throw Error("No pubkey found for " + network);
            }
        },
        getBalance: async (network) => {
            let balance = app.balances.filter((b) => b.networkId === network);
            return JSON.stringify(balance);
        }
    };

    const availableFunctions = {
        ...EXAMPLE_WALLET,
        showComponent: async ({ component }) => {
            setDashboardComponents((prev) => [...new Set([...prev, component])]);
            return `Component ${component} has been added to the dashboard.`;
        },
    };

    const submitMessage = async (message) => {
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
                setMessages([...newMessages, { role: 'bot', content: response.message.content }]);
            } else {
                for (const tool of response.message.tool_calls) {
                    const functionToCall = availableFunctions[tool.function.name];
                    const functionResponse = await functionToCall(tool.function.arguments);
                    const toolResponseMessage = {
                        role: 'tool',
                        content: `${tool.function.name}: ${functionResponse}`,
                    };
                    const updatedMessages = [...newMessages, toolResponseMessage];

                    const finalResponse = await ollama.chat({
                        model: model,
                        messages: updatedMessages,
                    });
                    setMessages([...updatedMessages, { role: 'bot', content: finalResponse.message.content }]);
                }
            }
        } catch (e) {
            console.error(e);
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
        dashboardComponents,
        setDashboardComponents,
    };
};
