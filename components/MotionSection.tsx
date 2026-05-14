import { ReactNode } from "react";

interface MotionSectionProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    id?: string;
}

export default function MotionSection({
    children,
    className = "",
    id
}: MotionSectionProps) {
    return (
        <div
            id={id}
            className={["w-full max-w-full", className].filter(Boolean).join(" ")}
        >
            {children}
        </div>
    );
}
