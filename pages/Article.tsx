import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ARTICLES, CATEGORIES } from '../constants';
import { ChevronRight, ThumbsUp, ThumbsDown, ArrowLeft, Info } from 'lucide-react';

export const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const article = ARTICLES.find(a => a.id === id);
  const category = article ? CATEGORIES.find(c => c.id === article.categoryId) : null;

  if (!article || !category) return <div className="p-20 text-center text-gray-500">Article not found</div>;

  const handleContactSupport = () => {
    window.dispatchEvent(new CustomEvent('open-support-popup'));
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.includes('💡 Tip:')) {
        return (
          <div key={i} className="my-8 p-6 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg flex gap-4">
            <Info className="text-emerald-600 shrink-0" size={24} />
            <span className="text-emerald-800 font-medium italic">{line.replace('💡 Tip:', '').trim()}</span>
          </div>
        );
      }
      return <p key={i} className="mb-6 leading-relaxed text-gray-700 text-lg">{line}</p>;
    });
  };

  return (
    <div className="bg-[#f6f6f7] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center text-sm text-gray-500 mb-10 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
          <Link to="/" className="hover:text-shopify-green transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Home
          </Link>
          <ChevronRight size={14} className="mx-2 shrink-0" />
          <Link to={`/category/${category.id}`} className="hover:text-shopify-green font-medium">{category.title}</Link>
          <ChevronRight size={14} className="mx-2 shrink-0" />
          <span className="text-gray-400 truncate max-w-[200px] shrink-0">{article.title}</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
          <div className="p-8 sm:p-14">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-10 leading-tight">
              {article.title}
            </h1>
            <div className="prose prose-emerald max-w-none">
              {renderContent(article.content)}
            </div>
            <div className="mt-12 pt-12 border-t border-gray-100 flex flex-col items-center">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Was this article helpful?</h3>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all font-semibold text-gray-700"><ThumbsUp size={20} className="text-emerald-600" /> Yes</button>
                <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all font-semibold text-gray-700"><ThumbsDown size={20} className="text-red-500" /> No</button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 bg-shopify-dark rounded-[32px] text-white text-center shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
           <h4 className="text-2xl font-bold mb-3 relative z-10">Need personalized assistance?</h4>
           <p className="text-emerald-100 mb-8 max-w-md mx-auto relative z-10 opacity-90">Our Shopify support representatives are available around the clock to help you solve any issue.</p>
           <button onClick={handleContactSupport} className="bg-white text-shopify-dark px-10 py-4 rounded-2xl font-extrabold hover:bg-emerald-50 transition-all shadow-xl hover:scale-105 active:scale-95 relative z-10">
             Contact Support
           </button>
        </div>
      </div>
    </div>
  );
};
