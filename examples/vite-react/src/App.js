import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnonflyProvider, MessageList, ChatInput } from '@anonfly/react';
const config = {
    apiKey: 'test-api-key',
    baseUrl: 'http://localhost:5001/api/v1',
    wsUrl: 'ws://localhost:5001',
};
function App() {
    return (_jsx(AnonflyProvider, { config: config, children: _jsxs("div", { className: "flex h-screen flex-col bg-white dark:bg-zinc-950", children: [_jsx("header", { className: "border-b p-4 dark:border-zinc-800", children: _jsx("h1", { className: "text-xl font-bold", children: "Anonfly SDK Chat Demo" }) }), _jsxs("main", { className: "flex-1 overflow-hidden flex flex-col", children: [_jsx(MessageList, { roomId: "global", className: "flex-1" }), _jsx(ChatInput, { roomId: "global" })] })] }) }));
}
export default App;
//# sourceMappingURL=App.js.map