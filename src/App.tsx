import { useEffect, useMemo, useState } from "react";

/** =========================
 *  Smart Money — Dark Glass UI (Single Splash + Full Sections)
 *  React + TS + TailwindCSS
 * ========================= */

type Route = "splash" | "login" | "register" | "dashboard" | "profile";
type Tab =
  | "smartWallet"
  | "moneyTransfer"
  | "cash"
  | "p2p"
  | "companies"
  | "inbox"
  | "reports"
  | "crypto"; // CRYPTO: تبويب جديد للعملات الرقمية

type Tx = { id: string; date: string; desc: string; amount: number; currency: string; tag?: string };
type Account = { id: string; name: string; iban: string; balance: number; currency: string };

// CRYPTO: نوع بسيط لأصول العملات الرقمية
type CryptoAsset = {
  id: string;
  symbol: string;
  name: string;
  amount: number; // كمية العملة
  priceUsd: number; // سعر تقريبي بالدولار (للديمو فقط)
};

const COLORS = {
  bg:        "#0A0F1C",
  glass:     "rgba(255,255,255,0.06)",
  border:    "rgba(255,255,255,0.12)",
  text:      "#E9EEF9",
  mutetext:  "#9AA6C3",
  primary:   "#1F3EDC",
  primary2:  "#142AA4",
  accent:    "#00BDF2",
  success:   "#3EB489",
  danger:    "#E65353",
};

const glass = "backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.45)]";

