import { Article, Category } from './types';

export const CATEGORIES: Category[] = [
  { 
    id: 'themes', 
    title: 'Customizing Your Theme', 
    iconName: 'Layout', 
    description: 'Control the look and feel of your store',
    imageUrl: 'https://cdn.shopify.com/shopifycloud/help-center/assets/themes-DGg0lHtO.webp'
  },
  { 
    id: 'payments', 
    title: 'Setting Up Payments', 
    iconName: 'CreditCard', 
    description: 'Accept payments and get paid',
    imageUrl: 'https://cdn.shopify.com/shopifycloud/help-center/assets/payments-BsjzbT8a.webp'
  },
  { 
    id: 'fulfillment', 
    title: 'Fulfilling Your Orders', 
    iconName: 'Truck', 
    description: 'Manage deliveries and shipping',
    imageUrl: 'https://cdn.shopify.com/shopifycloud/help-center/assets/fulfillment-t3qJKjZp.webp'
  },
  { id: 'editions', title: 'Shopify Editions Winter 2026', iconName: 'Snowflake', description: 'The latest feature updates' },
  { id: 'start', title: 'Getting Started', iconName: 'Flag', description: 'Step-by-step to launch your store' },
  { id: 'migration', title: 'Migration', iconName: 'ArrowRightLeft', description: 'Move from Etsy, WooCommerce, and more' },
  { id: 'admin', title: 'Shopify Admin', iconName: 'Settings', description: 'Navigating your dashboard' },
  { id: 'apps', title: 'Apps', iconName: 'Grid', description: 'Extend store functionality' },
  { id: 'account', title: 'Your Account', iconName: 'User', description: 'Manage billing and security' },
  { id: 'domains', title: 'Domains', iconName: 'Globe', description: 'Buy or connect a custom domain' },
  { id: 'online_store', title: 'Online Store', iconName: 'Home', description: 'Pages, themes, and settings' },
  { id: 'products', title: 'Products', iconName: 'Package', description: 'Inventory and details' },
  { id: 'marketing', title: 'Marketing and Promotions', iconName: 'Megaphone', description: 'SEO and messaging' },
  { id: 'analytics', title: 'Reports and Analytics', iconName: 'BarChart', description: 'Track your store performance' },
  { id: 'customers', title: 'Customers', iconName: 'Users', description: 'Segmentation and accounts' },
  { id: 'taxes', title: 'Taxes and Duties', iconName: 'Calculator', description: 'Tax overrides and rules' },
  { id: 'finances', title: 'Finances', iconName: 'Wallet', description: 'Balance, Capital, and Credit' },
  { id: 'b2b', title: 'B2B', iconName: 'Briefcase', description: 'Catalogs and wholesale' },
  { id: 'compliance', title: 'Compliance', iconName: 'Shield', description: 'Legal and consumer protection' },
  { id: 'partners', title: 'Partner Directory', iconName: 'Handshake', description: 'Hire Shopify Experts' },
];

