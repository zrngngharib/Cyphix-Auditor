'use client';

import React from 'react';
import { ShieldAlert, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import { CodebaseSummary } from '@/lib/types';
import { formatBytes } from '@/lib/file-utils';
import { useLanguage } from '@/lib/LanguageContext';

interface SampleProjectsProps {
  onLoadSample: (summary: CodebaseSummary) => void;
  disabled?: boolean;
}

export const SampleProjects: React.FC<SampleProjectsProps> = ({
  onLoadSample,
  disabled = false,
}) => {
  const { t, dir } = useLanguage();

  const samples = [
    {
      id: 'nextjs-auth',
      title: t('sample1Title'),
      description: t('sample1Desc'),
      icon: ShieldAlert,
      tag: t('sample1Tag'),
      iconBg: 'bg-slate-900',
      files: [
        {
          name: 'package.json',
          path: 'package.json',
          size: 450,
          lineCount: 22,
          content: `{
  "name": "vulnerable-next-auth-demo",
  "version": "0.1.0",
  "dependencies": {
    "next": "14.2.0",
    "react": "18.2.0",
    "pg": "^8.11.0",
    "jsonwebtoken": "^9.0.2"
  }
}`,
        },
        {
          name: 'route.ts',
          path: 'app/api/auth/login/route.ts',
          size: 1100,
          lineCount: 35,
          content: `import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  // Vulnerability 1: Direct string interpolation SQL injection
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/db' });
  await client.connect();

  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  const res = await client.query(query);

  if (res.rows.length > 0) {
    // Vulnerability 2: Hardcoded secret and no expiry
    return NextResponse.json({ token: "SUPER_SECRET_TOKEN_ADMIN", user: res.rows[0] });
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}`,
        },
        {
          name: 'LoginForm.tsx',
          path: 'components/LoginForm.tsx',
          size: 1450,
          lineCount: 45,
          content: `'use client';
import { useState } from 'react';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      localStorage.setItem('auth_token', data.token);
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="w-[800px] p-6 bg-slate-900">
      <h1 className="text-2xl font-bold">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input 
        type="text" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        placeholder="Username" 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password" 
      />
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
}`,
        },
      ],
    },
    {
      id: 'ecommerce-cart',
      title: t('sample2Title'),
      description: t('sample2Desc'),
      icon: ShoppingBag,
      tag: t('sample2Tag'),
      iconBg: 'bg-slate-900',
      files: [
        {
          name: 'route.ts',
          path: 'app/api/checkout/route.ts',
          size: 1200,
          lineCount: 38,
          content: `import { NextRequest, NextResponse } from 'next/server';

let inventory = { "ITEM_1": 5 };

export async function POST(req: NextRequest) {
  const { itemId, quantity } = await req.json();

  if (inventory[itemId] >= quantity) {
    await new Promise(r => setTimeout(r, 100));
    inventory[itemId] -= quantity;
    return NextResponse.json({ success: true, remaining: inventory[itemId] });
  }

  return NextResponse.json({ error: "Out of stock" }, { status: 400 });
}`,
        },
        {
          name: 'CartDrawer.tsx',
          path: 'components/CartDrawer.tsx',
          size: 1300,
          lineCount: 42,
          content: `'use client';
import { useState, useEffect } from 'react';

export function CartDrawer() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => setItems(data));
  });

  return (
    <div className="p-4">
      <h2>Shopping Cart</h2>
      {items.map((item: any) => (
        <div key={item.id}>
          <span>{item.name}</span>
          <img src={item.image} />
        </div>
      ))}
    </div>
  );
}`,
        },
      ],
    },
  ];

  const handleSelectSample = (sample: (typeof samples)[0]) => {
    let totalChars = 0;
    let totalLines = 0;
    let totalBytes = 0;

    const files = sample.files.map((f) => {
      totalChars += f.content.length;
      totalLines += f.lineCount;
      totalBytes += f.size;
      return f;
    });

    const concatenatedCode = files
      .map(
        (f) =>
          `================================================================================\n` +
          `FILE: ${f.path}\n` +
          `================================================================================\n` +
          f.content +
          `\n\n`
      )
      .join('');

    onLoadSample({
      files,
      totalFiles: files.length,
      totalCharacters: totalChars,
      totalLines,
      totalSizeFormatted: formatBytes(totalBytes),
      concatenatedCode,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-slate-700" aria-hidden="true" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
          {t('sampleHeader')}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {samples.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              disabled={disabled}
              onClick={() => handleSelectSample(s)}
              className="p-6 rounded-3xl text-left rtl:text-right quantix-card group flex flex-col justify-between space-y-4 focus-ring min-h-[140px] cursor-pointer bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${s.iconBg} flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 group-hover:text-slate-700 transition-colors font-sans">
                      {s.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {t('sampleFilesCount', { count: s.files.length })}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0 font-sans">
                  {s.tag}
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 font-sans leading-relaxed">
                {s.description}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 group-hover:text-slate-950 pt-1">
                <span>{t('loadAndTestBtn')}</span>
                <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} aria-hidden="true" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
