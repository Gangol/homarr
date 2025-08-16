import React from 'react';
import Dock from './Dock';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <h1 className="text-2xl text-white">Welcome to Homarr</h1>
      </div>
      <Dock />
    </div>
  );
};

export default Dashboard;
