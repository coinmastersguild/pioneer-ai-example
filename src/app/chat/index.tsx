"use client";

import { VStack, HStack, Input, Button, Card, Box, Text } from '@chakra-ui/react';
import { useOllamaChat } from './ollama';

export default function Chat({ usePioneer }) {
    const { model, setModel, messages, input, setInput, isOllamaRunning, submitMessage } = useOllamaChat(usePioneer);

    return (
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
    );
}
