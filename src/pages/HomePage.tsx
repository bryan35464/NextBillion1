import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import MarketCard, { AssetIcon, PriceChange } from '@/components/MarketCard';
import { formatCurrency, formatNumber } from '@/lib/format';
import {
  Shield,
  Zap,
  Globe,
  TrendingUp,
  ArrowRight,
  Lock,
  Smartphone,
  Headphones,
  ChevronDown,
  Plus,
  Minus,
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { FAQ } from '@/types';
import { useEffect } from 'react';

export default function HomePage() {
  const { settings, assets } = useSettings();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        if (data) setFaqs(data as FAQ[]);
      });
  }, []);

  const featuredAssets = assets.filter((a) => a.is_featured).slice(0, 6);
  const topMovers = [...assets].sort((a, b) => Math.abs(b.change_24h) - Math.abs(a.change_24h)).slice(0, 4);

  const stats = [
    { label: 'Active Users', value: formatNumber(settings?.total_users || 0), icon: TrendingUp },
    { label: 'Trading Volume', value: formatCurrency(settings?.trading_volume || 0), icon: Zap },
    { label: 'Countries', value: `${settings?.supported_countries || 80}+`, icon: Globe },
    { label: 'Assets Listed', value: `${settings?.supported_assets || 200}+`, icon: Shield },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Trading',
      desc: 'Execute trades in milliseconds with our high-performance matching engine and low-latency infrastructure.',
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      desc: 'Your assets are protected by multi-signature cold storage, 2FA, and industry-leading encryption protocols.',
    },
    {
      icon: Smartphone,
      title: 'Trade Anywhere',
      desc: 'Access your portfolio from any device with our responsive web platform and native mobile experience.',
    },
    {
      icon: TrendingUp,
      title: 'Advanced Charts',
      desc: 'Professional candlestick charts with multiple timeframes, technical indicators, and real-time market data.',
    },
    {
      icon: Globe,
      title: '200+ Cryptocurrencies',
      desc: 'Trade the widest selection of digital assets including Bitcoin, Ethereum, Solana, and emerging tokens.',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      desc: 'Our dedicated support team is available around the clock to help you with any questions or issues.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 via-transparent to-dark-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 badge badge-sandbox mb-6 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              💥750 Investment is Back💥
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight animate-slide-up">
              {settings?.hero_headline || 'Trade Crypto With Confidence'}
            </h1>
            <p className="mt-6 text-lg text-dark-300 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {settings?.hero_subtitle ||
                'Buy, sell and trade 200+ cryptocurrencies on the most secure and trusted digital asset platform.'}
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/signup" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
                {settings?.hero_cta_text || 'Start Trading'}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/markets" className="btn-secondary text-base px-8 py-3">
                {settings?.hero_secondary_cta || 'Explore Markets'}
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="card p-5 text-center group hover:border-brand-500/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-500/20 transition-all">
                    <Icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-dark-400 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ticker */}
      <section className="border-y border-dark-700 bg-dark-900/50 overflow-hidden py-3">
        <div className="flex gap-8 animate-ticker whitespace-nowrap">
          {[...assets, ...assets].map((asset, i) => (
            <Link
              key={i}
              to={`/trade/${asset.symbol}_USDT`}
              className="flex items-center gap-2 text-sm hover:bg-dark-800 px-3 py-1 rounded-lg transition-colors"
            >
              <span className="text-dark-300 font-medium">{asset.symbol}</span>
              <span className="text-white">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <PriceChange change={asset.change_24h} showIcon={false} />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Markets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Markets</h2>
            <p className="text-dark-400 mt-1">Trade the most popular cryptocurrencies</p>
          </div>
          <Link to="/markets" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1 transition-colors">
            View All Markets <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredAssets.map((asset) => (
            <MarketCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      {/* Top Movers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-6">Top Movers (24h)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topMovers.map((asset) => (
              <Link
                key={asset.id}
                to={`/trade/${asset.symbol}_USDT`}
                className="flex items-center justify-between p-4 rounded-xl bg-dark-900/50 hover:bg-dark-700/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <AssetIcon symbol={asset.symbol} size="sm" />
                  <div>
                    <p className="text-white font-medium text-sm">{asset.symbol}</p>
                    <p className="text-dark-400 text-xs">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <PriceChange change={asset.change_24h} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Why Choose Us</h2>
          <p className="text-dark-400 mt-3 max-w-2xl mx-auto">
            A professional-grade trading platform built for both beginners and experienced traders
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="card card-hover p-6 group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center mb-4 group-hover:from-brand-500/30 group-hover:to-accent-500/30 transition-all">
                  <Icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 badge bg-success-500/10 text-success-400 border border-success-500/20 mb-4">
                <Lock className="w-3.5 h-3.5" /> Security First
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Your Assets Are Protected
              </h2>
              <p className="text-dark-300 leading-relaxed mb-6">
                We employ a comprehensive security framework including cold storage for the majority
                of assets, multi-signature wallets, two-factor authentication, and real-time
                monitoring. Our platform undergoes regular security audits by industry-leading firms.
              </p>
              <ul className="space-y-3">
                {[
                  '98% of assets in cold storage',
                  'Multi-signature wallet security',
                  'Two-factor authentication',
                  'Regular security audits',
                  'Real-time fraud detection',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-dark-200">
                    <div className="w-5 h-5 rounded-full bg-success-500/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3 h-3 text-success-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '98%', label: 'Cold Storage' },
                { value: '24/7', label: 'Monitoring' },
                { value: '256-bit', label: 'Encryption' },
                { value: 'SOC 2', label: 'Compliant' },
              ].map((item) => (
                <div key={item.label} className="bg-dark-900/50 rounded-2xl p-6 text-center border border-dark-700">
                  <p className="text-3xl font-bold gradient-text">{item.value}</p>
                  <p className="text-sm text-dark-400 mt-2">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-dark-400 mt-3">Everything you need to know about trading on our platform</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={faq.id} className="card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left group"
              >
                <span className="text-white font-medium group-hover:text-brand-400 transition-colors">
                  {faq.question}
                </span>
                {openFaq === i ? (
                  <Minus className="w-5 h-5 text-dark-400 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-dark-400 flex-shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-dark-300 text-sm leading-relaxed animate-fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA / Download */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card p-8 lg:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-accent-500/5 to-brand-500/10" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-dark-300 max-w-xl mx-auto mb-8">
              Join over {formatNumber(settings?.total_users || 0)} traders who trust our platform
              for their cryptocurrency trading needs.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/signup" className="btn-primary text-base px-8 py-3">
                Create Free Account
              </Link>
              <Link to="/trade/BTC_USDT" className="btn-secondary text-base px-8 py-3">
                Try Trading
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
