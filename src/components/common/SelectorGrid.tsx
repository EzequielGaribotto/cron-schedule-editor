import './SelectorGrid.css';

interface SelectorGridProps {
    items: Array<{ value: number, label: string }>;
    selectedValues: number[];
    onToggle: (value: number) => void;
    columns?: number;
}

export function SelectorGrid({
    items,
    selectedValues,
    onToggle,
    columns = 7
}: SelectorGridProps) {
    return (
        <div className="selector-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {items.map(item => (
                <button
                    key={item.value}
                    type="button"
                    className={`grid-item ${selectedValues.includes(item.value) ? 'selected' : ''}`}
                    onClick={() => onToggle(item.value)}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
