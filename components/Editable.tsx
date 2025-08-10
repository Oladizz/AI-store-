
import React, { useState, useEffect, useRef } from 'react';

interface EditableProps {
    as?: keyof JSX.IntrinsicElements;
    isAdmin: boolean;
    value: string;
    onChange: (newValue: string) => void;
    className?: string;
    multiline?: boolean;
}

const Editable: React.FC<EditableProps> = ({
    as: Component = 'span',
    isAdmin,
    value,
    onChange,
    className,
    multiline = false
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);
    
    const handleClick = () => {
        if (isAdmin) {
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (currentValue !== value) {
            onChange(currentValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            handleBlur();
        } else if (e.key === 'Escape') {
            setCurrentValue(value);
            setIsEditing(false);
        }
    };
    
    if (!isAdmin) {
         return <Component className={className} dangerouslySetInnerHTML={{ __html: value }} />;
    }
    
    if (isEditing) {
        if (multiline) {
            return (
                <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`${className} bg-yellow-100 border border-yellow-400 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full`}
                    rows={4}
                />
            );
        }
        return (
            <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`${className} bg-yellow-100 border border-yellow-400 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
        );
    }

    return (
        <Component
            onClick={handleClick}
            className={`${className} cursor-pointer transition-all hover:outline hover:outline-2 hover:outline-offset-2 hover:outline-dashed hover:outline-indigo-500/50 rounded-sm`}
            tabIndex={0}
            role="button"
            aria-label={`Edit ${Component} content`}
            dangerouslySetInnerHTML={{ __html: value }}
        />
    );
};

export default Editable;
