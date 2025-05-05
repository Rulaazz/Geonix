import React from 'react';
import ReactPlayer from 'react-player';

export default function VideoLesson({ title, url, notes }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="aspect-w-16 aspect-h-9 mb-4">
        <ReactPlayer url={url} controls width="100%" />
      </div>
      <div className="text-sm bg-gray-50 p-4 rounded">
        <h3 className="font-medium mb-1">Notes</h3>
        <p>{notes || 'No notes available for this lesson.'}</p>
      </div>
    </div>
  );
}