export const ARTICLES: Article[] = [
  // Theme Customization
  {
    id: 'themes-1',
    categoryId: 'themes',
    title: 'Customizing your theme',
    excerpt: 'Your theme controls the look and feel of your Shopify store — from colors and fonts to layout and images.',
    content: 'Your theme controls the look and feel of your Shopify store — from colors and fonts to layout and images. You can customize it anytime to match your brand identity.\n\nSteps:\n1. From your admin, go to Online Store → Themes.\n2. Click Customize beside your theme.\n3. Use the theme editor to adjust colors, fonts, and layout.\n4. Click Save when finished.\n\n💡 Tip: Preview your theme on mobile and desktop before publishing.'
  },
  {
    id: 'themes-2',
    categoryId: 'themes',
    title: 'How do I customize the colors and images in my store theme?',
    excerpt: 'Step-by-step guide to adjusting your visual assets.',
    content: '1. In your Shopify admin, click Online Store → Themes → Customize.\n2. Select Theme Settings → Colors to change your palette.\n3. Upload new images in each section.\n\n💡 Tip: Use high-resolution images for a professional look.'
  },

  // Payments
  {
    id: 'pay-1',
    categoryId: 'payments',
    title: 'Setting up payments',
    excerpt: 'To start accepting payments, activate Shopify Payments or a third-party provider.',
    content: 'To start accepting payments, go to Settings → Payments, then activate Shopify Payments or a third-party provider.\n\n💡 Tip: Shopify Payments lets you accept major cards, Apple Pay, and Google Pay.'
  },

  // Fulfillment
  {
    id: 'fulfill-1',
    categoryId: 'fulfillment',
    title: 'Fulfilling your orders',
    excerpt: 'After a customer orders, you can fulfill manually or automatically.',
    content: 'After a customer orders, you can fulfill manually or automatically.\n\nSteps:\n1. From your admin, go to Orders.\n2. Select an order → Mark as fulfilled → add tracking → Fulfill items.\n\n💡 Tip: Automate digital products or dropshipping.'
  },
  {
    id: 'fulfill-2',
    categoryId: 'fulfillment',
    title: 'How do I configure the shipping settings in my store?',
    excerpt: 'Configure rates, zones, and carriers.',
    content: '1. Go to Settings → Shipping and delivery.\n2. Click Manage rates and add zones or carriers.\n\n💡 Tip: Offer free shipping over a certain amount.'
  },

  // Editions
  {
    id: 'ed-1',
    categoryId: 'editions',
    title: 'Shopify Editions Winter 2026',
    excerpt: 'Updates to checkout, analytics, B2B tools, and Shop app integrations.',
    content: 'Shopify Editions Winter 2026 includes updates to checkout, analytics, B2B tools, and Shop app integrations.\n\n💡 Tip: Visit “What’s New” inside admin to view updates by store type.'
  },

  // Getting Started
  { id: 'start-1', categoryId: 'start', title: 'Intro to Shopify', excerpt: 'Overview of features and benefits.', content: 'Overview of features and benefits for store owners.' },
  { id: 'start-2', categoryId: 'start', title: 'Pricing plans', excerpt: 'Comparison of Basic, Shopify, and Advanced plans.', content: 'Comparison of Basic, Shopify, and Advanced plans.' },
  { id: 'start-3', categoryId: 'start', title: 'Getting set up to start selling', excerpt: 'Step-by-step to launch your store.', content: 'Step-by-step guide to get your store ready for launch.' },
  { id: 'start-4', categoryId: 'start', title: 'Checklist for starting a store', excerpt: 'Review before going live.', content: '💡 Tip: Use the setup checklist in your admin to track progress.' },

  // Migration
  { id: 'mig-1', categoryId: 'migration', title: 'Migrate to Shopify', excerpt: 'Move your existing store easily.', content: 'Move your existing store easily using migration tools.' },
  { id: 'mig-2', categoryId: 'migration', title: 'Migrating from Etsy', excerpt: 'Use the Etsy migration app.', content: 'Step-by-step instructions for Etsy migration.' },
  { id: 'mig-3', categoryId: 'migration', title: 'Migrating from WooCommerce', excerpt: 'Use the Store Importer app.', content: 'How to bring your WooCommerce data to Shopify.' },
  { id: 'mig-4', categoryId: 'migration', title: 'Migrating from eBay', excerpt: 'Sync with the eBay connector.', content: '💡 Tip: Test before redirecting your old domain.' },

  // Admin
  { id: 'adm-1', categoryId: 'admin', title: 'Navigating the Shopify admin', excerpt: 'Overview of Home, Orders, Products, Analytics.', content: 'Overview of Home, Orders, Products, Analytics.' },
  { id: 'adm-2', categoryId: 'admin', title: 'Productivity tools', excerpt: 'Bulk editor, tags, order timeline.', content: 'Bulk editor, tags, order timeline help.' },
  { id: 'adm-3', categoryId: 'admin', title: 'Using the Shopify app', excerpt: 'Manage your store from your phone.', content: '💡 Tip: Use Ctrl+K to find anything instantly.' },

  // Apps
  { id: 'app-1', categoryId: 'apps', title: 'Choosing apps', excerpt: 'Browse the App Store.', content: 'Browse the App Store for functionality.' },
  { id: 'app-2', categoryId: 'apps', title: 'Finding apps', excerpt: 'Search or explore categories.', content: 'Finding the right tools for your business.' },
  { id: 'app-3', categoryId: 'apps', title: 'Apps made by Shopify', excerpt: 'Trusted official tools.', content: '💡 Tip: Start with Shopify-built apps for reliability.' },

  // Your Account
  { id: 'acc-1', categoryId: 'account', title: 'Logging in to your Shopify account', excerpt: 'Access your account safely.', content: 'Access your account safely.' },
  { id: 'acc-2', categoryId: 'account', title: 'Managing your Shopify billing', excerpt: 'View invoices and charges.', content: 'View invoices and charges.' },
  { id: 'acc-3', categoryId: 'account', title: 'Managing users', excerpt: 'Add staff and permissions.', content: '💡 Tip: Enable two-step authentication for security.' },

  // Domains
  { id: 'dom-1', categoryId: 'domains', title: 'Adding a domain to Shopify', excerpt: 'Establish your brand online.', content: 'Establish your brand online.' },
  { id: 'dom-2', categoryId: 'domains', title: 'Connecting a third-party domain', excerpt: 'Use external registrars.', content: 'Use external registrars.' },
  { id: 'dom-3', categoryId: 'domains', title: 'Managing your domain settings', excerpt: '💡 Tip: Keep your domain short and easy to remember.', content: '💡 Tip: Keep your domain short and easy to remember.' },

  // Online Store
  { id: 'os-1', categoryId: 'online_store', title: 'Shopify themes', excerpt: 'Manage your store look.', content: 'Manage your store look.' },
  { id: 'os-2', categoryId: 'online_store', title: 'Creating and editing pages', excerpt: 'Add content to your store.', content: 'Add content to your store.' },
  { id: 'os-3', categoryId: 'online_store', title: 'Theme settings', excerpt: '💡 Tip: Update homepage banners regularly.', content: '💡 Tip: Update homepage banners regularly.' },

  // Products
  { id: 'prd-1', categoryId: 'products', title: 'Product details', excerpt: 'Create rich product listings.', content: 'Create rich product listings.' },
  { id: 'prd-2', categoryId: 'products', title: 'Managing inventory', excerpt: 'Keep track of stock.', content: 'Keep track of stock.' },
  { id: 'prd-3', categoryId: 'products', title: 'Digital products', excerpt: '💡 Tip: Use tags for automatic collections.', content: '💡 Tip: Use tags for automatic collections.' },

  // Payments Extended
  { id: 'pya-1', categoryId: 'payments', title: 'Shop Pay', excerpt: 'Accelerated checkout for customers.', content: 'Accelerated checkout for customers.' },
  { id: 'pya-2', categoryId: 'payments', title: 'Shop Pay Installments', excerpt: 'Offer flexible payments.', content: 'Offer flexible payments.' },
  { id: 'pya-3', categoryId: 'payments', title: 'Shopify checkout', excerpt: 'Optimize the customer journey.', content: 'Optimize the customer journey.' },
  { id: 'pya-4', categoryId: 'payments', title: 'Placing a test order', excerpt: 'Ensure everything works.', content: 'Ensure everything works.' },
  { id: 'pya-5', categoryId: 'payments', title: 'Customizing your checkout', excerpt: 'Branding the final step.', content: 'Branding the final step.' },
  { id: 'pya-6', categoryId: 'payments', title: 'Checkout Blocks app', excerpt: '💡 Tip: Enable Shop Pay for faster checkout.', content: '💡 Tip: Enable Shop Pay for faster checkout.' },

  // Orders and Shipping
  { id: 'shp-1', categoryId: 'shipping', title: 'Setting up shipping and fulfillment', excerpt: 'Configure delivery methods.', content: 'Configure delivery methods.' },
  { id: 'shp-2', categoryId: 'shipping', title: 'Managing orders', excerpt: 'Process sales and returns.', content: 'Process sales and returns.' },
  { id: 'shp-3', categoryId: 'shipping', title: 'Fulfilling orders', excerpt: '💡 Tip: Add tracking links to improve customer experience.', content: '💡 Tip: Add tracking links to improve customer experience.' },

  // Marketing
  { id: 'mkt-1', categoryId: 'marketing', title: 'Setting up marketing in Shopify', excerpt: 'Launch campaigns.', content: 'Launch campaigns.' },
  { id: 'mkt-2', categoryId: 'marketing', title: 'Shopify Messaging', excerpt: 'Chat with customers.', content: 'Chat with customers.' },
  { id: 'mkt-3', categoryId: 'marketing', title: 'Improving SEO', excerpt: '💡 Tip: Use automation to welcome new subscribers.', content: '💡 Tip: Use automation to welcome new subscribers.' },

  // Analytics
  { id: 'ana-1', categoryId: 'analytics', title: 'Shopify analytics', excerpt: 'Overview of dashboard reports.', content: 'Overview of dashboard reports.' },
  { id: 'ana-2', categoryId: 'analytics', title: 'Customizing and managing reports', excerpt: 'Tailor data to your needs.', content: 'Tailor data to your needs.' },
  { id: 'ana-3', categoryId: 'analytics', title: 'Google Analytics', excerpt: '💡 Tip: Schedule weekly summaries by email.', content: '💡 Tip: Schedule weekly summaries by email.' },

  // Customers
  { id: 'cst-1', categoryId: 'customers', title: 'Managing customers', excerpt: 'Organize your buyer list.', content: 'Organize your buyer list.' },
  { id: 'cst-2', categoryId: 'customers', title: 'Customer accounts', excerpt: 'Logins and profiles.', content: 'Logins and profiles.' },
  { id: 'cst-3', categoryId: 'customers', title: 'Customer segmentation', excerpt: '💡 Tip: Offer rewards for repeat buyers.', content: '💡 Tip: Offer rewards for repeat buyers.' },

  // Taxes
  { id: 'tax-1', categoryId: 'taxes', title: 'Shopify Tax', excerpt: 'Automated calculations.', content: 'Automated calculations.' },
  { id: 'tax-2', categoryId: 'taxes', title: 'Basic tax', excerpt: 'Manual setup guide.', content: 'Manual setup guide.' },
  { id: 'tax-3', categoryId: 'taxes', title: 'Tax overrides and exemptions', excerpt: '💡 Tip: Review tax rules before big sale events.', content: '💡 Tip: Review tax rules before big sale events.' },

  // Finances
  { id: 'fin-1', categoryId: 'finances', title: 'Shopify Balance', excerpt: 'Business account basics.', content: 'Business account basics.' },
  { id: 'fin-2', categoryId: 'finances', title: 'Shopify Capital', excerpt: 'Funding for your growth.', content: 'Funding for your growth.' },
  { id: 'fin-3', categoryId: 'finances', title: 'Shopify Credit', excerpt: '💡 Tip: Enable automatic payouts to your bank.', content: '💡 Tip: Enable automatic payouts to your bank.' },

  // B2B
  { id: 'b2b-1', categoryId: 'b2b', title: 'Getting started with Shopify B2B', excerpt: 'Wholesale features overview.', content: 'Wholesale features overview.' },
  { id: 'b2b-2', categoryId: 'b2b', title: 'Companies and customers in B2B', excerpt: 'Profiles and permissions.', content: 'Profiles and permissions.' },
  { id: 'b2b-3', categoryId: 'b2b', title: 'Catalogs and pricing in B2B', excerpt: '💡 Tip: Use company profiles for bulk customers.', content: '💡 Tip: Use company profiles for bulk customers.' },

  // Compliance
  { id: 'cmp-1', categoryId: 'compliance', title: 'Handling Shopify store termination', excerpt: 'What happens next.', content: 'What happens next.' },
  { id: 'cmp-2', categoryId: 'compliance', title: 'Consumer protection laws', excerpt: 'Staying legal worldwide.', content: 'Staying legal worldwide.' },
  { id: 'cmp-3', categoryId: 'compliance', title: 'Legal removals and intellectual property', excerpt: '💡 Tip: Include clear legal pages in your store.', content: '💡 Tip: Include clear legal pages in your store.' },

  // Partners
  { id: 'prt-1', categoryId: 'partners', title: 'Hiring and working with Shopify Partners', excerpt: 'Find the right expert.', content: '💡 Tip: Review ratings and portfolios before hiring.' },
];

export const DEFAULT_LOGO = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqu14QowRTJiRRKL0f27GKoORN7LaRlW-r2bkSjhiUmg&s=10";
export const FALLBACK_LOGO = "https://cdn-icons-png.flaticon.com/512/5968/5968756.png";