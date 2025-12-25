import React from 'react';

interface SectionProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ id, title, children, className = "" }) => {
  return (
    <section id={id} className={`scroll-mt-20 py-20 px-4 md:px-8 border-b border-neutral-900 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-white flex items-center tracking-tight">
            <span className="text-neutral-700 mr-3 opacity-50">#</span>
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;