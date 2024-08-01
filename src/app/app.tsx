"use client";

import { Select, Box, Tabs, TabList, Tab, TabPanels, TabPanel, Card, Button, Input, VStack, HStack, Text } from '@chakra-ui/react';
import * as React from 'react';
import { usePioneer } from "@coinmasters/pioneer-react";
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
import Chat from './chat';

export default function App() {
  const onStartApp = useOnStartApp();
  const { state } = usePioneer();
  const { api, app, assets, context } = state;
  const [intent, setIntent] = useState('classic');
  const [tabIndex, setTabIndex] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState({});

  useEffect(() => {
    onStartApp();
  }, []);

  useEffect(() => {
    if (app && app.assetContext) setSelectedAsset(app.assetContext);
  }, [app, app?.assetContext]);

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
          <Chat usePioneer={usePioneer} />
        </main>

        {/* Footer */}
        <footer className="w-full px-10 py-5 bg-gray-200 dark:bg-gray-900 text-center">
          Powered by <a href="https://pioneers.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500">Pioneers</a>
        </footer>
      </>
  );
}
