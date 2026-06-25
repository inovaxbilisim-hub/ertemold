import Link from 'next/link';
import { Calculator, ArrowRight, DollarSign } from 'lucide-react';

interface CalculatorCTAButtonProps {
  serviceSlug: string;
  citySlug?: string | null;
  cityName?: string | null;
  buttonText?: string;
  icon?: 'Calculator' | 'ArrowRight' | 'DollarSign' | 'none';
  className?: string;
}

export default function CalculatorCTAButton({
  serviceSlug,
  citySlug,
  cityName,
  buttonText = 'Fiyat Hesapla',
  icon = 'Calculator',
  className = '',
}: CalculatorCTAButtonProps) {
  const href = citySlug 
    ? `/hizmetler/${serviceSlug}/hesaplama?city=${citySlug}`
    : `/hizmetler/${serviceSlug}/hesaplama`;
  
  const displayText = cityName 
    ? buttonText.replace('{city}', cityName)
    : buttonText;

  const IconComponent = icon === 'Calculator' ? Calculator
    : icon === 'ArrowRight' ? ArrowRight
    : icon === 'DollarSign' ? DollarSign
    : null;

  return (
    <div className={`py-12 ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 border border-blue-100 shadow-lg">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              {IconComponent && <IconComponent size={32} className="text-white" strokeWidth={2.5} />}
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-black text-black tracking-tight">
                {cityName ? `${cityName} İçin ` : ''}Hızlı Fiyat Teklifi
              </h3>
              <p className="text-slate-600 text-base md:text-lg max-w-2xl">
                Metrekare bilginizi girerek anında tahmini fiyat alın. 
                Detaylı teklif için ücretsiz keşif hizmeti sunuyoruz.
              </p>
            </div>

            <Link
              href={href}
              className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl text-base font-black transition-all duration-300 hover:bg-blue-700 hover:scale-105 shadow-xl hover:shadow-2xl uppercase tracking-wide"
            >
              {IconComponent && <IconComponent size={20} strokeWidth={3} />}
              {displayText}
              <ArrowRight size={20} strokeWidth={3} />
            </Link>

            <p className="text-xs text-slate-400 mt-2">
              * Nihai fiyat keşif sonrası netleşir
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
