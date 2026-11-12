import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { AssetIcon } from '@/components/MarketCard';
import { formatPrice, formatCurrency, generateDemoAddress, generateDemoTxHash, shortAddress } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { Wallet as WalletType, Transaction } from '@/types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Copy,
  Check,
  Wallet as WalletIcon,
  History,
  QrCode,
  AlertTriangle,
} from 'lucide-react';

type Tab = 'overview' | 'deposit' | 'withdraw' | 'transfer' | 'history';

export default function WalletPage() {
  const { user } = useAuth();
  const { assets } = useSettings();
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedAsset, setSelectedAsset] = useState('USDT');
  const [depositAddress, setDepositAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('wallets').select('*').eq('user_id', user.id).then(({ data }) => {
      if (data) setWallets(data as WalletType[]);
    });
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setTransactions(data as Transaction[]);
      });
  }, [user]);

  const getWallet = (symbol: string) => wallets.find((w) => w.asset_symbol === symbol);
  const selectedWallet = getWallet(selectedAsset);
  const selectedAssetData = assets.find((a) => a.symbol === selectedAsset);

  const handleGenerateAddress = () => {
    setDepositAddress(generateDemoAddress(selectedAsset));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async () => {
    if (!user || !selectedWallet) return;
    const amount = 100;
    const tx = {
      user_id: user.id,
      type: 'deposit',
      asset_symbol: selectedAsset,
      amount,
      status: 'completed',
      tx_hash: generateDemoTxHash(),
      address: depositAddress,
      is_demo: true,
    };
    const { data } = await supabase.from('transactions').insert(tx).select().maybeSingle();
    if (data) {
      setTransactions((prev) => [data as Transaction, ...prev]);
      await supabase
        .from('wallets')
        .update({ balance: selectedWallet.balance + amount, available: selectedWallet.available + amount })
        .eq('id', selectedWallet.id);
      setWallets((prev) =>
        prev.map((w) =>
          w.id === selectedWallet.id ? { ...w, balance: w.balance + amount, available: w.available + amount } : w
        )
      );
      setSuccess(`Demo deposit of ${amount} ${selectedAsset} completed successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !selectedWallet) return;
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > selectedWallet.available) return;

    const tx = {
      user_id: user.id,
      type: 'withdrawal',
      asset_symbol: selectedAsset,
      amount,
      status: 'pending',
      tx_hash: generateDemoTxHash(),
      address: withdrawAddress,
      is_demo: true,
    };
    const { data } = await supabase.from('transactions').insert(tx).select().maybeSingle();
    if (data) {
      setTransactions((prev) => [data as Transaction, ...prev]);
      await supabase
        .from('wallets')
        .update({ balance: selectedWallet.balance - amount, available: selectedWallet.available - amount })
        .eq('id', selectedWallet.id);
      setWallets((prev) =>
        prev.map((w) =>
          w.id === selectedWallet.id ? { ...w, balance: w.balance - amount, available: w.available - amount } : w
        )
      );
      setWithdrawAmount('');
      setWithdrawAddress('');
      setSuccess(`Demo withdrawal of ${amount} ${selectedAsset} submitted.`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleTransfer = async () => {
    if (!user) return;
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) return;

    const tx = {
      user_id: user.id,
      type: 'transfer',
      asset_symbol: selectedAsset,
      amount,
      status: 'completed',
      address: transferTo,
      is_demo: true,
    };
    const { data } = await supabase.from('transactions').insert(tx).select().maybeSingle();
    if (data) {
      setTransactions((prev) => [data as Transaction, ...prev]);
      setTransferAmount('');
      setTransferTo('');
      setSuccess(`Demo transfer of ${amount} ${selectedAsset} completed.`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const totalValue = wallets.reduce((sum, w) => {
    const asset = assets.find((a) => a.symbol === w.asset_symbol);
    return sum + w.balance * (asset?.price || 0);
  }, 0);

  const tabs: { key: Tab; label: string; icon: typeof WalletIcon }[] = [
    { key: 'overview', label: 'Overview', icon: WalletIcon },
    { key: 'deposit', label: 'Deposit', icon: ArrowDownLeft },
    { key: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
    { key: 'transfer', label: 'Transfer', icon: Send },
    { key: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <p className="text-dark-400 mt-1">Manage your deposits, withdrawals, and transfers</p>
        <div className="mt-3 inline-flex items-center gap-2 badge badge-demo">
          <AlertTriangle className="w-3.5 h-3.5" />
          Demo/Sandbox Mode - All transactions are simulated
        </div>
      </div>

      {/* Balance Card */}
      <div className="card p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <p className="text-dark-400 text-sm">Total Wallet Balance</p>
          <p className="text-3xl font-bold text-white mt-2">{formatCurrency(totalValue)}</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setActiveTab('deposit')} className="btn-primary text-sm">
              <ArrowDownLeft className="w-4 h-4 inline mr-1" /> Deposit
            </button>
            <button onClick={() => setActiveTab('withdraw')} className="btn-secondary text-sm">
              <ArrowUpRight className="w-4 h-4 inline mr-1" /> Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto no-scrollbar border-b border-dark-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.key ? 'text-brand-400 border-brand-500' : 'text-dark-400 border-transparent hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {success && (
        <div className="mb-4 bg-success-500/10 border border-success-500/30 rounded-xl px-4 py-3 text-sm text-success-400 animate-fade-in">
          {success}
        </div>
      )}

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-dark-400 text-xs uppercase border-b border-dark-700">
                  <th className="text-left px-6 py-3">Asset</th>
                  <th className="text-right px-6 py-3">Total Balance</th>
                  <th className="text-right px-6 py-3 hidden sm:table-cell">Available</th>
                  <th className="text-right px-6 py-3 hidden md:table-cell">In Order</th>
                  <th className="text-right px-6 py-3 hidden lg:table-cell">Value (USD)</th>
                  <th className="text-right px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const wallet = getWallet(asset.symbol);
                  const balance = wallet?.balance || 0;
                  const available = wallet?.available || 0;
                  const inOrder = wallet?.in_order || 0;
                  return (
                    <tr key={asset.id} className="border-b border-dark-700/30 hover:bg-dark-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <AssetIcon symbol={asset.symbol} size="sm" />
                          <div>
                            <p className="text-white font-medium text-sm">{asset.symbol}</p>
                            <p className="text-dark-400 text-xs">{asset.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right px-6 py-4 text-white font-medium">{balance.toFixed(4)}</td>
                      <td className="text-right px-6 py-4 text-dark-200 hidden sm:table-cell">{available.toFixed(4)}</td>
                      <td className="text-right px-6 py-4 text-dark-400 hidden md:table-cell">{inOrder.toFixed(4)}</td>
                      <td className="text-right px-6 py-4 text-white hidden lg:table-cell">{formatCurrency(balance * asset.price)}</td>
                      <td className="text-right px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { setSelectedAsset(asset.symbol); setActiveTab('deposit'); }}
                            className="px-2.5 py-1 rounded-lg bg-success-500/10 text-success-400 hover:bg-success-500/20 text-xs font-medium transition-all"
                          >
                            Deposit
                          </button>
                          <button
                            onClick={() => { setSelectedAsset(asset.symbol); setActiveTab('withdraw'); }}
                            className="px-2.5 py-1 rounded-lg bg-danger-500/10 text-danger-400 hover:bg-danger-500/20 text-xs font-medium transition-all"
                          >
                            Withdraw
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deposit */}
      {activeTab === 'deposit' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="text-white font-medium mb-4">Select Asset</h3>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => { setSelectedAsset(asset.symbol); setDepositAddress(''); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    selectedAsset === asset.symbol ? 'bg-brand-500/15 text-brand-400' : 'hover:bg-dark-800 text-dark-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AssetIcon symbol={asset.symbol} size="sm" />
                    <span className="text-sm font-medium">{asset.symbol}</span>
                  </div>
                  <span className="text-xs text-dark-400">{formatPrice(asset.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 card p-6">
            <h3 className="text-white font-medium mb-2">Deposit {selectedAsset}</h3>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-6 text-xs text-amber-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>This is a DEMO deposit address. No real blockchain transaction will occur. Do not send real cryptocurrency to this address.</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Deposit Address</label>
                {!depositAddress ? (
                  <button onClick={handleGenerateAddress} className="btn-primary w-full">
                    Generate Demo Address
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 flex items-center gap-3">
                      <QrCode className="w-5 h-5 text-dark-400 flex-shrink-0" />
                      <code className="text-sm text-white truncate">{depositAddress}</code>
                    </div>
                    <button onClick={handleCopy} className="btn-secondary px-3 py-3">
                      {copied ? <Check className="w-4 h-4 text-success-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>

              {depositAddress && (
                <>
                  <div className="bg-dark-900/50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-400">Network</span>
                      <span className="text-white">{selectedAsset} Network</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Min Deposit</span>
                      <span className="text-white">0.0001 {selectedAsset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Confirmations</span>
                      <span className="text-white">3 blocks</span>
                    </div>
                  </div>

                  <button onClick={handleDeposit} className="btn-primary w-full">
                    Simulate Demo Deposit (100 {selectedAsset})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Withdraw */}
      {activeTab === 'withdraw' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="text-white font-medium mb-4">Select Asset</h3>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    selectedAsset === asset.symbol ? 'bg-brand-500/15 text-brand-400' : 'hover:bg-dark-800 text-dark-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AssetIcon symbol={asset.symbol} size="sm" />
                    <div>
                      <span className="text-sm font-medium">{asset.symbol}</span>
                      <p className="text-xs text-dark-400">{(getWallet(asset.symbol)?.available || 0).toFixed(4)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 card p-6">
            <h3 className="text-white font-medium mb-2">Withdraw {selectedAsset}</h3>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-6 text-xs text-amber-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>DEMO/SANDBOX mode. No real funds will be sent. This is for testing purposes only.</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Available Balance</label>
                <div className="bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white">
                  {(selectedWallet?.available || 0).toFixed(4)} {selectedAsset}
                </div>
              </div>

              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Withdrawal Address</label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder={`Enter ${selectedAsset} address`}
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Amount</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field"
                />
                <div className="flex justify-between mt-2 text-xs text-dark-400">
                  <span>Min: 0.001 {selectedAsset}</span>
                  <button
                    onClick={() => setWithdrawAmount((selectedWallet?.available || 0).toString())}
                    className="text-brand-400 hover:text-brand-300"
                  >
                    Max
                  </button>
                </div>
              </div>

              <div className="bg-dark-900/50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Network Fee</span>
                  <span className="text-white">0.0001 {selectedAsset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">You Will Receive</span>
                  <span className="text-white">{(parseFloat(withdrawAmount || '0') - 0.0001).toFixed(4)} {selectedAsset}</span>
                </div>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || !withdrawAddress || parseFloat(withdrawAmount) > (selectedWallet?.available || 0)}
                className="btn-primary w-full disabled:opacity-50"
              >
                Submit Demo Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer */}
      {activeTab === 'transfer' && (
        <div className="max-w-2xl mx-auto">
          <div className="card p-6">
            <h3 className="text-white font-medium mb-2">Transfer {selectedAsset}</h3>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-6 text-xs text-amber-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>DEMO/SANDBOX mode. Transfers are simulated and no real funds are moved.</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Asset</label>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="input-field"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.symbol}>{a.symbol} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Recipient Email or User ID</label>
                <input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="user@example.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Amount</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field"
                />
                <p className="text-xs text-dark-400 mt-2">
                  Available: {(selectedWallet?.available || 0).toFixed(4)} {selectedAsset}
                </p>
              </div>

              <button
                onClick={handleTransfer}
                disabled={!transferAmount || !transferTo}
                className="btn-primary w-full disabled:opacity-50"
              >
                Send Demo Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-dark-400 text-xs uppercase border-b border-dark-700">
                  <th className="text-left px-6 py-3">Type</th>
                  <th className="text-left px-6 py-3">Asset</th>
                  <th className="text-right px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3 hidden sm:table-cell">Address</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Tx Hash</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-right px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-dark-700/30 hover:bg-dark-800/50">
                      <td className="px-6 py-4">
                        <span className={`badge capitalize ${
                          tx.type === 'deposit' ? 'bg-success-500/10 text-success-400' :
                          tx.type === 'withdrawal' ? 'bg-danger-500/10 text-danger-400' :
                          'bg-brand-500/10 text-brand-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">{tx.asset_symbol}</td>
                      <td className="text-right px-6 py-4 text-white font-medium">{tx.amount}</td>
                      <td className="px-6 py-4 text-dark-300 text-xs hidden sm:table-cell">
                        {tx.address ? shortAddress(tx.address) : '--'}
                      </td>
                      <td className="px-6 py-4 text-dark-300 text-xs hidden md:table-cell">
                        {tx.tx_hash ? shortAddress(tx.tx_hash) : '--'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge capitalize ${
                          tx.status === 'completed' ? 'badge-success' :
                          tx.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'badge-danger'
                        }`}>
                          {tx.status}
                        </span>
                        {tx.is_demo && <span className="badge badge-demo ml-1">DEMO</span>}
                      </td>
                      <td className="text-right px-6 py-4 text-dark-400 text-xs">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-dark-400">No transactions yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
