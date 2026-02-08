
import React from 'react';
// Fix: Use namespace import for react-router-dom to resolve missing named export errors in this environment
import * as ReactRouterDOM from 'react-router-dom';
import { ARTICLES, CATEGORIES } from '../constants';
import { ChevronRight, ThumbsUp, ThumbsDown, ArrowLeft, Info } from 'lucide-react';

const { useParams, Link } = ReactRouterDOM;

export const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const article = ARTICLES.find(a => a.id === id);
  const category = article ? CATEGORIES.find(c => c.id === article.categoryId) : null;

  if (!article || !category) return <div className="p-20 text-center text-gray-500">Article not found</div>;

  // Function to process content and highlight tips
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
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-10 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Home
          </Link>
          <ChevronRight size={14} className="mx-2 shrink-0" />
          <Link to={`/category/${category.id}`} className="hover:text-emerald-600 font-medium">{category.title}</Link>
          <ChevronRight size={14} className="mx-2 shrink-0" />
          <span className="text-gray-400 truncate max-w-[200px] shrink-0">{article.title}</span>
        </div>

        {/* Article Body */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
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
                <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all font-semibold text-gray-700">
                  <ThumbsUp size={20} className="text-emerald-600" /> Yes
                </button>
                <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all font-semibold text-gray-700">
                  <ThumbsDown size={20} className="text-red-500" /> No
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Support Prompt */}
        <div className="mt-12 p-8 bg-emerald-900 rounded-2xl text-white text-center shadow-lg">
           <h4 className="text-xl font-bold mb-2">Need more personalized help?</h4>
           <p className="text-emerald-100 mb-6">Our Shopify experts are online and ready to guide you.</p>
           <button 
             onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
             className="bg-white text-emerald-900 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
           >
             Contact Support
           </button>
        </div>
      </div>
    </div>
  );
};
