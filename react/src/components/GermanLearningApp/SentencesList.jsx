import React from 'react';
import SentenceItem from './SentenceItem';

export default function SentencesList({ sentences, ...props }) {
  if (sentences.length === 0) {
    return (
      <div className="card empty-state">
        Noch keine Sätze vorhanden. Fügen Sie Ihren ersten Satz hinzu!
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
