import { AnonflyProvider, MessageList, ChatInput } from '@anonfly/react';

const config = {
    apiKey: 'test-api-key',
    baseUrl: 'http://localhost:5001/api/v1',
    wsUrl: 'ws://localhost:5001',
};

function App() {
    return (
        <AnonflyProvider config={config}>
            <div className="flex h-screen flex-col bg-white dark:bg-zinc-950">
                <header className="border-b p-4 dark:border-zinc-800">
                    <h1 className="text-xl font-bold">Anonfly SDK Chat Demo</h1>
                </header>

                <main className="flex-1 overflow-hidden flex flex-col">
                    <MessageList
                        roomId="global"
                        className="flex-1"
                    />
                    <ChatInput roomId="global" />
                </main>
            </div>
        </AnonflyProvider>
    );
}

export default App;
