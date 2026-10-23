import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-md mx-auto my-16 text-center space-y-4 animate-in fade-in duration-150">
      <Card className="p-8 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.25)]">
          <Compass size={36} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          404 - Page Not Found
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          The requested analytical module or contract pair does not exist in the GoldLens registry.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" icon={<ArrowLeft size={16} />}>
              Return to Market Overview
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
