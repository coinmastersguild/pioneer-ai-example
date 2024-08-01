"use client";

import { VStack, HStack, Input, Button, Card, Box, Text, Checkbox, CheckboxGroup } from '@chakra-ui/react';
import { useOllamaChat } from './ollama';
import { Amount, Asset, Assets, Basic, Classic, Portfolio, Swap, Transfer } from "@coinmasters/pioneer-lib";
import * as React from "react";
import { useState } from "react";

export default function Chat({ usePioneer }:any) {
    const { model, setModel, messages, input, setInput, isOllamaRunning, submitMessage, dashboardComponents, setDashboardComponents } = useOllamaChat(usePioneer);

    const onClose = () => {
        //console.log("onClose")
    };

    const onSelect = (asset:any) => {
        //console.log("onSelect: ", asset)
    };

    const onAcceptSign = (tx:any) => {
        //console.log("onAcceptSign: ", tx)
    };

    const setInputAmount = (amount:any) => {
        console.log("setInputAmount: ", amount);
    };

    const renderDashboard = () => {
        return dashboardComponents.map((component, index) => {
            switch (component) {
                case 'basic':
                    return <Basic key={index} usePioneer={usePioneer} />;
                case 'asset':
                    return <Asset key={index} usePioneer={usePioneer} onClose={onClose} onSelect={onSelect} />;
                case 'amount':
                    return <Amount key={index} usePioneer={usePioneer} onClose={onClose} setInputAmount={setInputAmount} />;
                case 'assets':
                    return <Assets key={index} usePioneer={usePioneer} onClose={onClose} onSelect={onSelect} filters={{ onlyOwned: false, noTokens: false, hasPubkey: true }} />;
                case 'transfer':
                    return <Transfer key={index} usePioneer={usePioneer} />;
                case 'classic':
                    return <Classic key={index} usePioneer={usePioneer} />;
                case 'portfolio':
                    return <Portfolio key={index} usePioneer={usePioneer} />;
                case 'swap':
                    return <Swap key={index} usePioneer={usePioneer} />;
                default:
                    return null;
            }
        });
    };

    const handleCheckboxChange = (value:any) => {
        setDashboardComponents(value);
    };

    return (
        <VStack spacing={4} align="stretch">
            <CheckboxGroup onChange={handleCheckboxChange}>
                <HStack spacing={4}>
                    <Checkbox value="basic">Basic</Checkbox>
                    <Checkbox value="asset">Asset</Checkbox>
                    <Checkbox value="amount">Amount</Checkbox>
                    <Checkbox value="assets">Assets</Checkbox>
                    <Checkbox value="transfer">Transfer</Checkbox>
                    <Checkbox value="classic">Classic</Checkbox>
                    <Checkbox value="portfolio">Portfolio</Checkbox>
                    <Checkbox value="swap">Swap</Checkbox>
                </HStack>
            </CheckboxGroup>

            <Box maxH="300px" overflowY="scroll">
                {messages.slice(-10).map((msg:any, index:any) => (
                    // eslint-disable-next-line react/jsx-key
                    <div>
                        <Card key={index}>
                            <Box p={4}>
                                <Text>{msg.role === 'user' ? 'User' : 'Assistant'}: {msg.content}</Text>
                            </Box>
                        </Card>
                        <br/>
                    </div>
                ))}
            </Box>

            <HStack spacing={4}>
                <Input
                    placeholder="Type your message here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button onClick={() => submitMessage(input)}>Send</Button>
            </HStack>

            {renderDashboard()}
        </VStack>
    );
}
