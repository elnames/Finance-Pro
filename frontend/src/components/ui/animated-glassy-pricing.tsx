'use client';

import React from 'react';
import { RippleButton } from '@/components/ui/multi-type-ripple-buttons';

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="3"
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export interface PricingCardProps {
  planName: string;
  description: string;
  price: string;
  period?: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  buttonVariant?: 'primary' | 'secondary';
  onButtonClick?: () => void;
}

export const PricingCard = ({
  planName,
  description,
  price,
  period = '/mo',
  features,
  buttonText,
  isPopular = false,
  buttonVariant = 'primary',
  onButtonClick,
}: PricingCardProps) => {
  const cardClasses = [
    'backdrop-blur-[14px] bg-gradient-to-br rounded-2xl shadow-xl flex-1 max-w-xs px-7 py-8 flex flex-col transition-all duration-300',
    'from-white/10 to-white/5 border border-white/10 backdrop-brightness-[0.91]',
    isPopular
      ? 'scale-105 relative ring-2 ring-blue-400/30 from-white/20 to-white/10 border-blue-400/30 shadow-2xl shadow-blue-500/10'
      : 'hover:border-white/20 hover:from-white/15',
  ].join(' ');

  const buttonClasses = [
    'mt-auto w-full py-2.5 rounded-xl font-semibold text-[14px] transition font-sans',
    buttonVariant === 'primary'
      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-lg shadow-blue-500/20'
      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
  ].join(' ');

  return (
    <div className={cardClasses}>
      {isPopular && (
        <div className="absolute -top-4 right-4 px-3 py-1 text-[12px] font-bold rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30">
          Más Popular
        </div>
      )}

      <div className="mb-3">
        <h2 className="text-[42px] font-extralight tracking-[-0.03em] text-white">{planName}</h2>
        <p className="text-[15px] text-white/60 mt-1">{description}</p>
      </div>

      <div className="my-6 flex items-baseline gap-1">
        <span className="text-[48px] font-extralight text-white">${price}</span>
        <span className="text-[14px] text-white/50">{period}</span>
      </div>

      <div className="w-full mb-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <ul className="flex flex-col gap-2.5 text-[14px] text-white/80 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckIcon className="text-blue-400 w-4 h-4 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <RippleButton
        className={buttonClasses}
        rippleColor="rgba(255,255,255,0.15)"
        onClick={onButtonClick}
      >
        {buttonText}
      </RippleButton>
    </div>
  );
};

interface PricingSectionProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  plans: PricingCardProps[];
}

export const PricingSection = ({
  title,
  subtitle,
  plans,
}: PricingSectionProps) => {
  return (
    <div className="w-full max-w-5xl mx-auto text-center">
      {title && (
        <div className="mb-14">
          {title}
          {subtitle && (
            <p className="mt-3 text-[16px] md:text-[18px] text-white/60 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-8 md:gap-6 justify-center items-center w-full">
        {plans.map((plan) => (
          <PricingCard key={plan.planName} {...plan} />
        ))}
      </div>
    </div>
  );
};