export default function App() {
  const [route, setRoute] = useState<Route>("splash");
  const [tab, setTab] = useState<Tab>("smartWallet");

  // Accounts + sample TXs
  const [accounts, setAccounts] = useState<Account[]>([
    { id:"ACC-1", name:"Main (SAR)", iban:"SA03 8000 1234 5678", balance: 4320.75, currency:"SAR" },
    { id:"ACC-2", name:"USD Wallet", iban:"US12 **** 9988", balance: 820.00, currency:"USD" },
  ]);
  const [txs, setTxs] = useState<Tx[]>([
    { id:"TX-1002", date: "2025-11-04", desc: "Cash Deposit", amount: +1200, currency:"SAR", tag:"deposit" },
    { id:"TX-1003", date: "2025-11-06", desc: "Transfer to USD", amount: -500, currency:"SAR", tag:"transfer" },
    { id:"TX-1004", date: "2025-11-06", desc: "FX SAR→USD", amount: +133.0, currency:"USD", tag:"fx" },
    { id:"TX-1005", date: "2025-11-07", desc: "Coffee", amount: -18, currency:"SAR", tag:"purchase" },
    { id:"TX-1006", date: "2025-11-08", desc: "Gym Membership", amount: -120, currency:"SAR", tag:"subscription" },
  ]);

  const totalSar = useMemo(()=> accounts.reduce((s,a)=> s + (a.currency==="SAR"? a.balance: 0), 0), [accounts]);
  const usd      = useMemo(()=> accounts.find(a=>a.currency==="USD")?.balance||0, [accounts]);

  // CRYPTO: حالة المحفظة الرقمية حسب التقرير (محفظة عملات رقمية منفصلة)
  const [cryptoAssets] = useState<CryptoAsset[]>([
    { id: "CR-1", symbol: "BTC", name: "Bitcoin",  amount: 0.12, priceUsd: 68000 },
    { id: "CR-2", symbol: "ETH", name: "Ethereum", amount: 1.8,  priceUsd: 3600 },
    { id: "CR-3", symbol: "USDT", name: "Tether",  amount: 1500, priceUsd: 1 },
  ]);

  const totalCryptoUsd = useMemo(
    () => cryptoAssets.reduce((s, a) => s + a.amount * a.priceUsd, 0),
    [cryptoAssets]
  );

  // افتراض بسيط لتحويل USD إلى SAR (فقط للعرض – المحاكاة في التقرير)
  const totalCryptoSar = useMemo(() => totalCryptoUsd * 3.75, [totalCryptoUsd]);

  /* ---------- ROUTES ---------- */

  if(route==="splash") return (
    <SplashOne onDone={()=> setRoute("login")} />
  );

  if(route==="login") return (
    <AuthLogin
      onRegister={()=> setRoute("register")}
      onSuccess={()=> setRoute("dashboard")}
    />
  );

  if(route==="register") return (
    <AuthRegister
      onLogin={()=> setRoute("login")}
      onSuccess={()=> setRoute("dashboard")}
    />
  );

  if(route==="profile") return (
    <Profile onBack={()=> setRoute("dashboard")} />
  );

  /* ---------- DASHBOARD (all sections) ---------- */

  return (
    <div className="min-h-screen w-full relative" style={{ background: COLORS.bg, color: COLORS.text }}>
      <BackgroundOrbs />

      <TopBar onProfile={()=> setRoute("profile")} />

      <div className="sticky top-0 z-20">
        <NavTabs tab={tab} setTab={setTab} />
      </div>

      <main className="max-w-6xl mx-auto p-4 md:p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
        {tab==="smartWallet"   && <Card><SmartWallet totalSar={totalSar} usd={usd} txs={txs} jump={setTab} /></Card>}
        {tab==="moneyTransfer" && <Card><Transfers onTransfer={(amt)=> makeTransfer(amt)} /></Card>}
        {tab==="cash"          && <Card><CashOps onDeposit={deposit} onWithdraw={withdraw} onPurchase={purchase} /></Card>}
        {tab==="p2p"           && <Card><P2P onSend={(u,a)=> sendP2P(u,a)} /></Card>}
        {tab==="companies"     && <Card><Companies vendors={[{id:"V1",name:"Electricity Bills"},{id:"V2",name:"Telecom Co."}]} onPay={(n)=> payVendor(n)} onInvoice={(n)=> invoice(n)} /></Card>}
        {tab==="inbox"         && <Card><Inbox alerts={[
          "⚠️ Electricity bill due in 4 days",
          "🔐 Security policy update",
          "🎉 You received a transfer"
        ]} /></Card>}
        {tab==="reports"       && <Card><Reports txs={txs} /></Card>}
        {tab==="crypto"        && ( // CRYPTO: القسم الجديد
          <Card>
            <CryptoWalletSection
              assets={cryptoAssets}
              totalUsd={totalCryptoUsd}
              totalSar={totalCryptoSar}
              onBridgeFromCash={() =>
                alert("Demo: تحويل من المحفظة النقدية إلى محفظة العملات الرقمية / العكس حسب التقرير.")
              }
              onWithdrawToExchange={() =>
                alert("Demo: سحب إلى منصة عملات رقمية أو محفظة خارجية كما هو مذكور في التقرير.")
              }
            />
          </Card>
        )}
      </main>

      <BottomBar tab={tab} setTab={setTab} />
    </div>
  );

  /* ---------- actions ---------- */
  function deposit(amount:number){
    if(amount<=0) return;
    setAccounts(a=> a.map(ac=> ac.id==="ACC-1"? {...ac, balance: ac.balance + amount}: ac));
    setTxs(prev=> [{ id:`TX-${Date.now()}`, date:ymd(new Date()), desc:`Cash Deposit`, amount:amount, currency:"SAR", tag:"deposit" }, ...prev]);
  }
  function withdraw(amount:number){
    if(amount<=0) return;
    setAccounts(a=> a.map(ac=> ac.id==="ACC-1"? {...ac, balance: ac.balance - amount}: ac));
    setTxs(prev=> [{ id:`TX-${Date.now()}`, date:ymd(new Date()), desc:`Cash Withdraw`, amount:-amount, currency:"SAR", tag:"withdraw" }, ...prev]);
  }
  function purchase(desc:string, amount:number){
    if(amount<=0) return;
    setTxs(prev=> [{ id:`TX-${Date.now()}`, date:ymd(new Date()), desc:`Purchase: ${desc}`, amount:-amount, currency:"SAR", tag:"purchase" }, ...prev]);
  }
  function makeTransfer(amount=250){
    if(amount<=0) return;
    setAccounts(a=> a.map(ac=> ac.id==="ACC-1"? {...ac, balance: ac.balance - amount}: ac));
    setTxs(prev=> [{ id:`TX-${Date.now()}`, date:ymd(new Date()), desc:"Internal Transfer", amount:-amount, currency:"SAR", tag:"transfer" }, ...prev]);
    alert(`Transfer ${amount} SAR (demo)`);
  }
  function sendP2P(user:string, amount:number){
    if(!user || amount<=0) return;
    setTxs(prev=> [{ id:`TX-${Date.now()}`, date:ymd(new Date()), desc:`P2P → ${user}`, amount:-amount, currency:"SAR", tag:"p2p" }, ...prev]);
  }
  function payVendor(name:string){
    const amt = 150 + Math.round(Math.random()*200);
    setTxs(prev=> [{ id:`TX-${Date.now()}`, date:ymd(new Date()), desc:`Vendor: ${name}`, amount:-amt, currency:"SAR", tag:"vendor" }, ...prev]);
  }
  function invoice(name:string){
    alert(`Generated invoice (demo) for ${name} with QR • Ref INV-${Date.now()}`);
  }
}

/* ======================= BG & Splash ======================= */

function BackgroundOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-[700px] h-[700px] rounded-full blur-3xl opacity-60"
           style={{ background: `radial-gradient(70% 70% at 50% 50%, ${COLORS.primary}33, transparent 70%)` }}/>
      <div className="absolute -bottom-24 -right-28 w-[780px] h-[780px] rounded-full blur-3xl opacity-60"
           style={{ background: `radial-gradient(70% 70% at 50% 50%, ${COLORS.accent}2e, transparent 70%)` }}/>
      <div className="absolute inset-0 opacity-[0.06] mix-blend-screen"
           style={{ backgroundImage:"linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize:"34px 34px" }}/>
    </div>
  );
}

function SplashOne({ onDone }:{ onDone:()=>void }){
  useEffect(()=>{ const t=setTimeout(onDone, 1200); return ()=> clearTimeout(t); },[onDone]);
  return (
    <div className="min-h-screen w-full grid place-items-center relative" style={{ background: COLORS.bg, color: COLORS.text }}>
      <BackgroundOrbs />
      <div className={`w-[92%] max-w-[760px] rounded-3xl p-10 text-center ${glass}`}>
        <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-2xl"
             style={{ background:`linear-gradient(135deg, ${COLORS.primary2}, ${COLORS.primary})`, boxShadow:`0 20px 60px ${COLORS.primary}55` }}>
          💼
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-wide">Smart Money</h1>
        <p className="mt-2 text-sm" style={{ color: COLORS.mutetext }}>
          Wallet • Transfers • Pay • Vendors • Mail • Reports
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <LoaderBar />
        </div>
      </div>
    </div>
  );
}

