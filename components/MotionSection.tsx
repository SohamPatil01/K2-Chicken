"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

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
    return (
        <motion.div
            id={id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className={["w-full max-w-full", className].filter(Boolean).join(" ")}
        >
            {children}
        </motion.div>
    );
}
