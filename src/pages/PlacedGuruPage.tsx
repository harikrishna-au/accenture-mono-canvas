import React from 'react';
import Header from '@/components/Header';
import GuruProfileForm from './placed-guru/GuruProfileForm';

const PlacedGuruPage = () => {
  return (
    <div className="min-h-screen bg-[#fcfcf9]">
      <div className="w-full flex flex-col items-center z-50">
        <Header onStartTour={() => {}} />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-28 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-['Merriweather'] text-stone-900 tracking-tight">
            Add Expert Profile
          </h1>
          <p className="text-stone-400 text-sm font-['Inter'] mt-2">
            New experts appear immediately on{' '}
            <a href="/connect" className="text-stone-600 hover:underline transition-colors">
              /connect
            </a>
            .
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
          <GuruProfileForm />
        </div>
      </div>
    </div>
  );
};

export default PlacedGuruPage;
