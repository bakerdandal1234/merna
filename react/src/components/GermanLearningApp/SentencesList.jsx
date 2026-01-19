import React from 'react';
import SentenceItem from './SentenceItem';

export default function SentencesList({
  sentences,
  ...props 
}) {
  if (sentences.length === 0) {
    return (
      <div className="card empty-state">
        لا توجد جمل بعد. ابدأ بإضافة جملة جديدة!
      </div>
    );
  }

  return (
    <div className="list-container">
      {sentences.map((sentence) => (
        <SentenceItem
          key={sentence._id}
          sentence={sentence}
          {...props}
        />
      ))}
    </div>
  );
}
