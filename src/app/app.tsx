"use client";

import { Select, Box, Tabs, TabList, Tab, TabPanels, TabPanel, Card, Button, Input, VStack, HStack, Text } from '@chakra-ui/react';
import * as React from 'react';
import { usePioneer } from "@coinmasters/pioneer-react";
import { availableChainsByWallet, WalletOption } from '@coinmasters/types';
import ollama from 'ollama/browser'
import { useState, useEffect } from 'react';
//components
import {
  Pioneer,
  Basic,
  Portfolio,
  Transfer,
  Assets,
  Asset,
  Amount,
  Quote,
  Quotes,
  Swap,
  Track,
  Classic,
  SignTransaction
} from '@coinmasters/pioneer-lib';
import Image from 'next/image';
import { useOnStartApp } from "../utils/onStart";

const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434/';

export default function App() {
  const onStartApp = useOnStartApp();
  const { state } = usePioneer();
  const { api, app, assets, context } = state;
  const [intent, setIntent] = useState('classic');
  const [tabIndex, setTabIndex] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState({});
  const [model, setModel] = useState('llama3.1');
  const [messages, setMessages] = useState([{ role: 'user', content: 'What is my btc address from my wallet?' }]);
  const [input, setInput] = useState('');

  useEffect(() => {
    onStartApp();
  }, []);

  useEffect(() => {
    if (app && app.assetContext) setSelectedAsset(app.assetContext);
  }, [app, app?.assetContext]);

  const handleTabsChange = (index: any) => {
    setTabIndex(index);
  };

  const isOllamaRunning = () => {
    return ollama.isRunning();
  };

  const onClose = () => {
    //console.log("onClose")
  };

  const onSelect = (asset: any) => {
    //console.log("onSelect: ", asset)
  };

  const onAcceptSign = (tx: any) => {
    //console.log("onAcceptSign: ", tx)
  };

  const setInputAmount = (amount: any) => {
    console.log("setInputAmount: ", amount);
  };

  // Function to determine which component to render based on intent
  const renderComponent = () => {
    // Your switch case logic here, similar to the original
    switch (intent) {
      case 'basic':
        return <Basic usePioneer={usePioneer} />;
      case 'asset':
        return <Asset usePioneer={usePioneer} onClose={onClose} onSelect={onSelect} asset={selectedAsset} />;
      case 'amount':
        return <Amount usePioneer={usePioneer} onClose={onClose} asset={selectedAsset} setInputAmount={setInputAmount} />;
      case 'assets':
        return <Assets usePioneer={usePioneer} onClose={onClose} onSelect={onSelect} filters={{ onlyOwned: false, noTokens: false, hasPubkey: true }} />;
      case 'transfer':
        return <Transfer usePioneer={usePioneer} />;
      case 'classic':
        return <Classic usePioneer={usePioneer} />;
      case 'portfolio':
        return <Portfolio usePioneer={usePioneer} />;
      case 'swap':
        return <Swap usePioneer={usePioneer} />;
      default:
        return <div></div>;
    }
  };

  const handleIntentChange = (event: any) => {
    setIntent(event.target.value);
  };

  const submitMessage = async (message: string) => {
    setMessages([...messages, { role: 'user', content: message }]);
    setInput('');
    const response = await ollama.chat({
      model: model,
      messages: [...messages, { role: 'user', content: message }]
    });
    setMessages([...messages, { role: 'user', content: message }, { role: 'assistant', content: response.message.content }]);
  };

  return (
      <>
        {/* Header */}
        <header className="flex justify-between items-center w-full px-10 py-5 bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            {/* Avatar logo */}
            <Image src="/png/pioneerMan.png" alt="Logo" width={180} height={150} className="rounded-full" />
            {/* Website title */}
            <span className="text-xl font-bold">Pioneer SDK</span>
          </div>
          <Pioneer usePioneer={usePioneer} />
        </header>

        {/* Main Content */}
        <main className="flex-grow p-4">
          <VStack spacing={4} align="stretch">
            {messages.map((msg, index) => (
                <Card key={index}>
                  <Box p={4}>
                    <Text>{msg.role === 'user' ? 'User' : 'Assistant'}: {msg.content}</Text>
                  </Box>
                </Card>
            ))}
            <HStack spacing={4}>
              <Input
                  placeholder="Type your message here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
              />
              <Button onClick={() => submitMessage(input)}>Send</Button>
            </HStack>
          </VStack>
        </main>

        {/* Footer */}
        <footer className="w-full px-10 py-5 bg-gray-200 dark:bg-gray-900 text-center">
          Powered by <a href="https://pioneers.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500">Pioneers</a>
        </footer>
      </>
  );
}
