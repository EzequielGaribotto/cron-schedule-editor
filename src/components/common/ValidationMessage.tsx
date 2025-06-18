import './ValidationMessage.css';

type MessageType = 'error' | 'warning' | 'info';

interface ValidationMessageProps {
    message: string;
    type?: MessageType;
    visible?: boolean;
}

export function ValidationMessage({ 
    message, 
    type = 'error', 
    visible = true 
}: ValidationMessageProps) {
    if (!visible) return null;
    
    const iconMap: Record<MessageType, string> = {
        error: '⚠️',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    return (
        <div className={`validation-message ${type}`} role="alert">
            <span className="validation-icon">{iconMap[type]}</span>
            <span>{message}</span>
        </div>
    );
}
