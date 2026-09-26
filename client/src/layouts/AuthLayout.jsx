import React from 'react';
import { Outlet } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';
import { WarmMeshBackground } from '../components/common/WarmMeshBackground';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-cocoa-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-terracotta-500 selection:text-white">
      {/* Warm animated mesh background */}
      <WarmMeshBackground />

      {/* Subtle warm ambient gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-terracotta-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-olive-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4 flex justify-center">
        <BrandLogo size="lg" light />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-cocoa-900/90 backdrop-blur-2xl py-8 px-6 sm:px-10 rounded-3xl border border-cocoa-700/70 shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

