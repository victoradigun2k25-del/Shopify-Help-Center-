
import React, { useState } from 'react';
// Fix: Use named imports for react-router-dom to resolve missing named export errors in this environment
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Layout, CreditCard, Truck, Snowflake, Flag, ArrowRightLeft, Settings, Grid, User, Globe, Home as HomeIcon, Package, Megaphone, BarChart, Users, Calculator, Wallet, Briefcase, Shield, Handshake } from 'lucide-react';
import { CATEGORIES, ARTICLES } from './constants';
import { UserSession } from './types';

const IconMap: Record<string, React.ElementType> = {
  Layout, CreditCard, Truck, Snowflake, Flag, ArrowRightLeft, Settings, Grid, User, Globe, Home: HomeIcon, Package, Megaphone, BarChart, Users, Calculator, Wallet, Briefcase, Shield, Handshake
};

interface HomeProps {
  user: UserSession;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<typeof ARTICLES>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 1) {
      const results = ARTICLES.filter(a => 
        a.title.toLowerCase().includes(term.toLowerCase()) || 
        a.content.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="bg-[#f6f6f7]">
      {/* Hero Section */}
      <div className="bg-white py-20 px-4 border-b border-gray-200">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">How can we help you?</h1>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              style={{ colorScheme: 'light' }}
              className="w-full pl-14 pr-4 py-4 rounded-xl text-lg border border-gray-200 shadow-xl focus:ring-2 focus:ring-emerald-400 outline-none transition-all placeholder-gray-400 text-gray-800 bg-white"
              placeholder="Search help articles..."
            />
            {/* Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-2xl overflow-hidden z-20 text-left border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                {searchResults.map(article => (
                  <Link 
                    key={article.id} 
                    to={`/article/${article.id}`}
                    className="block px-5 py-4 hover:bg-emerald-50 border-b last:border-0 border-gray-100 transition-colors"
                  >
                    <div className="font-semibold text-gray-900 mb-0.5">{article.title}</div>
                    <div className="text-sm text-gray-500 truncate">{article.excerpt}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {CATEGORIES.map(category => {
            const Icon = IconMap[category.iconName] || Grid;
            return (
              <Link 
                key={category.id} 
                to={`/category/${category.id}`}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300 group flex flex-col h-full"
              >
                {/* Visual Header */}
                <div className="h-40 w-full relative bg-gray-50 flex items-center justify-center overflow-hidden">
                   {category.imageUrl ? (
                     <img src={category.imageUrl} alt={category.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   ) : (
                     <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                            <Icon size={40} />
                        </div>
                     </div>
                   )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-2 flex items-center justify-between">
                    {category.title}
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{category.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Still Need Help Section */}
      <div className="bg-white py-20 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Still need help?</h2>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">Our support team is available 24/7 to assist you with any questions about setting up and growing your business.</p>
          <div className="inline-flex items-center justify-center p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 font-semibold shadow-sm">
             Open the chat widget in the bottom right corner to start a conversation.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;