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
          <h2 className="text-3xl font-bold mb-12 text-white flex items-center">
            <span className="text-neutral-600 mr-2">#</span>
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;