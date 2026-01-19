import "./ChatDisplay.css";

interface Message {
    text: string;
    type: 'user' | 'bot';
}

interface ChatDisplayProps {
    messages: Message[];
    isRecording: boolean;
    onRecordingToggle: () => void;
}

export const ChatDisplay = ({ messages, isRecording, onRecordingToggle }: ChatDisplayProps) => {
    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>Chat History</h2>
            </div>
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.type}`}>
                        <div className="message-content">
                            {message.text}
                        </div>
                    </div>
                ))}
            </div>
            <div className="record-button-container">
                <button
                    className={`record-button ${isRecording ? 'recording' : ''}`}
                    onClick={onRecordingToggle}
                >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
            </div>
        </div>
    );
};
