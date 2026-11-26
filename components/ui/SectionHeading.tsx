import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/util/cn';

/** Eyebrow + title + lede, used to open every landing-page section and page. */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Heading = 'h2',
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(align === 'center' && 'mx-auto text-center', 'max-w-2xl', className)}
    >
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <Heading
        className={cn(
          'font-display font-semibold',
          Heading === 'h1' ? 'text-display-lg' : 'text-display-md',
        )}
      >
        {title}
      </Heading>
      {description && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
    </motion.div>
  );
}
