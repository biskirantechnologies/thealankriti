import { Link } from 'react-router-dom';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  HeartIcon,
  ShieldCheckIcon,
  TruckIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Track Order', href: '/track-order' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Care Instructions', href: '/care-instructions' },
    { name: 'FAQ', href: '/faq' }
  ];

  const categories = [
    { name: 'Gold Jewelry', href: '/products?category=gold' },
    { name: 'Silver Jewelry', href: '/products?category=silver' },
    { name: 'Diamond Jewelry', href: '/products?category=diamond' },
    { name: 'Rings', href: '/products?type=rings' },
    { name: 'Necklaces', href: '/products?type=necklaces' },
    { name: 'Earrings', href: '/products?type=earrings' }
  ];

  const policies = [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Shipping Policy', href: '/shipping-policy' },
    { name: 'Return Policy', href: '/return-policy' },
    { name: 'Refund Policy', href: '/refund-policy' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Trust Badges */}
      <div className="bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <ShieldCheckIcon className="h-8 w-8 text-amber-400 mb-2" />
              <h4 className="font-medium mb-1">100% Authentic</h4>
              <p className="text-sm text-gray-400">BIS Hallmarked Jewelry</p>
            </div>
            <div className="flex flex-col items-center">
              <TruckIcon className="h-8 w-8 text-amber-400 mb-2" />
              <h4 className="font-medium mb-1">Free Shipping</h4>
              <p className="text-sm text-gray-400">On orders above NPR 5,000</p>
            </div>
            <div className="flex flex-col items-center">
              <HeartIcon className="h-8 w-8 text-amber-400 mb-2" />
              <h4 className="font-medium mb-1">Lifetime Service</h4>
              <p className="text-sm text-gray-400">Free cleaning & polishing</p>
            </div>
            <div className="flex flex-col items-center">
              <CurrencyRupeeIcon className="h-8 w-8 text-amber-400 mb-2" />
              <h4 className="font-medium mb-1">Best Prices</h4>
              <p className="text-sm text-gray-400">Transparent pricing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link 
              to="/" 
              className="text-2xl font-bold text-amber-400 mb-4 block"
            >
              The Alankriti
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Crafting beautiful jewelry for over two decades. We specialize in 
              traditional and contemporary designs that celebrate life's precious moments.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-amber-400 mr-3" />
                <span>+977 9840254146</span>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-amber-400 mr-3" />
                <span>The Alankritijwelles@gmail.com</span>
              </div>
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                <span>
                  Balumari, Lalitpur<br />
                  Nepal
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-amber-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.href}>
                  <Link
                    to={category.href}
                    className="text-gray-300 hover:text-amber-400 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Policies</h3>
            <ul className="space-y-2 mb-6">
              {policies.slice(0, 3).map((policy) => (
                <li key={policy.href}>
                  <Link
                    to={policy.href}
                    className="text-gray-300 hover:text-amber-400 transition-colors"
                  >
                    {policy.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div>
              <h4 className="font-medium mb-3">Stay Updated</h4>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Social Media & Business Hours */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Social Media */}
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-gray-300">Follow Us:</span>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.324-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.324C5.901 8.197 7.052 7.707 8.349 7.707s2.448.49 3.324 1.297c.876.807 1.366 1.958 1.366 3.255s-.49 2.448-1.297 3.324c-.876.807-2.027 1.297-3.324 1.297z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>

            {/* Online Support */}
            <div className="text-center md:text-right">
              <h4 className="font-medium mb-2">Online Support</h4>
              <p className="text-gray-300 text-sm">
                Available 24/7<br />
                Chat, Email & WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>
              © {currentYear} The Alankriti. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              {policies.map((policy) => (
                <Link
                  key={policy.href}
                  to={policy.href}
                  className="hover:text-amber-400 transition-colors"
                >
                  {policy.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
