import './TimeSelector.css';

interface TimeSelectorProps {
    id?: string;
    label?: string;
    value: string;
    onChange: (value: string) => void;
    showRemoveButton?: boolean;
    onRemove?: () => void;
    step?: string;
}

export function TimeSelector({
    id,
    label,
    value,
    onChange,
    showRemoveButton = false,
    onRemove,
    step = "60"
}: TimeSelectorProps) {
    return (
        <div className="time-selector">
            {label && <label htmlFor={id}>{label}</label>}
            <div className="time-input-container">
                <input
                    id={id}
                    type="time"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    step={step}
                    className="time-input"
                />
                {showRemoveButton && onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="remove-time-btn"
                        aria-label="Remove time"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}
