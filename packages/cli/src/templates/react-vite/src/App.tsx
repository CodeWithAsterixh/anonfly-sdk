import { AnonflyProvider, MessageList, ChatInput } from '@anonfly/react'

const config = {
    apiKey: 'YOUR_API_KEY', // You can also use environment variables
}

function App() {
    return (
        <AnonflyProvider config={config}>
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <header style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                    <h1>Anonfly Chat</h1>
                </header>
                <main style={{ flex: 1, overflow: 'hidden' }}>
                    <MessageList roomId="GENERAL" />
                </main>
                <footer style={{ padding: '1rem' }}>
                    <ChatInput roomId="GENERAL" />
                </footer>
            </div>
        </AnonflyProvider>
    )
}

export default App
