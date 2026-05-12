"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface MotionSectionProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    id?: string;
}

export default function MotionSection({
    children,
    delay = 0,
    className = "",
    id
}: MotionSectionProps) {
    const [disableAnimation, setDisableAnimation] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const media = window.matchMedia("(max-width: 768px), (prefers-reduced-motion: reduce)");
        const update = () => setDisableAnimation(media.matches);
        update();
        media.addEventListener?.("change", update);
        return () => media.removeEventListener?.("change", update);
    }, []);

    return (
        <motion.div
            id={id}
            initial={disableAnimation ? false : { opacity: 0, y: 30 }}
            whileInView={disableAnimation ? undefined : { opacity: 1, y: 0 }}
            viewport={disableAnimation ? undefined : { once: true, margin: "-100px" }}
            transition={disableAnimation ? undefined : { duration: 0.6, delay, ease: "easeOut" }}
            className={["w-full max-w-full", className].filter(Boolean).join(" ")}
        >
            {children}
        </motion.div>
    );
}
