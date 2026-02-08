
import React from 'react';
// Fix: Use namespace import for react-router-dom to resolve missing named export errors in this environment
import * as ReactRouterDOM from 'react-router-dom';
import { CATEGORIES, ARTICLES } from '../constants';
import { ChevronRight, FileText, ArrowLeft } from 'lucide-react';

const { useParams, Link } = ReactRouterDOM;

export const Category: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const category = CATEGORIES.find(c => c.id === id);
  const articles = ARTICLES.filter(a => a.categoryId === id);

  if (!category) return <div className="p-20 text-center text-gray-500 font-medium">Category not found</div>;

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Home
          </Link>
          <ChevronRight size={14} className="mx-2 shrink-0" />
          <span className="font-semibold text-gray-900 shrink-0">{category.title}</span>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-200 shadow-sm mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">{category.description}</p>
        </div>

        {/* Articles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.length > 0 ? (
            articles.map(article => (
              <Link 
                key={article.id} 
                to={`/article/${article.id}`}
                className="block bg-white p-6 rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-emerald-700 group-hover:text-emerald-800 mb-2 leading-snug">
                      {article.title}
                    </h2>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{article.excerpt}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500 mt-1 transition-colors" />
                </div>
              </Link>
            ))
          ) : (
            <div className="md:col-span-2 text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
               <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                  <FileText size={48} className="text-gray-300" />
               </div>
               <p className="text-gray-500 text-lg font-medium">No articles found in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