function LoaderBar(){
  return (
    <div className="w-40 h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full animate-loader"
        style={{
          background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.primary})`,
          width: "40%",
        }}
      />
      <style>{`
        @keyframes loader { 
          0% { transform: translateX(-150%); } 
          100% { transform: translateX(350%);} 
        }
        .animate-loader { animation: loader 1s ease-in-out infinite; }
      `}</style>
    </div>
  );
}


/* ======================= Top / Nav / Bottom ======================= */

function TopBar({ onProfile }:{ onProfile:()=>void }){
  return (
    <header className="sticky top-0 z-30 px-4 py-3 border-b bg-white/5 backdrop-blur"
            style={{borderColor: COLORS.border}}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
               style={{background:`linear-gradient(135deg, ${COLORS.primary2}, ${COLORS.primary})`}}>💼</div>
          <div className="font-semibold">Smart Money</div>
        </div>
        <button className="text-sm rounded-xl px-3 py-1.5 border bg-white/5"
                style={{borderColor: COLORS.border}} onClick={onProfile}>Profile</button>
      </div>
    </header>
  );
}

function NavTabs({ tab, setTab }:{ tab:Tab; setTab:(t:Tab)=>void }){
  const items:{key:Tab; label:string; icon:string}[] = [
    { key:"smartWallet",   label:"Smart Wallet",        icon:"💼" },
    { key:"crypto",        label:"Digital Assets",      icon:"🪙" }, // CRYPTO: تبويب العملات الرقمية
    { key:"moneyTransfer", label:"Transfers",           icon:"🔁" },
    { key:"cash",          label:"Deposit/Withdraw/Pay",icon:"💳" },
    { key:"p2p",           label:"P2P",                 icon:"👥" },
    { key:"companies",     label:"Vendors",             icon:"🏢" },
    { key:"inbox",         label:"Mail & Alerts",       icon:"🔔" },
    { key:"reports",       label:"Reports",             icon:"📊" },
  ];
  return (
    <div className="bg-white/5 backdrop-blur border-b" style={{borderColor: COLORS.border}}>
      <div className="max-w-6xl mx-auto px-3 py-2 flex gap-2 overflow-auto">
        {items.map(i=>(
          <button key={i.key}
                  onClick={()=> setTab(i.key)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-2xl border transition"
                  style={{
                    borderColor: tab===i.key? "transparent" : COLORS.border,
                    background:  tab===i.key? `linear-gradient(135deg, ${COLORS.primary2}, ${COLORS.primary})` : "transparent",
                    color:       tab===i.key? "#fff" : COLORS.mutetext
                  }}>
            {i.icon} {i.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BottomBar({ tab, setTab }:{ tab:Tab; setTab:(t:Tab)=>void }){
  const items:{key:Tab; label:string; icon:string}[] = [
    { key:"smartWallet",   label:"Wallet",   icon:"💼" },
    { key:"crypto",        label:"Crypto",   icon:"🪙" }, // CRYPTO: اختصار في البوتوم بار
    { key:"moneyTransfer", label:"Transfer", icon:"🔁" },
    { key:"p2p",           label:"P2P",      icon:"👥" },
    { key:"companies",     label:"Vendors",  icon:"🏢" },
    { key:"reports",       label:"Reports",  icon:"📊" },
  ];
  return (
    <nav className="sticky bottom-0 z-20 border-t bg-white/5 backdrop-blur"
         style={{borderColor: COLORS.border}}>
      <div className="max-w-6xl mx-auto flex justify-around py-2 text-xs">
        {items.map(i=>(
          <button key={i.key} onClick={()=> setTab(i.key)}
                  className="flex flex-col items-center"
                  style={{color: tab===i.key? COLORS.accent : COLORS.mutetext}}>
            <span className="text-lg">{i.icon}</span>
            {i.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ======================= Cards / Layout ======================= */

function Card({ children }:{ children: React.ReactNode }) {
  return <div className={`rounded-2xl p-5 ${glass}`}>{children}</div>;
}

/* ======================= Sections ======================= */

function SmartWallet({ totalSar, usd, txs, jump }:{
  totalSar:number; usd:number; txs:Tx[]; jump:(t:Tab)=>void;
}){
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl p-6 text-white"
             style={{background:`linear-gradient(90deg, ${COLORS.primary2}, ${COLORS.primary})`, boxShadow:`0 20px 60px ${COLORS.primary}55`}}>
          <div className="text-sm/5 opacity-90">Total Balance (SAR)</div>
          <div className="text-3xl font-semibold">{totalSar.toLocaleString(undefined,{maximumFractionDigits:2})}</div>
          <div className="text-xs mt-1 opacity-90">USD Wallet: {usd.toFixed(2)}</div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {[{k:"moneyTransfer",l:"Transfers"},{k:"cash",l:"Deposit/Withdraw"},{k:"companies",l:"Pay Vendor"},{k:"reports",l:"Reports"}].map(x=>(
              <button key={x.k} onClick={()=> jump(x.k as Tab)} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30">{x.l}</button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-4" style={{borderColor: COLORS.border}}>
          <div className="font-semibold">Recent Activity</div>
          <div className="mt-3 space-y-2 text-sm max-h-64 overflow-auto">
            {txs.map(tx=>(
              <div key={tx.id} className="p-2 rounded-xl flex items-center justify-between border bg-white/5"
                   style={{borderColor: COLORS.border}}>
                <div>
                  <div className="font-medium">{tx.desc}</div>
                  <div className="text-xs" style={{color: COLORS.mutetext}}>{tx.date} · {tx.tag||'-'}</div>
                </div>
                <div style={{color: tx.amount<0? COLORS.danger: COLORS.success}} className="font-semibold">
                  {tx.amount>0? '+':''}{tx.amount.toFixed(2)} {tx.currency}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border p-4" style={{borderColor: COLORS.border}}>
          <div className="font-semibold mb-2">Quick Links</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button className="rounded-xl px-3 py-2 border bg-white/5" style={{borderColor: COLORS.border}} onClick={()=> jump("p2p")}>Send P2P</button>
            <button className="rounded-xl px-3 py-2 border bg-white/5" style={{borderColor: COLORS.border}} onClick={()=> jump("companies")}>Pay Vendor</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// CRYPTO: قسم محفظة العملات الرقمية كما في التقرير (رصيد منفصل + إيداع/سحب/تحويل)
function CryptoWalletSection({
  assets,
  totalUsd,
  totalSar,
  onBridgeFromCash,
  onWithdrawToExchange,
}:{
  assets: CryptoAsset[];
  totalUsd: number;
  totalSar: number;
  onBridgeFromCash: () => void;
  onWithdrawToExchange: () => void;
}) {
  return (
    <div className="space-y-4 text-sm">
      <div
        className="rounded-2xl p-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary2}, ${COLORS.accent})`,
          boxShadow: `0 20px 60px ${COLORS.accent}55`,
        }}
      >
        <div className="text-xs/5 opacity-90">Digital Assets Wallet (Crypto)</div>
        <div className="mt-1 text-2xl font-semibold">
          {totalSar.toLocaleString(undefined, { maximumFractionDigits: 2 })} SAR
        </div>
        <div className="text-xs mt-1 opacity-90">
          ≈ {totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full px-3 py-1 bg-white/20">
            • محفظة رقمية منفصلة عن النقد
          </span>
          <span className="rounded-full px-3 py-1 bg-white/20">
            • إيداع وسحب عبر منصات العملات الرقمية / محفظة خارجية
          </span>
          <span className="rounded-full px-3 py-1 bg-white/20">
            • إمكانية التحويل بين المحفظة النقدية والرقمية
          </span>
        </div>
      </div>

      <div className="rounded-2xl border p-4" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Portfolio</div>
          <div className="text-xs" style={{ color: COLORS.mutetext }}>
            Sample data for demo
          </div>
        </div>
        <div className="space-y-2 max-h-64 overflow-auto">
          {assets.map((asset) => {
            const valueUsd = asset.amount * asset.priceUsd;
            const valueSar = valueUsd * 3.75;
            return (
              <div
                key={asset.id}
                className="flex items-center justify-between rounded-xl px-3 py-2 border bg-white/5"
                style={{ borderColor: COLORS.border }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{asset.symbol}</span>
                    <span className="text-xs" style={{ color: COLORS.mutetext }}>
                      {asset.name}
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: COLORS.mutetext }}>
                    {asset.amount} {asset.symbol} · ≈{" "}
                    {valueUsd.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    USD
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {valueSar.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    SAR
                  </div>
                  <div className="flex gap-1 mt-1 text-[11px]">
                    <button
                      className="px-2 py-1 rounded-lg border bg-white/5"
                      style={{ borderColor: COLORS.border }}
                      onClick={onBridgeFromCash}
                    >
                      ↔︎ Bridge
                    </button>
                    <button
                      className="px-2 py-1 rounded-lg border bg-white/5"
                      style={{ borderColor: COLORS.border }}
                      onClick={onWithdrawToExchange}
                    >
                      ⤴ Withdraw
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border p-4" style={{ borderColor: COLORS.border }}>
        <div className="font-semibold mb-2">How it works (per report)</div>
        <ul className="list-disc list-inside space-y-1 text-xs" style={{ color: COLORS.mutetext }}>
          <li>محفظة العملات الرقمية لها عنوان خاص (Digital Wallet Address) مستقل عن المحفظة النقدية.</li>
          <li>الإيداع يتم من منصات عملات رقمية أو محافظ خارجية مرتبطة بالتطبيق.</li>
          <li>السحب يمكن أن يكون إلى منصة عملات رقمية أو محفظة خارجية أو عبر وسيط معتمد.</li>
          <li>يمكن للمستخدم التحويل بين الرصيد النقدي ورصيد العملات الرقمية داخلياً.</li>
          <li>كل عملية يتم توثيقها في الأرشيف المالي والتقارير المحاسبية كما ورد في المستند.</li>
        </ul>
      </div>
    </div>
  );
}

function Transfers({ onTransfer }:{ onTransfer:(amt:number)=>void }){
  const [amt,setAmt]=useState(250);
  return (
    <div className="grid md:grid-cols-2 gap-4 text-sm">
      <div className="rounded-2xl border p-4" style={{borderColor: COLORS.border}}>
        <div className="font-semibold mb-2">Internal / Local</div>
        <input className="w-full rounded-xl px-3 py-2 border bg-white/5" style={{borderColor: COLORS.border}} placeholder="Beneficiary" defaultValue="My USD Wallet"/>
        <input className="w-full rounded-xl px-3 py-2 border bg-white/5 mt-2" style={{borderColor: COLORS.border}} type="number" value={amt} onChange={e=> setAmt(+e.target.value)} />
        <button className="mt-2 rounded-xl px-4 py-2 text-white" style={{background:`linear-gradient(135deg, ${COLORS.primary2}, ${COLORS.primary})`}} onClick={()=> onTransfer(amt)}>Transfer</button>
      </div>
      <div className="rounded-2xl border p-4" style={{borderColor: COLORS.border}}>
        <div className="font-semibold mb-2">International (demo)</div>
        <input className="w-full rounded-xl px-3 py-2 border bg-white/5" style={{borderColor: COLORS.border}} placeholder="IBAN / SWIFT"/>
        <button className="mt-2 rounded-xl px-4 py-2 border bg-white/5" style={{borderColor: COLORS.border}}>Estimate Fees</button>
      </div>
    </div>
  );
}

function CashOps({ onDeposit, onWithdraw, onPurchase }:{
  onDeposit:(amt:number)=>void; onWithdraw:(amt:number)=>void; onPurchase:(desc:string, amt:number)=>void
}){
  const [dep,setDep]=useState(300); const [wd,setWd]=useState(200); const [pd,setPd]=useState(75); const [desc,setDesc]=useState("Groceries");
  return (
    <div className="grid md:grid-cols-3 gap-4 text-sm">
      <div className="rounded-2xl border p-4" style={{borderColor: COLORS.border}}>
        <div className="font-semibold mb-2">Deposit</div>
        <input className="w-full rounded-xl px-3 py-2 border bg-white/5" style={{borderColor: COLORS.border}} type="number" value={dep} onChange={e=> setDep(+e.target.value)} />
        <button className="mt-2 rounded-xl px-4 py-2 text-white" style={{background:`linear-gradient(135deg, ${COLORS.primary2}, ${COLORS.primary})`}} onClick={()=> onDeposit(dep)}>Add</button>
      </div>
      <div className="rounded-2xl border p-4" style={{borderColor: COLORS.border}}>
        <div className="font-semibold mb-2">Withdraw</div>
        <input className="w-full rounded-xl px-3 py-2 border bg-white/5" style={{borderColor: COLORS.border}} type="number" value={wd} onChange={e=> setWd(+e.target.value)} />
        <button className="mt-2 rounded-xl px-4 py-2 text-white" style={{background:`linear-gradient(135deg, ${COLORS.primary2}, ${COLORS.primary})`}} onClick={()=> onWithdraw(wd)}>Withdraw</button>
      </div>
      <div className="rounded-2xl border p-4" style={{borderColor: COLORS.border}}>
        <div className="font-semibold mb-2">Pay / Purchase</div>
        <input className="w-full rounded-xl px-3 py-2 border bg-white/5" style={{borderColor: COLORS.border}} value={desc} onChange={e=> setDesc(e.target.value)} />
        <input className="w-full rounded-xl px-3 py-2 border bg:white/5 mt-2" style={{borderColor: COLORS.border}} type="number" value={pd} onChange={e=> setPd(+e.target.value)} />
        <button className="mt-2 rounded-xl px-4 py-2 border bg-white/5" style={{borderColor: COLORS.border}} onClick={()=> onPurchase(desc, pd)}>Add Purchase</button>
      </div>
    </div>
  );
}

function P2P({ onSend }:{ onSend:(user:string, amt:number)=>void }){
  const [user,setUser]=useState("@ahmed"); const [amt,setAmt]=useState(150);
  return (
    <div className="grid md:grid-cols-2 gap-4 text-sm">
      <div className="rounded-2xl border p-4" style={{borderColor: COLORS.border}}>
        <div className="font-semibold mb-2">P2P Transfer</div>
        <input className="w-full rounded-xl px-3 py-2 border bg:white/5" style={{borderColor: COLORS.border}} placeholder="@username" value={user} onChange={e=> setUser(e.target.value)} />
        <input className="w-full rounded-xl px-3 py-2 border bg:white/5 mt-2" style={{borderColor: COLORS.border}} type="number" value={amt} onChange={e=> setAmt(+e.target.value)} />
        <button className="mt-2 rounded-xl px-4 py-2 text-white" style={{background:`linear-gradient(135deg, ${COLORS.primary2}, ${COLORS.primary})`}} onClick={()=> onSend(user, amt)}>Send</button>
      </div>
      <div className="rounded-2xl border p-4" style={{borderColor: COLORS.border}}>
        <div className="font-semibold mb-2">Quick Actions</div>
        <ul className="text-sm space-y-1">
          <li>🔗 Share payment link</li>
          <li>🧾 Create mini-invoice</li>
        </ul>
      </div>
    </div>
  );
}

function Companies({ vendors, onPay, onInvoice }:{
  vendors:{id:string; name:string}[]; onPay:(name:string)=>void; onInvoice:(name:string)=>void
}){
  return (
    <div>
      <div className="font-semibold mb-2">Businesses & Vendors</div>
      <div className="grid md:grid-cols-3 gap-3">
        {vendors.map(v=>(
          <div key={v.id} className={`p-4 rounded-2xl ${glass}`}>
            <div className="flex items-center justify-between mb-3">
              <div>{v.name}</div>
              <button className="px-3 py-1.5 rounded-xl text-white"
                      style={{background:`linear-gradient(135deg, ${COLORS.primary2}, ${COLORS.primary})`}}
                      onClick={()=> onPay(v.name)}>Pay</button>
            </div>
            <div className="flex gap-2 text-xs">
              <button className="px-2 py-1 rounded-lg border bg-white/5" style={{borderColor: COLORS.border}} onClick={()=> onInvoice(v.name)}>Generate Invoice + QR</button>
              <button className="px-2 py-1 rounded-lg border bg:white/5" style={{borderColor: COLORS.border}}>Upload Bill</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Inbox({ alerts }:{ alerts:string[] }){
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className={`p-4 rounded-2xl ${glass}`}>
        <div className="font-semibold mb-2">Alerts</div>
        <ul className="text-sm space-y-2">
          {alerts.map((n,i)=> (<li key={i} className="p-3 rounded-xl border bg-white/5" style={{borderColor: COLORS.border}}>{n}</li>))}
        </ul>
      </div>
      <div className={`p-4 rounded-2xl ${glass}`}>
        <div className="font-semibold mb-2">Mail (demo)</div>
        <ul className="space-y-2 text-sm">
          <li className="p-3 rounded-xl border bg:white/5" style={{borderColor: COLORS.border}}>📧 Monthly Statement</li>
          <li className="p-3 rounded-xl border bg:white/5" style={{borderColor: COLORS.border}}>🎁 New reward offer</li>
        </ul>
      </div>
    </div>
  );
}

function Reports({ txs }:{ txs:Tx[] }){
  const income = txs.filter(t=> t.amount>0).reduce((s,t)=> s+t.amount,0);
  const spend  = txs.filter(t=> t.amount<0 && t.currency==="SAR").reduce((s,t)=> s+Math.abs(t.amount),0);
  const saving = Math.max(0, income - spend);
  const burn   = Math.round((spend/Math.max(1, income+spend))*100);
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Metric title="Income"  value={`${income.toFixed(2)} SAR`} color={COLORS.success}/>
      <Metric title="Spending" value={`${spend.toFixed(2)} SAR`} color={COLORS.danger}/>
      <Metric title="Savings" value={`${saving.toFixed(2)} SAR`} color={COLORS.accent}/>
      <div className={`md:col-span-3 p-4 rounded-2xl ${glass}`}>
        <div className="text-sm">Spend Burn (approx.)</div>
        <div className="w-full h-2 bg:white/10 rounded-full mt-2">
          <div className="h-2 rounded-full" style={{width:`${burn}%`, background:`linear-gradient(90deg, ${COLORS.accent}, ${COLORS.primary})`}}/>
        </div>
      </div>
    </div>
  );
}
function Metric({title,value,color}:{title:string;value:string;color:string}){
  return (
    <div className={`p-4 rounded-2xl ${glass}`}>
      <div className="text-sm">{title}</div>
      <div className="text-2xl font-semibold" style={{color}}>{value}</div>
    </div>
  );
}

/* ======================= Profile ======================= */

function Profile({ onBack }:{ onBack:()=>void }){
  return (
    <div className="min-h-screen w-full relative" style={{ background: COLORS.bg, color: COLORS.text }}>
      <BackgroundOrbs />
      <div className="max-w-5xl mx-auto p-6 md:p-10 grid lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-3xl ${glass}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                 style={{background:`linear-gradient(135deg, ${COLORS.primary2}, ${COLORS.accent})`}}>🧑🏻</div>
            <div>
              <div className="font-semibold text-lg">Omar Al-Fintech</div>
              <div className="text-xs" style={{color: COLORS.mutetext}}>user@smart.money</div>
            </div>
          </div>
          <div className="mt-6 text-sm space-y-2">
            <Row k="Plan" v="Free"/>
            <Row k="2FA" v="Enabled"/>
            <Row k="Language" v="English"/>
          </div>
          <button className="mt-6 w-full rounded-2xl px-4 py-3 text:white"
                  style={{background:`linear-gradient(135deg, ${COLORS.primary2}, ${COLORS.primary})`}}
                  onClick={onBack}>Back to Dashboard</button>
        </div>

        <div className={`p-6 rounded-3xl ${glass}`}>
          <div className="text-sm text-white/80">Total Balance</div>
          <div className="text-3xl font-semibold mt-1">4,320.75 SAR</div>
          <div className="text-xs mt-1" style={{color: COLORS.mutetext}}>USD Wallet: 820.00</div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <button className="rounded-2xl px-4 py-3 border bg:white/5" style={{borderColor: COLORS.border}}>Transfers</button>
            <button className="rounded-2xl px-4 py-3 border bg:white/5" style={{borderColor: COLORS.border}}>Deposit / Withdraw</button>
            <button className="rounded-2xl px-4 py-3 border bg:white/5" style={{borderColor: COLORS.border}}>Pay Vendor</button>
            <button className="rounded-2xl px-4 py-3 border bg:white/5" style={{borderColor: COLORS.border}}>Reports</button>
          </div>
        </div>

        <div className={`p-6 rounded-3xl ${glass}`}>
          <div className="font-semibold">Recent Activity</div>
          <div className="mt-4 space-y-3 text-sm">
            {[
              { txt: "Cash Deposit", val: "+1200 SAR", color: COLORS.success },
              { txt: "Transfer to USD", val: "-500 SAR", color: COLORS.danger },
              { txt: "Coffee", val: "-18 SAR", color: COLORS.danger },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl border bg:white/5" style={{borderColor: COLORS.border}}>
                <span className="text-white/90">{r.txt}</span>
                <span className="font-medium" style={{ color: r.color }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function Row({k,v}:{k:string; v:string}){ return (
  <div className="flex items-center justify-between py-2 border-b last:border-0" style={{borderColor: COLORS.border}}>
    <span className="text-white/80">{k}</span><span className="text:white/60">{v}</span>
  </div>
); }

/* ======================= Auth ======================= */

function AuthLogin({ onRegister, onSuccess }:{ onRegister:()=>void; onSuccess:()=>void }){
  const [email,setEmail]=useState("user@smart.money");
  const [pass,setPass]=useState("");
  return (
    <div className="min-h-screen w-full grid place-items-center relative" style={{ background: COLORS.bg, color: COLORS.text }}>
      <BackgroundOrbs />
      <div className="w:[92%] max-w:[880px] grid md:grid-cols-2 gap-6">
        <div className={`rounded-3xl p-8 ${glass}`}>
          <h2 className="text-2xl font-semibold">Welcome back 👋</h2>
          <p className="mt-2 text-sm" style={{ color: COLORS.mutetext }}>
            Manage wallet, transfers, payments & reports in one place.
          </p>
          <ul className="mt-6 text-sm space-y-2 text:white/90">
            <li>• Encrypted sessions & audited logs</li>
            <li>• Country-aware compliance rules</li>
            <li>• Instant internal transfers</li>
          </ul>
        </div>
        <div className={`rounded-3xl p-8 ${glass}`}>
          <h3 className="text-xl font-medium">Login</h3>
          <div className="mt-4 space-y-3 text-sm">
            <input className="w-full rounded-2xl px-4 py-3 bg:white/5 border border:white/10 outline-none" placeholder="Email" value={email} onChange={e=> setEmail(e.target.value)}/>
            <input className="w-full rounded-2xl px-4 py-3 bg:white/5 border border:white/10 outline-none" placeholder="Password" type="password" value={pass} onChange={e=> setPass(e.target.value)}/>
            <button className="w-full rounded-2xl px-4 py-3 text:white shadow-lg hover:shadow-xl transition"
                    style={{background:`linear-gradient(135deg, ${COLORS.primary2}, ${COLORS.primary})`}}
                    onClick={onSuccess}>Sign in</button>
            <button className="w-full rounded-2xl px-4 py-3 border border:white/10 bg:white/5" onClick={onRegister}>Create account</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthRegister({ onLogin, onSuccess }:{ onLogin:()=>void; onSuccess:()=>void }){
  return (
    <div className="min-h-screen w-full grid place-items-center relative" style={{ background: COLORS.bg, color: COLORS.text }}>
      <BackgroundOrbs />
      <div className="w:[92%] max-w:[880px] grid md:grid-cols-2 gap-6">
        <div className={`rounded-3xl p-8 ${glass}`}>
          <h2 className="text-2xl font-semibold">Create your account 🚀</h2>
          <p className="mt-2 text-sm" style={{ color: COLORS.mutetext }}>Start with a secure smart wallet and grow.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
            <FeaturePill text="Smart Wallet" /><FeaturePill text="Transfers" />
            <FeaturePill text="Vendors" /><FeaturePill text="Reports" />
          </div>
        </div>
        <div className={`rounded-3xl p-8 ${glass}`}>
          <h3 className="text-xl font-medium">Sign up</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <input className="rounded-2xl px-4 py-3 bg:white/5 border border:white/10" placeholder="First name" />
            <input className="rounded-2xl px-4 py-3 bg:white/5 border border:white/10" placeholder="Last name" />
            <input className="col-span-2 rounded-2xl px-4 py-3 bg:white/5 border border:white/10" placeholder="Email" />
            <input className="col-span-2 rounded-2xl px-4 py-3 bg:white/5 border border:white/10" placeholder="Password" type="password" />
            <button className="col-span-2 mt-1 rounded-2xl px-4 py-3 text:white shadow-lg hover:shadow-xl transition"
                    style={{background:`linear-gradient(135deg, ${COLORS.primary2}, ${COLORS.primary})`}}
                    onClick={onSuccess}>Create account</button>
            <button className="col-span-2 rounded-2xl px-4 py-3 border border:white/10 bg:white/5" onClick={onLogin}>I already have an account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function FeaturePill({ text }:{ text:string }){ return <div className="rounded-full px-4 py-2 border border:white/10 bg:white/5 text:white/90">{text}</div>; }

/* ======================= Utils ======================= */
function ymd(d:Date){ const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dd}`; }
