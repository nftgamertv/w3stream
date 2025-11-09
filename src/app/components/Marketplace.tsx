'use client'
import React, { useState } from 'react';
import { Search, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface App {
  id: number;
  name: string;
  category: string;
  rating: number;
  installs: string;
}

const categories = [
  'All',
  'Productivity',
  'Design',
  'Development',
  'Marketing',
  'Finance',
  'Education',
];

const apps: App[] = [
  { id: 1, name: 'Figma', category: 'Design', rating: 4.9, installs: '1M+' },
  { id: 2, name: 'VS Code', category: 'Development', rating: 4.8, installs: '5M+' },
  { id: 3, name: 'Notion', category: 'Productivity', rating: 4.7, installs: '10M+' },
  { id: 4, name: 'Slack', category: 'Productivity', rating: 4.6, installs: '20M+' },
  { id: 5, name: 'Photoshop', category: 'Design', rating: 4.5, installs: '5M+' },
  { id: 6, name: 'Mailchimp', category: 'Marketing', rating: 4.4, installs: '2M+' },
  { id: 7, name: 'QuickBooks', category: 'Finance', rating: 4.3, installs: '3M+' },
  { id: 8, name: 'Duolingo', category: 'Education', rating: 4.7, installs: '50M+' },
];

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter apps based on search term and selected category
  const filteredApps = apps.filter(
    (app) =>
      (selectedCategory === 'All' || app.category === selectedCategory) &&
      app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 z-50 isolate
    ">
      {/* Header */}
      <header className="bg-gray-800 py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">App Marketplace</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search apps..."
              className="pl-10 pr-4 py-2 bg-gray-700 text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="flex">
        {/* Sidebar for Categories */}
        <aside className="w-64 bg-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category}>
                <Button
                  variant={selectedCategory === category ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content with Card Grid */}
        <section className="flex-1 p-6">
          {filteredApps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105"
                >
                  <div className="h-60 bg-gray-700"></div>
                  <div className="px-4 py-2 flex flex-row justify-between">
                    <div className='flex flex-col'>
                      <h3 className="text-lg font-semibold mb-2">{app.name}</h3>
                      <div className="flex items-center mb-2">
                        <Star className="h-5 w-5 text-yellow-400 mr-1" />
                        <span>{app.rating}</span>
                      </div>
                    </div>
                    <div className='flex flex-col justify-end mb-2 items-center'>
                      <p className="text-sm text-gray-400 ">{app.category}</p>
                      <p className="text-sm text-gray-400">{app.installs} installs</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-blue-600 text-center text-white font-medium cursor-pointer">
                    Install
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">No apps found.</div>
          )}
        </section>
      </main>
    </div>
  );
}