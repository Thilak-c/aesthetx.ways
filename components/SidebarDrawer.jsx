import { useState } from "react";
import Link from "next/link";
import { X, ChevronRight, User } from "lucide-react";

export default function SidebarDrawer({ open, onClose, width = "w-4/5 max-w-sm" }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full ${width} text-[13px/] bg-white z-[9999] transition-transform duration-300 overflow-y-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header with Logo and Close */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Link href="/" onClick={onClose}>
            <img src="/logo.png" alt="Logo" className="h-8" />
          </Link>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-700" />
          </button>
        </div>

      

        {/* Navigation Menu */}
        <nav className="py-4">
          {/* Home */}
          <Link href="/" onClick={onClose}>
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <span className="text-base font-normal text-gray-900">Home</span>
            </div>
          </Link>

          {/* Shop by Category */}
          <div>
            <button
              onClick={() => toggleSection('category')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-base font-normal text-gray-900">Shop by Category</span>
              <ChevronRight
                size={20}
                className={`text-gray-500 transition-transform ${
                  expandedSection === 'category' ? 'rotate-90' : ''
                }`}
              />
            </button>
            {expandedSection === 'category' && (
              <div className="bg-gray-50 py-2">
                <Link href="/shop?ct=men" onClick={onClose}>
                  <div className="px-10 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                    <span className="text-sm text-gray-700">Men</span>
                  </div>
                </Link>
                <Link href="/shop?ct=women" onClick={onClose}>
                  <div className="px-10 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                    <span className="text-sm text-gray-700">Women</span>
                  </div>
                </Link>
                <Link href="/shop?ct=sneakers" onClick={onClose}>
                  <div className="px-10 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                    <span className="text-sm text-gray-700">Sneakers</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Shop by Collection */}
          <div>
            <button
              onClick={() => toggleSection('collection')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-base font-normal text-gray-900">Shop by Collection</span>
              <ChevronRight
                size={20}
                className={`text-gray-500 transition-transform ${
                  expandedSection === 'collection' ? 'rotate-90' : ''
                }`}
              />
            </button>
            {expandedSection === 'collection' && (
              <div className="bg-gray-50 py-2">
                <div className="px-10 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                  <span className="text-sm text-gray-700">New Arrivals</span>
                </div>
                <div className="px-10 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                  <span className="text-sm text-gray-700">Bestsellers</span>
                </div>
                <div className="px-10 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                  <span className="text-sm text-gray-700">Sale</span>
                </div>
              </div>
            )}
          </div>

          {/* Contact us */}
          <Link href="/contact" onClick={onClose}>
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <span className="text-base font-normal text-gray-900">Contact us</span>
            </div>
          </Link>

          {/* Return Policy */}
          <Link href="/return-policy" onClick={onClose}>
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <span className="text-base font-normal text-gray-900">Return Policy</span>
            </div>
          </Link>
        </nav>

        {/* Login Button at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
          <Link href="/login" onClick={onClose}>
            <button className="w-full flex items-center justify-center gap-2 py-3 text-base font-normal text-gray-900 hover:bg-gray-50 transition-colors rounded-lg">
              <User size={20} />
              <span>Log in</span>
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
